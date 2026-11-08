import Foundation
import Observation

/// Junta as lâmpadas de todas as integrações e envia comandos com atualização otimista.
@Observable
final class LightStore {
    let providers: [any LightProvider]
    let local: LocalStore
    var lastError: String?

    /// Estados enviados e ainda não confirmados pela integração.
    private var pending: [String: LightState] = [:]

    init(providers: [any LightProvider], local: LocalStore) {
        self.providers = providers
        self.local = local
    }

    var lights: [Light] {
        providers.flatMap(\.lights).map { light in
            var copy = light
            if let state = pending[light.id] { copy.state = state }
            if let room = local.room(for: light.id) { copy.room = room }
            return copy
        }
        .sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }
    }

    func light(_ id: String) -> Light? { lights.first { $0.id == id } }

    /// Lâmpadas agrupadas por ambiente; sem ambiente vão para "Outras".
    var rooms: [(name: String, lights: [Light])] {
        let grouped = Dictionary(grouping: lights) { $0.room ?? String(localized: "Outras") }
        return grouped
            .map { (name: $0.key, lights: $0.value) }
            .sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }
    }

    var favorites: [Light] { lights.filter { local.isFavorite($0.id) } }

    var isLoading: Bool { providers.contains { $0.status == .loading } }

    func start() async {
        await Self.concurrently(providers) { await $0.start() }
    }

    func refresh() async {
        await Self.concurrently(providers) { await $0.refresh() }
        pending.removeAll()
    }

    /// Executa as operações em paralelo no main actor (as integrações não são Sendable).
    static func concurrently<T>(_ items: [T], _ operation: @escaping (T) async -> Void) async {
        let tasks = items.map { item in Task { await operation(item) } }
        for task in tasks { await task.value }
    }

    func send(_ command: LightCommand, to light: Light) async {
        guard let provider = providers.first(where: { $0.source == light.source }) else { return }
        pending[light.id] = (pending[light.id] ?? light.state).applying(command)
        do {
            try await provider.send(command, to: light.id)
            pending[light.id] = nil
        } catch {
            pending[light.id] = nil
            lastError = String(localized: "Não foi possível controlar “\(light.name)”: \(error.localizedDescription)")
        }
    }

    func toggle(_ light: Light) async {
        await send(.power(!light.state.isOn), to: light)
    }

    func setAll(on: Bool, in lights: [Light]) async {
        let targets = lights.filter { $0.isReachable && $0.state.isOn != on }
        await Self.concurrently(targets) { await self.send(.power(on), to: $0) }
    }

    func apply(_ scene: LumiScene) async {
        let targets = scene.entries.compactMap { entry in
            light(entry.lightID).flatMap { $0.isReachable ? (light: $0, state: entry.state) : nil }
        }
        await Self.concurrently(targets) { target in
            for command in target.state.commands(for: target.light.capabilities) {
                await self.send(command, to: target.light)
            }
        }
    }

    /// Cria uma cena a partir do estado atual das lâmpadas escolhidas.
    func makeScene(name: String, symbol: String, lightIDs: Set<String>) -> LumiScene {
        let entries = lights
            .filter { lightIDs.contains($0.id) }
            .map { LumiScene.Entry(lightID: $0.id, state: $0.state) }
        return LumiScene(name: name, symbol: symbol, entries: entries)
    }
}

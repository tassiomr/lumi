#if DEBUG
import Foundation
import Observation

/// Lâmpadas fictícias para desenvolvimento e capturas de tela no simulador.
/// Só existe em builds Debug e só é ativado com o argumento de inicialização `-LumiDemo`.
@Observable
final class DemoProvider: LightProvider {
    let source = LightSource.demo
    private(set) var status: ProviderStatus = .ready
    private(set) var lights: [Light] = [
        Light(id: "demo:1", name: "Luminária", room: "Sala", source: .demo, isReachable: true,
              capabilities: [.brightness, .temperature], state: LightState(isOn: true, brightness: 0.72, kelvin: 3000)),
        Light(id: "demo:2", name: "Fita LED", room: "Sala", source: .demo, isReachable: true,
              capabilities: [.brightness, .color, .temperature], state: LightState(isOn: true, brightness: 0.5, hue: 265, saturation: 0.8)),
        Light(id: "demo:3", name: "Abajur", room: "Quarto", source: .demo, isReachable: true,
              capabilities: [.brightness, .color, .temperature], state: LightState(isOn: true, brightness: 0.35, hue: 30, saturation: 0.6)),
        Light(id: "demo:4", name: "Teto", room: "Cozinha", source: .demo, isReachable: true,
              capabilities: [.brightness], state: LightState(isOn: false, brightness: 1)),
        Light(id: "demo:5", name: "Mesa", room: "Escritório", source: .demo, isReachable: true,
              capabilities: [.brightness, .temperature], state: LightState(isOn: true, brightness: 0.9, kelvin: 5500)),
        Light(id: "demo:6", name: "Varanda", room: "Área externa", source: .demo, isReachable: false,
              capabilities: [.brightness], state: LightState(isOn: false)),
    ]

    static var isEnabled: Bool { ProcessInfo.processInfo.arguments.contains("-LumiDemo") }

    func start() async {}
    func refresh() async {}

    func send(_ command: LightCommand, to lightID: String) async throws {
        guard let index = lights.firstIndex(where: { $0.id == lightID }) else { return }
        try await Task.sleep(for: .milliseconds(120))
        lights[index].state = lights[index].state.applying(command)
    }
}
#endif

import Foundation
import LumiLegal
import Observation

/// Lâmpadas Tuya da conta anônima do Lumi. A conta e os comandos passam pela nuvem da Tuya;
/// alguns dispositivos também aceitam comandos pela rede local.
@Observable
final class TuyaProvider: LightProvider, LumiAccountDeleting {
    let source = LightSource.tuya
    private(set) var lights: [Light] = []
    private(set) var status: ProviderStatus = .idle

    @ObservationIgnored private let client: any TuyaClient
    @ObservationIgnored private var devices: [String: TuyaDevice] = [:]

    init(client: any TuyaClient) {
        self.client = client
        client.onDeviceUpdate = { [weak self] device in self?.update(device) }
    }

    var isConfigured: Bool { client.unavailableReason == nil }
    var hasAccount: Bool { client.hasAccount }

    func start() async {
        if let reason = client.unavailableReason {
            status = .unavailable(reason)
            return
        }
        // Só cria a conta anônima quando o usuário for adicionar a primeira lâmpada.
        guard client.hasAccount else {
            status = .actionNeeded(String(localized: "Adicione uma lâmpada Tuya para começar."))
            return
        }
        await refresh()
    }

    func refresh() async {
        guard isConfigured, client.hasAccount else { return }
        status = .loading
        do {
            try await client.connect()
            let list = try await client.devices()
            devices = Dictionary(uniqueKeysWithValues: list.map { ($0.id, $0) })
            rebuild()
            status = .ready
        } catch {
            status = .failed(error.localizedDescription)
        }
    }

    func send(_ command: LightCommand, to lightID: String) async throws {
        let deviceID = String(lightID.dropFirst("tuya:".count))
        guard let device = devices[deviceID], let light = lights.first(where: { $0.id == lightID }) else {
            throw ProviderError(String(localized: "Dispositivo não encontrado na sua conta Tuya."))
        }
        let dps = TuyaLightMapper.dps(for: command, device: device, current: light.state)
        guard !dps.isEmpty else { return }
        try await client.publish(dps, to: deviceID)
        var updated = device
        for (key, value) in dps { updated.dps[key] = value }
        update(updated)
    }

    /// Pareia uma lâmpada no modo AP. Cria a conta anônima se ainda não existir.
    func pair(ssid: String, password: String) async throws -> Light? {
        try await client.connect()
        let device = try await client.pairAP(ssid: ssid, password: password, timeout: 120)
        update(device)
        status = .ready
        await refresh()
        return lights.first { $0.id == "tuya:\(device.id)" }
    }

    func cancelPairing() { client.cancelPairing() }

    func remove(lightID: String) async throws {
        let deviceID = String(lightID.dropFirst("tuya:".count))
        try await client.remove(deviceID: deviceID)
        devices[deviceID] = nil
        rebuild()
    }

    func deleteAccount() async throws {
        try await client.deleteAccount()
        devices = [:]
        lights = []
        status = .actionNeeded(String(localized: "Adicione uma lâmpada Tuya para começar."))
    }

    private func update(_ device: TuyaDevice) {
        devices[device.id] = device
        rebuild()
    }

    private func rebuild() {
        lights = devices.values.compactMap(TuyaLightMapper.light(from:))
    }
}

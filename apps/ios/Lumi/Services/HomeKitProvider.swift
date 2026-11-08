import Foundation
import HomeKit
import Observation

/// Lâmpadas do app Casa, lidas e controladas pelo framework HomeKit no próprio iPhone.
/// Inclui dispositivos Matter adicionados ao app Casa. Nada daqui é enviado a outros serviços.
@Observable
final class HomeKitProvider: NSObject, LightProvider {
    let source = LightSource.homeKit
    private(set) var lights: [Light] = []
    private(set) var scenes: [HomeScene] = []
    private(set) var status: ProviderStatus = .idle

    @ObservationIgnored private var manager: HMHomeManager?
    @ObservationIgnored private var services: [String: HMService] = [:]
    @ObservationIgnored private var actionSets: [String: (HMHome, HMActionSet)] = [:]

    func start() async {
        guard manager == nil else { return }
        status = .loading
        // Criar o HMHomeManager dispara o pedido de permissão na primeira vez.
        let manager = HMHomeManager()
        manager.delegate = self
        self.manager = manager
    }

    func refresh() async {
        guard let manager else { return await start() }
        rebuild()
        let characteristics = services.values.flatMap { $0.characteristics.filter(Self.isRelevant) }
        await LightStore.concurrently(characteristics) { try? await $0.readValue() }
        _ = manager
        rebuild()
    }

    func send(_ command: LightCommand, to lightID: String) async throws {
        guard let service = services[lightID] else { throw ProviderError(String(localized: "Lâmpada não encontrada no app Casa.")) }
        func write(_ type: String, _ value: Any) async throws {
            guard let characteristic = service.characteristics.first(where: { $0.characteristicType == type }) else { return }
            try await characteristic.writeValue(value)
        }
        switch command {
        case .power(let on):
            try await write(HMCharacteristicTypePowerState, on)
        case .brightness(let value):
            try await write(HMCharacteristicTypeBrightness, Int((value * 100).rounded()))
        case .color(let hue, let saturation):
            try await write(HMCharacteristicTypeHue, Float(hue))
            try await write(HMCharacteristicTypeSaturation, Float(saturation * 100))
        case .temperature(let kelvin):
            try await write(HMCharacteristicTypeColorTemperature, Int((1_000_000 / kelvin).rounded()))
        }
        rebuild()
    }

    func execute(_ scene: HomeScene) async throws {
        guard let (home, actionSet) = actionSets[scene.id] else { return }
        try await home.executeActionSet(actionSet)
        await refresh()
    }

    // MARK: - Mapeamento

    private nonisolated static let relevantTypes: Set<String> = [
        HMCharacteristicTypePowerState, HMCharacteristicTypeBrightness, HMCharacteristicTypeHue,
        HMCharacteristicTypeSaturation, HMCharacteristicTypeColorTemperature,
    ]

    private nonisolated static func isRelevant(_ characteristic: HMCharacteristic) -> Bool {
        relevantTypes.contains(characteristic.characteristicType)
    }

    private func rebuild() {
        guard let manager else { return }
        var newServices: [String: HMService] = [:]
        var newLights: [Light] = []
        var newActionSets: [String: (HMHome, HMActionSet)] = [:]

        for home in manager.homes {
            for accessory in home.accessories {
                accessory.delegate = self
                for service in accessory.services where service.serviceType == HMServiceTypeLightbulb {
                    let id = "hk:\(service.uniqueIdentifier.uuidString)"
                    newServices[id] = service
                    newLights.append(Self.light(id: id, service: service, accessory: accessory, homeCount: manager.homes.count, home: home))
                }
            }
            for actionSet in home.actionSets where !actionSet.actions.isEmpty {
                newActionSets["hks:\(actionSet.uniqueIdentifier.uuidString)"] = (home, actionSet)
            }
        }

        for (id, service) in newServices where services[id] == nil {
            for characteristic in service.characteristics where Self.isRelevant(characteristic) {
                characteristic.enableNotification(true) { _ in }
            }
        }

        services = newServices
        lights = newLights
        actionSets = newActionSets
        scenes = newActionSets
            .map { HomeScene(id: $0.key, name: $0.value.1.name) }
            .sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }
    }

    private static func light(id: String, service: HMService, accessory: HMAccessory, homeCount: Int, home: HMHome) -> Light {
        func characteristic(_ type: String) -> HMCharacteristic? {
            service.characteristics.first { $0.characteristicType == type }
        }
        func number(_ type: String) -> Double? {
            (characteristic(type)?.value as? NSNumber)?.doubleValue
        }

        var capabilities: LightCapabilities = []
        if characteristic(HMCharacteristicTypeBrightness) != nil { capabilities.insert(.brightness) }
        if characteristic(HMCharacteristicTypeHue) != nil, characteristic(HMCharacteristicTypeSaturation) != nil { capabilities.insert(.color) }
        var kelvinRange: ClosedRange<Double> = 2700...6500
        if let temperature = characteristic(HMCharacteristicTypeColorTemperature) {
            capabilities.insert(.temperature)
            if let minMired = temperature.metadata?.minimumValue?.doubleValue, let maxMired = temperature.metadata?.maximumValue?.doubleValue,
               minMired > 0, maxMired > minMired {
                kelvinRange = (1_000_000 / maxMired)...(1_000_000 / minMired)
            }
        }

        let state = LightState(
            isOn: (characteristic(HMCharacteristicTypePowerState)?.value as? Bool) ?? false,
            brightness: number(HMCharacteristicTypeBrightness).map { $0 / 100 },
            hue: number(HMCharacteristicTypeHue),
            saturation: number(HMCharacteristicTypeSaturation).map { $0 / 100 },
            kelvin: number(HMCharacteristicTypeColorTemperature).flatMap { $0 > 0 ? 1_000_000 / $0 : nil }
        )

        var room = accessory.room?.name
        if homeCount > 1, let name = room { room = "\(home.name) · \(name)" }
        let name = service.name.isEmpty ? accessory.name : service.name

        return Light(id: id, name: name, room: room, source: .homeKit, isReachable: accessory.isReachable,
                     capabilities: capabilities, state: state, kelvinRange: kelvinRange)
    }

    private func updateStatus() {
        guard let manager else { return }
        let authorization = manager.authorizationStatus
        if authorization.contains(.restricted) {
            status = .unavailable(String(localized: "O acesso aos dados da Casa está restrito neste iPhone."))
        } else if authorization.contains(.determined) && !authorization.contains(.authorized) {
            status = .actionNeeded(String(localized: "Permita o acesso aos dados da Casa em Ajustes › Lumi para ver suas lâmpadas do HomeKit."))
        } else if manager.homes.isEmpty, authorization.contains(.authorized) {
            status = .actionNeeded(String(localized: "Nenhuma casa configurada no app Casa."))
        } else if authorization.contains(.authorized) {
            status = .ready
        }
    }
}

extension HomeKitProvider: @preconcurrency HMHomeManagerDelegate {
    func homeManagerDidUpdateHomes(_ manager: HMHomeManager) {
        rebuild()
        updateStatus()
        Task { await refresh() }
    }

    func homeManager(_ manager: HMHomeManager, didUpdate status: HMHomeManagerAuthorizationStatus) {
        updateStatus()
    }
}

extension HomeKitProvider: @preconcurrency HMAccessoryDelegate {
    func accessory(_ accessory: HMAccessory, service: HMService, didUpdateValueFor characteristic: HMCharacteristic) {
        rebuild()
    }

    func accessoryDidUpdateReachability(_ accessory: HMAccessory) {
        rebuild()
    }
}

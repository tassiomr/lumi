#if canImport(ThingSmartHomeKit)
import Foundation
import ThingSmartHomeKit

// ATENÇÃO: este arquivo só é compilado com o SDK da Tuya instalado (veja apps/ios/README.md).
// Foi escrito a partir da documentação pública do Smart Life App SDK e ainda NÃO foi compilado:
// confira as assinaturas na versão do SDK usada e teste em um iPhone real.

/// Implementação de `TuyaClient` sobre o Smart Life App SDK, com conta anônima.
final class ThingTuyaClient: NSObject, TuyaClient {
    private(set) var unavailableReason: String?
    var onDeviceUpdate: ((TuyaDevice) -> Void)?

    private var homeID: Int64?
    private var observed: [String: ThingSmartDevice] = [:]
    private let activator = ThingSmartActivator()
    private var pairing: CheckedContinuation<TuyaDevice, Error>?

    /// Lê as credenciais do Info.plist (TuyaAppKey / TuyaAppSecret, vindas de Secrets.xcconfig).
    override init() {
        super.init()
        let info = Bundle.main.infoDictionary
        let key = (info?["TuyaAppKey"] as? String) ?? ""
        let secret = (info?["TuyaAppSecret"] as? String) ?? ""
        guard !key.isEmpty, !secret.isEmpty,
              Bundle.main.url(forResource: "t_s", withExtension: "bmp") != nil else {
            unavailableReason = String(localized: "A integração Tuya ainda não foi configurada neste build do Lumi.")
            return
        }
        ThingSmartSDK.sharedInstance().start(withAppKey: key, secretKey: secret)
        activator.delegate = self
    }

    var hasAccount: Bool { ThingSmartUser.sharedInstance().isLogin }

    func connect() async throws {
        if !hasAccount {
            // Conta anônima: sem e-mail, telefone ou senha. O nome é um identificador aleatório,
            // para não enviar o nome do aparelho à Tuya.
            try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
                ThingSmartUser.sharedInstance().registerAnonymous(
                    withCountryCode: "55",
                    userName: "lumi-\(UUID().uuidString.prefix(8))",
                    success: { cont.resume() },
                    failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao criar a conta.")) }
                )
            }
        }
        if homeID == nil { homeID = try await ensureHome() }
    }

    private func ensureHome() async throws -> Int64 {
        let manager = ThingSmartHomeManager()
        let homes: [ThingSmartHomeModel] = try await withCheckedThrowingContinuation { cont in
            manager.getHomeList(success: { cont.resume(returning: $0 ?? []) },
                                failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao listar casas.")) })
        }
        if let first = homes.first { return first.homeId }
        return try await withCheckedThrowingContinuation { cont in
            manager.addHome(withName: String(localized: "Minha casa"), geoName: "", rooms: [], latitude: 0, longitude: 0,
                            success: { cont.resume(returning: $0) },
                            failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao criar a casa.")) })
        }
    }

    func devices() async throws -> [TuyaDevice] {
        guard let homeID, let home = ThingSmartHome(homeId: homeID) else { return [] }
        let model: ThingSmartHomeModel? = try await withCheckedThrowingContinuation { cont in
            home.getDataWithSuccess({ cont.resume(returning: $0) },
                                    failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao carregar dispositivos.")) })
        }
        _ = model
        return home.deviceList.map { model in
            observe(model.devId)
            return Self.snapshot(model)
        }
    }

    func publish(_ dps: [String: TuyaDPValue], to deviceID: String) async throws {
        guard let device = ThingSmartDevice(deviceId: deviceID) else { throw ProviderError("Dispositivo indisponível.") }
        let payload = dps.mapValues(\.anyValue)
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            device.publishDps(payload, success: { cont.resume() },
                              failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao enviar o comando.")) })
        }
    }

    func pairAP(ssid: String, password: String, timeout: TimeInterval) async throws -> TuyaDevice {
        guard let homeID else { throw ProviderError("Conta não conectada.") }
        let token: String = try await withCheckedThrowingContinuation { cont in
            activator.getTokenWithHomeId(homeID, success: { cont.resume(returning: $0 ?? "") },
                                         failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao obter o token de pareamento.")) })
        }
        return try await withCheckedThrowingContinuation { cont in
            pairing = cont
            activator.startConfigWiFi(.AP, ssid: ssid, password: password, token: token, timeout: timeout)
        }
    }

    func cancelPairing() {
        activator.stopConfigWiFi()
        pairing?.resume(throwing: CancellationError())
        pairing = nil
    }

    func remove(deviceID: String) async throws {
        guard let device = ThingSmartDevice(deviceId: deviceID) else { return }
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            device.remove({ cont.resume() }, failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao remover.")) })
        }
        observed[deviceID] = nil
    }

    func deleteAccount() async throws {
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            ThingSmartUser.sharedInstance().deleteAnonymousAccount(success: { cont.resume() },
                                                                   failure: { cont.resume(throwing: $0 ?? ProviderError("Falha ao excluir a conta.")) })
        }
        homeID = nil
        observed = [:]
    }

    // MARK: - Helpers

    private func observe(_ deviceID: String) {
        guard observed[deviceID] == nil, let device = ThingSmartDevice(deviceId: deviceID) else { return }
        device.delegate = self
        observed[deviceID] = device
    }

    private static func snapshot(_ model: ThingSmartDeviceModel) -> TuyaDevice {
        var codes: [String: String] = [:]
        var ranges: [String: ClosedRange<Int>] = [:]
        for schema in model.schemaArray ?? [] {
            codes[schema.code] = schema.dpId
            if let property = schema.property, property.max > property.min {
                ranges[schema.code] = Int(property.min)...Int(property.max)
            }
        }
        var dps: [String: TuyaDPValue] = [:]
        for (key, value) in model.dps ?? [:] {
            if let value = TuyaDPValue(value) { dps["\(key)"] = value }
        }
        return TuyaDevice(id: model.devId, name: model.name, isOnline: model.isOnline, dps: dps, codes: codes, ranges: ranges)
    }
}

extension ThingTuyaClient: ThingSmartActivatorDelegate {
    func activator(_ activator: ThingSmartActivator!, didReceiveDevice deviceModel: ThingSmartDeviceModel!, error: Error!) {
        guard let pairing else { return }
        self.pairing = nil
        if let deviceModel, error == nil {
            observe(deviceModel.devId)
            pairing.resume(returning: Self.snapshot(deviceModel))
        } else {
            pairing.resume(throwing: error ?? ProviderError("O pareamento não foi concluído."))
        }
    }
}

extension ThingTuyaClient: ThingSmartDeviceDelegate {
    func device(_ device: ThingSmartDevice!, dpsUpdate dps: [AnyHashable: Any]!) {
        guard let model = device.deviceModel else { return }
        onDeviceUpdate?(Self.snapshot(model))
    }
}
#endif

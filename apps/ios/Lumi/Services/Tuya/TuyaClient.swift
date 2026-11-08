import Foundation

/// Valor de um data point (DP) da Tuya.
nonisolated enum TuyaDPValue: Hashable, Sendable {
    case bool(Bool)
    case int(Int)
    case string(String)

    init?(_ any: Any) {
        switch any {
        case let value as Bool: self = .bool(value)
        case let value as Int: self = .int(value)
        case let value as NSNumber: self = .int(value.intValue)
        case let value as String: self = .string(value)
        default: return nil
        }
    }

    var anyValue: Any {
        switch self {
        case .bool(let value): value
        case .int(let value): value
        case .string(let value): value
        }
    }
}

/// Retrato de um dispositivo Tuya, já desacoplado das classes do SDK.
nonisolated struct TuyaDevice: Hashable, Sendable {
    var id: String
    var name: String
    var isOnline: Bool
    /// dpId → valor
    var dps: [String: TuyaDPValue]
    /// código do DP (ex.: "switch_led") → dpId
    var codes: [String: String]
    /// Faixa de valores inteiros declarada no schema (código → min...max).
    var ranges: [String: ClosedRange<Int>] = [:]
}

/// Ponte para o SDK da Tuya. A implementação real (`ThingTuyaClient`) só é compilada quando o
/// SDK está instalado; o restante do app depende apenas deste protocolo.
protocol TuyaClient: AnyObject {
    /// `nil` quando o SDK está pronto; senão, o motivo para exibir ao usuário.
    var unavailableReason: String? { get }
    var hasAccount: Bool { get }
    /// Inicia o SDK e garante uma conta anônima (criada automaticamente, sem e-mail nem senha).
    func connect() async throws
    func devices() async throws -> [TuyaDevice]
    func publish(_ dps: [String: TuyaDPValue], to deviceID: String) async throws
    /// Pareamento no modo AP (o iPhone se conecta ao Wi‑Fi temporário da lâmpada).
    func pairAP(ssid: String, password: String, timeout: TimeInterval) async throws -> TuyaDevice
    func cancelPairing()
    func remove(deviceID: String) async throws
    /// Exclui a conta anônima e todos os dados dela na nuvem Tuya (imediato, segundo a Tuya).
    func deleteAccount() async throws
    /// Atualizações de estado enviadas pelos dispositivos.
    var onDeviceUpdate: ((TuyaDevice) -> Void)? { get set }
}

/// Usado quando o SDK da Tuya não está no build (ex.: antes de configurar as credenciais).
final class UnavailableTuyaClient: TuyaClient {
    let unavailableReason: String? = String(localized: "A integração Tuya ainda não foi configurada neste build do Lumi.")
    let hasAccount = false
    var onDeviceUpdate: ((TuyaDevice) -> Void)?
    func connect() async throws { throw ProviderError(unavailableReason!) }
    func devices() async throws -> [TuyaDevice] { [] }
    func publish(_ dps: [String: TuyaDPValue], to deviceID: String) async throws { throw ProviderError(unavailableReason!) }
    func pairAP(ssid: String, password: String, timeout: TimeInterval) async throws -> TuyaDevice { throw ProviderError(unavailableReason!) }
    func cancelPairing() {}
    func remove(deviceID: String) async throws {}
    func deleteAccount() async throws {}
}

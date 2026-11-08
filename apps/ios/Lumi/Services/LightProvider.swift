import Foundation

enum ProviderStatus: Equatable {
    case idle
    case loading
    case ready
    /// O usuário precisa agir (dar permissão, configurar) — a mensagem explica o quê.
    case actionNeeded(String)
    case unavailable(String)
    case failed(String)
}

/// Uma integração que fornece lâmpadas (HomeKit, Tuya…).
protocol LightProvider: AnyObject, Observable {
    var source: LightSource { get }
    var lights: [Light] { get }
    var status: ProviderStatus { get }
    func start() async
    func refresh() async
    func send(_ command: LightCommand, to lightID: String) async throws
}

struct ProviderError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
    init(_ message: String) { self.message = message }
}

import Foundation

/// Implementado pelo app para excluir a conta do Lumi.
///
/// No modelo atual (Smart Life App SDK da Tuya), a implementação deve chamar a API de cancelamento
/// de conta do SDK (`ThingSmartUser.sharedInstance().cancelAccount`) e, em seguida, limpar a sessão.
/// Exigido pela App Review Guideline 5.1.1(v): a exclusão precisa ser iniciável dentro do app.
@MainActor
public protocol LumiAccountDeleting: AnyObject {
    /// `true` quando há uma conta do Lumi conectada neste aparelho.
    var hasAccount: Bool { get }
    func deleteAccount() async throws
}

/// Implementado pelo app para apagar dados locais (ambientes, cenas, favoritos, preferências, cache e sessão).
@MainActor
public protocol LumiLocalDataErasing: AnyObject {
    func eraseLocalData() async throws
}

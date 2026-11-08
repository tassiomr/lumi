import Foundation

/// Páginas públicas do site oficial do Lumi.
///
/// Os caminhos precisam ser idênticos aos de `apps/website/lib/routes.ts`;
/// `npm run check:links` (no site) falha se divergirem.
public enum LumiPage: String, CaseIterable, Identifiable, Sendable {
    case privacy
    case terms
    case support
    case compatibility
    case privacyChoices
    case deleteAccount

    public var id: String { rawValue }

    public var path: String {
        switch self {
        case .privacy: "/privacy"
        case .terms: "/terms"
        case .support: "/support"
        case .compatibility: "/compatibility"
        case .privacyChoices: "/privacy-choices"
        case .deleteAccount: "/delete-account"
        }
    }

    public var title: String {
        switch self {
        case .privacy: String(localized: "Política de Privacidade")
        case .terms: String(localized: "Termos de Uso")
        case .support: String(localized: "Central de Suporte")
        case .compatibility: String(localized: "Compatibilidade")
        case .privacyChoices: String(localized: "Preferências de Privacidade")
        case .deleteAccount: String(localized: "Exclusão de Conta e Dados")
        }
    }

    public var systemImage: String {
        switch self {
        case .privacy: "hand.raised"
        case .terms: "doc.text"
        case .support: "questionmark.circle"
        case .compatibility: "lightbulb.2"
        case .privacyChoices: "slider.horizontal.3"
        case .deleteAccount: "trash"
        }
    }
}

/// Monta as URLs do site a partir do domínio oficial.
public struct LumiLinks: Sendable, Equatable {
    /// Chave do Info.plist com o domínio oficial (ex.: defina `LUMI_WEBSITE_URL` no .xcconfig
    /// e use `$(LUMI_WEBSITE_URL)` como valor de `LumiWebsiteURL`).
    public static let infoPlistKey = "LumiWebsiteURL"

    public let baseURL: URL

    /// Aceita apenas `https` (ou `http://localhost` para desenvolvimento) e remove a barra final.
    public init?(baseURL: URL) {
        guard let scheme = baseURL.scheme?.lowercased(), let host = baseURL.host(), !host.isEmpty else { return nil }
        let isLocal = host == "localhost" || host == "127.0.0.1"
        guard scheme == "https" || (scheme == "http" && isLocal) else { return nil }
        var string = baseURL.absoluteString
        while string.hasSuffix("/") { string.removeLast() }
        guard let normalized = URL(string: string) else { return nil }
        self.baseURL = normalized
    }

    public init?(string: String) {
        guard let url = URL(string: string.trimmingCharacters(in: .whitespacesAndNewlines)) else { return nil }
        self.init(baseURL: url)
    }

    /// Lê o domínio do Info.plist. Retorna `nil` se a chave estiver ausente, vazia ou inválida.
    public static func fromBundle(_ bundle: Bundle = .main) -> LumiLinks? {
        guard let value = bundle.object(forInfoDictionaryKey: infoPlistKey) as? String else { return nil }
        return LumiLinks(string: value)
    }

    public func url(for page: LumiPage) -> URL {
        baseURL.appending(path: String(page.path.dropFirst()))
    }

    public var homeURL: URL { baseURL }
}

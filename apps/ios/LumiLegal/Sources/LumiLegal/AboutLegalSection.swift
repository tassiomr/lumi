import SwiftUI

/// Seção "Sobre e Legal" para a tela de Configurações do Lumi.
///
/// ```swift
/// Form {
///     // ...outras seções
///     AboutLegalSection(account: session, localData: store)
/// }
/// ```
///
/// Os links abrem no navegador do sistema (Safari), o que mantém VoiceOver, Dynamic Type,
/// leitor e tradução funcionando como no site.
public struct AboutLegalSection: View {
    private let links: LumiLinks?
    private let account: (any LumiAccountDeleting)?
    private let localData: (any LumiLocalDataErasing)?

    public init(
        links: LumiLinks? = .fromBundle(),
        account: (any LumiAccountDeleting)? = nil,
        localData: (any LumiLocalDataErasing)? = nil
    ) {
        self.links = links
        self.account = account
        self.localData = localData
    }

    public var body: some View {
        Section {
            if let links {
                ForEach(Self.webPages) { page in
                    Link(destination: links.url(for: page)) {
                        Label(page.title, systemImage: page.systemImage)
                    }
                    .accessibilityHint(Text("Abre no Safari"))
                }
            } else {
                Label("Domínio do site não configurado (\(LumiLinks.infoPlistKey) no Info.plist).",
                      systemImage: "exclamationmark.triangle")
                    .foregroundStyle(.secondary)
            }
            // A exclusão funciona dentro do app mesmo sem o site configurado.
            NavigationLink {
                DataDeletionView(links: links, account: account, localData: localData)
            } label: {
                Label(LumiPage.deleteAccount.title, systemImage: LumiPage.deleteAccount.systemImage)
            }
            LabeledContent("Versão", value: Self.appVersion)
            LabeledContent("Desenvolvedor", value: "TR Media")
        } header: {
            Text("Sobre e Legal")
        }
    }

    /// Páginas abertas diretamente; a exclusão tem uma tela própria com ações dentro do app.
    nonisolated static let webPages: [LumiPage] = [.privacy, .terms, .support, .compatibility, .privacyChoices]

    static var appVersion: String {
        let info = Bundle.main.infoDictionary
        let short = info?["CFBundleShortVersionString"] as? String ?? "—"
        let build = info?["CFBundleVersion"] as? String ?? "—"
        return "\(short) (\(build))"
    }
}

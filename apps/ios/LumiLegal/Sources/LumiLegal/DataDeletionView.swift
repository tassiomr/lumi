import SwiftUI

/// Tela "Exclusão de Conta e Dados": ações executadas dentro do app + instruções e link para o site.
public struct DataDeletionView: View {
    let links: LumiLinks?
    let account: (any LumiAccountDeleting)?
    let localData: (any LumiLocalDataErasing)?

    @State private var confirming: Action?
    @State private var working = false
    @State private var resultMessage: String?

    enum Action: Identifiable {
        case eraseLocal, deleteAccount
        var id: Self { self }
    }

    public init(links: LumiLinks?, account: (any LumiAccountDeleting)?, localData: (any LumiLocalDataErasing)?) {
        self.links = links
        self.account = account
        self.localData = localData
    }

    public var body: some View {
        Form {
            if localData != nil {
                Section {
                    Button("Apagar dados locais", role: .destructive) { confirming = .eraseLocal }
                } footer: {
                    Text("Remove cenas, ambientes, favoritos e preferências salvos neste iPhone. Suas lâmpadas Tuya continuam conectadas, e os dados do app Casa não são alterados.")
                }
            }

            if let account, account.hasAccount {
                Section {
                    Button("Excluir conta", role: .destructive) { confirming = .deleteAccount }
                } footer: {
                    Text("Exclui a conta anônima do Lumi e as lâmpadas vinculadas a ela na nuvem da Tuya. Depois disso, as lâmpadas precisam ser resetadas e pareadas de novo. Contas Smart Life ou Tuya Smart não são afetadas.")
                }
            }

            homeKitSection

            if let links {
                Section {
                    Link(destination: links.url(for: .deleteAccount)) {
                        Label("Detalhes no site", systemImage: "safari")
                    }
                }
            }
        }
        .navigationTitle(LumiPage.deleteAccount.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .disabled(working)
        .overlay { if working { ProgressView() } }
        .confirmationDialog(
            confirming == .deleteAccount ? "Excluir sua conta do Lumi?" : "Apagar os dados locais?",
            isPresented: Binding(get: { confirming != nil }, set: { if !$0 { confirming = nil } }),
            titleVisibility: .visible,
            presenting: confirming
        ) { action in
            Button(action == .deleteAccount ? "Excluir conta" : "Apagar dados", role: .destructive) {
                Task { await perform(action) }
            }
            Button("Cancelar", role: .cancel) {}
        } message: { action in
            Text(action == .deleteAccount
                 ? "Esta ação não pode ser desfeita."
                 : "Esta ação não pode ser desfeita.")
        }
        .alert(
            "Exclusão de dados",
            isPresented: Binding(get: { resultMessage != nil }, set: { if !$0 { resultMessage = nil } })
        ) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(resultMessage ?? "")
        }
    }

    private var homeKitSection: some View {
        Section {
            if let settings = Self.appSettingsURL {
                Link("Gerenciar acesso aos dados da Casa", destination: settings)
            }
        } header: {
            Text("HomeKit")
        } footer: {
            Text("Desativar o acesso remove a permissão do Lumi. Sua casa e seus acessórios continuam no app Casa.")
        }
    }

    /// Abre Ajustes › Lumi, onde ficam as permissões de Dados da Casa, Rede Local, Bluetooth e Localização.
    private static var appSettingsURL: URL? {
        #if os(iOS)
        URL(string: UIApplication.openSettingsURLString)
        #else
        nil
        #endif
    }

    private func perform(_ action: Action) async {
        working = true
        defer { working = false }
        do {
            switch action {
            case .eraseLocal:
                try await localData?.eraseLocalData()
                resultMessage = "Os dados locais foram apagados."
            case .deleteAccount:
                try await account?.deleteAccount()
                try await localData?.eraseLocalData()
                resultMessage = "Sua conta foi excluída."
            }
        } catch {
            resultMessage = "Não foi possível concluir: \(error.localizedDescription)"
        }
    }
}

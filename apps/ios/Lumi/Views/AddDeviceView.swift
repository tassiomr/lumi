import SwiftUI
import TRDesignSystem

/// Pareamento de lâmpadas Tuya no modo AP (ponto de acesso), recomendado pela Tuya para iOS.
/// A senha do Wi‑Fi é enviada à lâmpada durante o pareamento e não é guardada pelo Lumi.
struct AddDeviceView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @Environment(\.trTheme) private var theme

    enum Step { case choose, prepare, network, joinHotspot, pairing, done(Light?), failed(String) }

    @State private var step: Step = .choose
    @State private var ssid = ""
    @State private var password = ""
    @State private var task: Task<Void, Never>?

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Adicionar lâmpada")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Fechar") {
                            if case .pairing = step { model.tuya.cancelPairing() }
                            task?.cancel()
                            dismiss()
                        }
                    }
                }
        }
    }

    @ViewBuilder private var content: some View {
        switch step {
        case .choose:
            Form {
                Section {
                    Link(destination: URL(string: "x-hm://")!) {
                        Label("HomeKit ou Matter — abrir o app Casa", trIcon: .home)
                    }
                } footer: {
                    Text("No app Casa, toque em + › Adicionar Acessório e escaneie o código da lâmpada. Ela aparecerá no Lumi automaticamente.")
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
                Section {
                    Button {
                        step = .prepare
                    } label: {
                        Label("Lâmpada Tuya (Wi‑Fi)", trIcon: .wifi)
                    }
                    .disabled(!model.tuya.isConfigured)
                } footer: {
                    if model.tuya.isConfigured {
                        Text("Para lâmpadas da plataforma Tuya. Na primeira vez, o Lumi cria automaticamente uma conta anônima na nuvem da Tuya, sem e-mail nem senha.")
                    } else {
                        Text("A integração Tuya ainda não está disponível nesta versão do Lumi.")
                    }
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
            }
            .themedForm(theme)

        case .prepare:
            InstructionsView(
                icon: .lightPairing,
                title: "Coloque a lâmpada em modo de pareamento",
                steps: [
                    "Ligue e desligue a lâmpada 3 vezes até ela piscar rápido.",
                    "Repita mais 3 vezes até ela piscar devagar — esse é o modo AP.",
                    "Consulte o manual se o seu modelo usar outra sequência.",
                ],
                button: "A lâmpada está piscando devagar"
            ) { step = .network }

        case .network:
            Form {
                Section {
                    TextField("Nome da rede Wi‑Fi", text: $ssid)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textContentType(.username)
                    SecureField("Senha do Wi‑Fi", text: $password)
                        .textContentType(.password)
                } header: {
                    Text("Sua rede Wi‑Fi")
                } footer: {
                    Text("A maioria das lâmpadas só funciona em redes de 2,4 GHz. A senha é enviada apenas para a lâmpada durante o pareamento e não é guardada pelo Lumi.")
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
                Section {
                    TRButton("Continuar", size: .large, fullWidth: true) { step = .joinHotspot }
                        .disabled(ssid.trimmingCharacters(in: .whitespaces).isEmpty)
                        .listRowInsets(EdgeInsets())
                        .listRowBackground(Color.clear)
                }
            }
            .themedForm(theme)

        case .joinHotspot:
            InstructionsView(
                icon: .router,
                title: "Conecte o iPhone à lâmpada",
                steps: [
                    "Abra Ajustes › Wi‑Fi.",
                    "Escolha a rede da lâmpada (geralmente “SmartLife-XXXX”).",
                    "Volte ao Lumi e toque em Parear.",
                ],
                button: "Parear"
            ) { startPairing() }

        case .pairing:
            TRStateView(.loading, title: "Pareando…", message: "Isso pode levar até 2 minutos. Mantenha o Lumi aberto e a lâmpada ligada.")
                .trPagePadding()
                .frame(maxHeight: .infinity)
                .background(theme.colors.background.secondary)

        case .done(let light):
            TRStateView(
                .success,
                title: "Lâmpada adicionada",
                message: light.map { "“\($0.name)” já pode ser controlada no Lumi." as LocalizedStringKey } ?? "Sua lâmpada já pode ser controlada no Lumi.",
                action: .init("Concluir") { dismiss() }
            )
            .trPagePadding()
            .frame(maxHeight: .infinity)
            .background(theme.colors.background.secondary)

        case .failed(let message):
            TRStateView(.error, title: "Não foi possível parear", message: "\(message)", action: .init("Tentar novamente") { step = .prepare })
                .trPagePadding()
                .frame(maxHeight: .infinity)
                .background(theme.colors.background.secondary)
        }
    }

    private func startPairing() {
        step = .pairing
        task = Task {
            do {
                let light = try await model.tuya.pair(ssid: ssid.trimmingCharacters(in: .whitespaces), password: password)
                password = ""
                step = .done(light)
            } catch is CancellationError {
                step = .network
            } catch {
                password = ""
                step = .failed(error.localizedDescription)
            }
        }
    }
}

private struct InstructionsView: View {
    @Environment(\.trTheme) private var theme
    let icon: TRIcon
    let title: LocalizedStringKey
    let steps: [LocalizedStringKey]
    let button: LocalizedStringKey
    let action: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: theme.spacing.lg) {
                TRIconView(icon, size: .large)
                    .trTextStyle(.largeTitle)
                    .foregroundStyle(theme.colors.foreground.accent)
                    .frame(maxWidth: .infinity)
                Text(title)
                    .trTextStyle(.title2)
                    .foregroundStyle(theme.colors.foreground.primary)
                    .accessibilityAddTraits(.isHeader)
                VStack(alignment: .leading, spacing: theme.spacing.stack.loose) {
                    ForEach(Array(steps.enumerated()), id: \.offset) { index, text in
                        HStack(alignment: .firstTextBaseline, spacing: theme.spacing.sm) {
                            TRBadge(verbatim: "\(index + 1)", tone: .accent)
                            Text(text)
                                .trTextStyle(.body)
                                .foregroundStyle(theme.colors.foreground.primary)
                        }
                    }
                }
                TRButton(button, size: .large, fullWidth: true) { action() }
            }
            .trPagePadding()
        }
        .background(theme.colors.background.secondary)
    }
}

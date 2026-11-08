import SwiftUI

/// Pareamento de lâmpadas Tuya no modo AP (ponto de acesso), recomendado pela Tuya para iOS.
/// A senha do Wi‑Fi é enviada à lâmpada durante o pareamento e não é guardada pelo Lumi.
struct AddDeviceView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss

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
                        Label("HomeKit ou Matter — abrir o app Casa", systemImage: "house")
                    }
                } footer: {
                    Text("No app Casa, toque em + › Adicionar Acessório e escaneie o código da lâmpada. Ela aparecerá no Lumi automaticamente.")
                }
                Section {
                    Button {
                        step = .prepare
                    } label: {
                        Label("Lâmpada Tuya (Wi‑Fi)", systemImage: "wifi")
                    }
                    .disabled(!model.tuya.isConfigured)
                } footer: {
                    if model.tuya.isConfigured {
                        Text("Para lâmpadas da plataforma Tuya. Na primeira vez, o Lumi cria automaticamente uma conta anônima na nuvem da Tuya, sem e-mail nem senha.")
                    } else {
                        Text("A integração Tuya ainda não está disponível nesta versão do Lumi.")
                    }
                }
            }

        case .prepare:
            InstructionsView(
                symbol: "lightbulb.max",
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
                Section {
                    Button("Continuar") { step = .joinHotspot }
                        .disabled(ssid.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }

        case .joinHotspot:
            InstructionsView(
                symbol: "wifi.router",
                title: "Conecte o iPhone à lâmpada",
                steps: [
                    "Abra Ajustes › Wi‑Fi.",
                    "Escolha a rede da lâmpada (geralmente “SmartLife-XXXX”).",
                    "Volte ao Lumi e toque em Parear.",
                ],
                button: "Parear"
            ) { startPairing() }

        case .pairing:
            VStack(spacing: 20) {
                ProgressView().controlSize(.large)
                Text("Pareando…").font(.title3.weight(.semibold))
                Text("Isso pode levar até 2 minutos. Mantenha o Lumi aberto e a lâmpada ligada.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .padding(32)
            .frame(maxHeight: .infinity)

        case .done(let light):
            ContentUnavailableView {
                Label("Lâmpada adicionada", systemImage: "checkmark.circle.fill")
            } description: {
                Text(light.map { "“\($0.name)” já pode ser controlada no Lumi." } ?? "Sua lâmpada já pode ser controlada no Lumi.")
            } actions: {
                Button("Concluir") { dismiss() }.buttonStyle(.borderedProminent)
            }

        case .failed(let message):
            ContentUnavailableView {
                Label("Não foi possível parear", systemImage: "exclamationmark.triangle")
            } description: {
                Text(message)
            } actions: {
                Button("Tentar novamente") { step = .prepare }.buttonStyle(.borderedProminent)
            }
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
    let symbol: String
    let title: LocalizedStringKey
    let steps: [LocalizedStringKey]
    let button: LocalizedStringKey
    let action: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image(systemName: symbol)
                    .font(.system(size: 48))
                    .foregroundStyle(Theme.gradient)
                    .frame(maxWidth: .infinity)
                    .accessibilityHidden(true)
                Text(title).font(.title2.weight(.semibold))
                VStack(alignment: .leading, spacing: 14) {
                    ForEach(Array(steps.enumerated()), id: \.offset) { index, text in
                        HStack(alignment: .top, spacing: 12) {
                            Text("\(index + 1)")
                                .font(.subheadline.weight(.semibold))
                                .frame(width: 28, height: 28)
                                .background(Theme.electric.opacity(0.15), in: Circle())
                                .foregroundStyle(Theme.electric)
                            Text(text)
                        }
                    }
                }
                Button(action: action) {
                    Text(button).frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding(24)
        }
    }
}

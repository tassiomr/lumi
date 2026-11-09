import LumiLegal
import SwiftUI
import TRDesignSystem

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(LightStore.self) private var store
    @Environment(\.trTheme) private var theme
    @State private var addingDevice = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    ForEach(store.providers, id: \.source) { provider in
                        IntegrationRow(provider: provider)
                    }
                    if model.tuya.isConfigured {
                        Button { addingDevice = true } label: { Label("Adicionar lâmpada Tuya", trIcon: .addCircle) }
                    }
                } header: {
                    Text("Integrações")
                } footer: {
                    Text("Lâmpadas do HomeKit e Matter são adicionadas pelo app Casa. Lâmpadas Tuya são pareadas aqui no Lumi, sem e-mail nem senha.")
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))

                AboutLegalSection(account: model.tuya.isConfigured ? model.tuya : nil, localData: model.local)
            }
            .themedForm(theme)
            .navigationTitle("Configurações")
            .sheet(isPresented: $addingDevice) { AddDeviceView() }
        }
    }
}

private struct IntegrationRow: View {
    @Environment(\.trTheme) private var theme
    let provider: any LightProvider

    var body: some View {
        TRListRow(verbatim: provider.source.displayName, subtitle: detail) {
            TRIconView(icon, renderingMode: .monochrome).foregroundStyle(tone.foreground(theme.colors))
        }
    }

    private var detail: String {
        switch provider.status {
        case .ready: String(localized: "\(provider.lights.count) lâmpadas")
        case .loading: String(localized: "Carregando…")
        case .idle: String(localized: "Aguardando")
        case .actionNeeded(let text), .unavailable(let text), .failed(let text): text
        }
    }

    private var icon: TRIcon {
        switch provider.status {
        case .ready: .success
        case .failed: .warning
        case .loading, .idle: .pending
        default: .info
        }
    }

    private var tone: TRTone {
        switch provider.status {
        case .ready: .success
        case .failed: .warning
        default: .neutral
        }
    }
}

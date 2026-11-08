import LumiLegal
import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(LightStore.self) private var store
    @State private var addingDevice = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    ForEach(store.providers, id: \.source) { provider in
                        IntegrationRow(provider: provider)
                    }
                    if model.tuya.isConfigured {
                        Button { addingDevice = true } label: { Label("Adicionar lâmpada Tuya", systemImage: "plus.circle") }
                    }
                } header: {
                    Text("Integrações")
                } footer: {
                    Text("Lâmpadas do HomeKit e Matter são adicionadas pelo app Casa. Lâmpadas Tuya são pareadas aqui no Lumi, sem e-mail nem senha.")
                }

                AboutLegalSection(account: model.tuya.isConfigured ? model.tuya : nil, localData: model.local)
            }
            .navigationTitle("Configurações")
            .sheet(isPresented: $addingDevice) { AddDeviceView() }
        }
    }
}

private struct IntegrationRow: View {
    let provider: any LightProvider

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(provider.source.displayName)
                Text(detail).font(.footnote).foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: icon).foregroundStyle(color)
        }
        .accessibilityElement(children: .combine)
    }

    private var detail: String {
        switch provider.status {
        case .ready: String(localized: "\(provider.lights.count) lâmpadas")
        case .loading: String(localized: "Carregando…")
        case .idle: String(localized: "Aguardando")
        case .actionNeeded(let text), .unavailable(let text), .failed(let text): text
        }
    }

    private var icon: String {
        switch provider.status {
        case .ready: "checkmark.circle.fill"
        case .failed: "exclamationmark.triangle.fill"
        case .loading, .idle: "clock"
        default: "info.circle"
        }
    }

    private var color: Color {
        switch provider.status {
        case .ready: .green
        case .failed: .orange
        default: .secondary
        }
    }
}

import SwiftUI

struct RootView: View {
    @Environment(LightStore.self) private var store

    var body: some View {
        @Bindable var store = store
        TabView {
            Tab("Luzes", systemImage: "lightbulb.2") { LightsView() }
            Tab("Cenas", systemImage: "sparkles") { ScenesView() }
            Tab("Configurações", systemImage: "gearshape") { SettingsView() }
        }
        .alert("Algo deu errado", isPresented: Binding(get: { store.lastError != nil }, set: { if !$0 { store.lastError = nil } })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(store.lastError ?? "")
        }
    }
}

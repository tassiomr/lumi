import SwiftUI
import TRDesignSystem

struct ScenesView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @Environment(\.trTheme) private var theme
    @State private var editing: LumiScene?
    @State private var creating = false
    @State private var applied: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: theme.spacing.section) {
                    if store.local.scenes.isEmpty && homeScenes.isEmpty {
                        TRStateView(
                            .empty,
                            title: "Nenhuma cena ainda",
                            message: "Ajuste as luzes do jeito que você gosta e salve como uma cena para repetir com um toque.",
                            icon: .sparkles,
                            action: store.lights.isEmpty ? nil : .init("Criar cena") { creating = true }
                        )
                    }

                    if !store.local.scenes.isEmpty {
                        VStack(alignment: .leading, spacing: theme.spacing.stack.loose) {
                            TRSectionHeader("Cenas do Lumi")
                            TRAdaptiveGrid(minimumItemWidth: 150, spacing: theme.spacing.sm) {
                                ForEach(store.local.scenes) { scene in
                                    SceneCard(title: scene.name, symbol: scene.symbol, subtitle: lightCount(scene), isApplied: applied == scene.id.uuidString) {
                                        applied = scene.id.uuidString
                                        Task { await store.apply(scene) }
                                    }
                                    .contextMenu {
                                        Button { editing = scene } label: { Label("Editar", trIcon: .edit) }
                                        Button(role: .destructive) { store.local.deleteScene(scene.id) } label: { Label("Apagar", trIcon: .delete) }
                                    }
                                }
                            }
                        }
                    }

                    if !homeScenes.isEmpty {
                        VStack(alignment: .leading, spacing: theme.spacing.stack.loose) {
                            TRSectionHeader("Cenas do app Casa")
                            TRAdaptiveGrid(minimumItemWidth: 150, spacing: theme.spacing.sm) {
                                ForEach(homeScenes) { scene in
                                    SceneCard(title: scene.name, symbol: "house", subtitle: String(localized: "HomeKit"), isApplied: applied == scene.id) {
                                        applied = scene.id
                                        Task {
                                            do { try await model.homeKit?.execute(scene) } catch { store.lastError = error.localizedDescription }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .trPagePadding()
            }
            .background(theme.colors.background.secondary)
            .navigationTitle("Cenas")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { creating = true } label: { Label("Nova cena", trIcon: .add) }
                        .disabled(store.lights.isEmpty)
                }
            }
            .sheet(isPresented: $creating) { SceneEditorView(scene: nil) }
            .sheet(item: $editing) { scene in SceneEditorView(scene: scene) }
        }
    }

    private var homeScenes: [HomeScene] { model.homeKit?.scenes ?? [] }

    private func lightCount(_ scene: LumiScene) -> String {
        String(localized: "\(scene.entries.count) lâmpadas")
    }
}

struct SceneCard: View {
    @Environment(\.trTheme) private var theme
    let title: String
    let symbol: String
    let subtitle: String
    let isApplied: Bool
    let action: () -> Void

    var body: some View {
        let iconSize = theme.metrics.minimumHitTarget
        Button(action: action) {
            TRCard(.elevated, padding: theme.spacing.inset.regular) {
                VStack(alignment: .leading, spacing: theme.spacing.stack.loose) {
                    Image(systemName: symbol)
                        .trTextStyle(.title2)
                        .foregroundStyle(theme.colors.action.onAccent)
                        .frame(width: iconSize, height: iconSize)
                        .background(theme.colors.action.accent, in: .tr(theme.shape.control))
                    VStack(alignment: .leading, spacing: theme.spacing.xxxs) {
                        Text(title).trTextStyle(.headline).foregroundStyle(theme.colors.foreground.primary).lineLimit(2)
                        Text(subtitle).trTextStyle(.subheadline).foregroundStyle(theme.colors.foreground.secondary)
                    }
                }
            }
            .overlay {
                if isApplied {
                    RoundedRectangle.tr(theme.shape.card)
                        .strokeBorder(theme.colors.action.primary, lineWidth: TRBorder.emphasized)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isApplied ? .isSelected : [])
        .accessibilityHint("Aplica a cena")
    }
}

struct SceneEditorView: View {
    @Environment(LightStore.self) private var store
    @Environment(\.trTheme) private var theme
    @Environment(\.dismiss) private var dismiss
    let scene: LumiScene?

    @State private var name = ""
    @State private var symbol = LumiScene.symbols[0]
    @State private var selected: Set<String> = []

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Nome da cena", text: $name)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: theme.spacing.sm) {
                        ForEach(LumiScene.symbols, id: \.self) { item in
                            let isSelected = symbol == item
                            let size = theme.metrics.height(.large)
                            Button { symbol = item } label: {
                                Image(systemName: item)
                                    .trTextStyle(.title3)
                                    .frame(width: size, height: size)
                                    .foregroundStyle(isSelected ? theme.colors.action.onPrimary : theme.colors.foreground.primary)
                                    .background(isSelected ? theme.colors.action.primary : theme.colors.background.tertiary,
                                                in: .tr(theme.shape.control))
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel(item)
                            .accessibilityAddTraits(symbol == item ? .isSelected : [])
                        }
                    }
                    .padding(.vertical, theme.spacing.xxs)
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
                Section {
                    ForEach(store.lights) { light in
                        Button {
                            if selected.contains(light.id) { selected.remove(light.id) } else { selected.insert(light.id) }
                        } label: {
                            TRListRow(
                                verbatim: light.name,
                                subtitle: light.room ?? light.source.displayName,
                                icon: light.state.isOn ? .lightOn : .light,
                                iconTint: light.state.isOn ? theme.colors.lightOn : theme.colors.foreground.tertiary
                            ) {
                                if selected.contains(light.id) {
                                    TRIconView(.checkmark).foregroundStyle(theme.colors.foreground.accent)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                        .accessibilityAddTraits(selected.contains(light.id) ? .isSelected : [])
                    }
                } header: {
                    Text("Lâmpadas")
                } footer: {
                    Text("A cena salva o estado atual das lâmpadas escolhidas — ligada ou desligada, brilho, cor e temperatura. Ela fica guardada apenas neste iPhone.")
                }
                .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
            }
            .themedForm(theme)
            .navigationTitle(scene == nil ? "Nova cena" : "Editar cena")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || selected.isEmpty)
                }
            }
            .onAppear {
                if let scene {
                    name = scene.name
                    symbol = scene.symbol
                    selected = Set(scene.entries.map(\.lightID))
                } else {
                    selected = Set(store.lights.filter(\.state.isOn).map(\.id))
                }
            }
        }
    }

    private func save() {
        var new = store.makeScene(name: name.trimmingCharacters(in: .whitespaces), symbol: symbol, lightIDs: selected)
        if let scene { new.id = scene.id }
        store.local.upsert(new)
        dismiss()
    }
}

import SwiftUI

struct ScenesView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @State private var editing: LumiScene?
    @State private var creating = false
    @State private var applied: String?

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    if store.local.scenes.isEmpty && homeScenes.isEmpty {
                        ContentUnavailableView {
                            Label("Nenhuma cena ainda", systemImage: "sparkles")
                        } description: {
                            Text("Ajuste as luzes do jeito que você gosta e salve como uma cena para repetir com um toque.")
                        } actions: {
                            Button("Criar cena") { creating = true }
                                .buttonStyle(.borderedProminent)
                                .disabled(store.lights.isEmpty)
                        }
                        .padding(.top, 40)
                    }

                    if !store.local.scenes.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Cenas do Lumi").font(.title3.weight(.semibold)).accessibilityAddTraits(.isHeader)
                            LazyVGrid(columns: columns, spacing: 12) {
                                ForEach(store.local.scenes) { scene in
                                    SceneCard(title: scene.name, symbol: scene.symbol, subtitle: lightCount(scene), isApplied: applied == scene.id.uuidString) {
                                        applied = scene.id.uuidString
                                        Task { await store.apply(scene) }
                                    }
                                    .contextMenu {
                                        Button("Editar", systemImage: "pencil") { editing = scene }
                                        Button("Apagar", systemImage: "trash", role: .destructive) { store.local.deleteScene(scene.id) }
                                    }
                                }
                            }
                        }
                    }

                    if !homeScenes.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Cenas do app Casa").font(.title3.weight(.semibold)).accessibilityAddTraits(.isHeader)
                            LazyVGrid(columns: columns, spacing: 12) {
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
                .padding()
            }
            .background(BackgroundGlow())
            .navigationTitle("Cenas")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { creating = true } label: { Label("Nova cena", systemImage: "plus") }
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
    let title: String
    let symbol: String
    let subtitle: String
    let isApplied: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 18) {
                Image(systemName: symbol)
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Theme.gradient, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.headline).foregroundStyle(.primary).lineLimit(2)
                    Text(subtitle).font(.subheadline).foregroundStyle(.secondary)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .strokeBorder(isApplied ? Theme.electric.opacity(0.6) : .clear, lineWidth: 1.5)
            }
        }
        .buttonStyle(.plain)
        .accessibilityHint("Aplica a cena")
    }
}

struct SceneEditorView: View {
    @Environment(LightStore.self) private var store
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
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                        ForEach(LumiScene.symbols, id: \.self) { item in
                            Button { symbol = item } label: {
                                Image(systemName: item)
                                    .font(.title3)
                                    .frame(width: 48, height: 48)
                                    .foregroundStyle(symbol == item ? .white : .primary)
                                    .background(symbol == item ? AnyShapeStyle(Theme.gradient) : AnyShapeStyle(Color.secondary.opacity(0.12)),
                                                in: RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel(item)
                            .accessibilityAddTraits(symbol == item ? .isSelected : [])
                        }
                    }
                    .padding(.vertical, 4)
                }
                Section {
                    ForEach(store.lights) { light in
                        Button {
                            if selected.contains(light.id) { selected.remove(light.id) } else { selected.insert(light.id) }
                        } label: {
                            HStack {
                                Image(systemName: light.state.isOn ? "lightbulb.fill" : "lightbulb")
                                    .foregroundStyle(Theme.color(for: light.state))
                                VStack(alignment: .leading) {
                                    Text(light.name).foregroundStyle(.primary)
                                    Text(light.room ?? light.source.displayName).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                if selected.contains(light.id) {
                                    Image(systemName: "checkmark").foregroundStyle(Theme.accent)
                                }
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .accessibilityAddTraits(selected.contains(light.id) ? .isSelected : [])
                    }
                } header: {
                    Text("Lâmpadas")
                } footer: {
                    Text("A cena salva o estado atual das lâmpadas escolhidas — ligada ou desligada, brilho, cor e temperatura. Ela fica guardada apenas neste iPhone.")
                }
            }
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

import SwiftUI

struct LightDetailView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let lightID: String

    @State private var brightness: Double = 1
    @State private var kelvin: Double = 4000
    @State private var color: Color = .white
    @State private var roomName = ""
    @State private var confirmingRemoval = false

    private let presetHues: [Double] = [0, 30, 50, 120, 190, 220, 265, 310]

    var body: some View {
        if let light = store.light(lightID) {
            content(light)
                .onAppear { sync(light) }
                .onChange(of: light.state) { _, _ in sync(light) }
        } else {
            ContentUnavailableView("Lâmpada indisponível", systemImage: "lightbulb.slash")
        }
    }

    private func content(_ light: Light) -> some View {
        Form {
            headerSection(light)
            brightnessSection(light)
            temperatureSection(light)
            colorSection(light)
            infoSection(light)
            removeSection(light)
        }
        .navigationTitle(light.name)
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear { if light.source != .homeKit { store.local.setRoom(roomName, for: light.id) } }
        .confirmationDialog("Remover “\(light.name)”?", isPresented: $confirmingRemoval, titleVisibility: .visible) {
            Button("Remover", role: .destructive) {
                Task {
                    do {
                        try await model.tuya.remove(lightID: light.id)
                        dismiss()
                    } catch {
                        store.lastError = error.localizedDescription
                    }
                }
            }
        }
    }

    @ViewBuilder private func headerSection(_ light: Light) -> some View {
        Section {
            VStack(spacing: 16) {
                Image(systemName: light.state.isOn ? "lightbulb.fill" : "lightbulb")
                    .font(.system(size: 64))
                    .foregroundStyle(Theme.color(for: light.state))
                    .shadow(color: light.state.isOn ? Theme.color(for: light.state).opacity(0.8) : .clear, radius: 28)
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
                    .accessibilityHidden(true)
                Toggle(isOn: Binding(get: { light.state.isOn }, set: { on in Task { await store.send(.power(on), to: light) } })) {
                    Text(light.state.isOn ? "Ligada" : "Desligada").font(.headline)
                }
                .disabled(!light.isReachable)
            }
            if !light.isReachable {
                Label("A lâmpada não está respondendo. Verifique se ela está energizada e conectada.", systemImage: "exclamationmark.triangle")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    @ViewBuilder private func brightnessSection(_ light: Light) -> some View {
        if light.capabilities.contains(.brightness) {
            Section("Brilho") {
                HStack {
                    Image(systemName: "sun.min").accessibilityHidden(true)
                    Slider(value: $brightness, in: 0.01...1) { editing in
                        if !editing { Task { await store.send(.brightness(brightness), to: light) } }
                    }
                    .accessibilityLabel("Brilho")
                    .accessibilityValue("\(Int(brightness * 100))%")
                    Image(systemName: "sun.max.fill").accessibilityHidden(true)
                }
            }
            .disabled(!light.isReachable)
        }
    }

    @ViewBuilder private func temperatureSection(_ light: Light) -> some View {
        if light.capabilities.contains(.temperature) {
            Section("Temperatura de branco") {
                Slider(
                    value: $kelvin,
                    in: light.kelvinRange,
                    label: { Text("Temperatura de branco") },
                    minimumValueLabel: { Text("Quente").font(.caption) },
                    maximumValueLabel: { Text("Fria").font(.caption) },
                    onEditingChanged: { editing in
                        if !editing { Task { await store.send(.temperature(kelvin: kelvin), to: light) } }
                    }
                )
                .tint(Theme.color(kelvin: kelvin))
                .accessibilityLabel("Temperatura de branco")
                .accessibilityValue("\(Int(kelvin)) kelvin")
            }
            .disabled(!light.isReachable)
        }
    }

    @ViewBuilder private func colorSection(_ light: Light) -> some View {
        if light.capabilities.contains(.color) {
            Section("Cor") {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 14) {
                    ForEach(presetHues, id: \.self) { hue in
                        Button {
                            Task { await store.send(.color(hue: hue, saturation: 0.85), to: light) }
                        } label: {
                            Circle()
                                .fill(Color(hue: hue / 360, saturation: 0.85, brightness: 1))
                                .frame(width: 40, height: 40)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(Self.colorName(hue))
                    }
                }
                .padding(.vertical, 6)
                ColorPicker("Outra cor", selection: $color, supportsOpacity: false)
                    .onChange(of: color) { _, newValue in
                        let (hue, saturation) = Self.hueSaturation(newValue)
                        Task { await store.send(.color(hue: hue, saturation: saturation), to: light) }
                    }
            }
            .disabled(!light.isReachable)
        }
    }

    @ViewBuilder private func infoSection(_ light: Light) -> some View {
        Section {
            if light.source == .homeKit {
                LabeledContent("Ambiente", value: light.room ?? String(localized: "Sem ambiente"))
            } else {
                TextField("Ambiente (ex.: Sala)", text: $roomName)
                    .onSubmit { store.local.setRoom(roomName, for: light.id) }
                    .submitLabel(.done)
            }
            Button {
                store.local.toggleFavorite(light.id)
            } label: {
                Label(store.local.isFavorite(light.id) ? "Remover das favoritas" : "Adicionar às favoritas",
                      systemImage: store.local.isFavorite(light.id) ? "star.slash" : "star")
            }
            LabeledContent("Integração", value: light.source.displayName)
        } footer: {
            if light.source == .homeKit {
                Text("Nome e ambiente desta lâmpada são definidos no app Casa.")
            }
        }
    }

    @ViewBuilder private func removeSection(_ light: Light) -> some View {
        if light.source == .tuya {
            Section {
                Button("Remover dispositivo", role: .destructive) { confirmingRemoval = true }
            } footer: {
                Text("A lâmpada sai da sua conta e pode ser pareada novamente.")
            }
        }
    }

    private func sync(_ light: Light) {
        brightness = light.state.brightness ?? 1
        kelvin = min(max(light.state.kelvin ?? 4000, light.kelvinRange.lowerBound), light.kelvinRange.upperBound)
        roomName = store.local.room(for: light.id) ?? ""
    }

    static func hueSaturation(_ color: Color) -> (Double, Double) {
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        UIColor(color).getHue(&h, saturation: &s, brightness: &b, alpha: &a)
        return (Double(h) * 360, Double(s))
    }

    static func colorName(_ hue: Double) -> String {
        switch hue {
        case 0: String(localized: "Vermelho")
        case 30: String(localized: "Laranja")
        case 50: String(localized: "Amarelo")
        case 120: String(localized: "Verde")
        case 190: String(localized: "Ciano")
        case 220: String(localized: "Azul")
        case 265: String(localized: "Violeta")
        default: String(localized: "Rosa")
        }
    }
}

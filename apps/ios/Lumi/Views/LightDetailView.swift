import SwiftUI
import TRDesignSystem

struct LightDetailView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @Environment(\.trTheme) private var theme
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
            TRStateView(.error, title: "Lâmpada indisponível", icon: .lightUnavailable)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(theme.colors.background.secondary)
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
        .themedForm(theme)
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
            VStack(spacing: theme.spacing.stack.loose) {
                TRIconView(light.state.isOn ? .lightOn : .light, size: .large)
                    .trTextStyle(.metric)
                    .foregroundStyle(LightAppearance.style(for: light.state, colors: theme.colors))
                    .shadow(color: light.state.isOn ? theme.colors.glow.color : .clear, radius: theme.spacing.lg)
                    .frame(maxWidth: .infinity)
                    .padding(.top, theme.spacing.xs)
                Toggle(isOn: Binding(get: { light.state.isOn }, set: { on in Task { await store.send(.power(on), to: light) } })) {
                    Text(light.state.isOn ? "Ligada" : "Desligada").trTextStyle(.headline)
                }
                .disabled(!light.isReachable)
            }
            if !light.isReachable {
                TRBanner("Sem resposta", message: "A lâmpada não está respondendo. Verifique se ela está energizada e conectada.", tone: .warning)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
            }
        }
        .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
    }

    @ViewBuilder private func brightnessSection(_ light: Light) -> some View {
        if light.capabilities.contains(.brightness) {
            Section("Brilho") {
                HStack {
                    TRIconView(.brightnessLow)
                    Slider(value: $brightness, in: 0.01...1) { editing in
                        if !editing { Task { await store.send(.brightness(brightness), to: light) } }
                    }
                    .accessibilityLabel("Brilho")
                    .accessibilityValue("\(Int(brightness * 100))%")
                    TRIconView(.brightnessHigh)
                }
                .foregroundStyle(theme.colors.foreground.secondary)
            }
            .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
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
                    minimumValueLabel: { Text("Quente").trTextStyle(.caption) },
                    maximumValueLabel: { Text("Fria").trTextStyle(.caption) },
                    onEditingChanged: { editing in
                        if !editing { Task { await store.send(.temperature(kelvin: kelvin), to: light) } }
                    }
                )
                .tint(LightAppearance.color(kelvin: kelvin))
                .accessibilityLabel("Temperatura de branco")
                .accessibilityValue("\(Int(kelvin)) kelvin")
            }
            .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
            .disabled(!light.isReachable)
        }
    }

    @ViewBuilder private func colorSection(_ light: Light) -> some View {
        if light.capabilities.contains(.color) {
            Section("Cor") {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: theme.spacing.sm) {
                    ForEach(presetHues, id: \.self) { hue in
                        Button {
                            Task { await store.send(.color(hue: hue, saturation: 0.85), to: light) }
                        } label: {
                            Circle()
                                .fill(LightAppearance.color(hue: hue, saturation: 0.85))
                                .frame(width: theme.metrics.minimumHitTarget, height: theme.metrics.minimumHitTarget)
                                .overlay(Circle().strokeBorder(theme.colors.border.subtle, lineWidth: TRBorder.default))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(Self.colorName(hue))
                    }
                }
                .padding(.vertical, theme.spacing.xs)
                ColorPicker("Outra cor", selection: $color, supportsOpacity: false)
                    .onChange(of: color) { _, newValue in
                        let (hue, saturation) = Self.hueSaturation(newValue)
                        Task { await store.send(.color(hue: hue, saturation: saturation), to: light) }
                    }
            }
            .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
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
                      trIcon: store.local.isFavorite(light.id) ? .unfavorite : .favorite)
            }
            LabeledContent("Integração", value: light.source.displayName)
        } footer: {
            if light.source == .homeKit {
                Text("Nome e ambiente desta lâmpada são definidos no app Casa.")
            }
        }
        .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
    }

    @ViewBuilder private func removeSection(_ light: Light) -> some View {
        if light.source == .tuya {
            Section {
                Button("Remover dispositivo", role: .destructive) { confirmingRemoval = true }
            } footer: {
                Text("A lâmpada sai da sua conta e pode ser pareada novamente.")
            }
            .listRowBackground(Rectangle().fill(theme.colors.surface.raised))
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

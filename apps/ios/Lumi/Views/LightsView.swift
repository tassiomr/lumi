import SwiftUI
import TRDesignSystem

struct LightsView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @Environment(\.trTheme) private var theme
    @State private var addingDevice = false

    var body: some View {
        NavigationStack {
            ScrollView {
                if store.lights.isEmpty {
                    EmptyLightsView(addDevice: { addingDevice = true })
                } else {
                    LazyVStack(alignment: .leading, spacing: theme.spacing.section) {
                        if !store.favorites.isEmpty {
                            section(title: String(localized: "Favoritas"), lights: store.favorites, showsBulkActions: false)
                        }
                        ForEach(store.rooms, id: \.name) { room in
                            section(title: room.name, lights: room.lights, showsBulkActions: true)
                        }
                    }
                    .trPagePadding()
                }
            }
            .background(theme.colors.background.secondary)
            .navigationTitle(greeting)
            .navigationDestination(for: String.self) { id in LightDetailView(lightID: id) }
            .refreshable { await store.refresh() }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { addingDevice = true } label: { Label("Adicionar lâmpada", trIcon: .add) }
                }
            }
            .sheet(isPresented: $addingDevice) { AddDeviceView() }
        }
    }

    private func section(title: String, lights: [Light], showsBulkActions: Bool) -> some View {
        VStack(alignment: .leading, spacing: theme.spacing.stack.loose) {
            if showsBulkActions, lights.count > 1 {
                let anyOn = lights.contains { $0.state.isOn }
                TRSectionHeader("\(title)", actionTitle: anyOn ? "Desligar tudo" : "Ligar tudo") {
                    Task { await store.setAll(on: !anyOn, in: lights) }
                }
            } else {
                TRSectionHeader("\(title)")
            }
            TRAdaptiveGrid(minimumItemWidth: 160, spacing: theme.spacing.sm) {
                ForEach(lights) { light in LightTile(light: light) }
            }
        }
    }

    private var greeting: String {
        switch Calendar.current.component(.hour, from: .now) {
        case 5..<12: String(localized: "Bom dia")
        case 12..<18: String(localized: "Boa tarde")
        default: String(localized: "Boa noite")
        }
    }
}

struct LightTile: View {
    @Environment(LightStore.self) private var store
    @Environment(\.trTheme) private var theme
    let light: Light

    var body: some View {
        NavigationLink(value: light.id) {
            TRCard(.elevated, padding: theme.spacing.sm) {
                HStack(spacing: theme.spacing.sm) {
                    Button {
                        Task { await store.toggle(light) }
                    } label: {
                        LightGlyph(state: light.state)
                    }
                    .buttonStyle(.plain)
                    .disabled(!light.isReachable)
                    .accessibilityLabel(light.state.isOn ? "Desligar \(light.name)" : "Ligar \(light.name)")

                    VStack(alignment: .leading, spacing: theme.spacing.xxxs) {
                        Text(light.name)
                            .trTextStyle(.bodyEmphasized)
                            .foregroundStyle(theme.colors.foreground.primary)
                            .lineLimit(1)
                        HStack(spacing: theme.spacing.stack.tight) {
                            if !light.isReachable { TRIconView(.warning, size: .small, renderingMode: .monochrome) }
                            Text(subtitle).lineLimit(1)
                        }
                        .trTextStyle(.footnote)
                        .foregroundStyle(light.isReachable ? theme.colors.foreground.secondary : theme.colors.feedback.warning)
                    }
                    Spacer(minLength: 0)
                }
            }
            .overlay {
                if light.state.isOn {
                    RoundedRectangle.tr(theme.shape.card)
                        .strokeBorder(LightAppearance.style(for: light.state, colors: theme.colors), lineWidth: TRBorder.emphasized)
                        .opacity(0.5)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(light.name), \(subtitle)")
    }

    private var subtitle: String {
        guard light.isReachable else { return String(localized: "Sem resposta") }
        guard light.state.isOn else { return String(localized: "Desligada") }
        if let brightness = light.state.brightness { return "\(Int((brightness * 100).rounded()))%" }
        return String(localized: "Ligada")
    }
}

/// Ícone de lâmpada num círculo com a cor da luz emitida (ou apagada).
struct LightGlyph: View {
    @Environment(\.trTheme) private var theme
    let state: LightState

    var body: some View {
        let size = theme.metrics.minimumHitTarget
        TRIconView(state.isOn ? .lightOn : .light, size: .large)
            .foregroundStyle(state.isOn ? LightAppearance.onLight(theme) : theme.colors.foreground.secondary)
            .frame(width: size, height: size)
            .background {
                Circle()
                    .fill(state.isOn ? LightAppearance.style(for: state, colors: theme.colors) : AnyShapeStyle(theme.colors.background.tertiary))
                    .shadow(color: state.isOn ? theme.colors.glow.color : .clear, radius: theme.spacing.xs)
            }
    }
}

struct EmptyLightsView: View {
    @Environment(AppModel.self) private var model
    @Environment(LightStore.self) private var store
    @Environment(\.trTheme) private var theme
    let addDevice: () -> Void

    var body: some View {
        VStack(spacing: theme.spacing.stack.loose) {
            TRStateView(
                store.isLoading ? .loading : .empty,
                title: "Nenhuma lâmpada por aqui",
                message: "Adicione lâmpadas no app Casa (HomeKit ou Matter) ou pareie uma lâmpada Tuya pelo Lumi.",
                icon: .light
            )
            ForEach(Array(messages.enumerated()), id: \.offset) { _, message in
                TRBanner("\(message)", tone: .info)
            }
            TRButton("Adicionar lâmpada", icon: .add, size: .large, fullWidth: true) { addDevice() }
        }
        .trPagePadding()
    }

    private var messages: [String] {
        store.providers.compactMap { provider in
            switch provider.status {
            case .actionNeeded(let text), .unavailable(let text): "\(provider.source.displayName): \(text)"
            case .failed(let text): "\(provider.source.displayName): \(text)"
            default: nil
            }
        }
    }
}

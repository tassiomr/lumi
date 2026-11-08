import SwiftUI

struct LightsView: View {
    @Environment(LightStore.self) private var store
    @Environment(AppModel.self) private var model
    @State private var addingDevice = false

    private let columns = [GridItem(.adaptive(minimum: 160), spacing: 10)]

    var body: some View {
        NavigationStack {
            ScrollView {
                if store.lights.isEmpty {
                    EmptyLightsView(addDevice: { addingDevice = true })
                        .padding(.top, 40)
                } else {
                    LazyVStack(alignment: .leading, spacing: 28) {
                        if !store.favorites.isEmpty {
                            section(title: String(localized: "Favoritas"), lights: store.favorites, showsBulkActions: false)
                        }
                        ForEach(store.rooms, id: \.name) { room in
                            section(title: room.name, lights: room.lights, showsBulkActions: true)
                        }
                    }
                    .padding()
                }
            }
            .background(BackgroundGlow())
            .navigationTitle(greeting)
            .navigationDestination(for: String.self) { id in LightDetailView(lightID: id) }
            .refreshable { await store.refresh() }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { addingDevice = true } label: { Label("Adicionar lâmpada", systemImage: "plus") }
                }
            }
            .sheet(isPresented: $addingDevice) { AddDeviceView() }
        }
    }

    private func section(title: String, lights: [Light], showsBulkActions: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title).font(.title3.weight(.semibold))
                Spacer()
                if showsBulkActions, lights.count > 1 {
                    let anyOn = lights.contains { $0.state.isOn }
                    Button(anyOn ? "Desligar tudo" : "Ligar tudo") {
                        Task { await store.setAll(on: !anyOn, in: lights) }
                    }
                    .font(.subheadline)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isHeader)
            LazyVGrid(columns: columns, spacing: 12) {
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
    let light: Light

    var body: some View {
        NavigationLink(value: light.id) {
            HStack(spacing: 12) {
                Button {
                    Task { await store.toggle(light) }
                } label: {
                    Image(systemName: light.state.isOn ? "lightbulb.fill" : "lightbulb")
                        .font(.title3)
                        .foregroundStyle(light.state.isOn ? Color.black.opacity(0.72) : Color.secondary)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(light.state.isOn ? Theme.color(for: light.state) : Color.secondary.opacity(0.12)))
                        .shadow(color: light.state.isOn ? Theme.color(for: light.state).opacity(0.7) : .clear, radius: 10)
                }
                .buttonStyle(.plain)
                .disabled(!light.isReachable)
                .accessibilityLabel(light.state.isOn ? "Desligar \(light.name)" : "Ligar \(light.name)")

                VStack(alignment: .leading, spacing: 2) {
                    Text(light.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(light.state.isOn ? Theme.color(for: light.state).opacity(0.35) : .clear)
            }
            .opacity(light.isReachable ? 1 : 0.55)
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

struct EmptyLightsView: View {
    @Environment(AppModel.self) private var model
    @Environment(LightStore.self) private var store
    let addDevice: () -> Void

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "lightbulb.2")
                .font(.system(size: 52))
                .foregroundStyle(Theme.gradient)
            Text("Nenhuma lâmpada por aqui")
                .font(.title2.weight(.semibold))
            Text("Adicione lâmpadas no app Casa (HomeKit ou Matter) ou pareie uma lâmpada Tuya pelo Lumi.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            ForEach(Array(messages.enumerated()), id: \.offset) { _, message in
                Label(message, systemImage: "info.circle")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
            if store.isLoading { ProgressView() }
            Button(action: addDevice) {
                Label("Adicionar lâmpada", systemImage: "plus")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .padding(24)
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

struct BackgroundGlow: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
            RadialGradient(colors: [Theme.electric.opacity(0.18), .clear], center: .topLeading, startRadius: 0, endRadius: 420)
            RadialGradient(colors: [Theme.violet.opacity(0.14), .clear], center: .topTrailing, startRadius: 0, endRadius: 380)
        }
        .ignoresSafeArea()
    }
}

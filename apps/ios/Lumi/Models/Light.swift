import Foundation

/// De onde vem uma lâmpada.
nonisolated enum LightSource: String, Codable, CaseIterable, Sendable {
    case homeKit
    case tuya
    #if DEBUG
    case demo
    #endif

    var displayName: String {
        switch self {
        case .homeKit: "HomeKit"
        case .tuya: "Tuya"
        #if DEBUG
        case .demo: "Demonstração"
        #endif
        }
    }
}

/// O que cada lâmpada sabe fazer. O Lumi só mostra controles para as funções que o dispositivo expõe.
nonisolated struct LightCapabilities: OptionSet, Hashable, Codable, Sendable {
    let rawValue: Int
    static let brightness = LightCapabilities(rawValue: 1 << 0)
    static let color = LightCapabilities(rawValue: 1 << 1)
    static let temperature = LightCapabilities(rawValue: 1 << 2)
}

/// Estado de uma lâmpada, independente da integração.
nonisolated struct LightState: Hashable, Codable, Sendable {
    var isOn: Bool
    /// 0...1
    var brightness: Double?
    /// Matiz 0...360 e saturação 0...1.
    var hue: Double?
    var saturation: Double?
    /// Temperatura de cor em Kelvin.
    var kelvin: Double?
}

nonisolated struct Light: Identifiable, Hashable, Sendable {
    /// Prefixado pela origem ("hk:…", "tuya:…") para ser único entre integrações.
    let id: String
    var name: String
    var room: String?
    let source: LightSource
    var isReachable: Bool
    var capabilities: LightCapabilities
    var state: LightState
    /// Faixa de temperatura suportada, em Kelvin.
    var kelvinRange: ClosedRange<Double> = 2700...6500
}

/// Comando enviado a uma lâmpada.
nonisolated enum LightCommand: Hashable, Sendable {
    case power(Bool)
    case brightness(Double)
    case color(hue: Double, saturation: Double)
    case temperature(kelvin: Double)
}

extension LightState {
    /// Aplica um comando ao estado (atualização otimista da interface).
    nonisolated func applying(_ command: LightCommand) -> LightState {
        var copy = self
        switch command {
        case .power(let on): copy.isOn = on
        case .brightness(let value):
            copy.brightness = min(max(value, 0), 1)
            copy.isOn = value > 0
        case .color(let hue, let saturation):
            copy.hue = hue
            copy.saturation = saturation
            copy.kelvin = nil
            copy.isOn = true
        case .temperature(let kelvin):
            copy.kelvin = kelvin
            copy.saturation = 0
            copy.isOn = true
        }
        return copy
    }

    /// Comandos necessários para levar uma lâmpada até este estado (usado ao aplicar cenas).
    nonisolated func commands(for capabilities: LightCapabilities) -> [LightCommand] {
        guard isOn else { return [.power(false)] }
        var result: [LightCommand] = [.power(true)]
        if capabilities.contains(.brightness), let brightness { result.append(.brightness(brightness)) }
        if capabilities.contains(.color), let hue, let saturation, saturation > 0 {
            result.append(.color(hue: hue, saturation: saturation))
        } else if capabilities.contains(.temperature), let kelvin {
            result.append(.temperature(kelvin: kelvin))
        }
        return result
    }
}

import Foundation

/// Converte entre o padrão de DPs de iluminação da Tuya (categoria "dj") e o modelo do Lumi.
///
/// Códigos padrão: `switch_led`, `work_mode` ("white"/"colour"), `bright_value_v2` (10–1000),
/// `temp_value_v2` (0–1000, 0 = mais quente), `colour_data_v2` (HHHHSSSSVVVV em hexadecimal:
/// H 0–360, S 0–1000, V 0–1000). Variantes v1 (`bright_value`, `temp_value` 0–255/25–255) são aceitas.
nonisolated enum TuyaLightMapper {
    static let warmKelvin = 2700.0
    static let coolKelvin = 6500.0

    static func isLight(_ device: TuyaDevice) -> Bool {
        device.codes["switch_led"] != nil
    }

    static func light(from device: TuyaDevice) -> Light? {
        guard isLight(device) else { return nil }
        func value(_ code: String) -> TuyaDPValue? { device.codes[code].flatMap { device.dps[$0] } }
        func int(_ code: String) -> Int? { if case .int(let v) = value(code) { v } else { nil } }

        var capabilities: LightCapabilities = []
        let brightnessCode = device.codes["bright_value_v2"] != nil ? "bright_value_v2" : "bright_value"
        let temperatureCode = device.codes["temp_value_v2"] != nil ? "temp_value_v2" : "temp_value"
        if device.codes[brightnessCode] != nil { capabilities.insert(.brightness) }
        if device.codes[temperatureCode] != nil { capabilities.insert(.temperature) }
        if device.codes["colour_data_v2"] != nil { capabilities.insert(.color) }

        var state = LightState(isOn: false)
        if case .bool(let on) = value("switch_led") { state.isOn = on }

        let mode: String? = if case .string(let m) = value("work_mode") { m } else { nil }
        if mode == "colour", case .string(let hsv) = value("colour_data_v2"), let color = parseColour(hsv) {
            state.hue = color.hue
            state.saturation = color.saturation
            state.brightness = color.value
        } else {
            if let raw = int(brightnessCode) {
                state.brightness = normalize(raw, range: device.ranges[brightnessCode] ?? defaultRange(brightnessCode))
            }
            if let raw = int(temperatureCode) {
                let t = normalize(raw, range: device.ranges[temperatureCode] ?? defaultRange(temperatureCode))
                state.kelvin = warmKelvin + t * (coolKelvin - warmKelvin)
                state.saturation = 0
            }
        }

        return Light(id: "tuya:\(device.id)", name: device.name, room: nil, source: .tuya,
                     isReachable: device.isOnline, capabilities: capabilities, state: state,
                     kelvinRange: warmKelvin...coolKelvin)
    }

    /// DPs a publicar para executar um comando. `current` é usado para preservar o brilho ao mudar a cor.
    static func dps(for command: LightCommand, device: TuyaDevice, current: LightState) -> [String: TuyaDPValue] {
        func id(_ code: String) -> String? { device.codes[code] }
        let brightnessCode = device.codes["bright_value_v2"] != nil ? "bright_value_v2" : "bright_value"
        let temperatureCode = device.codes["temp_value_v2"] != nil ? "temp_value_v2" : "temp_value"
        var result: [String: TuyaDPValue] = [:]

        switch command {
        case .power(let on):
            if let dp = id("switch_led") { result[dp] = .bool(on) }
        case .brightness(let value):
            if current.saturation ?? 0 > 0, let hue = current.hue, let saturation = current.saturation, let dp = id("colour_data_v2") {
                result[dp] = .string(formatColour(hue: hue, saturation: saturation, value: value))
            } else if let dp = id(brightnessCode) {
                result[dp] = .int(denormalize(value, range: device.ranges[brightnessCode] ?? defaultRange(brightnessCode)))
            }
            if let dp = id("switch_led") { result[dp] = .bool(value > 0) }
        case .color(let hue, let saturation):
            if let dp = id("work_mode") { result[dp] = .string("colour") }
            if let dp = id("colour_data_v2") {
                result[dp] = .string(formatColour(hue: hue, saturation: saturation, value: current.brightness ?? 1))
            }
        case .temperature(let kelvin):
            if let dp = id("work_mode") { result[dp] = .string("white") }
            if let dp = id(temperatureCode) {
                let t = (min(max(kelvin, warmKelvin), coolKelvin) - warmKelvin) / (coolKelvin - warmKelvin)
                result[dp] = .int(denormalize(t, range: device.ranges[temperatureCode] ?? defaultRange(temperatureCode)))
            }
        }
        return result
    }

    // MARK: - Conversões

    static func defaultRange(_ code: String) -> ClosedRange<Int> {
        switch code {
        case "bright_value_v2": 10...1000
        case "temp_value_v2": 0...1000
        case "bright_value": 25...255
        default: 0...255
        }
    }

    static func normalize(_ raw: Int, range: ClosedRange<Int>) -> Double {
        guard range.upperBound > range.lowerBound else { return 0 }
        return min(max(Double(raw - range.lowerBound) / Double(range.upperBound - range.lowerBound), 0), 1)
    }

    static func denormalize(_ value: Double, range: ClosedRange<Int>) -> Int {
        let clamped = min(max(value, 0), 1)
        return range.lowerBound + Int((clamped * Double(range.upperBound - range.lowerBound)).rounded())
    }

    static func parseColour(_ hex: String) -> (hue: Double, saturation: Double, value: Double)? {
        guard hex.count == 12 else { return nil }
        let parts = stride(from: 0, to: 12, by: 4).map { offset -> Int? in
            let start = hex.index(hex.startIndex, offsetBy: offset)
            return Int(hex[start..<hex.index(start, offsetBy: 4)], radix: 16)
        }
        guard let h = parts[0], let s = parts[1], let v = parts[2] else { return nil }
        return (Double(h), Double(s) / 1000, Double(v) / 1000)
    }

    static func formatColour(hue: Double, saturation: Double, value: Double) -> String {
        let h = Int(min(max(hue, 0), 360).rounded())
        let s = Int((min(max(saturation, 0), 1) * 1000).rounded())
        let v = Int((min(max(value, 0.01), 1) * 1000).rounded())
        return String(format: "%04x%04x%04x", h, s, v)
    }
}

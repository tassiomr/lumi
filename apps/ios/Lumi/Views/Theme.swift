import SwiftUI

enum Theme {
    static let electric = Color(red: 0.184, green: 0.420, blue: 1.0)
    static let violet = Color(red: 0.545, green: 0.361, blue: 0.965)
    static let accent = Color.accentColor
    static let gradient = LinearGradient(colors: [electric, violet], startPoint: .topLeading, endPoint: .bottomTrailing)

    /// Cor aproximada da luz emitida, usada nos ícones e no brilho dos cartões.
    static func color(for state: LightState) -> Color {
        guard state.isOn else { return Color.secondary.opacity(0.35) }
        if let hue = state.hue, let saturation = state.saturation, saturation > 0.02 {
            return Color(hue: hue / 360, saturation: saturation, brightness: 1)
        }
        if let kelvin = state.kelvin { return color(kelvin: kelvin) }
        return Color(red: 1, green: 0.86, blue: 0.62)
    }

    /// Aproximação de cor para temperaturas entre 2000 K e 6500 K.
    static func color(kelvin: Double) -> Color {
        let t = min(max((kelvin - 2000) / 4500, 0), 1)
        return Color(red: 1, green: 0.72 + 0.26 * t, blue: 0.42 + 0.56 * t)
    }
}

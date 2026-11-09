import SwiftUI
import TRDesignSystem

/// Cor da luz que a lâmpada emite. Vem do estado do dispositivo, não do tema:
/// é o único lugar do app que cria cores fora de `theme.colors`.
enum LightAppearance {
    /// Cor emitida, ou `nil` quando a lâmpada está desligada ou não informa cor nem temperatura.
    static func emittedColor(for state: LightState) -> Color? {
        guard state.isOn else { return nil }
        if let hue = state.hue, let saturation = state.saturation, saturation > 0.02 {
            return Color(hue: hue / 360, saturation: saturation, brightness: 1)
        }
        if let kelvin = state.kelvin { return color(kelvin: kelvin) }
        return nil
    }

    /// Aproximação de cor para temperaturas entre 2000 K e 6500 K.
    static func color(kelvin: Double) -> Color {
        let t = min(max((kelvin - 2000) / 4500, 0), 1)
        return TRRGBA(red: 1, green: 0.72 + 0.26 * t, blue: 0.42 + 0.56 * t).color
    }

    /// Cor de um preset de matiz da tela de detalhe.
    static func color(hue: Double, saturation: Double) -> Color {
        Color(hue: hue / 360, saturation: saturation, brightness: 1)
    }

    /// Estilo de uma lâmpada: a cor emitida quando conhecida, senão os tokens de luz do tema.
    static func style(for state: LightState, colors: TRColors) -> AnyShapeStyle {
        if let emitted = emittedColor(for: state) { return AnyShapeStyle(emitted) }
        return AnyShapeStyle(state.isOn ? colors.lightOn : colors.lightOff)
    }

    /// Conteúdo desenhado sobre a cor da luz. A luz emitida é sempre clara, então o conteúdo é
    /// sempre escuro, nos dois modos. O DS ainda não tem esse token (`onLight`).
    static func onLight(_ theme: TRTheme) -> TRColorToken {
        theme.colors.custom["onLight"] ?? TRColorToken(theme.palette.neutral[950])
    }
}

extension TRColors {
    /// Luz acesa (`lightOn` do tema). Sem o token, cai no accent.
    var lightOn: TRColorToken { custom["lightOn"] ?? action.accent }
    /// Luz apagada.
    var lightOff: TRColorToken { custom["lightOff"] ?? foreground.disabled }
    /// Brilho em volta de elementos que emitem luz (`glow` do tema).
    var glow: TRColorToken { custom["glow"] ?? lightOn.opacity(0.4) }
}

extension View {
    /// Fundo e linhas de `Form` nas cores do tema, em vez das cores agrupadas do sistema.
    func themedForm(_ theme: TRTheme) -> some View {
        scrollContentBackground(.hidden)
            .background(theme.colors.background.secondary)
    }
}

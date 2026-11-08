import Foundation

/// Cena criada no Lumi: um retrato do estado de algumas lâmpadas, salvo apenas no iPhone.
nonisolated struct LumiScene: Identifiable, Hashable, Codable, Sendable {
    var id = UUID()
    var name: String
    var symbol: String
    var entries: [Entry]

    nonisolated struct Entry: Hashable, Codable, Sendable {
        var lightID: String
        var state: LightState
    }

    static let symbols = ["sun.max", "moon.stars", "book", "tv", "fork.knife", "sparkles", "bed.double", "party.popper"]
}

/// Cena do app Casa (HomeKit), executada pelo HomeKit.
struct HomeScene: Identifiable, Hashable {
    let id: String
    let name: String
}

import Foundation
import LumiLegal
import Observation

/// Dados que existem só no iPhone: cenas do Lumi, ambientes atribuídos e preferências.
/// Gravados em Application Support/Lumi/local.json, sem iCloud.
@Observable
final class LocalStore: LumiLocalDataErasing {
    nonisolated struct Snapshot: Codable, Sendable {
        var scenes: [LumiScene] = []
        /// lightID → nome do ambiente definido no Lumi.
        var rooms: [String: String] = [:]
        var favorites: Set<String> = []
    }

    private(set) var snapshot: Snapshot
    private let fileURL: URL
    /// Chamado após apagar os dados locais (ex.: encerrar sessões).
    var onErase: (() async -> Void)?

    init(directory: URL? = nil) {
        let base = directory ?? URL.applicationSupportDirectory.appending(path: "Lumi", directoryHint: .isDirectory)
        fileURL = base.appending(path: "local.json")
        if let data = try? Data(contentsOf: fileURL),
           let decoded = try? JSONDecoder().decode(Snapshot.self, from: data) {
            snapshot = decoded
        } else {
            snapshot = Snapshot()
        }
    }

    var scenes: [LumiScene] { snapshot.scenes }

    func room(for lightID: String) -> String? { snapshot.rooms[lightID] }

    func setRoom(_ room: String?, for lightID: String) {
        let trimmed = room?.trimmingCharacters(in: .whitespacesAndNewlines)
        snapshot.rooms[lightID] = (trimmed?.isEmpty ?? true) ? nil : trimmed
        save()
    }

    func isFavorite(_ lightID: String) -> Bool { snapshot.favorites.contains(lightID) }

    func toggleFavorite(_ lightID: String) {
        if snapshot.favorites.contains(lightID) { snapshot.favorites.remove(lightID) } else { snapshot.favorites.insert(lightID) }
        save()
    }

    func upsert(_ scene: LumiScene) {
        if let index = snapshot.scenes.firstIndex(where: { $0.id == scene.id }) {
            snapshot.scenes[index] = scene
        } else {
            snapshot.scenes.append(scene)
        }
        save()
    }

    func deleteScene(_ id: LumiScene.ID) {
        snapshot.scenes.removeAll { $0.id == id }
        save()
    }

    func eraseLocalData() async throws {
        snapshot = Snapshot()
        if FileManager.default.fileExists(atPath: fileURL.path()) {
            try FileManager.default.removeItem(at: fileURL)
        }
        if let domain = Bundle.main.bundleIdentifier {
            UserDefaults.standard.removePersistentDomain(forName: domain)
        }
        await onErase?()
    }

    private func save() {
        do {
            try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            let data = try JSONEncoder().encode(snapshot)
            try data.write(to: fileURL, options: [.atomic, .completeFileProtection])
        } catch {
            assertionFailure("Falha ao salvar dados locais: \(error)")
        }
    }
}

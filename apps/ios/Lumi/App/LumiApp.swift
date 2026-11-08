import SwiftUI

@main
struct LumiApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .environment(model.store)
                .tint(Theme.accent)
                .task { await model.store.start() }
        }
    }
}

/// Monta as integrações e o armazenamento local.
@Observable
final class AppModel {
    let local = LocalStore()
    let homeKit: HomeKitProvider?
    let tuya: TuyaProvider
    let store: LightStore

    init() {
        let tuya = TuyaProvider(client: TuyaClientFactory.make())
        self.tuya = tuya
        var providers: [any LightProvider] = []

        #if DEBUG
        if DemoProvider.isEnabled {
            homeKit = nil
            providers = [DemoProvider()]
            store = LightStore(providers: providers, local: local)
            return
        }
        #endif

        let homeKit = HomeKitProvider()
        self.homeKit = homeKit
        providers = [homeKit, tuya]
        store = LightStore(providers: providers, local: local)
    }
}

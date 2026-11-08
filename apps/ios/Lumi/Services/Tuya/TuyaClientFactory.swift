import Foundation

enum TuyaClientFactory {
    static func make() -> any TuyaClient {
        #if canImport(ThingSmartHomeKit)
        ThingTuyaClient()
        #else
        UnavailableTuyaClient()
        #endif
    }
}

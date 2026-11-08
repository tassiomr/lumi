import Foundation
import Testing
@testable import Lumi

@Suite struct TuyaLightMapperTests {
    let device = TuyaDevice(
        id: "abc", name: "Abajur", isOnline: true,
        dps: ["20": .bool(true), "21": .string("white"), "22": .int(505), "23": .int(1000)],
        codes: ["switch_led": "20", "work_mode": "21", "bright_value_v2": "22", "temp_value_v2": "23", "colour_data_v2": "24"]
    )

    @Test func mapsWhiteModeState() throws {
        let light = try #require(TuyaLightMapper.light(from: device))
        #expect(light.id == "tuya:abc")
        #expect(light.state.isOn)
        #expect(abs((light.state.brightness ?? 0) - 0.5) < 0.001)
        #expect(light.state.kelvin == TuyaLightMapper.coolKelvin)
        #expect(light.capabilities == [.brightness, .temperature, .color])
    }

    @Test func mapsColourMode() throws {
        var colour = device
        colour.dps["21"] = .string("colour")
        colour.dps["24"] = .string("010903e801f4") // H 265, S 1000, V 500
        let light = try #require(TuyaLightMapper.light(from: colour))
        #expect(light.state.hue == 265)
        #expect(light.state.saturation == 1)
        #expect(light.state.brightness == 0.5)
    }

    @Test func ignoresNonLights() {
        let plug = TuyaDevice(id: "p", name: "Tomada", isOnline: true, dps: ["1": .bool(true)], codes: ["switch_1": "1"])
        #expect(TuyaLightMapper.light(from: plug) == nil)
    }

    @Test func buildsCommands() {
        let state = LightState(isOn: true, brightness: 0.5)
        #expect(TuyaLightMapper.dps(for: .power(false), device: device, current: state) == ["20": .bool(false)])
        #expect(TuyaLightMapper.dps(for: .brightness(1), device: device, current: state) == ["22": .int(1000), "20": .bool(true)])
        #expect(TuyaLightMapper.dps(for: .temperature(kelvin: 2700), device: device, current: state) == ["21": .string("white"), "23": .int(0)])
        #expect(TuyaLightMapper.dps(for: .color(hue: 120, saturation: 0.5), device: device, current: state)
                == ["21": .string("colour"), "24": .string("007801f401f4")])
    }

    @Test func colourRoundTrip() throws {
        let hex = TuyaLightMapper.formatColour(hue: 200, saturation: 0.3, value: 0.8)
        let parsed = try #require(TuyaLightMapper.parseColour(hex))
        #expect(parsed.hue == 200 && parsed.saturation == 0.3 && parsed.value == 0.8)
        #expect(TuyaLightMapper.parseColour("xyz") == nil)
    }
}

@Suite struct LightStateTests {
    @Test func sceneCommandsRespectCapabilities() {
        let state = LightState(isOn: true, brightness: 0.4, hue: 30, saturation: 0.6, kelvin: nil)
        #expect(state.commands(for: [.brightness, .color]) == [.power(true), .brightness(0.4), .color(hue: 30, saturation: 0.6)])
        #expect(state.commands(for: [.brightness]) == [.power(true), .brightness(0.4)])
        #expect(LightState(isOn: false).commands(for: [.brightness]) == [.power(false)])
    }

    @Test func optimisticUpdate() {
        let state = LightState(isOn: false, brightness: 0.2)
        #expect(state.applying(.brightness(0.8)).isOn)
        #expect(state.applying(.temperature(kelvin: 3000)).saturation == 0)
    }
}

@Suite struct LocalStoreTests {
    @Test func persistsAndErases() async throws {
        let directory = URL.temporaryDirectory.appending(path: UUID().uuidString)
        let store = LocalStore(directory: directory)
        store.upsert(LumiScene(name: "Leitura", symbol: "book", entries: [.init(lightID: "x", state: LightState(isOn: true))]))
        store.setRoom("Sala", for: "x")
        store.toggleFavorite("x")

        let reloaded = LocalStore(directory: directory)
        #expect(reloaded.scenes.map(\.name) == ["Leitura"])
        #expect(reloaded.room(for: "x") == "Sala")
        #expect(reloaded.isFavorite("x"))

        try await reloaded.eraseLocalData()
        #expect(LocalStore(directory: directory).scenes.isEmpty)
    }
}

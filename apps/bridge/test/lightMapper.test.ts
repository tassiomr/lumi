import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UnsupportedCommandError } from "../src/core/types.ts";
import { capabilities, dpMapFromSpecs, dpsForCommand, formatColour, inferDpMap, modes, parseColour, stateFromDps } from "../src/tuya/lightMapper.ts";

const v2 = { "20": true, "21": "white", "22": 1000, "23": 0, "24": "00f003e803e8" };

describe("mapeamento de DPs de iluminação", () => {
  it("infere o esquema v2 só quando os tipos conferem", () => {
    assert.deepEqual(Object.keys(inferDpMap(v2)!), ["switch", "mode", "brightness", "temperature", "colour"]);
    assert.equal(inferDpMap({ "1": true, "2": "white" }), undefined);
    assert.equal(inferDpMap({ "20": true, "24": "não é cor" })!.colour, undefined);
  });

  it("não expõe capacidades ausentes", () => {
    const map = inferDpMap({ "20": false, "22": 500 })!;
    assert.deepEqual(capabilities(map), ["power", "brightness"]);
    assert.throws(() => dpsForCommand(map, { type: "color", hue: 0, saturation: 1 }, undefined), UnsupportedCommandError);
  });

  it("usa o modelo de dados da nuvem (ids e limites reais)", () => {
    const map = dpMapFromSpecs([
      { id: "1", code: "switch_led", type: "bool" },
      { id: "3", code: "bright_value", type: "value", min: 25, max: 255 },
      { id: "2", code: "work_mode", type: "enum", range: ["white", "colour", "scene"] },
    ]);
    assert.deepEqual(dpsForCommand(map, { type: "brightness", value: 1 }, { on: true, mode: "white" }), { "3": 255 });
    assert.deepEqual(stateFromDps(map, { "1": true, "2": "white", "3": 25 }).brightness, 0);
    assert.deepEqual(modes(map, {}), ["white", "colour", "scene"]);
  });

  it("lê estado em modo branco e em modo cor", () => {
    const white = stateFromDps(inferDpMap(v2)!, v2);
    assert.equal(white.on, true);
    assert.equal(white.brightness, 1);
    assert.equal(white.colorTemperature, 0);
    const colour = stateFromDps(inferDpMap(v2)!, { ...v2, "21": "colour", "24": "00f001f40064" });
    assert.equal(colour.hue, 240);
    assert.equal(colour.saturation, 0.5);
    assert.equal(colour.brightness, 0.1);
  });

  it("gera comandos preservando brilho e trocando o modo quando preciso", () => {
    const map = inferDpMap(v2)!;
    const current = stateFromDps(map, v2);
    assert.deepEqual(dpsForCommand(map, { type: "color", hue: 120, saturation: 1 }, current), { "24": "007803e803e8", "21": "colour" });
    assert.deepEqual(dpsForCommand(map, { type: "colorTemperature", value: 1 }, { ...current, mode: "colour" }), { "23": 1000, "21": "white" });
    assert.deepEqual(dpsForCommand(map, { type: "brightness", value: 0.5 }, { on: true, mode: "colour", hue: 120, saturation: 1 }), { "24": "007803e801f4" });
    assert.deepEqual(dpsForCommand(map, { type: "brightness", value: 0.5 }, current), { "22": 505 });
  });

  it("converte HHHHSSSSVVVV", () => {
    assert.equal(formatColour(360, 1, 1), "000003e803e8");
    assert.deepEqual(parseColour("016803e80000"), { hue: 360, saturation: 1, value: 0 });
    assert.equal(parseColour("xyz"), undefined);
  });
});

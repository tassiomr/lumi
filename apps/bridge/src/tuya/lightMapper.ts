// Tradução entre DPs de iluminação Tuya (categoria "dj") e o modelo do Lumi.
//
// Os números dos DPs variam por produto. A fonte confiável é o modelo de dados da nuvem
// (`TuyaCloud.dpSpecs`). Sem ele, reconhecemos apenas o esquema padrão "v2" (DPs 20–24),
// e só quando os DPs observados no dispositivo têm os tipos esperados.

import type { Capability, LightCommand, LightState } from "../core/types.ts";
import { UnsupportedCommandError } from "../core/types.ts";
import type { DpSpec } from "./cloud.ts";
import type { Dps } from "./lan.ts";

export type DpRef = { id: string; min?: number; max?: number; range?: string[] };

/** Códigos padrão Tuya → DP. */
export type DpMap = {
  switch?: DpRef;
  mode?: DpRef;
  brightness?: DpRef;
  temperature?: DpRef;
  colour?: DpRef;
};

const codeAliases: Record<keyof DpMap, string[]> = {
  switch: ["switch_led"],
  mode: ["work_mode"],
  brightness: ["bright_value_v2", "bright_value"],
  temperature: ["temp_value_v2", "temp_value"],
  colour: ["colour_data_v2"],
};

export function dpMapFromSpecs(specs: DpSpec[]): DpMap {
  const map: DpMap = {};
  for (const key of Object.keys(codeAliases) as (keyof DpMap)[]) {
    for (const code of codeAliases[key]) {
      const s = specs.find((x) => x.code === code);
      if (s) {
        map[key] = { id: s.id, min: s.min, max: s.max, range: s.range };
        break;
      }
    }
  }
  return map;
}

/** Infere o esquema v2 padrão a partir dos DPs reportados. Não adivinha esquemas desconhecidos. */
export function inferDpMap(dps: Dps): DpMap | undefined {
  if (typeof dps["20"] !== "boolean") return undefined;
  const map: DpMap = { switch: { id: "20" } };
  if (typeof dps["21"] === "string") map.mode = { id: "21" };
  if (typeof dps["22"] === "number") map.brightness = { id: "22", min: 10, max: 1000 };
  if (typeof dps["23"] === "number") map.temperature = { id: "23", min: 0, max: 1000 };
  if (typeof dps["24"] === "string" && /^[0-9a-f]{12}$/i.test(dps["24"])) map.colour = { id: "24" };
  return map;
}

export function capabilities(map: DpMap): Capability[] {
  const c: Capability[] = [];
  if (map.switch) c.push("power");
  if (map.brightness || map.colour) c.push("brightness");
  if (map.temperature) c.push("colorTemperature");
  if (map.colour) c.push("color");
  if (map.mode) c.push("mode");
  return c;
}

/** Modos declarados no modelo de dados; sem ele, só os inferidos pelos DPs presentes e o modo atual. */
export function modes(map: DpMap, dps: Dps): string[] {
  if (!map.mode) return [];
  if (map.mode.range?.length) return map.mode.range;
  const set = new Set<string>(["white"]);
  if (map.colour) set.add("colour");
  const current = dps[map.mode.id];
  if (typeof current === "string") set.add(current);
  return [...set];
}

export function stateFromDps(map: DpMap, dps: Dps): LightState {
  const state: LightState = { on: map.switch ? dps[map.switch.id] === true : false };
  const mode = map.mode ? dps[map.mode.id] : undefined;
  if (typeof mode === "string") state.mode = mode;

  const colour = map.colour ? parseColour(dps[map.colour.id]) : undefined;
  if (mode === "colour" && colour) {
    state.hue = colour.hue;
    state.saturation = colour.saturation;
    state.brightness = colour.value;
  } else {
    const b = map.brightness ? dps[map.brightness.id] : undefined;
    if (typeof b === "number") state.brightness = normalize(b, range(map.brightness!, 10, 1000));
    const t = map.temperature ? dps[map.temperature.id] : undefined;
    if (typeof t === "number") state.colorTemperature = normalize(t, range(map.temperature!, 0, 1000));
    if (mode === "white" || mode === undefined) state.saturation = 0;
  }
  return state;
}

/** DPs a publicar para o comando. `current` preserva o brilho ao trocar de cor e vice-versa. */
export function dpsForCommand(map: DpMap, command: LightCommand, current: LightState | undefined): Dps {
  const fail = (what: string) => new UnsupportedCommandError(`O dispositivo não informa suporte a ${what}`);
  switch (command.type) {
    case "power":
      if (!map.switch) throw fail("liga/desliga");
      return { [map.switch.id]: command.on };
    case "brightness": {
      const value = clamp(command.value, 0.01, 1);
      if (current?.mode === "colour" && map.colour) {
        return { [map.colour.id]: formatColour(current.hue ?? 0, current.saturation ?? 1, value) };
      }
      if (!map.brightness) throw fail("brilho em modo branco");
      return { [map.brightness.id]: denormalize(value, range(map.brightness, 10, 1000)) };
    }
    case "colorTemperature": {
      if (!map.temperature) throw fail("temperatura de branco");
      const dps: Dps = { [map.temperature.id]: denormalize(clamp(command.value, 0, 1), range(map.temperature, 0, 1000)) };
      if (map.mode && current?.mode !== "white") dps[map.mode.id] = "white";
      return dps;
    }
    case "color": {
      if (!map.colour) throw fail("cor");
      const dps: Dps = { [map.colour.id]: formatColour(command.hue, command.saturation, current?.brightness ?? 1) };
      if (map.mode && current?.mode !== "colour") dps[map.mode.id] = "colour";
      return dps;
    }
    case "mode": {
      if (!map.mode) throw fail("modos");
      return { [map.mode.id]: command.mode };
    }
  }
}

// MARK: - Conversões

export function parseColour(value: unknown): { hue: number; saturation: number; value: number } | undefined {
  if (typeof value !== "string" || !/^[0-9a-f]{12}$/i.test(value)) return undefined;
  return {
    hue: parseInt(value.slice(0, 4), 16) % 361,
    saturation: clamp(parseInt(value.slice(4, 8), 16) / 1000, 0, 1),
    value: clamp(parseInt(value.slice(8, 12), 16) / 1000, 0, 1),
  };
}

export function formatColour(hue: number, saturation: number, value: number): string {
  const h = Math.round(((hue % 360) + 360) % 360);
  const s = Math.round(clamp(saturation, 0, 1) * 1000);
  const v = Math.round(clamp(value, 0.01, 1) * 1000);
  return [h, s, v].map((n) => n.toString(16).padStart(4, "0")).join("");
}

function range(ref: DpRef, min: number, max: number): [number, number] {
  return [ref.min ?? min, ref.max ?? max];
}

function normalize(raw: number, [min, max]: [number, number]): number {
  return clamp((raw - min) / (max - min), 0, 1);
}

function denormalize(v: number, [min, max]: [number, number]): number {
  return Math.round(min + clamp(v, 0, 1) * (max - min));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

// Modelo de domínio independente de fabricante. Adapters (Tuya hoje) traduzem para este modelo;
// a bridge Apple Home e a CLI só conhecem estes tipos.

import type { EventEmitter } from "node:events";

export type Capability = "power" | "brightness" | "colorTemperature" | "color" | "mode";

export type Connectivity = "connecting" | "online" | "offline";

/** Valores normalizados: brightness e saturation em 0–1, hue em graus (0–360), colorTemperature 0 (quente) – 1 (fria). */
export type LightState = {
  on: boolean;
  brightness?: number;
  colorTemperature?: number;
  hue?: number;
  saturation?: number;
  mode?: string;
};

export type Device = {
  /** Identificador estável no Lumi: `<provider>:<id do fabricante>`. */
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  type: "light";
  provider: string;
  connectivity: Connectivity;
  capabilities: Capability[];
  /** Modos aceitos pelo hardware (ex.: "white", "colour", "scene"). Vazio se não suporta modos. */
  modes: string[];
  state?: LightState;
  /** Momento da última leitura confirmada pelo dispositivo. */
  stateUpdatedAt?: Date;
  lastError?: string;
};

export type LightCommand =
  | { type: "power"; on: boolean }
  | { type: "brightness"; value: number }
  | { type: "colorTemperature"; value: number }
  | { type: "color"; hue: number; saturation: number }
  | { type: "mode"; mode: string };

/** Evento `update` (Device) sempre que estado ou conectividade mudam, inclusive por apps de terceiros. */
export interface DeviceAdapter extends EventEmitter {
  readonly provider: string;
  devices(): Device[];
  start(): Promise<void>;
  stop(): Promise<void>;
  /** Lê o estado atual do hardware. */
  refresh(deviceId: string): Promise<Device>;
  /** Executa o comando e resolve com o estado confirmado pelo dispositivo. Rejeita se não houver confirmação. */
  execute(deviceId: string, command: LightCommand): Promise<Device>;
}

export class UnsupportedCommandError extends Error {}

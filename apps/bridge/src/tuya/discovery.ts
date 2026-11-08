// Descoberta passiva: dispositivos Tuya anunciam id, IP e versão do protocolo por broadcast UDP.
// Só escutamos; nenhum pacote é enviado à rede.

import { createSocket, type Socket } from "node:dgram";
import { decodeDiscovery, type ProtocolVersion } from "./protocol.ts";

export type DiscoveredDevice = {
  id: string;
  ip: string;
  version: string;
  productKey?: string;
  encrypted: boolean;
  lastSeen: Date;
};

const ports = [6666, 6667, 7000];

export function isSupportedVersion(v: string): v is ProtocolVersion {
  return v === "3.3" || v === "3.4" || v === "3.5";
}

export async function discover(seconds: number, onDevice?: (d: DiscoveredDevice) => void): Promise<DiscoveredDevice[]> {
  const found = new Map<string, DiscoveredDevice>();
  const sockets: Socket[] = [];
  await Promise.all(
    ports.map(
      (port) =>
        new Promise<void>((resolve) => {
          const s = createSocket({ type: "udp4", reuseAddr: true });
          s.on("error", () => resolve());
          s.on("message", (packet, remote) => {
            const info = decodeDiscovery(packet);
            const id = typeof info?.gwId === "string" ? info.gwId : undefined;
            if (!info || !id) return;
            const device: DiscoveredDevice = {
              id,
              ip: typeof info.ip === "string" ? info.ip : remote.address,
              version: String(info.version ?? "3.1"),
              productKey: typeof info.productKey === "string" ? info.productKey : undefined,
              encrypted: info.encrypt === true,
              lastSeen: new Date(),
            };
            const isNew = !found.has(id);
            found.set(id, device);
            if (isNew) onDevice?.(device);
          });
          s.bind(port, () => resolve());
          sockets.push(s);
        }),
    ),
  );
  await new Promise((r) => setTimeout(r, seconds * 1000));
  for (const s of sockets) s.close();
  return [...found.values()];
}

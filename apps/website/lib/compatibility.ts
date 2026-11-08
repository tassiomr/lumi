/**
 * Modelos testados pela TR Media. Inclua somente o que foi efetivamente testado com um build
 * do Lumi — com a versão do app e a data do teste. Lista vazia é a resposta honesta enquanto
 * não houver testes registrados.
 */

export type CompatStatus = "tested" | "partial" | "untested" | "unsupported";

export const compatStatusInfo: Record<CompatStatus, { label: string; description: string }> = {
  tested: {
    label: "Compatível e testado",
    description: "Testado pela TR Media; as funções listadas funcionaram como esperado.",
  },
  partial: {
    label: "Compatibilidade parcial",
    description: "Funciona, mas com limitações descritas na observação.",
  },
  untested: {
    label: "Não testado",
    description: "Pode funcionar pela integração, mas a TR Media ainda não testou.",
  },
  unsupported: {
    label: "Não suportado",
    description: "Testado e não funciona com o Lumi, ou fora do escopo das integrações.",
  },
};

export type TestedDevice = {
  brand: string;
  model: string;
  integration: "HomeKit" | "Matter" | "Tuya";
  status: CompatStatus;
  features: string[];
  notes?: string;
  appVersion: string;
  testedOn: string; // AAAA-MM-DD
};

export const testedDevices: TestedDevice[] = [
  // Exemplo de formato (não é um teste real):
  // { brand: "Elgin", model: "<modelo exato>", integration: "Tuya", status: "tested",
  //   features: ["Liga/desliga", "Brilho", "Cor"], appVersion: "1.0 (1)", testedOn: "2026-11-20" },
];

export function devicesFor(predicate: (d: TestedDevice) => boolean): TestedDevice[] {
  return testedDevices.filter(predicate);
}

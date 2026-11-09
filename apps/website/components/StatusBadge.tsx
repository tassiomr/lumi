import { type CapabilityId, capabilities, statusLabel } from "@/lib/capabilities";

export function CapabilityBadge({ id }: { id: CapabilityId }) {
  const label = statusLabel[capabilities[id].status];
  if (!label) return null;
  const planned = capabilities[id].status === "planned";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        planned
          ? "bg-info-subtle text-info"
          : "bg-warning-subtle text-warning"
      }`}
    >
      {label}
    </span>
  );
}

import type { CapabilityId } from "@/lib/capabilities";
import { CapabilityBadge } from "./StatusBadge";

export type Feature = {
  title: string;
  body: string;
  capability: CapabilityId;
  icon: "power" | "palette" | "scene" | "link" | "clock" | "apple";
};

const icons: Record<Feature["icon"], React.ReactNode> = {
  power: <path d="M12 3v8m5.66-4.66a8 8 0 1 1-11.32 0" />,
  palette: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 0 0 17Z" fill="currentColor" stroke="none" /></>,
  scene: <><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="m3.5 15 4.5-4 4 3.5 3-2.5 5.5 4.5" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  apple: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
};

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <li key={f.title} className="reveal group relative overflow-hidden rounded-card border border-line bg-elevated p-6 sm:p-7">
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-highlight/15 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-card bg-gradient-to-br from-primary to-highlight text-on-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icons[f.icon]}
                </svg>
              </span>
              <CapabilityBadge id={f.capability} />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

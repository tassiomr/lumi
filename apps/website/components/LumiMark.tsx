import { useId } from "react";

/** Símbolo do Lumi — mesma geometria de brand/logo/lumi-mark.svg. */
export function LumiMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F6BFF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}-bg)`} />
      <circle cx="32" cy="27" r="20" fill={`url(#${id}-glow)`} />
      <path
        d="M32 14a12 12 0 0 0-7 21.75c1.25.9 2 2.3 2 3.85V41h10v-1.4c0-1.55.75-2.95 2-3.85A12 12 0 0 0 32 14Z"
        fill="#FFFFFF"
      />
      <rect x="27" y="44" width="10" height="3.2" rx="1.6" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="28.5" y="49" width="7" height="3.2" rx="1.6" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
}

export function LumiWordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LumiMark size={size} />
      <span className="text-[1.15rem] font-semibold tracking-tight">Lumi</span>
    </span>
  );
}

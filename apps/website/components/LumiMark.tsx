import { useId } from "react";

/** Símbolo do Lumi — mesma geometria de brand/logo/lumi-mark.svg (família visual do Luminous). */
export function LumiMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId();
  const ref = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.72">
          <stop stopColor="#1E2029" />
          <stop offset="1" stopColor="#08090C" />
        </radialGradient>
        <linearGradient id={`${id}-light`} gradientUnits="userSpaceOnUse" x1="262" y1="180" x2="762" y2="860">
          <stop offset="0" stopColor="#FFFAF2" />
          <stop offset="0.25" stopColor="#E2D6FF" />
          <stop offset="0.55" stopColor="#A086EC" />
          <stop offset="0.8" stopColor="#6096E8" />
          <stop offset="1" stopColor="#4078D6" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B9A6F2" />
          <stop offset="1" stopColor="#7AA6EE" />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.4" cy="0.38" r="0.6">
          <stop offset="0" stopColor="#FFFBF4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFBF4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-spark`}>
          <stop stopColor="#FFFBF4" />
          <stop offset="0.12" stopColor="#FFFBF4" stopOpacity="0.75" />
          <stop offset="0.4" stopColor="#FFFBF4" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FFFBF4" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-halo`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="80" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <rect width="1024" height="1024" rx="236" />
        </clipPath>
      </defs>
      <g clipPath={ref("clip")}>
        <rect width="1024" height="1024" fill={ref("bg")} />
        <circle cx="512" cy="424" r="262" fill={ref("light")} filter={ref("halo")} opacity="0.65" />
        <circle cx="512" cy="424" r="244" fill={ref("light")} />
        <circle cx="512" cy="424" r="244" fill={ref("core")} />
        <rect x="398" y="712" width="228" height="60" rx="30" fill={ref("base")} />
        <rect x="436" y="796" width="152" height="60" rx="30" fill={ref("base")} opacity="0.75" />
        <circle cx="685" cy="251" r="110" fill={ref("spark")} />
        <circle cx="685" cy="251" r="13" fill="#FFFBF4" />
      </g>
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

import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

/**
 * ScamSentry Brand Logo — Forensic Amber Edition
 * A precision-crafted SVG icon: a hexagonal shield housing a forensic eye with
 * scanning rings, crosshairs and an amber core node — the visual language of
 * professional threat-intelligence tooling.
 */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={cn("", className)}
      aria-label="ScamSentry Logo"
      {...props}
    >
      <defs>
        <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
        </filter>
      </defs>

      {/* Shield outline — angular hexagonal form */}
      <path
        d="M32 3L5 15v17c0 14.5 11 26.5 27 32 16-5.5 27-17.5 27-32V15L32 3z"
        fill="#1A1308"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner shield bevel */}
      <path
        d="M32 9L10 19v13c0 11 8.5 20.5 22 25.5 13.5-5 22-14.5 22-25.5V19L32 9z"
        fill="#0C0A07"
        stroke="#78350F"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Ambient amber glow behind the eye */}
      <circle cx="32" cy="33" r="14" fill="url(#amberGlow)" filter="url(#softBlur)" />

      {/* Outer scanning ring */}
      <circle cx="32" cy="33" r="12" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="2 3" />

      {/* Middle ring */}
      <circle cx="32" cy="33" r="8.5" stroke="#F59E0B" strokeWidth="0.75" strokeOpacity="0.6" />

      {/* Crosshairs */}
      <line x1="32" y1="22" x2="32" y2="26" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="32" y1="40" x2="32" y2="44" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="21" y1="33" x2="25" y2="33" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="39" y1="33" x2="43" y2="33" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />

      {/* Core eye / threat node */}
      <circle cx="32" cy="33" r="4.5" fill="url(#coreGlow)" />

      {/* Inner pupil */}
      <circle cx="32" cy="33" r="1.75" fill="#451A03" />

      {/* Corner scan markers */}
      <path d="M14 20 L14 15 L19 15" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M50 20 L50 15 L45 15" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

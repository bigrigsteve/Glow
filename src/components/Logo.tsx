import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 52, text: 'text-4xl' },
  }
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Glow Icon Mark — a crescent moon with a soft inner glow and petal */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="glowGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdf4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fdf4ff" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Outer circle background */}
        <circle cx="26" cy="26" r="24" fill="url(#glowGrad)" />

        {/* Soft inner glow */}
        <circle cx="22" cy="20" r="14" fill="url(#innerGlow)" filter="url(#softBlur)" />

        {/* Crescent moon shape — white cutout */}
        <circle cx="31" cy="22" r="13" fill="#7c3aed" />

        {/* Three small petals / dots representing fertility */}
        <circle cx="18" cy="34" r="2.5" fill="white" opacity="0.9" />
        <circle cx="26" cy="38" r="2" fill="white" opacity="0.7" />
        <circle cx="34" cy="34" r="1.5" fill="white" opacity="0.5" />

        {/* Sparkle top-right */}
        <path
          d="M38 10 L39.2 13.2 L42.5 14 L39.2 14.8 L38 18 L36.8 14.8 L33.5 14 L36.8 13.2 Z"
          fill="white"
          opacity="0.85"
        />
      </svg>

      {showText && (
        <span
          className={cn(
            'font-semibold tracking-tight',
            s.text,
            'bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent'
          )}
        >
          glow
        </span>
      )}
    </div>
  )
}

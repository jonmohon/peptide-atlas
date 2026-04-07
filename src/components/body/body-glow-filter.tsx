export function BodyGlowFilter() {
  return (
    <defs>
      {/* Blue glow for hover */}
      <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feFlood floodColor="#0066cc" floodOpacity="0.4" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Stronger blue glow for selected */}
      <filter id="glow-blue-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feFlood floodColor="#0066cc" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Green glow for pathway dots */}
      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feFlood floodColor="#00cc88" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradient for intensity levels */}
      <linearGradient id="intensity-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0066cc" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0066cc" stopOpacity="0.2" />
      </linearGradient>

      {/* Accent gradient */}
      <linearGradient id="accent-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0066cc" />
        <stop offset="100%" stopColor="#00cc88" />
      </linearGradient>
    </defs>
  );
}

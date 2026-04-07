export function BodyGlowFilter() {
  return (
    <defs>
      {/* Cyan glow for hover */}
      <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feFlood floodColor="#00d4ff" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Strong cyan glow for selected */}
      <filter id="glow-cyan-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feFlood floodColor="#00d4ff" floodOpacity="0.7" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Green glow for pathway/selected markers */}
      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feFlood floodColor="#00ff88" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Orange glow for highlighted markers */}
      <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feFlood floodColor="#ff6b35" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* White glow for hovered markers */}
      <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feFlood floodColor="#ffffff" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Body silhouette gradient - more visible on dark */}
      <linearGradient id="body-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#253348" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#1e2b3d" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1a2436" stopOpacity="0.4" />
      </linearGradient>

      {/* Cyan gradient */}
      <linearGradient id="cyan-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.2" />
      </linearGradient>

      {/* Accent gradient */}
      <linearGradient id="accent-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#00ff88" />
      </linearGradient>

      {/* Radial glow for markers */}
      <radialGradient id="marker-glow-cyan" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="marker-glow-green" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#00ff88" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="marker-glow-orange" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

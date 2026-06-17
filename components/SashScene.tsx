"use client";

// Environment backdrops for category sashes. Rendered behind the band/badges.
export default function SashScene({ scene }: { scene?: string }) {
  if (!scene) return null;
  const wrap = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" as const };
  const svg = (children: React.ReactNode, extra?: React.ReactNode) => (
    <svg viewBox="0 0 300 130" preserveAspectRatio="xMidYMax slice" style={wrap}>{extra}{children}</svg>
  );
  const W = "rgba(255,255,255,.18)";
  const D = "rgba(0,0,0,.22)";

  switch (scene) {
    case "ocean":
      return svg(
        <g>
          <circle cx="245" cy="34" r="16" fill="rgba(255,255,255,.25)" />
          <path d="M0 86 Q40 76 80 86 T160 86 T240 86 T320 86 V130 H0 Z" fill="rgba(255,255,255,.12)" />
          <path d="M0 100 Q45 90 90 100 T180 100 T300 100 V130 H0 Z" fill="rgba(255,255,255,.16)" />
          <path d="M0 114 Q50 104 100 114 T200 114 T300 114 V130 H0 Z" fill="rgba(0,0,0,.18)" />
        </g>
      );
    case "city":
    case "night":
      return svg(
        <g>
          {scene === "night" && [...Array(18)].map((_, i) => <circle key={i} cx={(i * 53) % 300} cy={(i * 29) % 50 + 8} r="1.2" fill="rgba(255,255,255,.6)" />)}
          {[[10, 60], [42, 40], [70, 70], [100, 30], [128, 55], [160, 38], [190, 66], [222, 28], [252, 58], [282, 44]].map(([x, h], i) => (
            <g key={i}>
              <rect x={x} y={130 - h} width="26" height={h} fill={i % 2 ? D : "rgba(0,0,0,.3)"} />
              {[...Array(Math.floor(h / 14))].map((_, j) => <rect key={j} x={x + 5} y={130 - h + 6 + j * 14} width="4" height="5" fill="rgba(255,220,120,.5)" />)}
            </g>
          ))}
        </g>
      );
    case "forest":
      return svg(
        <g fill={D}>
          {[12, 44, 78, 110, 145, 178, 212, 246, 280].map((x, i) => (
            <path key={i} d={`M${x} 130 L${x - 18} 130 L${x} ${70 + (i % 3) * 8} L${x + 18} 130 Z`} opacity={i % 2 ? 0.85 : 1} />
          ))}
          <rect x="0" y="118" width="300" height="12" fill="rgba(0,0,0,.25)" />
        </g>
      );
    case "mountains":
      return svg(
        <g>
          <path d="M-10 130 L70 40 L120 90 L170 30 L240 100 L320 50 L320 130 Z" fill={D} />
          <path d="M70 40 L84 58 L78 55 L66 66 L58 58 Z" fill="rgba(255,255,255,.5)" />
          <path d="M170 30 L186 52 L178 48 L164 60 L156 50 Z" fill="rgba(255,255,255,.5)" />
        </g>
      );
    case "desert":
      return svg(
        <g>
          <circle cx="240" cy="40" r="20" fill="rgba(255,240,200,.35)" />
          <path d="M0 96 Q80 78 160 96 T320 92 V130 H0 Z" fill="rgba(0,0,0,.14)" />
          <path d="M0 112 Q90 96 180 112 T320 110 V130 H0 Z" fill="rgba(0,0,0,.2)" />
        </g>
      );
    case "meadow":
      return svg(
        <g>
          <path d="M0 100 Q75 84 150 100 T300 100 V130 H0 Z" fill="rgba(255,255,255,.12)" />
          <path d="M0 114 Q80 100 160 114 T300 114 V130 H0 Z" fill="rgba(0,0,0,.16)" />
          {[30, 90, 150, 210, 270].map((x, i) => <path key={i} d={`M${x} 118 V108 M${x} 112 l-5 -5 M${x} 112 l5 -5`} stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none" />)}
        </g>
      );
    case "volcano":
      return svg(
        <g>
          <path d="M-10 130 L90 46 L130 80 L150 60 L200 110 L320 70 L320 130 Z" fill={D} />
          <circle cx="110" cy="52" r="10" fill="rgba(255,140,50,.5)" />
          {[100, 110, 120].map((x, i) => <circle key={i} cx={x} cy={40 - i * 4} r="2.5" fill="rgba(255,180,80,.7)" />)}
        </g>
      );
    case "track":
      return svg(
        <g stroke="rgba(255,255,255,.25)" strokeWidth="3" fill="none">
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-20 ${50 + i * 20} L320 ${20 + i * 20}`} />)}
        </g>
      );
    default:
      return null;
  }
}

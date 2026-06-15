"use client";

const MAP: Record<string, string[]> = {
  sun: ["#ffd089", "#ff9a52", "#ef6b3a"],
  night: ["#1b2350", "#3a2f6b", "#0e1330"],
  water: ["#7fd3e8", "#3aa0c9", "#1d6fa0"],
  fire: ["#3a1c14", "#8a2f17", "#e5552b"],
  green: ["#bfe6a8", "#6fb86a", "#2f8f5b"],
  warm: ["#ffd9c2", "#ff9e7d", "#e0613a"],
};

function anToType(an: string) {
  if (an === "rays") return "sun";
  if (an === "twinkle") return "night";
  if (an === "ripple") return "water";
  if (an === "embers") return "fire";
  if (an === "leaves") return "green";
  return "warm";
}

export default function Scene({ an, id }: { an: string; id: string }) {
  const t = anToType(an);
  const c = MAP[t];
  const gid = `sg-${id}`;
  return (
    <svg className="scene" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c[0]} />
          <stop offset="55%" stopColor={c[1]} />
          <stop offset="100%" stopColor={c[2]} />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${gid})`} />
      {t === "sun" && (
        <>
          <circle cx="140" cy="50" r="22" fill="rgba(255,255,255,.85)" />
          <path d="M0 150 L60 95 L100 120 L150 80 L200 110 L200 150 Z" fill="rgba(20,14,8,.32)" />
          <path d="M0 150 L50 118 L110 138 L160 112 L200 132 L200 150 Z" fill="rgba(20,14,8,.5)" />
        </>
      )}
      {t === "night" && (
        <>
          <circle cx="150" cy="44" r="16" fill="rgba(255,255,255,.9)" />
          <circle cx="156" cy="40" r="16" fill={c[1]} />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={(i * 53) % 200} cy={(i * 37) % 90 + 8} r={i % 3 ? 1 : 1.6} fill="#fff" opacity=".85" />
          ))}
          <path d="M0 150 L70 120 L140 138 L200 118 L200 150 Z" fill="rgba(0,0,0,.4)" />
        </>
      )}
      {t === "water" && (
        <>
          <path d="M0 70 q25-12 50 0 t50 0 t50 0 t50 0 V150 H0 Z" fill="rgba(255,255,255,.18)" />
          <path d="M0 95 q25-12 50 0 t50 0 t50 0 t50 0 V150 H0 Z" fill="rgba(255,255,255,.16)" />
        </>
      )}
      {t === "fire" && (
        <>
          <circle cx="100" cy="120" r="60" fill="rgba(255,180,90,.35)" />
          <circle cx="100" cy="125" r="34" fill="rgba(255,210,120,.4)" />
        </>
      )}
      {t === "green" && (
        <>
          <path d="M0 150 L60 100 L120 135 L200 95 L200 150 Z" fill="rgba(20,40,20,.28)" />
          <circle cx="150" cy="48" r="16" fill="rgba(255,255,255,.55)" />
        </>
      )}
      {t === "warm" && (
        <>
          <circle cx="55" cy="55" r="34" fill="rgba(255,255,255,.22)" />
          <circle cx="150" cy="100" r="44" fill="rgba(255,255,255,.16)" />
        </>
      )}
    </svg>
  );
}

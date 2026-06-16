"use client";

// Per-category motif: how the floating particles behave + a tagline.
type Motif = "rise" | "fall" | "streak" | "drift";
const THEME: Record<string, { motif: Motif; sub: string }> = {
  All: { motif: "rise", sub: "Every passage there is" },
  Angler: { motif: "rise", sub: "Water, line, and patience" },
  Wilderness: { motif: "fall", sub: "Out where it's wild" },
  "Green Thumb": { motif: "fall", sub: "Make something grow" },
  Nomad: { motif: "drift", sub: "Keep moving" },
  Hooligan: { motif: "streak", sub: "A little chaos" },
  Samaritan: { motif: "rise", sub: "For other people" },
  Courage: { motif: "rise", sub: "Do the scary thing" },
  Adventure: { motif: "streak", sub: "Go far" },
  Urbanist: { motif: "drift", sub: "Master the city" },
  Athlete: { motif: "streak", sub: "Body on the line" },
};

export default function CategoryScene({ cat, color }: { cat: string; color: string }) {
  const theme = THEME[cat] ?? THEME.All;
  const c2 = `color-mix(in srgb, ${color} 55%, #000)`;
  const motifClass = theme.motif === "fall" ? "fall" : theme.motif === "streak" ? "streak" : "";

  // Deterministic particle field so it doesn't reshuffle every render.
  const parts = Array.from({ length: 12 }).map((_, i) => {
    const size = 5 + ((i * 7) % 11);
    return {
      left: (i * 8.3) % 100,
      size,
      dur: 4 + ((i * 1.7) % 5),
      delay: (i * 0.6) % 4,
    };
  });

  return (
    <div
      key={cat} // re-keys to retrigger the crossfade on category change
      className="catscene catfade"
      style={{ ["--c1" as string]: color, ["--c2" as string]: c2 }}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          className={"cpart " + motifClass}
          style={{
            left: `${p.left}%`,
            width: theme.motif === "streak" ? 26 : p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="cap">
        <div className="t">{cat === "All" ? "All passages" : cat}</div>
        <div className="s">{theme.sub}</div>
      </div>
    </div>
  );
}

"use client";

export default function Stars({ n, size = 13, color = "var(--gold)" }: { n: number; size?: number; color?: string }) {
  const full = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ display: "inline-flex", gap: 1, lineHeight: 1, verticalAlign: "middle" }} aria-label={`${full} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z"
            fill={i < full ? color : "none"}
            stroke={i < full ? color : "rgba(0,0,0,.25)"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

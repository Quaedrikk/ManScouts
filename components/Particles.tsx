"use client";

function r(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function Particles({ an }: { an: string }) {
  const items: React.ReactNode[] = [];

  if (an === "embers") {
    for (let i = 0; i < 24; i++)
      items.push(<span key={i} className="pf ember" style={{ left: r(15, 85) + "%", bottom: "34%", animationDelay: r(0, 0.8) + "s" }} />);
  } else if (an === "rays") {
    for (let i = 0; i < 14; i++)
      items.push(<span key={i} className="pf ray" style={{ left: "50%", top: "30%", transform: `rotate(${i * (360 / 14)}deg)`, animationDelay: r(0, 0.3) + "s" }} />);
  } else if (an === "ripple") {
    for (let i = 0; i < 5; i++)
      items.push(<span key={i} className="pf rippl" style={{ left: "50%", top: "40%", transform: "translate(-50%,-50%)", animationDelay: i * 0.28 + "s" }} />);
  } else if (an === "twinkle") {
    for (let i = 0; i < 22; i++)
      items.push(<span key={i} className="pf twk" style={{ left: r(6, 94) + "%", top: r(12, 72) + "%", animationDelay: r(0, 1.1) + "s" }}>✦</span>);
  } else if (an === "leaves") {
    for (let i = 0; i < 22; i++)
      items.push(<span key={i} className="pf leaf" style={{ left: r(8, 92) + "%", top: r(2, 28) + "%", animationDelay: r(0, 0.9) + "s", background: i % 2 ? "#5ba36a" : "#cf8a32" }} />);
  } else if (an === "sparks") {
    for (let i = 0; i < 18; i++)
      items.push(<span key={i} className="pf spark" style={{ left: "50%", top: "40%", transform: `rotate(${i * 20}deg)`, animationDelay: r(0, 0.2) + "s" }} />);
  } else {
    const cs = ["#e5552b", "#1f8a5b", "#d9a441", "#6d4ea8"];
    for (let i = 0; i < 28; i++)
      items.push(<span key={i} className="pf conf" style={{ left: r(4, 96) + "%", top: r(0, 18) + "%", background: cs[i % 4], animationDelay: r(0, 0.7) + "s" }} />);
  }

  return <>{items}</>;
}

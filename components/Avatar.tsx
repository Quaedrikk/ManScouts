"use client";

const AVCOL = ["#e5552b", "#1f8a5b", "#6d4ea8", "#cf8a32", "#2f8f8a", "#4a5a66"];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

interface Props {
  name: string;
  handle: string;
  img?: string;
  size?: number;
}

export default function Avatar({ name, handle, img, size = 40 }: Props) {
  if (img) {
    return (
      <div
        className="av"
        style={{ width: size, height: size, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    );
  }
  const init = (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const bg = AVCOL[hash(handle || name || "x") % AVCOL.length];
  return (
    <div className="av" style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}>
      {init}
    </div>
  );
}

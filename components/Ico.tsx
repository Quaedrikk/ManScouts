"use client";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const F = { fill: "currentColor" };

const icons: Record<string, React.ReactNode> = {
  mountain: <g {...P}><path d="M14 74 L40 30 L56 54 L70 36 L88 74 Z"/><path d="M34 38 l6 6 6-6"/></g>,
  tent: <g {...P}><path d="M16 76 L50 26 L84 76 Z"/><path d="M50 26 L50 76"/><path d="M40 76 L50 56 L60 76"/></g>,
  flame: <g {...P}><path d="M50 20 C66 40 70 52 60 66 C56 72 44 72 40 66 C34 58 38 52 44 48 C42 58 52 60 54 52 C56 44 46 40 50 20 Z"/></g>,
  water: <g {...P}><path d="M50 22 C66 46 72 58 64 70 C57 80 43 80 36 70 C28 58 34 46 50 22 Z"/></g>,
  compass: <g {...P}><circle cx="50" cy="50" r="30"/><path d="M50 30 L58 54 L50 50 L42 54 Z" fill="#fff"/><path d="M50 70 L42 50 L50 50 L58 50 Z"/></g>,
  leaf: <g {...P}><path d="M28 72 C28 40 56 28 76 28 C76 56 56 76 28 72 Z"/><path d="M30 70 L66 36"/></g>,
  fish: <g {...P}><path d="M22 50 C36 32 64 32 74 50 C64 68 36 68 22 50 Z"/><path d="M74 50 L88 38 L88 62 Z"/><circle cx="38" cy="46" r="2.5" fill="#fff"/></g>,
  axe: <g {...P}><path d="M34 78 L62 26"/><path d="M58 22 C72 24 78 36 74 48 C66 44 60 44 54 48 Z"/></g>,
  sunrise: <g {...P}><path d="M18 70 H82"/><path d="M34 70 a16 16 0 0 1 32 0"/><path d="M50 38 V28 M30 46 L24 40 M70 46 L76 40 M22 60 H14 M78 60 H86"/></g>,
  boot: <g {...P}><path d="M36 22 V54 L66 66 C76 70 78 78 70 78 H30 V22 Z"/><path d="M30 70 H70"/></g>,
  moon: <g {...P}><path d="M62 22 A30 30 0 1 0 62 78 A24 24 0 0 1 62 22 Z"/></g>,
  knife: <g {...P}><path d="M22 70 C40 52 60 38 78 26 C74 44 60 60 40 72 Z"/><path d="M22 70 L34 80"/></g>,
  knot: <g {...P}><path d="M30 40 C50 20 70 60 50 70 C30 80 50 40 70 60"/><path d="M28 64 C44 50 56 50 72 36"/></g>,
  wrench: <g {...P}><path d="M64 24 a14 14 0 1 0 12 22 L52 70 a8 8 0 0 1-12-12 L64 34 a14 14 0 0 1 0-10 Z"/></g>,
  pot: <g {...P}><path d="M24 46 H76 V62 a14 14 0 0 1-14 14 H38 a14 14 0 0 1-14-14 Z"/><path d="M40 46 V36 M60 46 V36"/><path d="M18 52 H24 M76 52 H82"/></g>,
  bowl: <g {...P}><path d="M22 50 H78 a28 22 0 0 1-56 0 Z"/><path d="M40 40 q4-10 0-16 M52 40 q4-10 0-16"/></g>,
  hands: <g {...P}><path d="M50 70 C30 56 24 44 32 34 C40 26 50 32 50 40 C50 32 60 26 68 34 C76 44 70 56 50 70 Z"/></g>,
  horn: <g {...P}><path d="M26 42 L26 58 L46 58 L72 74 L72 26 L46 42 Z"/><path d="M78 40 q8 10 0 20"/></g>,
  bag: <g {...P}><path d="M30 40 H70 L74 78 H26 Z"/><path d="M40 40 a10 10 0 0 1 20 0"/></g>,
  teach: <g {...P}><circle cx="50" cy="34" r="10"/><path d="M28 74 a22 18 0 0 1 44 0"/><path d="M24 50 L18 54 M76 50 L82 54"/></g>,
  seed: <g {...P}><path d="M50 76 V44"/><path d="M50 52 C36 52 30 40 32 30 C46 30 50 42 50 52 Z"/><path d="M50 48 C64 48 70 38 68 30 C56 30 50 40 50 48 Z"/></g>,
  drop: <g {...P}><path d="M50 22 C66 46 72 58 64 70 C57 80 43 80 36 70 C28 58 34 46 50 22 Z"/></g>,
  pack: <g {...P}><path d="M34 30 H66 V78 H34 Z"/><path d="M42 30 a8 8 0 0 1 16 0"/><path d="M34 56 H66 M44 56 V70"/></g>,
  stars: <g {...F}><path d="M30 30 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z"/><path d="M64 50 l2.5 5 5.5 .8 -4 4 1 5.5 -5 -2.5 -5 2.5 1 -5.5 -4 -4 5.5 -.8 Z"/></g>,
  wave: <g {...P}><path d="M16 46 q9-10 18 0 t18 0 t18 0"/><path d="M16 62 q9-10 18 0 t18 0 t18 0"/></g>,
  board: <g {...P}><rect x="22" y="24" width="56" height="52" rx="8"/><path d="M34 40 H66 M34 52 H58"/></g>,
  trophy: <g {...P}><path d="M34 24 H66 V40 a16 16 0 0 1-32 0 Z"/><path d="M34 30 H24 a8 8 0 0 0 10 12 M66 30 H76 a8 8 0 0 1-10 12"/><path d="M50 56 V66 M40 76 H60 M44 66 H56"/></g>,
  star: <g {...F}><path d="M50 18 l9 20 22 2 -16.5 15 5 21.5 -19.5 -11 -19.5 11 5 -21.5 -16.5 -15 22 -2 Z"/></g>,
  heart: <g {...P}><path d="M50 76 C26 60 20 46 28 36 C36 28 48 32 50 42 C52 32 64 28 72 36 C80 46 74 60 50 76 Z"/></g>,
  bolt: <g {...F}><path d="M54 16 L30 54 H46 L42 84 L70 44 H52 Z"/></g>,
  crown: <g {...P}><path d="M24 68 L20 34 L36 50 L50 28 L64 50 L80 34 L76 68 Z"/><path d="M24 68 H76"/></g>,
  anchor: <g {...P}><circle cx="50" cy="26" r="6"/><path d="M50 32 V78"/><path d="M30 52 H70"/><path d="M22 60 a28 28 0 0 0 56 0"/></g>,
  book: <g {...P}><path d="M26 28 C36 24 46 24 50 30 C54 24 64 24 74 28 V72 C64 68 54 68 50 74 C46 68 36 68 26 72 Z"/><path d="M50 30 V74"/></g>,
  camera: <g {...P}><rect x="20" y="36" width="60" height="40" rx="7"/><path d="M38 36 L44 28 H56 L62 36"/><circle cx="50" cy="56" r="11"/></g>,
  globe: <g {...P}><circle cx="50" cy="50" r="30"/><path d="M20 50 H80 M50 20 V80 M30 32 q20 14 40 0 M30 68 q20-14 40 0"/></g>,
  dumbbell: <g {...P}><path d="M34 50 H66"/><rect x="20" y="40" width="12" height="20" rx="3"/><rect x="68" y="40" width="12" height="20" rx="3"/></g>,
  paw: <g {...F}><circle cx="34" cy="40" r="7"/><circle cx="50" cy="34" r="7"/><circle cx="66" cy="40" r="7"/><path d="M50 50 C62 50 70 60 66 70 C62 78 38 78 34 70 C30 60 38 50 50 50 Z"/></g>,
  sword: <g {...P}><path d="M70 24 L40 54 M30 64 L40 54 M30 64 L26 74 L36 70 L46 60"/><path d="M58 36 L64 30 M70 24 L62 26 L62 34"/></g>,
  gear: <g {...P}><circle cx="50" cy="50" r="12"/><path d="M50 24 V34 M50 66 V76 M24 50 H34 M66 50 H76 M32 32 L40 40 M60 60 L68 68 M68 32 L60 40 M40 60 L32 68"/></g>,
  target: <g {...P}><circle cx="50" cy="50" r="28"/><circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="4" fill="currentColor"/></g>,
  music: <g {...P}><path d="M44 70 a8 8 0 1 1-2-6 V32 L72 24 V60 a8 8 0 1 1-2-6"/><path d="M42 40 L70 32"/></g>,
  feather: <g {...P}><path d="M72 28 C50 28 30 48 28 72 C52 70 72 50 72 28 Z"/><path d="M30 70 L60 40 M44 58 H58 M40 62 H52"/></g>,
  flag: <g {...P}><path d="M34 24 V78"/><path d="M34 28 L72 34 L62 46 L72 58 L34 52 Z"/></g>,
};

export default function Ico({ name, stroke }: { name: string; stroke?: string }) {
  const content = icons[name] || icons.stars;
  // Icons use `currentColor`, so the color is driven by `color`. Default white
  // keeps badge emblems (drawn on colored circles) looking right; callers like
  // the nav bar pass a color to make the icons visible on light backgrounds.
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ color: stroke ?? "#fff" }}>
      {content}
    </svg>
  );
}

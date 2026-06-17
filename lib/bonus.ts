import type { Challenge } from "./types";
import { chStars } from "./challenges";

// Same deterministic pick used by the board's daily/weekly selection.
function seededPick(all: Challenge[], seedStr: string, n: number): Challenge[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const pool = [...all];
  const out: Challenge[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}

// 1.5x if it was the challenge of the week, 1.25x if challenge of the day, else 1x.
export function pointsMultiplier(challengeId: string, dateIso: string, challenges: Challenge[]): number {
  const d = new Date(dateIso);
  const weekKey = "w" + Math.floor(d.getTime() / (7 * 86400000));
  const weekly = seededPick(challenges.filter((c) => chStars(c) >= 3), weekKey, 1)[0];
  if (weekly && weekly.id === challengeId) return 1.5;
  const dayKey = d.toISOString().slice(0, 10);
  const daily = seededPick(challenges.filter((c) => chStars(c) <= 2), dayKey, 3);
  if (daily.some((c) => c.id === challengeId)) return 1.25;
  return 1;
}

export function effectivePoints(ch: Challenge, dateIso: string, challenges: Challenge[]): number {
  return Math.round(ch.pts * pointsMultiplier(ch.id, dateIso, challenges));
}

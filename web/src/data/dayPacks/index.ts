import type { DayPack } from "./types";
import { week1 } from "./week1";

export type { DayPack, WordRow } from "./types";

/** All written day packs, in day order. Days without a pack fall back to the general banks. */
export const dayPacks: DayPack[] = [...week1].sort((a, b) => a.day - b.day);

export const packByDay = new Map(dayPacks.map((p) => [p.day, p]));

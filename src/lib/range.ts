import { startOfDay, endOfDay } from "@/lib/utils";

export type RangeKey = "day" | "month" | "year" | "custom";

export function resolveRange(
  range: string | undefined,
  from?: string,
  to?: string,
): { start: Date; end: Date; key: RangeKey } {
  const now = new Date();
  const key = (range as RangeKey) ?? "month";
  if (key === "day") {
    return { start: startOfDay(now), end: endOfDay(now), key };
  }
  if (key === "year") {
    const s = new Date(now.getFullYear(), 0, 1);
    const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start: s, end: e, key };
  }
  if (key === "custom" && from && to) {
    return {
      start: startOfDay(new Date(from)),
      end: endOfDay(new Date(to)),
      key,
    };
  }
  // month
  const s = new Date(now.getFullYear(), now.getMonth(), 1);
  const e = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start: s, end: e, key };
}

export function rangeBuckets(start: Date, end: Date): string[] {
  // 기간을 일 단위 라벨 목록으로
  const buckets: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    buckets.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return buckets;
}

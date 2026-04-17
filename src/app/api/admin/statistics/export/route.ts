import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { resolveRange } from "@/lib/range";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/domain";

function toCsv(rows: (string | number)[][]): string {
  // BOM 포함 → Excel 한글 호환
  const bom = "\uFEFF";
  const body = rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(","),
    )
    .join("\n");
  return bom + body;
}

export async function GET(request: Request) {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "super_admin") {
    return new NextResponse("forbidden", { status: 403 });
  }
  const url = new URL(request.url);
  const { start, end } = resolveRange(
    url.searchParams.get("range") ?? undefined,
    url.searchParams.get("from") ?? undefined,
    url.searchParams.get("to") ?? undefined,
  );
  const franchise = url.searchParams.get("franchise");
  const kind = url.searchParams.get("kind") ?? "orders";

  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select(
      "id, price, status, ordered_at, franchise_id, franchises(name, code), products(name, category), customers(name, phone)",
    )
    .gte("ordered_at", start.toISOString())
    .lte("ordered_at", end.toISOString())
    .order("ordered_at", { ascending: false });
  if (franchise && franchise !== "all") q = q.eq("franchise_id", franchise);
  const { data } = await q;
  const list = data ?? [];

  if (kind === "franchises") {
    const map = new Map<
      string,
      { name: string; code: string; revenue: number; orders: number }
    >();
    list.forEach((o) => {
      const id = o.franchise_id as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fr = (o as any).franchises;
      const cur = map.get(id) ?? {
        name: fr?.name ?? "-",
        code: fr?.code ?? "",
        revenue: 0,
        orders: 0,
      };
      cur.revenue += o.price ?? 0;
      cur.orders += 1;
      map.set(id, cur);
    });
    const ranking = [...map.values()].sort((a, b) => b.revenue - a.revenue);
    const rows: (string | number)[][] = [
      ["순위", "코드", "대리점명", "매출(원)", "주문건수", "평균단가(원)"],
      ...ranking.map((r, i) => [
        i + 1,
        r.code,
        r.name,
        r.revenue,
        r.orders,
        r.orders ? Math.round(r.revenue / r.orders) : 0,
      ]),
    ];
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="franchises_${Date.now()}.csv"`,
      },
    });
  }

  const rows: (string | number)[][] = [
    ["주문번호", "주문일", "대리점", "고객", "상품", "카테고리", "금액", "상태"],
    ...list.map((o) => [
      o.id as string,
      (o.ordered_at as string).replace("T", " ").slice(0, 19),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o as any).franchises?.name ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o as any).customers?.name ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o as any).products?.name ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      CATEGORY_LABEL[(o as any).products?.category as keyof typeof CATEGORY_LABEL] ?? "",
      o.price as number,
      STATUS_LABEL[o.status as keyof typeof STATUS_LABEL] ?? String(o.status),
    ]),
  ];
  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orders_${Date.now()}.csv"`,
    },
  });
}

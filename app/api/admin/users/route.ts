import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")?.trim() || ""
    const dateFrom = searchParams.get("dateFrom")?.trim() || ""
    const dateTo = searchParams.get("dateTo")?.trim() || ""

    const conditions: string[] = ["1=1"]
    const params: (string | number)[] = []

    if (role && ["user", "admin"].includes(role)) {
      conditions.push("u.role = ?")
      params.push(role)
    }
    if (dateFrom) {
      conditions.push("u.created_at >= ?")
      params.push(dateFrom)
    }
    if (dateTo) {
      conditions.push("u.created_at <= ?")
      params.push(dateTo + " 23:59:59")
    }

    const whereClause = conditions.join(" AND ")

    type Row = {
      id: string
      username: string
      email: string
      role: string | null
      created_at: string
      lots_count: string
      orders_count: string
      avg_rating: string | null
    }

    let rows: Row[] = []
    try {
      rows = await query<Row>(
        `SELECT u.id, u.username, u.email, u.role, u.created_at,
                (SELECT COUNT(*) FROM lots l WHERE l.seller_id = u.id) AS lots_count,
                (SELECT COUNT(*) FROM orders o WHERE o.buyer_id = u.id) AS orders_count,
                (SELECT AVG(r.rating) FROM reviews r WHERE r.seller_id = u.id) AS avg_rating
         FROM users u
         WHERE ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT 200`,
        params
      )
    } catch (_) {
      try {
        rows = await query<Row>(
          `SELECT u.id, u.username, u.email, u.role, u.created_at,
                  (SELECT COUNT(*) FROM lots l WHERE l.seller_id = u.id) AS lots_count,
                  (SELECT COUNT(*) FROM orders o WHERE o.buyer_id = u.id) AS orders_count,
                  NULL AS avg_rating
           FROM users u
           WHERE ${whereClause}
           ORDER BY u.created_at DESC
           LIMIT 200`,
          params
        )
      } catch (__) {
        rows = await query<Row>(
          `SELECT id, username, email, NULL AS role, created_at,
                  '0' AS lots_count, '0' AS orders_count, NULL AS avg_rating
           FROM users
           WHERE 1=1
           ORDER BY created_at DESC
           LIMIT 200`,
          []
        )
      }
    }

    const users = rows.map((r) => ({
      id: String(r.id),
      username: r.username ?? "",
      email: r.email ?? "",
      role: r.role ?? "user",
      createdAt: r.created_at,
      lotsCount: Number(r.lots_count ?? 0),
      ordersCount: Number(r.orders_count ?? 0),
      avgRating: r.avg_rating != null ? Math.round(Number(r.avg_rating) * 10) / 10 : null,
    }))

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

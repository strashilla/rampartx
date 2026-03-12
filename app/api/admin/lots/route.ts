import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))
    const category = searchParams.get("category")?.trim() || ""
    const status = searchParams.get("status")?.trim() || ""
    const offset = (page - 1) * limit

    const conditions: string[] = ["1=1"]
    const params: (string | number)[] = []

    if (category) {
      conditions.push("l.category = ?")
      params.push(category)
    }
    if (status) {
      conditions.push("l.status = ?")
      params.push(status)
    }

    const whereClause = conditions.join(" AND ")

    type Row = {
      id: string
      title: string
      seller_name: string
      category: string | null
      price: string
      currency: string
      status: string
      created_at: string
    }

    let rows: Row[] = []
    try {
      rows = await query<Row>(
        `SELECT l.id, l.title, u.username AS seller_name, l.category, l.price, l.currency, l.status, l.created_at
         FROM lots l
         JOIN users u ON u.id = l.seller_id
         WHERE ${whereClause}
         ORDER BY l.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
    } catch (_) {
      rows = await query<Row>(
        `SELECT l.id, l.title, u.username AS seller_name, l.price, l.currency, l.status, l.created_at, NULL AS category
         FROM lots l
         JOIN users u ON u.id = l.seller_id
         WHERE 1=1
         ORDER BY l.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      )
    }

    const lots = rows.map((r) => ({
      id: String(r.id),
      title: r.title ?? "",
      sellerName: r.seller_name ?? "",
      category: r.category ?? "",
      price: Number(r.price ?? 0),
      currency: r.currency ?? "RUB",
      status: r.status ?? "draft",
      createdAt: r.created_at,
    }))

    return NextResponse.json({ lots })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

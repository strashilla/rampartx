import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))
    const status = searchParams.get("status")?.trim() || ""
    const offset = (page - 1) * limit

    const conditions: string[] = ["1=1"]
    const params: (string | number)[] = []

    if (status) {
      conditions.push("o.status = ?")
      params.push(status)
    }

    const whereClause = conditions.join(" AND ")

    type Row = {
      id: string
      lot_id: string
      title: string
      buyer_name: string
      seller_name: string
      total: string
      currency: string
      status: string
      created_at: string
    }

    const rows = await query<Row>(
      `SELECT o.id, o.lot_id, l.title,
              buyer.username AS buyer_name,
              seller.username AS seller_name,
              o.total, o.currency, o.status, o.created_at
       FROM orders o
       JOIN lots l ON l.id = o.lot_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = l.seller_id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const orders = rows.map((r) => ({
      id: String(r.id),
      lotId: String(r.lot_id),
      title: r.title ?? "",
      buyerName: r.buyer_name ?? "",
      sellerName: r.seller_name ?? "",
      total: Number(r.total ?? 0),
      currency: r.currency ?? "RUB",
      status: r.status ?? "pending",
      createdAt: r.created_at,
    }))

    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

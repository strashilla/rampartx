import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ disputes: [] })
    }
    const rows = await query<{
      id: string
      order_id: string
      status: string
      created_at: string
      title: string
    }>(
      `SELECT d.id, d.order_id, d.status, d.created_at, l.title
       FROM disputes d
       JOIN orders o ON o.id = d.order_id
       JOIN lots l ON l.id = o.lot_id
       WHERE d.opener_id = ? OR l.seller_id = ? OR o.buyer_id = ?
       ORDER BY d.created_at DESC`,
      [userId, userId, userId]
    )
    const disputes = rows.map((r) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      status: r.status,
      createdAt: r.created_at,
      lotTitle: r.title,
    }))
    return NextResponse.json({ disputes })
  } catch {
    return NextResponse.json({ disputes: [] })
  }
}

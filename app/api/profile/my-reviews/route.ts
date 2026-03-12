import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ reviews: [] })
    }
    const rows = await query<{
      id: string
      order_id: string
      rating: string
      comment: string | null
      created_at: string
      title: string
    }>(
      `SELECT r.id, r.order_id, r.rating, r.comment, r.created_at, l.title
       FROM reviews r
       JOIN orders o ON o.id = r.order_id
       JOIN lots l ON l.id = o.lot_id
       WHERE r.buyer_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    )
    const reviews = rows.map((r) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      lotTitle: r.title,
      rating: Number(r.rating),
      comment: r.comment || undefined,
      createdAt: r.created_at,
    }))
    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

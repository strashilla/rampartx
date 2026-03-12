import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ orders: [] })
    }

    let rows: {
      id: string
      lot_id: string
      title: string
      quantity: number
      total: string
      currency: string
      seller_name: string
      seller_id?: string
      status: string
      created_at: string
      review_rating?: string | null
      review_comment?: string | null
    }[] = []

    try {
      rows = await query(
        `SELECT o.id, o.lot_id, o.quantity, o.total, o.currency, o.status, o.created_at,
                l.title, l.seller_id, u.username AS seller_name,
                r.rating AS review_rating, r.comment AS review_comment
         FROM orders o
         JOIN lots l ON l.id = o.lot_id
         JOIN users u ON u.id = l.seller_id
         LEFT JOIN reviews r ON r.order_id = o.id
         WHERE o.buyer_id = ?
         ORDER BY o.created_at DESC`,
        [userId]
      )
    } catch (_) {
      try {
        rows = await query(
          `SELECT o.id, o.lot_id, o.quantity, o.total, o.currency, o.status, o.created_at,
                  l.title, l.seller_id, u.username AS seller_name
           FROM orders o
           JOIN lots l ON l.id = o.lot_id
           JOIN users u ON u.id = l.seller_id
           WHERE o.buyer_id = ?
           ORDER BY o.created_at DESC`,
          [userId]
        )
      } catch (_) {
        const legacy = await query<{
        id: string
        title: string
        description: string
        price: string
        currency: string
        seller_name: string
        status: string
        created_at: string
      }>(
        `SELECT l.id, l.title, l.description, l.price, l.currency, l.status, l.created_at, u.username AS seller_name
         FROM lots l
         JOIN users u ON u.id = l.seller_id
         WHERE l.buyer_id = ?
         ORDER BY l.updated_at DESC`,
        [userId]
      )
      return NextResponse.json({
        orders: legacy.map((r) => ({
          id: String(r.id),
          lotId: String(r.id),
          title: r.title,
          quantity: 1,
          price: Number(r.price),
          total: Number(r.price),
          currency: r.currency,
          sellerName: r.seller_name,
          status: "paid",
          createdAt: r.created_at,
        })),
      })
      }
    }

    const orders = rows.map((r) => {
      const totalNum = Number(r.total)
      const hasReview = r.review_rating != null
      return {
        id: String(r.id),
        lotId: String(r.lot_id),
        title: r.title,
        quantity: Number(r.quantity),
        total: totalNum,
        price: totalNum,
        currency: r.currency ?? "RUB",
        sellerName: r.seller_name ?? "",
        sellerId: r.seller_id != null ? String(r.seller_id) : undefined,
        status: r.status,
        createdAt: r.created_at,
        hasReview: !!hasReview,
        reviewRating: r.review_rating != null ? Number(r.review_rating) : undefined,
        reviewComment: r.review_comment ?? undefined,
      }
    })
    return NextResponse.json({ orders })
  } catch (e) {
    console.error("Orders list error:", e)
    return NextResponse.json({ orders: [] })
  }
}

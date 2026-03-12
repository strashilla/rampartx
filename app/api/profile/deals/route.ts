import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    let purchases: {
      id: string
      title: string
      sellerName: string
      status: string
      total: number
      createdAt: string
      hasReview?: boolean
      reviewRating?: number
    }[] = []
    let sales: {
      id: string
      title: string
      buyerName: string
      status: string
      total: number
      createdAt: string
    }[] = []
    let dealsCount = 0
    let ratingReceived: number | null = null
    let reviewsAboutMe: { id: string; orderId: string; lotTitle: string; rating: number; comment: string | null; createdAt: string; buyerName: string }[] = []

    try {
      let purchaseRows: { id: string; title: string; total: string; status: string; created_at: string; seller_name: string; review_rating?: string | null }[]
      try {
        purchaseRows = await query(
          `SELECT o.id, o.total, o.status, o.created_at, l.title, u.username AS seller_name,
                  r.rating AS review_rating
           FROM orders o
           JOIN lots l ON l.id = o.lot_id
           JOIN users u ON u.id = l.seller_id
           LEFT JOIN reviews r ON r.order_id = o.id
           WHERE o.buyer_id = ?
           ORDER BY o.created_at DESC
           LIMIT 20`,
          [userId]
        )
      } catch (_) {
        purchaseRows = await query(
          `SELECT o.id, o.total, o.status, o.created_at, l.title, u.username AS seller_name
           FROM orders o
           JOIN lots l ON l.id = o.lot_id
           JOIN users u ON u.id = l.seller_id
           WHERE o.buyer_id = ?
           ORDER BY o.created_at DESC
           LIMIT 100`,
          [userId]
        )
      }
      purchases = purchaseRows.map((r) => ({
        id: String(r.id),
        title: r.title,
        sellerName: r.seller_name ?? "",
        status: r.status,
        total: Number(r.total),
        createdAt: r.created_at,
        hasReview: r.review_rating != null,
        reviewRating: r.review_rating != null ? Number(r.review_rating) : undefined,
      }))
    } catch (_) {}

    try {
      const salesRows = await query<{
        id: string
        title: string
        total: string
        status: string
        created_at: string
        buyer_name: string
      }>(
        `SELECT o.id, o.total, o.status, o.created_at, l.title, u.username AS buyer_name
         FROM orders o
         JOIN lots l ON l.id = o.lot_id
         JOIN users u ON u.id = o.buyer_id
         WHERE l.seller_id = ?
         ORDER BY o.created_at DESC
         LIMIT 100`,
        [userId]
      )
      sales = salesRows.map((r) => ({
        id: String(r.id),
        title: r.title,
        buyerName: r.buyer_name ?? "",
        status: (r.status || "").toLowerCase(),
        total: Number(r.total),
        createdAt: r.created_at,
      }))
    } catch (_) {}

    dealsCount = purchases.length + sales.length

    try {
      const ratingRows = await query<{ avg_rating: string; cnt: string }>(
        "SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE seller_id = ?",
        [userId]
      )
      if (ratingRows.length > 0 && Number(ratingRows[0].cnt) > 0) {
        ratingReceived = Math.round(Number(ratingRows[0].avg_rating) * 10) / 10
      }
    } catch (_) {}

    try {
      const reviewRows = await query<{ id: string; order_id: string; rating: string; comment: string | null; created_at: string; buyer_name: string; title: string }>(
        `SELECT r.id, r.order_id, r.rating, r.comment, r.created_at, u.username AS buyer_name, l.title
         FROM reviews r
         JOIN users u ON u.id = r.buyer_id
         JOIN orders o ON o.id = r.order_id
         JOIN lots l ON l.id = o.lot_id
         WHERE r.seller_id = ?
         ORDER BY r.created_at DESC
         LIMIT 50`,
        [userId]
      )
      reviewsAboutMe = reviewRows.map((r) => ({
        id: String(r.id),
        orderId: String(r.order_id),
        lotTitle: r.title ?? "",
        rating: Number(r.rating),
        comment: r.comment ?? null,
        createdAt: r.created_at,
        buyerName: r.buyer_name ?? "",
      }))
    } catch (_) {}

    return NextResponse.json({
      purchases,
      sales,
      stats: { dealsCount, ratingReceived },
      reviewsAboutMe,
    })
  } catch (e) {
    console.error("Profile deals error:", e)
    return NextResponse.json(
      { purchases: [], sales: [], stats: { dealsCount: 0, ratingReceived: null }, reviewsAboutMe: [] }
    )
  }
}

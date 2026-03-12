import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const rating = Math.min(5, Math.max(1, Number((body as { rating?: number }).rating) || 0))
    const comment = typeof (body as { comment?: string }).comment === "string"
      ? (body as { comment: string }).comment.trim().slice(0, 2000)
      : ""

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Оценка от 1 до 5" }, { status: 400 })
    }

    const orderRows = await query<{ buyer_id: string; lot_id: string }>(
      "SELECT buyer_id, lot_id FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    )
    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }
    if (String(orderRows[0].buyer_id) !== String(userId)) {
      return NextResponse.json({ error: "Только покупатель может оставить отзыв" }, { status: 403 })
    }

    const lotRows = await query<{ seller_id: string }>(
      "SELECT seller_id FROM lots WHERE id = ? LIMIT 1",
      [orderRows[0].lot_id]
    )
    const sellerId = lotRows.length > 0 ? lotRows[0].seller_id : null
    if (!sellerId) {
      return NextResponse.json({ error: "Продавец не найден" }, { status: 400 })
    }

    const existing = await query<{ id: string }>(
      "SELECT id FROM reviews WHERE order_id = ? LIMIT 1",
      [orderId]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: "Отзыв по этому заказу уже оставлен" }, { status: 400 })
    }

    try {
      await execute(
        "INSERT INTO reviews (order_id, buyer_id, seller_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [orderId, userId, sellerId, rating, comment || null]
      )
    } catch (e) {
      return NextResponse.json(
        { error: "Таблица отзывов недоступна. Выполните sql/migration-reviews.sql" },
        { status: 503 }
      )
    }

    return NextResponse.json({ ok: true, rating, comment: comment || null })
  } catch (e) {
    console.error("Review post error:", e)
    return NextResponse.json({ error: "Ошибка сохранения отзыва" }, { status: 500 })
  }
}

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
    const orderRows = await query<{ buyer_id: string; lot_id: string }>(
      "SELECT buyer_id, lot_id FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    )
    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }
    const order = orderRows[0]
    const lotRows = await query<{ seller_id: string }>("SELECT seller_id FROM lots WHERE id = ? LIMIT 1", [order.lot_id])
    const sellerId = lotRows.length > 0 ? lotRows[0].seller_id : null
    const canOpen = String(order.buyer_id) === String(userId) || (sellerId && String(sellerId) === String(userId))
    if (!canOpen) {
      return NextResponse.json({ error: "Нет доступа к этому заказу" }, { status: 403 })
    }
    const existing = await query<{ id: string }>("SELECT id FROM disputes WHERE order_id = ? LIMIT 1", [orderId])
    if (existing.length > 0) {
      return NextResponse.json({ error: "Спор по этому заказу уже открыт" }, { status: 400 })
    }
    const res = await execute(
      "INSERT INTO disputes (order_id, opener_id, status) VALUES (?, ?, 'open')",
      [orderId, userId]
    )
    return NextResponse.json({ ok: true, disputeId: res.insertId })
  } catch (e) {
    console.error("Dispute open error:", e)
    return NextResponse.json({ error: "Ошибка открытия спора" }, { status: 500 })
  }
}

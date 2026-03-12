import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

/** Добавить доказательство к спору по заказу (покупатель или продавец). */
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
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    if (!content) {
      return NextResponse.json({ error: "Текст доказательства обязателен" }, { status: 400 })
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
    const isParticipant =
      String(order.buyer_id) === String(userId) || (sellerId && String(sellerId) === String(userId))
    if (!isParticipant) {
      return NextResponse.json({ error: "Нет доступа к этому заказу" }, { status: 403 })
    }

    const disputeRows = await query<{ id: string }>("SELECT id FROM disputes WHERE order_id = ? AND status = 'open' LIMIT 1", [orderId])
    if (disputeRows.length === 0) {
      return NextResponse.json({ error: "Спор по этому заказу не открыт или уже закрыт" }, { status: 400 })
    }
    const disputeId = disputeRows[0].id

    await execute(
      "INSERT INTO dispute_evidence (dispute_id, user_id, content) VALUES (?, ?, ?)",
      [disputeId, userId, content]
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Dispute evidence error:", e)
    return NextResponse.json({ error: "Ошибка добавления доказательства" }, { status: 500 })
  }
}

/** Список доказательств по спору (для участника сделки). */
export async function GET(
  _request: Request,
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
      return NextResponse.json({ evidence: [] })
    }
    const order = orderRows[0]
    const lotRows = await query<{ seller_id: string }>("SELECT seller_id FROM lots WHERE id = ? LIMIT 1", [order.lot_id])
    const sellerId = lotRows.length > 0 ? lotRows[0].seller_id : null
    const isParticipant =
      String(order.buyer_id) === String(userId) || (sellerId && String(sellerId) === String(userId))
    if (!isParticipant) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }

    const disputeRows = await query<{ id: string }>("SELECT id FROM disputes WHERE order_id = ? LIMIT 1", [orderId])
    if (disputeRows.length === 0) {
      return NextResponse.json({ evidence: [] })
    }
    const disputeId = disputeRows[0].id

    const rows = await query<{ id: string; user_id: string; username: string; content: string; created_at: string }>(
      `SELECT e.id, e.user_id, u.username, e.content, e.created_at
       FROM dispute_evidence e
       JOIN users u ON u.id = e.user_id
       WHERE e.dispute_id = ?
       ORDER BY e.created_at ASC`,
      [disputeId]
    )
    const evidence = rows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      username: r.username ?? "",
      content: r.content,
      createdAt: r.created_at,
      isOwn: String(r.user_id) === String(userId),
    }))
    return NextResponse.json({ evidence })
  } catch {
    return NextResponse.json({ evidence: [] })
  }
}

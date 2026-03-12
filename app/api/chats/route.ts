import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ chats: [] })
    }

    try {
      const rows = await query<{
        chat_id: string
        order_id: string
        buyer_id: string
        seller_id: string
        order_title: string
        buyer_name: string
        seller_name: string
      }>(
        `SELECT c.id AS chat_id, c.order_id, o.buyer_id, l.seller_id, l.title AS order_title,
                buyer.username AS buyer_name, seller.username AS seller_name
         FROM chats c
         JOIN orders o ON o.id = c.order_id
         JOIN lots l ON l.id = o.lot_id
         JOIN users buyer ON buyer.id = o.buyer_id
         JOIN users seller ON seller.id = l.seller_id
         WHERE o.buyer_id = ? OR l.seller_id = ?
         ORDER BY c.id DESC`,
        [userId, userId]
      )

      if (rows.length === 0) {
        return NextResponse.json({ chats: [] })
      }

      const chatIds = rows.map((r) => r.chat_id)
      const placeholders = chatIds.map(() => "?").join(",")
      const lastMsgRows = await query<{ chat_id: string; body: string; created_at: string }>(
        `SELECT m.chat_id, m.body, m.created_at
         FROM chat_messages m
         INNER JOIN (
           SELECT chat_id, MAX(created_at) AS max_at FROM chat_messages GROUP BY chat_id
         ) t ON m.chat_id = t.chat_id AND m.created_at = t.max_at
         WHERE m.chat_id IN (${placeholders})`,
        chatIds
      )
      const lastByChat: Record<string, { body: string; created_at: string }> = {}
      for (const r of lastMsgRows) {
        lastByChat[String(r.chat_id)] = { body: r.body, created_at: r.created_at }
      }

      const chats = rows.map((r) => {
        const isBuyer = String(r.buyer_id) === String(userId)
        const otherName = isBuyer ? r.seller_name : r.buyer_name
        const otherId = isBuyer ? r.seller_id : r.buyer_id
        const last = lastByChat[String(r.chat_id)]
        return {
          id: String(r.chat_id),
          orderId: String(r.order_id),
          orderTitle: r.order_title,
          otherPartyName: otherName,
          otherPartyId: String(otherId),
          lastMessage: last?.body ?? null,
          lastMessageAt: last?.created_at ?? null,
        }
      })

      return NextResponse.json({ chats })
    } catch (_) {
      return NextResponse.json({ chats: [] })
    }
  } catch (e) {
    console.error("Chats list error:", e)
    return NextResponse.json({ chats: [] })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const orderId = (body as { orderId?: string }).orderId
    if (!orderId) {
      return NextResponse.json({ error: "Укажите orderId" }, { status: 400 })
    }

    const orderRows = await query<{ id: string; buyer_id: string; lot_id: string }>(
      "SELECT id, buyer_id, lot_id FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    )
    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }
    const order = orderRows[0]
    const lotRows = await query<{ seller_id: string }>(
      "SELECT seller_id FROM lots WHERE id = ? LIMIT 1",
      [order.lot_id]
    )
    const sellerId = lotRows.length > 0 ? String(lotRows[0].seller_id) : ""
    const buyerId = String(order.buyer_id)
    if (String(userId) !== buyerId && String(userId) !== sellerId) {
      return NextResponse.json({ error: "Нет доступа к этому заказу" }, { status: 403 })
    }

    let chatRows = await query<{ id: string }>(
      "SELECT id FROM chats WHERE order_id = ? LIMIT 1",
      [orderId]
    )
    if (chatRows.length > 0) {
      return NextResponse.json({ chatId: String(chatRows[0].id) })
    }

    const res = await execute("INSERT INTO chats (order_id) VALUES (?)", [orderId])
    return NextResponse.json({ chatId: String(res.insertId) })
  } catch (e) {
    console.error("Chat create error:", e)
    return NextResponse.json({ error: "Ошибка создания чата" }, { status: 500 })
  }
}

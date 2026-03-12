import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const chatRows = await query<{
      order_id: string
      buyer_id: string
      seller_id: string
      order_title: string
      buyer_name: string
      seller_name: string
    }>(
      `SELECT c.order_id, o.buyer_id, l.seller_id, l.title AS order_title,
              buyer.username AS buyer_name, seller.username AS seller_name
       FROM chats c
       JOIN orders o ON o.id = c.order_id
       JOIN lots l ON l.id = o.lot_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = l.seller_id
       WHERE c.id = ? LIMIT 1`,
      [chatId]
    )
    if (chatRows.length === 0) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 })
    }

    const r = chatRows[0]
    const isBuyer = String(r.buyer_id) === String(userId)
    if (String(r.buyer_id) !== String(userId) && String(r.seller_id) !== String(userId)) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }

    const otherName = isBuyer ? r.seller_name : r.buyer_name
    const otherId = isBuyer ? r.seller_id : r.buyer_id

    return NextResponse.json({
      chatId,
      orderId: String(r.order_id),
      orderTitle: r.order_title,
      otherPartyName: otherName,
      otherPartyId: String(otherId),
    })
  } catch (e) {
    console.error("Chat get error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

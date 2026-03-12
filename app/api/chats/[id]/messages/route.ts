import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

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

    const chatRows = await query<{ id: string; buyer_id: string }>(
      `SELECT c.id, o.buyer_id FROM chats c JOIN orders o ON o.id = c.order_id WHERE c.id = ? LIMIT 1`,
      [chatId]
    )
    if (chatRows.length === 0) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 })
    }
    const lotRows = await query<{ seller_id: string }>(
      `SELECT l.seller_id FROM chats c JOIN orders o ON o.id = c.order_id JOIN lots l ON l.id = o.lot_id WHERE c.id = ? LIMIT 1`,
      [chatId]
    )
    const sellerId = lotRows.length > 0 ? String(lotRows[0].seller_id) : ""
    const buyerId = String(chatRows[0].buyer_id)
    if (String(userId) !== buyerId && String(userId) !== sellerId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }

    const rows = await query<{ id: string; sender_id: string; body: string; created_at: string }>(
      `SELECT id, sender_id, body, created_at FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC`,
      [chatId]
    )
    const messages = rows.map((m) => ({
      id: String(m.id),
      senderId: String(m.sender_id),
      isMe: String(m.sender_id) === String(userId),
      body: m.body,
      createdAt: m.created_at,
    }))
    return NextResponse.json({ messages })
  } catch (e) {
    console.error("Messages get error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const text = typeof (body as { body?: string }).body === "string"
      ? (body as { body: string }).body.trim()
      : ""
    if (!text || text.length > 4000) {
      return NextResponse.json({ error: "Сообщение от 1 до 4000 символов" }, { status: 400 })
    }

    const chatRows = await query<{ id: string; buyer_id: string }>(
      `SELECT c.id, o.buyer_id FROM chats c JOIN orders o ON o.id = c.order_id WHERE c.id = ? LIMIT 1`,
      [chatId]
    )
    if (chatRows.length === 0) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 })
    }
    const lotRows = await query<{ seller_id: string }>(
      `SELECT l.seller_id FROM chats c JOIN orders o ON o.id = c.order_id JOIN lots l ON l.id = o.lot_id WHERE c.id = ? LIMIT 1`,
      [chatId]
    )
    const sellerId = lotRows.length > 0 ? String(lotRows[0].seller_id) : ""
    const buyerId = String(chatRows[0].buyer_id)
    if (String(userId) !== buyerId && String(userId) !== sellerId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }

    const res = await execute(
      "INSERT INTO chat_messages (chat_id, sender_id, body, created_at) VALUES (?, ?, ?, NOW())",
      [chatId, userId, text]
    )
    const msgRows = await query<{ id: string; sender_id: string; body: string; created_at: string }>(
      "SELECT id, sender_id, body, created_at FROM chat_messages WHERE id = ? LIMIT 1",
      [String(res.insertId)]
    )
    const m = msgRows[0]
    return NextResponse.json({
      message: {
        id: String(m.id),
        senderId: String(m.sender_id),
        isMe: true,
        body: m.body,
        createdAt: m.created_at,
      },
    })
  } catch (e) {
    console.error("Message send error:", e)
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 })
  }
}

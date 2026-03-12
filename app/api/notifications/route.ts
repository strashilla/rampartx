import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const rows: any[] = await query(
      "SELECT id, type, payload, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      [userId, limit]
    )
    const notifications = rows.map((r) => {
      // Parse the payload JSON to extract title and body
      let title = '';
      let body: string | undefined;
      try {
        const payloadObj = JSON.parse(r.payload);
        title = payloadObj.title || '';
        body = payloadObj.body || undefined;
      } catch (e) {
        // If payload is not valid JSON, use empty strings
        title = '';
        body = undefined;
      }
      
      return {
        id: String(r.id),
        type: r.type,
        title: title,
        body: body,
        read: r.is_read === 1,
        createdAt: r.created_at,
      }
    })
    const unreadRows: any[] = await query(
      "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    )
    const unreadCount = unreadRows.length > 0 ? Number(unreadRows[0].cnt) : 0
    return NextResponse.json({ notifications, unreadCount })
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const body = await request.json().catch(() => ({})) as { id?: string; readAll?: boolean }
    if (body.readAll) {
      await execute("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [userId])
      return NextResponse.json({ ok: true })
    }
    if (body.id) {
      await execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [body.id, userId])
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: "Укажите id или readAll" }, { status: 400 })
  } catch (e) {
    console.error("Notifications PATCH error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

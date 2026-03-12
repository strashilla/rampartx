import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ items: [], count: 0 })
    }
    try {
      const rows = await query<{
        id: string
        lot_id: string
        quantity: number
        title: string
        price: string
        currency: string
        image_url: string | null
      }>(
        `SELECT c.id, c.lot_id, c.quantity, l.title, l.price, l.currency, l.image_url
         FROM cart_items c
         JOIN lots l ON l.id = c.lot_id
         WHERE c.user_id = ? AND l.status = 'published'`,
        [userId]
      )
      const items = rows.map((r) => ({
        id: String(r.id),
        lotId: String(r.lot_id),
        quantity: Number(r.quantity),
        title: r.title,
        price: Number(r.price),
        currency: r.currency || "RUB",
        imageUrl: r.image_url || undefined,
      }))
      const count = items.reduce((s, i) => s + i.quantity, 0)
      return NextResponse.json({ items, count })
    } catch (_) {
      return NextResponse.json({ items: [], count: 0 })
    }
  } catch (e) {
    console.error("Cart GET error:", e)
    return NextResponse.json({ items: [], count: 0 })
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
    const { lotId, quantity: qty } = body as { lotId?: string; quantity?: number }
    if (!lotId) {
      return NextResponse.json({ error: "Укажите lotId" }, { status: 400 })
    }
    const quantity = Math.max(1, Math.min(999, Number(qty) || 1))

    const lots = await query<{ id: string; seller_id: string; status: string; quantity: number }>(
      "SELECT id, seller_id, status, quantity FROM lots WHERE id = ? LIMIT 1",
      [lotId]
    )
    if (lots.length === 0) {
      return NextResponse.json({ error: "Лот не найден" }, { status: 404 })
    }
    if (lots[0].status !== "published") {
      return NextResponse.json({ error: "Лот недоступен" }, { status: 400 })
    }
    if (String(lots[0].seller_id) === String(userId)) {
      return NextResponse.json({ error: "Нельзя добавить свой лот в корзину" }, { status: 400 })
    }
    const available = lots[0].quantity != null ? Number(lots[0].quantity) : 1
    if (quantity > available) {
      return NextResponse.json({ error: `В наличии только ${available} шт.` }, { status: 400 })
    }

    try {
      const existing = await query<{ quantity: number }>(
        "SELECT quantity FROM cart_items WHERE user_id = ? AND lot_id = ? LIMIT 1",
        [userId, lotId]
      )
      const currentQty = existing.length > 0 ? Number(existing[0].quantity) : 0
      const newQty = Math.min(currentQty + quantity, available)
      await execute(
        `INSERT INTO cart_items (user_id, lot_id, quantity) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [userId, lotId, newQty, newQty]
      )
    } catch (err) {
      return NextResponse.json(
        { error: "Корзина недоступна. Выполните sql/migration-balance-and-cart.sql" },
        { status: 503 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Cart POST error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const lotId = searchParams.get("lotId")
    if (lotId) {
      await execute(
        "DELETE FROM cart_items WHERE user_id = ? AND lot_id = ?",
        [userId, lotId]
      )
    } else {
      await execute("DELETE FROM cart_items WHERE user_id = ?", [userId])
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Cart DELETE error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

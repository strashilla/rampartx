import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const rows = await query<{
      lot_id: string
      title: string
      price: string
      currency: string
      image_url: string | null
      seller_name: string
    }>(
      `SELECT l.id AS lot_id, l.title, l.price, l.currency, l.image_url, u.username AS seller_name
       FROM favorites f
       JOIN lots l ON l.id = f.lot_id AND l.status = 'published'
       JOIN users u ON u.id = l.seller_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    )
    const list = rows.map((r) => ({
      id: String(r.lot_id),
      title: r.title,
      price: Number(r.price),
      currency: r.currency,
      image: r.image_url || undefined,
      seller: { name: r.seller_name, rating: 0, deals: 0 },
      category: "Товар",
    }))
    return NextResponse.json(list)
  } catch (e) {
    console.error("Favorites list error:", e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const body = await request.json().catch(() => ({})) as { lotId?: string }
    const lotId = body.lotId?.trim()
    if (!lotId) {
      return NextResponse.json({ error: "Укажите lotId" }, { status: 400 })
    }
    await execute(
      "INSERT IGNORE INTO favorites (user_id, lot_id) VALUES (?, ?)",
      [userId, lotId]
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Favorites add error:", e)
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
    const lotId = searchParams.get("lotId")?.trim()
    if (!lotId) {
      return NextResponse.json({ error: "Укажите lotId" }, { status: 400 })
    }
    await execute("DELETE FROM favorites WHERE user_id = ? AND lot_id = ?", [userId, lotId])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Favorites remove error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

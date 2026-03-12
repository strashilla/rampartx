import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params
    const lots = await query<{
      id: string
      title: string
      description: string
      price: string
      currency: string
      seller_id: string
      quantity: string | null
      image_url: string | null
      status: string
      username: string
      category?: string | null
    }>(
      `SELECT l.id, l.title, l.description, l.price, l.currency, l.seller_id, l.quantity, l.image_url, l.status, u.username, l.category
       FROM lots l
       JOIN users u ON u.id = l.seller_id
       WHERE l.id = ? LIMIT 1`,
      [lotId]
    )
    if (lots.length === 0) {
      return NextResponse.json({ error: "Лот не найден" }, { status: 404 })
    }
    const lot = lots[0]
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    const isOwner = userId && String(lot.seller_id) === String(userId)
    if (lot.status !== "published" && !isOwner) {
      return NextResponse.json({ error: "Лот недоступен" }, { status: 404 })
    }

    let images: string[] = []
    try {
      const imgRows = await query<{ url: string }>(
        "SELECT url FROM lot_images WHERE lot_id = ? ORDER BY sort_order ASC, id ASC",
        [lotId]
      )
      images = imgRows.map((r) => r.url)
    } catch (_) {}
    if (images.length === 0 && lot.image_url) {
      images = [lot.image_url]
    }

    const categoryLabels: Record<string, string> = {
      steam: "Steam аккаунты",
      discord: "Discord аккаунты",
      epic: "Epic Games",
      keys: "Игровые ключи",
      items: "Внутриигровые предметы",
      software: "Программное обеспечение",
    }
    return NextResponse.json({
      id: String(lot.id),
      title: lot.title,
      description: lot.description,
      price: Number(lot.price),
      currency: lot.currency,
      quantity: lot.quantity != null ? Number(lot.quantity) : 1,
      seller: { name: lot.username, rating: 0, deals: 0 },
      sellerId: lot.seller_id,
      image: images[0] || lot.image_url || undefined,
      images,
      category: lot.category ? categoryLabels[lot.category] || lot.category : undefined,
    })
  } catch (e) {
    console.error("Lot by id error:", e)
    return NextResponse.json(
      { error: "Ошибка загрузки лота" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const rows = await query<{ seller_id: string }>(
      "SELECT seller_id FROM lots WHERE id = ? LIMIT 1",
      [lotId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Лот не найден" }, { status: 404 })
    }
    if (String(rows[0].seller_id) !== String(userId)) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }
    const body = await request.json().catch(() => ({})) as {
      title?: string
      description?: string
      price?: number
      currency?: string
      quantity?: number
      category?: string
      imageUrls?: string[]
    }
    const updates: string[] = []
    const values: (string | number)[] = []
    if (typeof body.title === "string" && body.title.trim().length >= 5) {
      updates.push("title = ?")
      values.push(body.title.trim())
    }
    if (typeof body.description === "string") {
      updates.push("description = ?")
      values.push(body.description.trim())
    }
    if (typeof body.price === "number" && body.price > 0) {
      updates.push("price = ?")
      values.push(body.price)
    }
    if (typeof body.currency === "string" && ["RUB", "USD", "EUR"].includes(body.currency)) {
      updates.push("currency = ?")
      values.push(body.currency)
    }
    if (typeof body.quantity === "number" && body.quantity >= 1) {
      updates.push("quantity = ?")
      values.push(body.quantity)
    }
    if (typeof body.category === "string") {
      updates.push("category = ?")
      values.push(body.category.trim().slice(0, 64))
    }
    if (Array.isArray(body.imageUrls) && body.imageUrls.length > 0) {
      const firstUrl = body.imageUrls[0]
      updates.push("image_url = ?")
      values.push(firstUrl)
      try {
        await execute("DELETE FROM lot_images WHERE lot_id = ?", [lotId])
        for (let i = 0; i < Math.min(body.imageUrls.length, 5); i++) {
          await execute("INSERT INTO lot_images (lot_id, url, sort_order) VALUES (?, ?, ?)", [lotId, body.imageUrls[i], i])
        }
      } catch (_) {}
    }
    if (updates.length === 0) {
      return NextResponse.json({ ok: true })
    }
    updates.push("updated_at = NOW()")
    values.push(lotId)
    await execute(
      `UPDATE lots SET ${updates.join(", ")} WHERE id = ?`,
      values
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Lot PATCH error:", e)
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const rows = await query<{ seller_id: string }>(
      "SELECT seller_id FROM lots WHERE id = ? LIMIT 1",
      [lotId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Лот не найден" }, { status: 404 })
    }
    if (String(rows[0].seller_id) !== String(userId)) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }
    await execute("UPDATE lots SET status = 'archived', updated_at = NOW() WHERE id = ?", [lotId])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Lot DELETE error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

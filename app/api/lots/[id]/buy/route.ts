import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({})) as {
      quantity?: number
      contactEmail?: string
      paymentMethod?: string
      comment?: string
    }
    const quantity = Math.max(1, Math.min(999999, Number(body.quantity) || 1))
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() || null : null
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim().slice(0, 64) || null : null
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) || null : null

    const lots = await query<{
      id: string
      seller_id: string
      status: string
      price: string
      currency: string
      quantity?: number
    }>("SELECT id, seller_id, status, price, currency, quantity FROM lots WHERE id = ? LIMIT 1", [lotId])
    if (lots.length === 0) {
      return NextResponse.json({ error: "Лот не найден" }, { status: 404 })
    }
    const lot = lots[0]
    if (lot.status !== "published") {
      return NextResponse.json(
        { error: "Лот недоступен для покупки" },
        { status: 400 }
      )
    }
    if (String(lot.seller_id) === String(userId)) {
      return NextResponse.json(
        { error: "Нельзя купить свой лот" },
        { status: 400 }
      )
    }

    const available = lot.quantity != null ? Number(lot.quantity) : 1
    if (quantity > available) {
      return NextResponse.json(
        { error: `В наличии только ${available} шт.` },
        { status: 400 }
      )
    }

    const priceNum = Number(lot.price)
    const total = priceNum * quantity
    const currency = lot.currency || "RUB"

    let orderId: string
    try {
      const res = await execute(
        `INSERT INTO orders (lot_id, buyer_id, quantity, total, currency, contact_email, payment_method, comment, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [lotId, userId, quantity, total, currency, contactEmail, paymentMethod, comment]
      )
      orderId = String(res.insertId)
    } catch (tableErr: unknown) {
      try {
        const res = await execute(
          `INSERT INTO orders (lot_id, buyer_id, quantity, total, currency, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
          [lotId, userId, quantity, total, currency]
        )
        orderId = String(res.insertId)
      } catch {
        throw tableErr
      }
    }

    try {
      await execute(
        "UPDATE lots SET quantity = quantity - ? WHERE id = ? AND quantity >= ?",
        [quantity, lotId, quantity]
      )
    } catch (_) {
      await execute("UPDATE lots SET buyer_id = ?, status = 'sold', updated_at = NOW() WHERE id = ?", [userId, lotId])
    }

    return NextResponse.json({ ok: true, orderId })
  } catch (e) {
    console.error("Buy error:", e)
    return NextResponse.json(
      { error: "Ошибка при оформлении покупки" },
      { status: 500 }
    )
  }
}

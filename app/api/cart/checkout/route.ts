import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      contactEmail?: string
      paymentMethod?: string
      comment?: string
    }
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() || null : null
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim().slice(0, 64) || null : null
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) || null : null

    const items = await query<{
      id: string
      lot_id: string
      quantity: number
      price: string
      currency: string
      lot_quantity: number
    }>(
      `SELECT c.id, c.lot_id, c.quantity, l.price, l.currency, l.quantity AS lot_quantity
       FROM cart_items c
       JOIN lots l ON l.id = c.lot_id
       WHERE c.user_id = ? AND l.status = 'published'`,
      [userId]
    )
    if (items.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 })
    }

    let totalSum = 0
    const validItems: { lotId: string; quantity: number; total: number }[] = []
    for (const row of items) {
      const qty = Math.min(Number(row.quantity), Number(row.lot_quantity) || 1)
      if (qty < 1) continue
      const price = Number(row.price)
      const total = price * qty
      totalSum += total
      validItems.push({ lotId: String(row.lot_id), quantity: qty, total })
    }
    if (validItems.length === 0) {
      return NextResponse.json({ error: "Нет доступных товаров в корзине" }, { status: 400 })
    }

    let balance = 0
    try {
      const balRows = await query<{ balance: string }>(
        "SELECT balance FROM users WHERE id = ? LIMIT 1",
        [userId]
      )
      if (balRows.length > 0) balance = Number(balRows[0].balance)
    } catch (_) {}
    if (balance < totalSum) {
      return NextResponse.json(
        { error: `Недостаточно средств. Баланс: ${balance.toFixed(2)} ₽, нужно: ${totalSum.toFixed(2)} ₽` },
        { status: 400 }
      )
    }

    let commissionPercent = 5
    try {
      const setRows = await query<{ value: string }>("SELECT value FROM settings WHERE `key` = 'commission_percent' LIMIT 1", [])
      if (setRows.length > 0 && setRows[0].value != null) commissionPercent = Math.min(10, Math.max(0, Number(setRows[0].value) || 5))
    } catch (_) {}

    const orderIds: string[] = []
    for (const it of validItems) {
      let insertedId: number
      try {
        const res = await execute(
          `INSERT INTO orders (lot_id, buyer_id, quantity, total, currency, contact_email, payment_method, comment, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'RUB', ?, ?, ?, 'paid', NOW(), NOW())`,
          [it.lotId, userId, it.quantity, it.total, contactEmail, paymentMethod, comment]
        )
        insertedId = res.insertId
        orderIds.push(String(insertedId))
      } catch (_) {
        const res = await execute(
          `INSERT INTO orders (lot_id, buyer_id, quantity, total, currency, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'RUB', 'paid', NOW(), NOW())`,
          [it.lotId, userId, it.quantity, it.total]
        )
        insertedId = res.insertId
        orderIds.push(String(insertedId))
      }
      await execute(
        "UPDATE lots SET quantity = quantity - ? WHERE id = ? AND quantity >= ?",
        [it.quantity, it.lotId, it.quantity]
      )
      try {
        const lotRow = await query<{ seller_id: string }>("SELECT seller_id FROM lots WHERE id = ? LIMIT 1", [it.lotId])
        if (lotRow.length > 0) {
          const commission = (it.total * commissionPercent) / 100
          const sellerGets = it.total - commission
          await execute("UPDATE users SET balance = balance + ? WHERE id = ?", [sellerGets, lotRow[0].seller_id])
          await execute("INSERT INTO platform_earnings (order_id, amount) VALUES (?, ?)", [insertedId, commission])
        }
      } catch (_) {}
    }

    const upd = await execute(
      "UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?",
      [totalSum, userId, totalSum]
    )
    if (upd.affectedRows === 0) {
      return NextResponse.json(
        { error: "Недостаточно средств на балансе" },
        { status: 400 }
      )
    }

    await execute("DELETE FROM cart_items WHERE user_id = ?", [userId])

    return NextResponse.json({ ok: true, orderIds })
  } catch (e) {
    console.error("Cart checkout error:", e)
    return NextResponse.json({ error: "Ошибка оформления" }, { status: 500 })
  }
}

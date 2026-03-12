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
    try {
      const rows = await query<{ balance: string }>(
        "SELECT balance FROM users WHERE id = ? LIMIT 1",
        [userId]
      )
      const balance = rows.length > 0 ? Number(rows[0].balance) : 0
      return NextResponse.json({ balance })
    } catch (_) {
      return NextResponse.json({ balance: 0 })
    }
  } catch (e) {
    console.error("Balance GET error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
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
    const amount = Math.max(0, Number((body as { amount?: number }).amount) || 0)
    if (amount <= 0) {
      return NextResponse.json({ error: "Укажите сумму пополнения" }, { status: 400 })
    }
    if (amount > 1_000_000) {
      return NextResponse.json({ error: "Сумма слишком большая" }, { status: 400 })
    }
    try {
      await execute(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        [amount, userId]
      )
    } catch (_) {
      return NextResponse.json(
        { error: "Баланс недоступен. Выполните sql/migration-balance-and-cart.sql" },
        { status: 503 }
      )
    }
    const rows = await query<{ balance: string }>(
      "SELECT balance FROM users WHERE id = ? LIMIT 1",
      [userId]
    )
    const balance = rows.length > 0 ? Number(rows[0].balance) : amount
    return NextResponse.json({ ok: true, balance })
  } catch (e) {
    console.error("Balance POST error:", e)
    return NextResponse.json({ error: "Ошибка пополнения" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"
import * as bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Введите текущий и новый пароль" },
        { status: 400 }
      )
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Новый пароль не менее 8 символов" },
        { status: 400 }
      )
    }

    const rows = await query<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
      [userId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 })
    }
    const match = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!match) {
      return NextResponse.json(
        { error: "Неверный текущий пароль" },
        { status: 401 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await execute("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [
      passwordHash,
      userId,
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Change password error:", e)
    return NextResponse.json(
      { error: "Ошибка при смене пароля" },
      { status: 500 }
    )
  }
}

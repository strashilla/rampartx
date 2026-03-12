import { NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import * as bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = typeof body?.token === "string" ? body.token.trim() : ""
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : ""
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Укажите токен и новый пароль" },
        { status: 400 }
      )
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Пароль не менее 8 символов" },
        { status: 400 }
      )
    }

    const rows = await query<{ email: string }>(
      "SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1",
      [token]
    )
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Ссылка недействительна или истекла" },
        { status: 400 }
      )
    }

    const email = rows[0].email
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await execute("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?", [
      passwordHash,
      email,
    ])
    await execute("DELETE FROM password_reset_tokens WHERE token = ?", [token])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Reset password error:", e)
    return NextResponse.json(
      { error: "Ошибка при сбросе пароля" },
      { status: 500 }
    )
  }
}

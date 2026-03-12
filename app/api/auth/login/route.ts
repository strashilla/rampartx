import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import * as bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body as {
      identifier?: string
      password?: string
    }

    if (!identifier?.trim() || !password) {
      return NextResponse.json(
        { error: "Введите email/имя пользователя и пароль" },
        { status: 400 }
      )
    }

    const rows = await query<{ id: string; username: string; password_hash: string }>(
      "SELECT id, username, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1",
      [identifier.trim().toLowerCase(), identifier.trim()]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Неверный email/имя пользователя или пароль" },
        { status: 401 }
      )
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json(
        { error: "Неверный email/имя пользователя или пароль" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ ok: true, username: user.username })
    response.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      sameSite: "lax",
    })
    return response
  } catch (e) {
    console.error("Login error:", e)
    return NextResponse.json(
      { error: "Ошибка входа. Попробуйте позже." },
      { status: 500 }
    )
  }
}

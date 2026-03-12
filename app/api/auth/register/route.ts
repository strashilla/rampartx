import { NextResponse } from "next/server"
import { execute, query } from "@/lib/db"
import * as bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body as {
      username?: string
      email?: string
      password?: string
    }

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Заполните имя пользователя, email и пароль" },
        { status: 400 }
      )
    }

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: "Имя пользователя: от 3 до 20 символов" },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 8 символов" },
        { status: 400 }
      )
    }

    const existing = await query<{ id: string }>(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [trimmedEmail, trimmedUsername]
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Пользователь с таким email или именем уже существует" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await execute(
      `INSERT INTO users (email, username, password_hash, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, 0, NOW(), NOW())`,
      [trimmedEmail, trimmedUsername, passwordHash]
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Register error:", e)
    return NextResponse.json(
      { error: "Ошибка при регистрации. Попробуйте позже." },
      { status: 500 }
    )
  }
}

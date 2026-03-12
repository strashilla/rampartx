import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { username } = body as { username?: string }
    const trimmed = username?.trim()
    if (!trimmed || trimmed.length < 3 || trimmed.length > 20) {
      return NextResponse.json(
        { error: "Имя пользователя: от 3 до 20 символов" },
        { status: 400 }
      )
    }

    const existing = await query<{ id: string }>(
      "SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1",
      [trimmed, userId]
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Это имя пользователя уже занято" },
        { status: 409 }
      )
    }

    await execute("UPDATE users SET username = ?, updated_at = NOW() WHERE id = ?", [
      trimmed,
      userId,
    ])
    return NextResponse.json({ ok: true, username: trimmed })
  } catch (e) {
    console.error("Profile update error:", e)
    return NextResponse.json(
      { error: "Ошибка при сохранении" },
      { status: 500 }
    )
  }
}

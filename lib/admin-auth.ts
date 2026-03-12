import { cookies } from "next/headers"
import { query } from "@/lib/db"

/** Возвращает user_id если пользователь авторизован и имеет роль admin, иначе null. */
export async function getAdminUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return null
  try {
    const rows = await query<{ role: string }>("SELECT role FROM users WHERE id = ? LIMIT 1", [userId])
    if (rows.length === 0) return null
    return String(rows[0].role) === "admin" ? userId : null
  } catch (_) {
    return null
  }
}

/** Проверяет, что текущий пользователь — админ; иначе бросает неавторизованную/запрещённую ошибку для API. */
export async function requireAdmin(): Promise<string> {
  const userId = await getAdminUserId()
  if (!userId) throw new Error("FORBIDDEN")
  return userId
}

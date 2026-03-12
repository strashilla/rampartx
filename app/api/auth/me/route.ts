import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ user: null, balance: 0, cartCount: 0, role: "user", isAdmin: false })
    }

    const rows: any[] = await query(
      "SELECT id, username, email FROM users WHERE id = ? LIMIT 1",
      [userId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ user: null, balance: 0, cartCount: 0, notificationCount: 0, role: "user", isAdmin: false })
    }
    let role = "user"
    try {
      const roleRows: any[] = await query("SELECT role FROM users WHERE id = ? LIMIT 1", [userId])
      if (roleRows.length > 0 && roleRows[0].role) role = String(roleRows[0].role)
    } catch (_) {}

    let balance = 0
    let cartCount = 0
    try {
      const balRows: any[] = await query(
        "SELECT balance FROM users WHERE id = ? LIMIT 1",
        [userId]
      )
      if (balRows.length > 0) balance = Number(balRows[0].balance)
    } catch (_) {}
    try {
      const cartRows: any[] = await query(
        "SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE user_id = ?",
        [userId]
      )
      if (cartRows.length > 0) cartCount = Number(cartRows[0].total) || 0
    } catch (_) {}

    // Get notification count
    let notificationCount = 0
    try {
      const notifRows: any[] = await query(
        "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND read_at IS NULL",
        [userId]
      )
      if (notifRows.length > 0) notificationCount = Number(notifRows[0].cnt) || 0
    } catch (_) {}

    return NextResponse.json({
      user: { name: rows[0].username, email: rows[0].email },
      balance,
      cartCount,
      notificationCount,
      role,
      isAdmin: role === "admin",
    })
  } catch (e) {
    console.error("Auth me error:", e)
    return NextResponse.json({ user: null, balance: 0, cartCount: 0, role: "user", isAdmin: false })
  }
}

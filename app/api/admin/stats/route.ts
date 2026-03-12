import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    let platformBalance = 0
    let usersCount = 0
    let lotsCount = 0
    let ordersCount = 0
    let disputesOpen = 0
    try {
      const sumRows = await query<{ total: string }>("SELECT COALESCE(SUM(amount), 0) AS total FROM platform_earnings", [])
      if (sumRows.length > 0) platformBalance = Number(sumRows[0].total)
    } catch (_) {}
    try {
      const u = await query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM users", [])
      if (u.length > 0) usersCount = Number(u[0].cnt)
    } catch (_) {}
    try {
      const l = await query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM lots", [])
      if (l.length > 0) lotsCount = Number(l[0].cnt)
    } catch (_) {}
    try {
      const o = await query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM orders", [])
      if (o.length > 0) ordersCount = Number(o[0].cnt)
    } catch (_) {}
    try {
      const d = await query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM disputes WHERE status = 'open'", [])
      if (d.length > 0) disputesOpen = Number(d[0].cnt)
    } catch (_) {}
    return NextResponse.json({
      platformBalance,
      usersCount,
      lotsCount,
      ordersCount,
      disputesOpen,
    })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

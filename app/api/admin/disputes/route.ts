import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    const rows = await query<{
      id: string
      order_id: string
      opener_id: string
      status: string
      admin_decision: string | null
      created_at: string
      lot_title: string
      opener_name: string
    }>(
      `SELECT d.id, d.order_id, d.opener_id, d.status, d.admin_decision, d.created_at, l.title AS lot_title, u.username AS opener_name
       FROM disputes d
       JOIN orders o ON o.id = d.order_id
       JOIN lots l ON l.id = o.lot_id
       JOIN users u ON u.id = d.opener_id
       ORDER BY d.created_at DESC`
    )
    const disputes = rows.map((r) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      openerId: r.opener_id,
      openerName: r.opener_name,
      status: r.status,
      adminDecision: r.admin_decision || undefined,
      createdAt: r.created_at,
      lotTitle: r.lot_title,
    }))
    return NextResponse.json({ disputes })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query, execute } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const disputeRows = await query<{
      id: string
      order_id: string
      opener_id: string
      status: string
      admin_decision: string | null
      created_at: string
      lot_title: string
      opener_name: string
      buyer_id: string
      buyer_name: string
      seller_id: string
      seller_name: string
    }>(
      `SELECT d.id, d.order_id, d.opener_id, d.status, d.admin_decision, d.created_at,
              l.title AS lot_title, u.username AS opener_name,
              o.buyer_id, buyer.username AS buyer_name,
              l.seller_id AS seller_id, seller.username AS seller_name
       FROM disputes d
       JOIN orders o ON o.id = d.order_id
       JOIN lots l ON l.id = o.lot_id
       JOIN users u ON u.id = d.opener_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = l.seller_id
       WHERE d.id = ? LIMIT 1`,
      [id]
    )
    if (disputeRows.length === 0) {
      return NextResponse.json({ error: "Спор не найден" }, { status: 404 })
    }
    const d = disputeRows[0]
    let evidenceRows: { id: string; user_id: string; username: string; content: string; created_at: string }[] = []
    try {
      evidenceRows = await query(
        `SELECT e.id, e.user_id, u.username, e.content, e.created_at
         FROM dispute_evidence e
         JOIN users u ON u.id = e.user_id
         WHERE e.dispute_id = ?
         ORDER BY e.created_at ASC`,
        [id]
      )
    } catch (_) {}
    const buyerId = d.buyer_id
    const sellerId = d.seller_id
    const evidence = evidenceRows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      username: r.username ?? "",
      content: r.content,
      createdAt: r.created_at,
      side: String(r.user_id) === String(buyerId) ? "buyer" : String(r.user_id) === String(sellerId) ? "seller" : "unknown",
    }))
    return NextResponse.json({
      id: String(d.id),
      orderId: String(d.order_id),
      openerId: d.opener_id,
      openerName: d.opener_name,
      status: d.status,
      adminDecision: d.admin_decision ?? undefined,
      createdAt: d.created_at,
      lotTitle: d.lot_title,
      buyerId,
      buyerName: d.buyer_name,
      sellerId,
      sellerName: d.seller_name,
      evidence,
    })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json().catch(() => ({})) as { status?: string; adminDecision?: string }
    const status = body.status?.trim()
    const decision = body.adminDecision?.trim()
    if (status) {
      await execute("UPDATE disputes SET status = ?, admin_decision = ?, updated_at = NOW() WHERE id = ?", [
        status,
        decision || null,
        id,
      ])
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const rows = await query<{
      id: string
      lot_id: string
      title: string
      description: string | null
      quantity: number
      total: string
      currency: string
      status: string
      created_at: string
      buyer_id: string
      seller_id: string
      buyer_name: string
      seller_name: string
    }>(
      `SELECT o.id, o.lot_id, o.quantity, o.total, o.currency, o.status, o.created_at,
              o.buyer_id, l.seller_id, l.title, l.description,
              buyer.username AS buyer_name, seller.username AS seller_name
       FROM orders o
       JOIN lots l ON l.id = o.lot_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = l.seller_id
       WHERE o.id = ? LIMIT 1`,
      [orderId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }
    const r = rows[0]
    const isBuyer = String(r.buyer_id) === String(userId)
    const isSeller = String(r.seller_id) === String(userId)
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }

    const totalNum = Number(r.total)
    return NextResponse.json({
      id: String(r.id),
      lotId: String(r.lot_id),
      title: r.title,
      description: r.description ?? undefined,
      quantity: Number(r.quantity),
      total: totalNum,
      price: totalNum,
      currency: r.currency ?? "RUB",
      status: r.status,
      createdAt: r.created_at,
      sellerId: String(r.seller_id),
      sellerName: r.seller_name,
      buyerId: String(r.buyer_id),
      buyerName: r.buyer_name,
      isBuyer,
      isSeller,
    })
  } catch (e) {
    console.error("Order get error:", e)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}

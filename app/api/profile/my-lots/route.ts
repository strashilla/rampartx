import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }
    const rows = await query<{
      id: string
      title: string
      description: string
      price: string
      currency: string
      quantity: string | null
      status: string
      image_url: string | null
      category: string | null
      created_at: string
    }>(
      `SELECT id, title, description, price, currency, quantity, status, image_url, category, created_at
       FROM lots
       WHERE seller_id = ?
       ORDER BY created_at DESC`,
      [userId]
    )
    const lots = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      description: r.description,
      price: Number(r.price),
      currency: r.currency,
      quantity: r.quantity != null ? Number(r.quantity) : 1,
      status: r.status,
      image: r.image_url || undefined,
      category: r.category || undefined,
      createdAt: r.created_at,
    }))
    return NextResponse.json({ lots })
  } catch (e) {
    console.error("My lots error:", e)
    return NextResponse.json({ lots: [] })
  }
}

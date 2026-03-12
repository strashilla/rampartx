import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    const { searchParams } = new URL(request.url)
    const lotIds = searchParams.get("lotIds")?.split(",").map((s) => s.trim()).filter(Boolean) || []
    if (!userId || lotIds.length === 0) {
      return NextResponse.json({ favorited: {} })
    }
    const placeholders = lotIds.map(() => "?").join(",")
    const rows = await query<{ lot_id: string }>(
      `SELECT lot_id FROM favorites WHERE user_id = ? AND lot_id IN (${placeholders})`,
      [userId, ...lotIds]
    )
    const favorited: Record<string, boolean> = {}
    lotIds.forEach((id) => { favorited[id] = false })
    rows.forEach((r) => { favorited[String(r.lot_id)] = true })
    return NextResponse.json({ favorited })
  } catch {
    return NextResponse.json({ favorited: {} })
  }
}

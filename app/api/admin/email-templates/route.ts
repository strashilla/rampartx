import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    let rows: { code: string; subject: string; body: string; updated_at: string }[] = []
    try {
      rows = await query(
        "SELECT code, subject, body, updated_at FROM email_templates ORDER BY code ASC"
      )
    } catch (_) {
      return NextResponse.json({ templates: [] })
    }
    const templates = rows.map((r) => ({
      code: r.code,
      subject: r.subject ?? "",
      body: r.body ?? "",
      updatedAt: r.updated_at,
    }))
    return NextResponse.json({ templates })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

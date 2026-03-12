import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query, execute } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    const rows = await query<{ key: string; value: string }>("SELECT `key`, value FROM settings", [])
    const settings: Record<string, string> = {}
    rows.forEach((r) => { settings[r.key] = r.value ?? "" })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({})) as Record<string, string>
    const commission = body.commission_percent?.trim()
    if (commission != null) {
      const num = Math.min(10, Math.max(0, parseInt(commission, 10) || 5))
      await execute(
        "INSERT INTO settings (`key`, value) VALUES ('commission_percent', ?) ON DUPLICATE KEY UPDATE value = ?",
        [String(num), String(num)]
      )
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

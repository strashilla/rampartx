import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query, execute } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await requireAdmin()
    const { code } = await params
    const body = await request.json().catch(() => ({}))
    const subject = body?.subject != null ? String(body.subject).trim() : null
    const bodyText = body?.body != null ? String(body.body) : null
    if (subject === null && bodyText === null) {
      return NextResponse.json({ error: "Укажите subject или body" }, { status: 400 })
    }
    const updates: string[] = []
    const values: (string | number)[] = []
    if (subject !== null) {
      updates.push("subject = ?")
      values.push(subject)
    }
    if (bodyText !== null) {
      updates.push("body = ?")
      values.push(bodyText)
    }
    values.push(code)
    const result = await execute(
      `UPDATE email_templates SET ${updates.join(", ")}, updated_at = NOW() WHERE code = ?`,
      values
    )
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Шаблон не найден" }, { status: 404 })
    }
    const rows = await query<{ code: string; subject: string; body: string }>(
      "SELECT code, subject, body FROM email_templates WHERE code = ? LIMIT 1",
      [code]
    )
    const r = rows[0]
    return NextResponse.json(r ? { code: r.code, subject: r.subject, body: r.body } : {})
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

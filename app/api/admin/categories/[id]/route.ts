import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query, execute } from "@/lib/db"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await _request.json()
    const slug = body?.slug != null ? String(body.slug).trim().toLowerCase().replace(/\s+/g, "-") : null
    const label = body?.label != null ? String(body.label).trim() : null
    if (!slug && !label) {
      return NextResponse.json({ error: "Укажите slug или label" }, { status: 400 })
    }
    const updates: string[] = []
    const values: (string | number)[] = []
    if (slug !== null) {
      updates.push("slug = ?")
      values.push(slug)
    }
    if (label !== null) {
      updates.push("label = ?")
      values.push(label)
    }
    values.push(id)
    const result = await execute(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
      values
    )
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 })
    }
    const rows = await query<{ id: string; slug: string; label: string }>(
      "SELECT id, slug, label FROM categories WHERE id = ? LIMIT 1",
      [id]
    )
    const r = rows[0]
    return NextResponse.json(r ? { id: String(r.id), slug: r.slug, label: r.label } : {})
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const slugRows = await query<{ slug: string }>("SELECT slug FROM categories WHERE id = ? LIMIT 1", [id])
    const slug = slugRows[0]?.slug
    let count = 0
    if (slug) {
      const countRows = await query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM lots WHERE category = ?", [slug])
      count = Number(countRows[0]?.cnt ?? 0)
    }
    if (count > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить: есть ${count} лотов с этой категорией` },
        { status: 409 }
      )
    }
    const result = await execute("DELETE FROM categories WHERE id = ?", [id])
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

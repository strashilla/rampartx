import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { query, execute } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    const rows = await query<{ id: string; slug: string; label: string; sort_order: number }>(
      "SELECT id, slug, label, sort_order FROM categories ORDER BY sort_order ASC, id ASC"
    )
    return NextResponse.json({
      categories: rows.map((r) => ({
        id: String(r.id),
        slug: r.slug,
        label: r.label,
        sortOrder: Number(r.sort_order ?? 0),
      })),
    })
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const slug = String(body?.slug ?? "").trim().toLowerCase().replace(/\s+/g, "-")
    const label = String(body?.label ?? "").trim()
    if (!slug || !label) {
      return NextResponse.json({ error: "slug и label обязательны" }, { status: 400 })
    }
    await execute("INSERT INTO categories (slug, label, sort_order) VALUES (?, ?, 999)", [slug, label])
    const rows = await query<{ id: string }>("SELECT id FROM categories WHERE slug = ? LIMIT 1", [slug])
    return NextResponse.json({ id: rows[0]?.id ?? null, slug, label })
  } catch (e) {
    if (String(e).includes("Duplicate")) {
      return NextResponse.json({ error: "Категория с таким slug уже есть" }, { status: 409 })
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}

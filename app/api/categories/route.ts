import { NextResponse } from "next/server"
import { query } from "@/lib/db"

/** Публичный список категорий для каталога и формы создания лота */
export async function GET() {
  try {
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
    return NextResponse.json({ categories: [] })
  }
}

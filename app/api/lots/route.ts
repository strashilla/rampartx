import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"

const CATEGORY_VALUES = ["steam", "discord", "epic", "keys", "items", "software"]

async function getAllowedCategorySlugs(): Promise<string[]> {
  try {
    const rows = await query<{ slug: string }>("SELECT slug FROM categories ORDER BY sort_order ASC")
    if (rows.length > 0) return rows.map((r) => r.slug)
  } catch (_) {}
  return CATEGORY_VALUES
}

async function getCategoryLabels(): Promise<Record<string, string>> {
  try {
    const rows = await query<{ slug: string; label: string }>("SELECT slug, label FROM categories")
    if (rows.length > 0) {
      const out: Record<string, string> = {}
      rows.forEach((r) => { out[r.slug] = r.label })
      return out
    }
  } catch (_) {}
  return {
    steam: "Steam аккаунты",
    discord: "Discord аккаунты",
    epic: "Epic Games",
    keys: "Игровые ключи",
    items: "Внутриигровые предметы",
    software: "Программное обеспечение",
  }
}

export async function GET(request: Request) {
  try {
    const [allowedSlugs, categoryLabels] = await Promise.all([getAllowedCategorySlugs(), getCategoryLabels()])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const category = searchParams.get("category")?.trim() || ""
    const minPrice = searchParams.get("minPrice")?.trim()
    const maxPrice = searchParams.get("maxPrice")?.trim()
    const seller = searchParams.get("seller")?.trim() || ""

    type Row = {
      id: string
      title: string
      description: string
      price: string
      currency: string
      seller_id: string
      seller_name: string
      image_url?: string | null
      quantity?: number
      category?: string | null
    }
    const baseWhere = "l.status = 'published'"
    const conditions: string[] = [baseWhere]
    const params: (string | number)[] = []
    if (search) {
      conditions.push("(l.title LIKE ? OR l.description LIKE ?)")
      const term = `%${search}%`
      params.push(term, term)
    }
    if (category && allowedSlugs.includes(category)) {
      conditions.push("l.category = ?")
      params.push(category)
    }
    const minPriceNum = minPrice ? parseFloat(minPrice) : NaN
    if (!isNaN(minPriceNum) && minPriceNum > 0) {
      conditions.push("l.price >= ?")
      params.push(minPriceNum)
    }
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : NaN
    if (!isNaN(maxPriceNum) && maxPriceNum > 0) {
      conditions.push("l.price <= ?")
      params.push(maxPriceNum)
    }
    if (seller) {
      conditions.push("u.username LIKE ?")
      params.push(`%${seller}%`)
    }
    const whereClause = conditions.join(" AND ")

    let rows: Row[]
    try {
      rows = await query<Row>(
        `SELECT l.id, l.title, l.description, l.price, l.currency, l.seller_id, u.username AS seller_name, l.image_url, l.quantity, l.category
         FROM lots l
         JOIN users u ON u.id = l.seller_id
         WHERE ${whereClause}
         ORDER BY l.created_at DESC`,
        params
      )
    } catch (colErr) {
      const fallbackWhere = search ? `${baseWhere} AND (l.title LIKE ? OR l.description LIKE ?)` : baseWhere
      const fallbackParams = search ? [`%${search}%`, `%${search}%`] : []
      try {
        rows = await query<Row>(
          `SELECT l.id, l.title, l.description, l.price, l.currency, l.seller_id, u.username AS seller_name, l.image_url, l.quantity
           FROM lots l
           JOIN users u ON u.id = l.seller_id
           WHERE ${fallbackWhere}
           ORDER BY l.created_at DESC`,
          fallbackParams
        )
      } catch {
        rows = await query<Row>(
          `SELECT l.id, l.title, l.description, l.price, l.currency, l.seller_id, u.username AS seller_name
           FROM lots l
           JOIN users u ON u.id = l.seller_id
           WHERE ${fallbackWhere}
           ORDER BY l.created_at DESC`,
          fallbackParams
        )
      }
    }
    const lots = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      description: r.description,
      price: Number(r.price),
      currency: r.currency,
      quantity: r.quantity != null ? Number(r.quantity) : 1,
      seller: { name: r.seller_name, rating: 0, deals: 0 },
      sellerId: r.seller_id,
      image: r.image_url || undefined,
      category: r.category ? categoryLabels[r.category] || r.category : "Товар",
    }))
    return NextResponse.json(lots)
  } catch (e) {
    console.error("Lots list error:", e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, price, currency, imageUrl, imageUrls, quantity, category: categoryBody } = body as {
      title?: string
      description?: string
      price?: number | string
      currency?: string
      imageUrl?: string
      imageUrls?: string[]
      quantity?: number
      category?: string
    }
    const allowedSlugs = await getAllowedCategorySlugs()
    const categorySlug = categoryBody && allowedSlugs.includes(String(categoryBody).trim())
      ? String(categoryBody).trim()
      : null

    const trimmedTitle = title?.trim()
    if (!trimmedTitle || trimmedTitle.length < 5) {
      return NextResponse.json(
        { error: "Название не менее 5 символов" },
        { status: 400 }
      )
    }
    const trimmedDesc = description?.trim() ?? ""
    if (trimmedDesc.length < 20) {
      return NextResponse.json(
        { error: "Описание не менее 20 символов" },
        { status: 400 }
      )
    }
    const priceNum = typeof price === "string" ? parseFloat(price) : Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: "Введите корректную цену" },
        { status: 400 }
      )
    }
    const curr = (currency?.trim() || "RUB").toUpperCase()
    const allowed = ["RUB", "USD", "EUR"]
    const finalCurrency = allowed.includes(curr) ? curr : "RUB"
    const qty = Math.max(1, Math.min(999999, Number(quantity) || 1))

    const urls = Array.isArray(imageUrls)
      ? imageUrls
          .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
          .slice(0, 5)
          .map((u) => u.trim())
      : []
    const firstUrl =
      urls[0] ?? (typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null)
    let result: { insertId: number }
    try {
      result = await execute(
        `INSERT INTO lots (seller_id, title, description, category, price, currency, quantity, status, image_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, NOW(), NOW())`,
        [userId, trimmedTitle, trimmedDesc, categorySlug, priceNum, finalCurrency, qty, firstUrl]
      )
    } catch (colErr) {
      try {
        result = await execute(
          `INSERT INTO lots (seller_id, title, description, price, currency, quantity, status, image_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'published', ?, NOW(), NOW())`,
          [userId, trimmedTitle, trimmedDesc, priceNum, finalCurrency, qty, firstUrl]
        )
      } catch {
        try {
          result = await execute(
            `INSERT INTO lots (seller_id, title, description, category, price, currency, status, image_url, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, 'published', ?, NOW(), NOW())`,
            [userId, trimmedTitle, trimmedDesc, categorySlug, priceNum, finalCurrency, firstUrl]
          )
        } catch {
          result = await execute(
            `INSERT INTO lots (seller_id, title, description, price, currency, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
            [userId, trimmedTitle, trimmedDesc, priceNum, finalCurrency]
          )
        }
      }
    }
    const insertedId = result.insertId
    if (urls.length > 0) {
      try {
        for (let i = 0; i < urls.length; i++) {
          await execute(
            "INSERT INTO lot_images (lot_id, url, sort_order) VALUES (?, ?, ?)",
            [insertedId, urls[i], i]
          )
        }
      } catch (_) {}
    }
    return NextResponse.json({ ok: true, id: String(insertedId) })
  } catch (e) {
    console.error("Create lot error:", e)
    return NextResponse.json(
      { error: "Ошибка при создании лота" },
      { status: 500 }
    )
  }
}

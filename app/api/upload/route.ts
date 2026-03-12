import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = "public/uploads"
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Только JPG, PNG, WEBP" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Размер до 5 МБ" }, { status: 400 })
    }

    const dir = path.join(process.cwd(), UPLOAD_DIR)
    await mkdir(dir, { recursive: true })
    const ext = path.extname(file.name) || ".jpg"
    const name = `lot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
    const filePath = path.join(dir, name)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/${name}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 })
  }
}

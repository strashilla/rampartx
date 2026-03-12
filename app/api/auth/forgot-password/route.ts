import { NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import { sendMail, getSiteUrl } from "@/lib/email"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!email) {
      return NextResponse.json(
        { error: "Укажите email" },
        { status: 400 }
      )
    }

    const rows = await query<{ id: string }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )
    if (rows.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await execute(
      "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expiresAt]
    )

    const resetUrl = `${getSiteUrl()}/reset-password?token=${token}`
    const sent = await sendMail({
      to: email,
      subject: "Восстановление пароля — Rampartx",
      text: `Перейдите по ссылке для сброса пароля: ${resetUrl}\nСсылка действительна 1 час.`,
      html: `<p>Перейдите по ссылке для сброса пароля: <a href="${resetUrl}">${resetUrl}</a></p><p>Ссылка действительна 1 час.</p>`,
    })
    if (!sent) {
      console.log("[forgot-password] SMTP not configured. Reset link:", resetUrl)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Forgot password error:", e)
    return NextResponse.json(
      { error: "Ошибка при отправке письма" },
      { status: 500 }
    )
  }
}

import type { Transporter } from "nodemailer"

let transporter: Transporter | null = null

async function getTransporter(): Promise<Transporter | null> {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  try {
    const nodemailer = await import("nodemailer")
    transporter = nodemailer.default.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    })
    return transporter
  } catch {
    return null
  }
}

/** Отправляет письмо. Возвращает true если отправлено, false если SMTP не настроен или ошибка. */
export async function sendMail(options: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<boolean> {
  const trans = await getTransporter()
  if (!trans) return false
  try {
    await trans.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@rampartx.ru",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    })
    return true
  } catch (e) {
    console.error("Send mail error:", e)
    return false
  }
}

/** Базовый URL сайта для ссылок в письмах (сброс пароля и т.д.). */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    (typeof process.env.VERCEL_URL === "string"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Shield } from "lucide-react"

const adminNavLinks = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/lots", label: "Лоты" },
  { href: "/admin/orders", label: "Сделки" },
  { href: "/admin/disputes", label: "Споры" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/email-templates", label: "Email-шаблоны" },
  { href: "/admin/settings", label: "Настройки" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (!data.user || data.isAdmin !== true) {
          router.replace("/login")
          return
        }
        setAllowed(true)
      })
      .catch(() => {
        if (!cancelled) router.replace("/login")
      })
    return () => {
      cancelled = true
    }
  }, [router])

  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-sans text-muted-foreground">Проверка доступа...</p>
      </div>
    )
  }

  if (!allowed) return null

  const isActiveLink = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href)

  return (
    <div className="min-h-screen bg-background">
      {/* Хедер в том же стиле, что и основной сайт */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-[#1A1A1A] h-20">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/admin" className="flex items-center gap-3 group">
              <Image
                src="/shield.png"
                alt="Rampartx"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
              <span className="font-serif font-bold text-white text-2xl group-hover:text-[#7fffd4] transition-colors duration-300">
                Rampartx
              </span>
              <span className="font-sans text-sm text-muted-foreground font-medium ml-1 hidden sm:inline">
                / Админ
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-[15px] transition-colors duration-200 relative py-2 ${
                    isActiveLink(link.href)
                      ? "text-[#7fffd4]"
                      : "text-white hover:text-[#7fffd4]"
                  }`}
                >
                  {link.label}
                  {isActiveLink(link.href) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7fffd4]" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/"
                className="font-sans text-sm text-white hover:text-[#7fffd4] transition-colors duration-200"
              >
                На сайт
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" })
                  window.location.href = "/"
                }}
                className="font-sans text-sm text-muted-foreground hover:text-red-400 transition-colors duration-200"
              >
                Выйти
              </button>
            </div>

            {/* Мобильное меню: бургер + выпадающие ссылки */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/"
                className="font-sans text-sm text-white hover:text-[#7fffd4] p-2"
              >
                На сайт
              </Link>
              <details className="relative group/details">
                <summary className="list-none p-2 rounded-lg hover:bg-[#1A1A1A] cursor-pointer">
                  <Shield className="w-6 h-6 text-[#7fffd4]" />
                </summary>
                <div className="absolute right-0 top-full mt-1 py-2 min-w-[160px] rounded-lg bg-[#0a0a0a] border border-[#1A1A1A] shadow-lg">
                  {adminNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 font-sans text-sm transition-colors ${
                        isActiveLink(link.href)
                          ? "text-[#7fffd4] bg-[#1A1A1A]/50"
                          : "text-white hover:bg-[#1A1A1A] hover:text-[#7fffd4]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" })
                      window.location.href = "/"
                    }}
                    className="block w-full text-left px-4 py-2 font-sans text-sm text-muted-foreground hover:text-red-400 hover:bg-[#1A1A1A] transition-colors"
                  >
                    Выйти
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-20 container mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  )
}

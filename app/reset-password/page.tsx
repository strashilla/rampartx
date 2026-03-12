"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = searchParams.get("token") || ""
    setToken(t)
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast.error("Отсутствует ссылка для сброса. Запросите новую на странице «Забыли пароль». ")
      return
    }
    if (password.length < 8) {
      toast.error("Пароль не менее 8 символов")
      return
    }
    if (password !== confirm) {
      toast.error("Пароли не совпадают")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка сброса пароля")
        return
      }
      setDone(true)
      toast.success("Пароль изменён. Войдите с новым паролем.")
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 pt-24">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-white mb-2">
                Новый пароль
              </h1>
              <p className="text-[#AFEEEE] text-sm">
                Введите новый пароль и подтверждение
              </p>
            </div>
            {done ? (
              <p className="text-center text-muted-foreground mb-6">
                Теперь вы можете войти с новым паролем.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <Input
                  type="password"
                  placeholder="Новый пароль (не менее 8 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Подтверждение пароля"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-12 bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full h-12 bg-gradient-to-r from-[#7fffd4] to-[#40E0D0] text-black font-semibold"
                >
                  {isLoading ? "Сохранение..." : "Сохранить пароль"}
                </Button>
              </form>
            )}
            <p className="text-center text-gray-400 text-sm mt-6">
              <Link href="/login" className="text-[#7fffd4] hover:text-[#AFEEEE]">
                ← Вход
              </Link>
              {" · "}
              <Link href="/forgot-password" className="text-[#7fffd4] hover:text-[#AFEEEE]">
                Забыли пароль?
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 pt-24">
          <p className="text-[#6B7280] font-sans">Загрузка...</p>
        </div>
        <Footer />
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

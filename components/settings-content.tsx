"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function SettingsContent() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const [username, setUsername] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/login")
          return
        }
        setUser(data.user)
        setUsername(data.user.name)
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setProfileSaving(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка сохранения")
        return
      }
      toast.success("Профиль обновлён")
      setUser((u) => (u ? { ...u, name: data.username } : null))
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error("Новый пароль не менее 8 символов")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают")
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка смены пароля")
        return
      }
      toast.success("Пароль изменён")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Настройки
          </h1>
          <p className="text-[#AFEEEE] font-sans text-sm">
            Управление профилем и безопасностью аккаунта
          </p>
        </div>

        <div className="space-y-8">
          {/* Профиль */}
          <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 md:p-8">
            <h2 className="font-serif text-xl font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-[#7fffd4]" />
              Профиль
            </h2>
            <p className="text-gray-400 font-sans text-sm mb-6">
              Имя пользователя и контактный email
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Имя пользователя</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#AFEEEE]" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Имя пользователя"
                    className="h-12 pl-12 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#7fffd4] focus:ring-[#7fffd4]/20 font-sans"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#AFEEEE]" />
                  <Input
                    value={user.email}
                    readOnly
                    className="h-12 pl-12 bg-[#0a0a0a]/50 border-[#2a2a2a] text-gray-400 font-sans cursor-not-allowed"
                  />
                </div>
                <p className="text-gray-500 font-sans text-xs">
                  Email изменить нельзя
                </p>
              </div>
              <Button
                type="submit"
                disabled={profileSaving}
                className="h-11 bg-gradient-to-r from-[#7fffd4] to-[#40E0D0] text-black font-sans font-semibold hover:opacity-90 disabled:opacity-70"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить профиль"
                )}
              </Button>
            </form>
          </section>

          {/* Смена пароля */}
          <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 md:p-8">
            <h2 className="font-serif text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#7fffd4]" />
              Смена пароля
            </h2>
            <p className="text-gray-400 font-sans text-sm mb-6">
              Введите текущий пароль и новый пароль
            </p>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Текущий пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#AFEEEE]" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Текущий пароль"
                    className="h-12 pl-12 pr-12 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#7fffd4] focus:ring-[#7fffd4]/20 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7fffd4]"
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Новый пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#AFEEEE]" />
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Не менее 8 символов"
                    className="h-12 pl-12 pr-12 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#7fffd4] focus:ring-[#7fffd4]/20 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7fffd4]"
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Подтвердите новый пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#AFEEEE]" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите новый пароль"
                    className="h-12 pl-12 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#7fffd4] focus:ring-[#7fffd4]/20 font-sans"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={passwordSaving}
                className="h-11 bg-gradient-to-r from-[#7fffd4] to-[#40E0D0] text-black font-sans font-semibold hover:opacity-90 disabled:opacity-70"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Изменить пароль"
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageCircle, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatItem {
  id: string
  orderId: string
  orderTitle: string
  otherPartyName: string
  otherPartyId: string
  lastMessage: string | null
  lastMessageAt: string | null
}

export function ChatsContent() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((authData) => {
        if (!authData?.user) {
          router.push("/login?returnUrl=/chats")
          return Promise.resolve({ chats: [] })
        }
        return fetch("/api/chats").then((r) => r.json())
      })
      .then((data) => setChats(data?.chats ?? []))
      .catch(() => setChats([]))
      .finally(() => setLoading(false))
  }, [router])

  const formatDate = (s: string | null) => {
    if (!s) return ""
    const d = new Date(s)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    }
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Чаты
          </h1>
          <p className="font-sans text-[#AFEEEE] text-sm">
            Переписка с продавцами по сделкам
          </p>
        </div>

        {chats.length === 0 ? (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="font-sans text-gray-400 mb-2">Пока нет чатов</p>
            <p className="font-sans text-sm text-gray-500 mb-6">
              Откройте сделку в «Мои заказы» и нажмите «Написать продавцу»
            </p>
            <Button asChild variant="outline" className="border-[#2a2a2a] text-[#AFEEEE] font-sans">
              <Link href="/orders">Мои заказы</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 hover:border-[#7fffd4]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7fffd4]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#7fffd4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-white truncate">
                      {chat.otherPartyName}
                    </p>
                    <p className="font-sans text-sm text-gray-400 truncate">
                      {chat.orderTitle}
                    </p>
                    {chat.lastMessage && (
                      <p className="font-sans text-sm text-gray-500 truncate mt-0.5">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                  {chat.lastMessageAt && (
                    <span className="font-sans text-xs text-gray-500 flex-shrink-0">
                      {formatDate(chat.lastMessageAt)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

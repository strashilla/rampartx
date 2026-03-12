"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Message {
  id: string
  senderId: string
  isMe: boolean
  body: string
  createdAt: string
}

export function ChatRoomContent({ chatId }: { chatId: string }) {
  const [info, setInfo] = useState<{
    orderTitle: string
    otherPartyName: string
    orderId: string
  } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadChat = () => {
    Promise.all([
      fetch(`/api/chats/${chatId}`).then((r) => r.json()),
      fetch(`/api/chats/${chatId}/messages`).then((r) => r.json()),
    ])
      .then(([chatData, msgData]) => {
        if (chatData.error) {
          setInfo(null)
          setMessages([])
          return
        }
        setInfo({
          orderTitle: chatData.orderTitle ?? "Сделка",
          otherPartyName: chatData.otherPartyName ?? "—",
          orderId: chatData.orderId ?? "",
        })
        setMessages(msgData.messages ?? [])
      })
      .catch(() => {
        setInfo(null)
        setMessages([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadChat()
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось отправить")
        return
      }
      setInput("")
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="container mx-auto px-4 py-12 pt-28 max-w-2xl">
        <p className="font-sans text-gray-400 mb-4">Чат не найден или нет доступа</p>
        <Button asChild variant="outline" className="border-[#2a2a2a] text-[#AFEEEE] font-sans">
          <Link href="/chats"><ArrowLeft className="w-4 h-4 mr-2" />К чатам</Link>
        </Button>
      </div>
    )
  }

  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="container mx-auto px-4 py-6 pt-28 max-w-2xl flex flex-col min-h-[calc(100vh-8rem)]">
      <Button asChild variant="ghost" size="sm" className="mb-4 self-start text-[#AFEEEE] hover:text-[#7fffd4] font-sans">
        <Link href="/chats"><ArrowLeft className="w-4 h-4 mr-2" />Чаты</Link>
      </Button>

      <div className="rounded-t-2xl border border-b-0 border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
        <p className="font-sans font-medium text-white">{info.otherPartyName}</p>
        <Link href={`/deal/${info.orderId}`} className="font-sans text-sm text-[#7fffd4] hover:underline">
          {info.orderTitle}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto border border-[#2a2a2a] bg-[#111111] min-h-[300px] max-h-[50vh] p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="font-sans text-sm text-gray-500 text-center py-8">Пока нет сообщений. Напишите первым.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.isMe
                    ? "bg-[#7fffd4] text-black rounded-br-md"
                    : "bg-[#2a2a2a] text-gray-100 rounded-bl-md"
                } font-sans text-sm`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`text-xs mt-1 ${msg.isMe ? "text-black/70" : "text-gray-400"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="rounded-b-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 flex gap-2">
        <Input
          placeholder="Сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          className="flex-1 bg-[#0a0a0a] border-[#2a2a2a] text-white font-sans"
          maxLength={4000}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          size="icon"
          className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

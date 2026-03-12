"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Loader2, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout-form"

interface CartItem {
  id: string
  lotId: string
  quantity: number
  title: string
  price: number
  currency: string
  imageUrl?: string
}

export function CartContent() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const loadCart = () => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/login?returnUrl=/cart")
          return
        }
        loadCart()
      })
      .catch(() => router.push("/login?returnUrl=/cart"))
  }, [router])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  async function removeItem(lotId: string) {
    await fetch(`/api/cart?lotId=${lotId}`, { method: "DELETE" })
    loadCart()
    toast.success("Удалено из корзины")
    window.dispatchEvent(new CustomEvent("header-refresh"))
  }

  async function handleCheckout(formData: CheckoutFormData) {
    if (items.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: formData.contactEmail || undefined,
          paymentMethod: formData.paymentMethod || undefined,
          comment: formData.comment || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка оформления")
        return
      }
      toast.success("Заказ оформлен")
      window.dispatchEvent(new CustomEvent("header-refresh"))
      router.push("/orders")
    } finally {
      setCheckingOut(false)
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Корзина
          </h1>
          <p className="font-sans text-[#AFEEEE] text-sm">
            {count > 0 ? `${count} ${count === 1 ? "товар" : "товаров"} на сумму ${total.toLocaleString("ru-RU")} ₽` : "Добавьте товары из каталога"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-12 text-center">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="font-sans text-gray-400 mb-2">Корзина пуста</p>
            <p className="font-sans text-sm text-gray-500 mb-6">
              Перейдите в каталог и нажмите «В корзину» у нужного товара
            </p>
            <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
              <Link href="/catalog">В каталог</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-lg bg-[#0a0a0a] overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-sans font-medium text-white truncate">{item.title}</h2>
                    <p className="font-sans text-sm text-[#7fffd4]">
                      {item.price.toLocaleString("ru-RU")} ₽ × {item.quantity} = {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-400 shrink-0"
                    onClick={() => removeItem(item.lotId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="font-sans text-xl text-[#7fffd4] font-semibold">
                  Итого: {total.toLocaleString("ru-RU")} ₽
                </p>
                <Button variant="outline" asChild className="border-[#2a2a2a] font-sans w-fit">
                  <Link href="/catalog">Продолжить покупки</Link>
                </Button>
              </div>
              <CheckoutForm
                totalAmount={total}
                currencySymbol="₽"
                submitLabel="Купить за"
                isLoading={checkingOut}
                onSubmit={handleCheckout}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

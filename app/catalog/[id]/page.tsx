"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { User, Star, ChevronLeft, Heart } from "lucide-react"
import { toast } from "sonner"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout-form"

interface LotDetail {
  id: string
  title: string
  description: string
  price: number
  currency: string
  quantity: number
  seller: { name: string; rating: number; deals?: number }
  sellerId: string
  image?: string
  images: string[]
}

export default function CatalogLotPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [lot, setLot] = useState<LotDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [buyQuantity, setBuyQuantity] = useState(1)
  const [buying, setBuying] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/lots/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setLot)
      .catch(() => setLot(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    fetch(`/api/favorites/check?lotIds=${id}`)
      .then((r) => r.json())
      .then((data) => setIsFavorite(!!data?.favorited?.[id]))
      .catch(() => {})
  }, [id])

  const images = lot?.images?.length ? lot.images : (lot?.image ? [lot.image] : [])
  const mainImage = images[selectedImageIndex] || lot?.image

  async function handleBuy(formData?: CheckoutFormData) {
    if (!lot) return
    const meRes = await fetch("/api/auth/me")
    const me = await meRes.json()
    if (!me?.user) {
      toast.error("Войдите в аккаунт для покупки")
      router.push("/login?returnUrl=/catalog/" + id)
      return
    }
    setBuying(true)
    try {
      const res = await fetch(`/api/lots/${lot.id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: buyQuantity,
          contactEmail: formData?.contactEmail,
          paymentMethod: formData?.paymentMethod,
          comment: formData?.comment,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось оформить заказ")
        return
      }
      toast.success("Заказ создан. Перейдите в «Мои заказы» для оплаты.")
      router.push("/orders")
    } finally {
      setBuying(false)
    }
  }

  async function handleFavorite() {
    const me = await fetch("/api/auth/me").then((r) => r.json())
    if (!me?.user) {
      router.push("/login?returnUrl=/catalog/" + id)
      return
    }
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?lotId=${id}`, { method: "DELETE" })
        setIsFavorite(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lotId: id }),
        })
        setIsFavorite(true)
      }
    } catch {
      toast.error("Не удалось обновить избранное")
    }
  }

  async function handleAddToCart() {
    if (!lot) return
    const me = await fetch("/api/auth/me").then((r) => r.json())
    if (!me?.user) {
      toast.error("Войдите в аккаунт, чтобы добавить в корзину")
      router.push("/login?returnUrl=/catalog/" + id)
      return
    }
    setAddingToCart(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId: lot.id, quantity: buyQuantity }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось добавить в корзину")
        return
      }
      toast.success("Добавлено в корзину")
      window.dispatchEvent(new CustomEvent("header-refresh"))
    } finally {
      setAddingToCart(false)
    }
  }

  const currencySymbol = lot?.currency === "USD" ? "$" : lot?.currency === "EUR" ? "€" : "₽"

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!lot) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <p className="text-muted-foreground mb-4">Лот не найден.</p>
          <Button asChild variant="outline">
            <Link href="/catalog">В каталог</Link>
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-video rounded-xl bg-secondary overflow-hidden border border-border">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={lot.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Нет фото
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
              {lot.title}
            </h1>
            <div className="font-mono text-2xl text-primary mb-4">
              {lot.price.toLocaleString("ru-RU")} {currencySymbol}
            </div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-sans text-sm">Продавец: {lot.seller.name}</span>
                <span className="flex items-center gap-0.5 text-sm">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {lot.seller.rating?.toFixed(1) || "0"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleFavorite}
                className={`p-2 rounded-full border transition-colors ${
                  isFavorite ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
            <p className="font-sans text-sm text-muted-foreground mb-4">
              В наличии: {lot.quantity} шт.
            </p>
            <p className="font-sans text-foreground whitespace-pre-wrap mb-6">
              {lot.description}
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={lot.quantity}
                    value={buyQuantity}
                    onChange={(e) =>
                      setBuyQuantity(
                        Math.max(1, Math.min(lot.quantity, parseInt(e.target.value, 10) || 1))
                      )
                    }
                    className="w-20 h-10 rounded-lg border border-border bg-background px-2 text-center font-sans"
                  />
                  <span className="text-sm text-muted-foreground">шт.</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={lot.quantity < 1 || addingToCart}
                  className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4]"
                >
                  {addingToCart ? "..." : "В корзину"}
                </Button>
              </div>
              <CheckoutForm
                totalAmount={lot.price * buyQuantity}
                currencySymbol={currencySymbol}
                submitLabel="Купить за"
                isLoading={buying}
                onSubmit={(formData) => handleBuy(formData)}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout-form"

interface CatalogProduct {
  id: string
  image?: string
  title: string
  price: number
  quantity?: number
  currency?: string
  seller: { name: string; rating: number; deals?: number }
  category: string
  description?: string
}

const defaultCategoryFilters = [
  { value: "", label: "Все" },
  { value: "steam", label: "Steam аккаунты" },
  { value: "discord", label: "Discord аккаунты" },
  { value: "epic", label: "Epic Games" },
  { value: "keys", label: "Игровые ключи" },
  { value: "items", label: "Внутриигровые предметы" },
  { value: "software", label: "Программное обеспечение" },
]

export function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categoryFilters, setCategoryFilters] = useState<{ value: string; label: string }[]>(defaultCategoryFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = data?.categories
        if (Array.isArray(list) && list.length > 0) {
          setCategoryFilters([
            { value: "", label: "Все" },
            ...list.map((c: { slug: string; label: string }) => ({ value: c.slug, label: c.label })),
          ])
        }
      })
      .catch(() => {})
  }, [])
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search")?.trim() ?? "")
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search")?.trim() ?? "")
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category")?.trim() ?? "")
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice")?.trim() ?? "")
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice")?.trim() ?? "")
  const [sellerName, setSellerName] = useState(() => searchParams.get("seller")?.trim() ?? "")
  // Черновик полей фильтров (чтобы не гонять запрос на каждый символ)
  const [filterMinPrice, setFilterMinPrice] = useState(() => searchParams.get("minPrice")?.trim() ?? "")
  const [filterMaxPrice, setFilterMaxPrice] = useState(() => searchParams.get("maxPrice")?.trim() ?? "")
  const [filterSeller, setFilterSeller] = useState(() => searchParams.get("seller")?.trim() ?? "")
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [buyModal, setBuyModal] = useState<{
    open: boolean
    lotId: string
    title: string
    price: number
    currency: string
    maxQuantity: number
  } | null>(null)
  const [buyQuantity, setBuyQuantity] = useState(1)
  const [buySubmitting, setBuySubmitting] = useState(false)

  // Синхронизация состояния с URL (при переходе по ссылке /catalog?search=...&category=... и фильтры)
  useEffect(() => {
    const q = searchParams.get("search")?.trim() ?? ""
    const cat = searchParams.get("category")?.trim() ?? ""
    const min = searchParams.get("minPrice")?.trim() ?? ""
    const max = searchParams.get("maxPrice")?.trim() ?? ""
    const seller = searchParams.get("seller")?.trim() ?? ""
    setSearchQuery(q)
    setSearchInput(q)
    setSelectedCategory(cat)
    setMinPrice(min)
    setMaxPrice(max)
    setSellerName(seller)
    setFilterMinPrice(min)
    setFilterMaxPrice(max)
    setFilterSeller(seller)
  }, [searchParams])

  // Обновление URL при смене поиска, категории или фильтров
  const updateUrl = useCallback(
    (opts: { search?: string; category?: string; minPrice?: string; maxPrice?: string; seller?: string }) => {
      const params = new URLSearchParams()
      if (opts.search) params.set("search", opts.search)
      if (opts.category) params.set("category", opts.category)
      if (opts.minPrice) params.set("minPrice", opts.minPrice)
      if (opts.maxPrice) params.set("maxPrice", opts.maxPrice)
      if (opts.seller) params.set("seller", opts.seller)
      const query = params.toString()
      const url = query ? `/catalog?${query}` : "/catalog"
      router.replace(url, { scroll: false })
    },
    [router]
  )

  const applyFilters = useCallback(() => {
    const min = filterMinPrice.trim()
    const max = filterMaxPrice.trim()
    const seller = filterSeller.trim()
    updateUrl({
      search: searchInput.trim(),
      category: selectedCategory,
      minPrice: min || undefined,
      maxPrice: max || undefined,
      seller: seller || undefined,
    })
    setSearchQuery(searchInput.trim())
    setMinPrice(min)
    setMaxPrice(max)
    setSellerName(seller)
  }, [searchInput, selectedCategory, filterMinPrice, filterMaxPrice, filterSeller, updateUrl])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedCategory) params.set("category", selectedCategory)
    if (minPrice.trim()) params.set("minPrice", minPrice.trim())
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim())
    if (sellerName.trim()) params.set("seller", sellerName.trim())
    Promise.all([
      fetch(`/api/lots?${params.toString()}`).then((r) => r.json()),
      fetch("/api/favorites").then((r) => r.json()).catch(() => []),
    ])
      .then(([lots, favList]: [CatalogProduct[], { id: string }[]]) => {
        if (Array.isArray(lots)) {
          setProducts(lots.map((l) => ({ ...l, category: l.category || "Товар" })))
        }
        setFavoriteIds(new Set(Array.isArray(favList) ? favList.map((f) => f.id) : []))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sellerName])

  async function handleBuy(productId: string) {
    const meRes = await fetch("/api/auth/me")
    const me = await meRes.json()
    if (!me?.user) {
      toast.error("Войдите в аккаунт для покупки")
      router.push("/login?returnUrl=/catalog")
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return
    const maxQty = product.quantity ?? 1
    if (maxQty < 1) {
      toast.error("Нет в наличии")
      return
    }
    setBuyQuantity(1)
    setBuyModal({
      open: true,
      lotId: productId,
      title: product.title,
      price: product.price,
      currency: product.currency || "RUB",
      maxQuantity: maxQty,
    })
  }

  async function handleConfirmBuy(formData?: CheckoutFormData) {
    if (!buyModal) return
    setBuySubmitting(true)
    try {
      const res = await fetch(`/api/lots/${buyModal.lotId}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: buyQuantity,
          contactEmail: formData?.contactEmail || undefined,
          paymentMethod: formData?.paymentMethod || undefined,
          comment: formData?.comment || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось оформить заказ")
        return
      }
      toast.success("Заказ создан. Перейдите в «Мои заказы» для оплаты.")
      setBuyModal(null)
      router.push("/orders")
    } finally {
      setBuySubmitting(false)
    }
  }

  async function handleFavorite(productId: string) {
    const isFav = favoriteIds.has(productId)
    try {
      if (isFav) {
        await fetch(`/api/favorites?lotId=${productId}`, { method: "DELETE" })
        setFavoriteIds((prev) => { const s = new Set(prev); s.delete(productId); return s })
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lotId: productId }),
        })
        setFavoriteIds((prev) => new Set(prev).add(productId))
      }
    } catch {
      toast.error("Не удалось обновить избранное")
    }
  }

  async function handleAddToCart(productId: string) {
    const me = await fetch("/api/auth/me").then((r) => r.json())
    if (!me?.user) {
      toast.error("Войдите в аккаунт, чтобы добавить товар в корзину")
      router.push("/login?returnUrl=/catalog")
      return
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId: productId, quantity: 1 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось добавить в корзину")
        return
      }
      toast.success("Добавлено в корзину")
      window.dispatchEvent(new CustomEvent("header-refresh"))
    } catch {
      toast.error("Ошибка")
    }
  }

  return (
    <section className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
            Каталог товаров
          </h1>
          <p className="font-sans text-muted-foreground">
            Найдите нужный цифровой товар среди тысяч предложений
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                className="pl-10 bg-secondary border-border h-12 font-sans"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = searchInput.trim()
                    setSearchQuery(q)
                    updateUrl({ search: q, category: selectedCategory, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, seller: sellerName || undefined })
                  }
                }}
              />
            </div>
            <Button
              type="button"
              className="h-12 font-sans"
              onClick={() => {
                const q = searchInput.trim()
                setSearchQuery(q)
                updateUrl({ search: q, category: selectedCategory, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, seller: sellerName || undefined })
              }}
            >
              Найти
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="h-12 px-6 border-primary text-foreground hover:bg-primary/10 hover:text-primary font-sans gap-2 bg-transparent transition-all duration-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры
          </Button>
        </div>

        {filtersOpen && (
          <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end">
            <div>
              <label className="font-sans text-xs text-muted-foreground mb-1 block">Мин. цена (₽)</label>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                className="h-10 bg-secondary border-border font-sans text-sm"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="font-sans text-xs text-muted-foreground mb-1 block">Макс. цена (₽)</label>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Не указано"
                className="h-10 bg-secondary border-border font-sans text-sm"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="font-sans text-xs text-muted-foreground mb-1 block">Имя продавца</label>
              <Input
                placeholder="Поиск по продавцу"
                className="h-10 bg-secondary border-border font-sans text-sm"
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
              />
            </div>
            <Button
              type="button"
              className="h-10 font-sans"
              onClick={applyFilters}
            >
              Применить фильтры
            </Button>
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categoryFilters.map((cat) => (
            <Button
              key={cat.value || "all"}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              className={
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground font-sans"
                  : "border-border bg-transparent font-sans text-muted-foreground hover:text-foreground"
              }
              onClick={() => {
                setSelectedCategory(cat.value)
                updateUrl({ search: searchInput.trim(), category: cat.value, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, seller: sellerName || undefined })
              }}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {!loading && products.length === 0 ? (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-12 text-center">
            <p className="font-sans text-gray-400 mb-2">Пока нет лотов в каталоге</p>
            <p className="font-sans text-sm text-gray-500 mb-6">
              Добавьте товар через раздел «Продать» — он сразу появится здесь
            </p>
            <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
              <Link href="/create-lot">Добавить лот</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                quantity={product.quantity}
                currency={product.currency}
                seller={product.seller}
                category={product.category}
                description={product.description}
                onBuy={handleBuy}
                onAddToCart={handleAddToCart}
                onFavorite={() => handleFavorite(product.id)}
                isFavorite={favoriteIds.has(product.id)}
              />
            ))}
          </div>
        )}

        <Dialog open={!!buyModal} onOpenChange={(open) => !open && setBuyModal(null)}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <DialogHeader>
              <DialogTitle className="font-serif">Оформление покупки</DialogTitle>
            </DialogHeader>
            {buyModal && (
              <>
                <p className="font-sans text-sm text-gray-300 mb-1">{buyModal.title}</p>
                <p className="font-sans text-[#7fffd4] font-semibold mb-2">
                  {buyModal.price.toLocaleString("ru-RU")} ₽ × {buyQuantity} = {(buyModal.price * buyQuantity).toLocaleString("ru-RU")} ₽
                </p>
                <div className="space-y-2 mb-4">
                  <Label className="text-gray-400 font-sans">Количество</Label>
                  <Input
                    type="number"
                    min={1}
                    max={buyModal.maxQuantity}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, Math.min(buyModal.maxQuantity, parseInt(e.target.value, 10) || 1)))}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                  <p className="font-sans text-xs text-gray-500">
                    В наличии: {buyModal.maxQuantity} шт.
                  </p>
                </div>
                <CheckoutForm
                  totalAmount={buyModal.price * buyQuantity}
                  currencySymbol="₽"
                  submitLabel="Купить за"
                  isLoading={buySubmitting}
                  onSubmit={(formData) => handleConfirmBuy(formData)}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

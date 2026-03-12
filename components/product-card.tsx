"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, User, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  title: string
  price: number
  currency?: string
  category: string
  image?: string
  description?: string
  quantity?: number
  seller: {
    name: string
    rating: number
    deals?: number
  }
}

interface ProductCardProps {
  product?: Product
  productId?: string
  image?: string
  title?: string
  price?: number
  currency?: string
  seller?: {
    name: string
    rating: number
    deals?: number
  }
  category?: string
  description?: string
  quantity?: number
  onBuy?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onFavorite?: () => void
  isFavorite?: boolean
  showActions?: boolean
}

export function ProductCard({
  product,
  productId: productIdProp,
  image: imageProp,
  title: titleProp,
  price: priceProp,
  currency: currencyProp = "RUB",
  seller: sellerProp,
  category: categoryProp,
  description,
  quantity: quantityProp,
  onBuy,
  onAddToCart,
  onFavorite,
  isFavorite: isFavoriteProp,
  showActions = true,
}: ProductCardProps) {
  // Support both product object and individual props
  const image = product?.image || imageProp
  const quantity = quantityProp ?? product?.quantity
  const title = product?.title || titleProp || ""
  const price = product?.price || priceProp || 0
  const currency = product?.currency || currencyProp
  const seller = product?.seller || sellerProp || { name: "Unknown", rating: 0 }
  const category = product?.category || categoryProp || ""
  const productId = productIdProp ?? product?.id ?? ""
  const [internalFavorite, setInternalFavorite] = useState(false)
  const isFavorite = isFavoriteProp !== undefined ? isFavoriteProp : internalFavorite

  const handleFavorite = () => {
    if (isFavoriteProp === undefined) setInternalFavorite((v) => !v)
    onFavorite?.()
  }

  const formatPrice = (value: number) => {
    return value.toLocaleString("ru-RU")
  }

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      "RUB": "₽",
      "USD": "$",
      "EUR": "€"
    }
    return symbols[curr] || curr
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-primary/50 text-primary" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-muted-foreground/30" />
        )
      }
    }
    return stars
  }

  return (
    <Card className="group relative bg-[#1A1A1A] border-transparent hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(127,255,212,0.15)] overflow-hidden">
      {/* Image - link to product page */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        <Link
          href={productId ? `/catalog/${productId}` : "#"}
          className={cn("block w-full h-full", !productId && "pointer-events-none")}
        >
          {image ? (
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-sans text-xs font-medium">
          {category}
        </Badge>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handleFavorite() }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200",
            isFavorite 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-primary")} />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Title - link to product page */}
        {productId ? (
          <Link href={`/catalog/${productId}`}>
            <h3 className="font-sans text-base font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="font-sans text-base font-semibold text-foreground line-clamp-2 mb-2">
            {title}
          </h3>
        )}

        {/* Price */}
        <div className="font-mono text-xl font-semibold text-primary mb-3">
          {formatPrice(price)} {getCurrencySymbol(currency)}
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-sans text-sm text-muted-foreground">
              {seller.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {renderStars(seller.rating)}
            </div>
            <span className="font-sans text-xs text-muted-foreground ml-1">
              {seller.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Quantity in stock */}
        {quantity != null && quantity >= 0 && (
          <p className="font-sans text-sm text-muted-foreground mt-2">
            В наличии: {quantity} шт.
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="font-sans text-sm text-gray-500 line-clamp-2 mt-3">
            {description}
          </p>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={() => onBuy?.(productId)}
              size="lg"
              disabled={quantity !== undefined && quantity < 1}
              className="flex-1 h-10 bg-gradient-to-r from-primary to-accent text-primary-foreground font-sans font-semibold text-sm hover:brightness-110 hover:shadow-[0_0_16px_rgba(127,255,212,0.3)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {quantity !== undefined && quantity < 1 ? "Нет в наличии" : "Купить"}
            </Button>
            {onAddToCart && (quantity === undefined || quantity >= 1) && (
              <Button
                onClick={() => onAddToCart(productId)}
                variant="outline"
                size="lg"
                className="h-10 border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] hover:text-[#7fffd4] font-sans text-sm"
              >
                В корзину
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

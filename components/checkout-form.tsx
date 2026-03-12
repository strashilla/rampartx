"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const PAYMENT_METHODS = [
  { value: "card", label: "Банковская карта" },
  { value: "ewallet", label: "Электронный кошелёк" },
  { value: "crypto", label: "Криптовалюта" },
] as const

export interface CheckoutFormData {
  paymentMethod: string
  contactEmail: string
  comment: string
  agreeTerms: boolean
}

export function CheckoutForm({
  totalAmount,
  currencySymbol,
  onSubmit,
  isLoading,
  submitLabel,
  defaultEmail,
}: {
  totalAmount: number
  currencySymbol: string
  onSubmit: (data: CheckoutFormData) => void | Promise<void>
  isLoading: boolean
  submitLabel: string
  defaultEmail?: string
}) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [contactEmail, setContactEmail] = useState(defaultEmail ?? "")
  const [comment, setComment] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreeTerms) return
    onSubmit({
      paymentMethod,
      contactEmail: contactEmail.trim(),
      comment: comment.trim(),
      agreeTerms,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-muted-foreground font-sans text-sm">Способ оплаты</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="mt-2 space-y-2"
        >
          {PAYMENT_METHODS.map((m) => (
            <div key={m.value} className="flex items-center space-x-2">
              <RadioGroupItem value={m.value} id={m.value} className="border-primary text-primary" />
              <Label htmlFor={m.value} className="font-sans text-sm cursor-pointer">
                {m.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="checkout-email" className="text-muted-foreground font-sans text-sm">
          Email для связи
        </Label>
        <Input
          id="checkout-email"
          type="email"
          placeholder="email@example.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="mt-1 bg-[#0a0a0a] border-[#2a2a2a] text-white font-sans"
        />
      </div>

      <div>
        <Label htmlFor="checkout-comment" className="text-muted-foreground font-sans text-sm">
          Комментарий продавцу (необязательно)
        </Label>
        <textarea
          id="checkout-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-white font-sans text-sm resize-none"
          placeholder="Дополнительные пожелания..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="checkout-terms"
          checked={agreeTerms}
          onCheckedChange={(v) => setAgreeTerms(!!v)}
          className="border-[#7fffd4] data-[state=checked]:bg-[#7fffd4] data-[state=checked]:border-[#7fffd4] data-[state=checked]:text-black"
        />
        <Label htmlFor="checkout-terms" className="font-sans text-sm text-muted-foreground cursor-pointer">
          Согласен с условиями сделки и правилами платформы
        </Label>
      </div>

      <Button
        type="submit"
        disabled={!agreeTerms || isLoading}
        className="w-full h-12 bg-gradient-to-r from-[#7fffd4] to-[#40E0D0] text-black font-semibold hover:opacity-90"
      >
        {isLoading ? "Оформление..." : `${submitLabel} ${totalAmount.toLocaleString("ru-RU")} ${currencySymbol}`}
      </Button>
    </form>
  )
}

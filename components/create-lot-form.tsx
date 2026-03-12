"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package, 
  ImageIcon, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Upload,
  X,
  Gamepad2,
  MessageCircle,
  Sword,
  Key,
  Package2,
  Monitor,
  DollarSign,
  GripVertical
} from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { toast } from "sonner"

// Types
interface FormData {
  title: string
  category: string
  description: string
  price: string
  currency: string
  quantity: string
  images: File[]
  conditions: string
  guarantee7Days: boolean
  canCheckBeforeBuy: boolean
}

interface FormErrors {
  title?: string
  category?: string
  description?: string
  price?: string
  quantity?: string
  images?: string
  conditions?: string
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  steam: Gamepad2,
  discord: MessageCircle,
  epic: Sword,
  keys: Key,
  items: Package2,
  software: Monitor,
}

const defaultCategories = [
  { value: "steam", label: "Steam аккаунты", icon: Gamepad2 },
  { value: "discord", label: "Discord аккаунты", icon: MessageCircle },
  { value: "epic", label: "Epic Games", icon: Sword },
  { value: "keys", label: "Игровые ключи", icon: Key },
  { value: "items", label: "Внутриигровые предметы", icon: Package2 },
  { value: "software", label: "Программное обеспечение", icon: Monitor },
]

const currencies = [
  { value: "RUB", label: "RUB", symbol: "₽" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "€" },
]

const steps = [
  { id: 1, title: "Основная информация", icon: Package },
  { id: 2, title: "Медиа", icon: ImageIcon },
  { id: 3, title: "Условия", icon: FileText },
]

export function CreateLotForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [categories, setCategories] = useState<{ value: string; label: string; icon: React.ComponentType<{ className?: string }> }[]>(defaultCategories)

  React.useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = data?.categories
        if (Array.isArray(list) && list.length > 0) {
          setCategories(
            list.map((c: { slug: string; label: string }) => ({
              value: c.slug,
              label: c.label,
              icon: CATEGORY_ICONS[c.slug] ?? Package,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    price: "",
    currency: "RUB",
    quantity: "1",
    images: [],
    conditions: "",
    guarantee7Days: false,
    canCheckBeforeBuy: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.title || formData.title.length < 5) {
      newErrors.title = "Минимум 5 символов"
    } else if (formData.title.length > 100) {
      newErrors.title = "Максимум 100 символов"
    }
    
    if (!formData.category) {
      newErrors.category = "Выберите категорию"
    }
    
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = "Минимум 20 символов"
    } else if (formData.description.length > 2000) {
      newErrors.description = "Максимум 2000 символов"
    }
    
    const priceNum = parseFloat(formData.price)
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Введите корректную цену"
    }
    const qty = parseInt(formData.quantity, 10)
    if (!formData.quantity || isNaN(qty) || qty < 1) {
      newErrors.quantity = "Минимум 1"
    } else if (qty > 999999) {
      newErrors.quantity = "Слишком большое число"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (formData.images.length === 0) {
      newErrors.images = "Добавьте хотя бы одно изображение"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.conditions || formData.conditions.length < 10) {
      newErrors.conditions = "Минимум 10 символов"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    
    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    }
    
    if (isValid) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setIsSubmitting(true)
    try {
      const imageUrls: string[] = []
      for (let i = 0; i < Math.min(formData.images.length, 5); i++) {
        const form = new FormData()
        form.append("file", formData.images[i])
        const upRes = await fetch("/api/upload", { method: "POST", body: form })
        const upData = await upRes.json().catch(() => ({}))
        if (upRes.ok && upData?.url) imageUrls.push(upData.url)
      }

      const res = await fetch("/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category || undefined,
          price: parseFloat(formData.price) || 0,
          currency: formData.currency,
          quantity: Math.max(1, parseInt(formData.quantity, 10) || 1),
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          imageUrl: imageUrls[0] || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось создать лот")
        return
      }
      toast.success("Лот создан и опубликован в каталоге")
      window.location.href = "/catalog"
    } catch (error) {
      console.error("Error creating lot:", error)
      toast.error("Ошибка соединения")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = []
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        return
      }
      if (file.size > maxSize) {
        return
      }
      if (formData.images.length + validFiles.length < 5) {
        validFiles.push(file)
      }
    })
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }))
      setErrors(prev => ({ ...prev, images: undefined }))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const isStep1Valid = formData.title.length >= 5 && formData.category && formData.description.length >= 20 && parseFloat(formData.price) > 0 && (parseInt(formData.quantity, 10) || 0) >= 1
  const isStep2Valid = formData.images.length > 0
  const isStep3Valid = formData.conditions.length >= 10

  const getCurrencySymbol = () => {
    return currencies.find(c => c.value === formData.currency)?.symbol || "₽"
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Создать лот
            </h1>
            <p className="font-sans text-muted-foreground">
              Заполните информацию о вашем товаре
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`flex items-center gap-2 ${
                      currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep > step.id 
                          ? "bg-primary text-primary-foreground" 
                          : currentStep === step.id 
                            ? "bg-primary/20 border-2 border-primary text-primary" 
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-sans text-sm hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 transition-colors duration-300 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-6">
                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Название товара
                      </label>
                      <div className="relative">
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          onBlur={() => handleBlur("title")}
                          placeholder="Например: Аккаунт Steam level 50"
                          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 pr-16"
                          maxLength={100}
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs ${
                          formData.title.length >= 5 ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {formData.title.length}/100
                        </span>
                      </div>
                      {touched.title && errors.title && (
                        <p className="mt-1.5 font-sans text-sm text-destructive">{errors.title}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Категория
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="w-4 h-4 text-primary" />
                                <span>{cat.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touched.category && errors.category && (
                        <p className="mt-1.5 font-sans text-sm text-destructive">{errors.category}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Описание
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        onBlur={() => handleBlur("description")}
                        placeholder="Подробно опишите товар..."
                        className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[150px] resize-none"
                        maxLength={2000}
                      />
                      <div className="flex justify-between mt-1.5">
                        {touched.description && errors.description ? (
                          <p className="font-sans text-sm text-destructive">{errors.description}</p>
                        ) : (
                          <span />
                        )}
                        <span className={`font-sans text-xs ${
                          formData.description.length >= 20 ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {formData.description.length}/2000
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Цена
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            onBlur={() => handleBlur("price")}
                            placeholder="0.00"
                            className="bg-secondary border-border focus:border-primary focus:ring-primary/20 pl-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger className="w-24 bg-secondary border-border focus:border-primary focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {currencies.map((cur) => (
                              <SelectItem key={cur.value} value={cur.value}>
                                {cur.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {touched.price && errors.price && (
                        <p className="mt-1.5 font-sans text-sm text-destructive">{errors.price}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Количество в наличии
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={999999}
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        onBlur={() => handleBlur("quantity")}
                        placeholder="1"
                        className="bg-secondary border-border focus:border-primary focus:ring-primary/20 w-32"
                      />
                      {touched.quantity && errors.quantity && (
                        <p className="mt-1.5 font-sans text-sm text-destructive">{errors.quantity}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Drag & Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive 
                          ? "border-primary bg-primary/5" 
                          : "border-primary/40 hover:border-primary hover:bg-primary/5"
                      } ${formData.images.length >= 5 ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={formData.images.length >= 5}
                      />
                      <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                      <p className="font-sans text-foreground mb-2">
                        Перетащите изображения или нажмите для выбора
                      </p>
                      <p className="font-sans text-sm text-muted-foreground">
                        PNG, JPG, WEBP до 5MB. Максимум 5 файлов.
                      </p>
                    </div>

                    {errors.images && (
                      <p className="font-sans text-sm text-destructive">{errors.images}</p>
                    )}

                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {formData.images.map((file, index) => (
                          <div 
                            key={index}
                            className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary"
                          >
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="absolute bottom-1 left-1 w-6 h-6 bg-black/50 rounded flex items-center justify-center">
                              <GripVertical className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="font-sans text-sm text-muted-foreground">
                      Загружено: {formData.images.length}/5 изображений
                    </p>
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Conditions */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-2">
                        Условия продажи
                      </label>
                      <Textarea
                        value={formData.conditions}
                        onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                        onBlur={() => handleBlur("conditions")}
                        placeholder="Укажите как будет передан товар..."
                        className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[120px] resize-none"
                      />
                      {touched.conditions && errors.conditions && (
                        <p className="mt-1.5 font-sans text-sm text-destructive">{errors.conditions}</p>
                      )}
                    </div>

                    {/* Guarantees */}
                    <div>
                      <label className="block font-sans text-sm font-medium text-foreground mb-4">
                        Гарантии
                      </label>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox
                            checked={formData.guarantee7Days}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, guarantee7Days: checked as boolean }))
                            }
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="font-sans text-foreground group-hover:text-primary transition-colors">
                            Гарантия на 7 дней
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox
                            checked={formData.canCheckBeforeBuy}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, canCheckBeforeBuy: checked as boolean }))
                            }
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="font-sans text-foreground group-hover:text-primary transition-colors">
                            Возможность проверки перед покупкой
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isStep3Valid || isSubmitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Создание...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Создать лот
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Card - Only on Step 3 */}
            {currentStep === 3 && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                    Превью
                  </h3>
                  <ProductCard
                    product={{
                      id: "preview",
                      title: formData.title || "Название товара",
                      price: parseFloat(formData.price) || 0,
                      currency: formData.currency,
                      category: categories.find(c => c.value === formData.category)?.label || "Категория",
                      image: formData.images[0] ? URL.createObjectURL(formData.images[0]) : "/placeholder.svg",
                      seller: {
                        name: "Вы",
                        rating: 5.0,
                        deals: 0
                      }
                    }}
                    showActions={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

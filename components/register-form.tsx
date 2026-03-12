"use client"

import React from "react"

import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

interface TouchedFields {
  username: boolean
  email: boolean
  password: boolean
  confirmPassword: boolean
  terms: boolean
}

export function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case "username":
        if (typeof value === "string") {
          if (value.length < 3) return "Минимум 3 символа"
          if (value.length > 20) return "Максимум 20 символов"
          if (!/^[a-zA-Zа-яА-ЯёЁ0-9_]+$/.test(value)) return "Только буквы, цифры и _"
        }
        break
      case "email":
        if (typeof value === "string") {
          if (!value) return "Email обязателен"
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Неверный формат email"
        }
        break
      case "password":
        if (typeof value === "string" && value.length < 8) return "Минимум 8 символов"
        break
      case "confirmPassword":
        if (typeof value === "string") {
          if (!value) return "Подтвердите пароль"
          if (value !== formData.password) return "Пароли не совпадают"
        }
        break
      case "terms":
        if (value !== true) return "Необходимо принять правила"
        break
    }
    return undefined
  }

  const handleChange = (name: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    // Re-validate confirmPassword when password changes
    if (name === "password" && touched.confirmPassword) {
      const confirmError = formData.confirmPassword && formData.confirmPassword !== value 
        ? "Пароли не совпадают" 
        : undefined
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    })

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAll()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error ?? "Ошибка регистрации"
        toast.error(msg)
        setErrors((prev) => ({ ...prev, email: msg }))
        return
      }
      toast.success("Аккаунт создан. Войдите.")
      window.location.href = "/login"
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Ошибка соединения. Попробуйте позже.")
      setErrors((prev) => ({ ...prev, email: "Ошибка соединения. Попробуйте позже." }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFieldValid = (name: keyof FormData) => {
    return touched[name] && formData[name] && !errors[name]
  }

  const isFormValid = 
    formData.username && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    formData.terms && 
    !errors.username && 
    !errors.email && 
    !errors.password && 
    !errors.confirmPassword && 
    !errors.terms

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-[#1A1A1A] p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Регистрация
          </h1>
          <p className="mt-2 font-sans text-muted-foreground">
            Присоединяйтесь к маркетплейсу
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-2">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                onBlur={() => handleBlur("username")}
                placeholder="Имя пользователя"
                className={cn(
                  "h-11 bg-background pl-10 pr-10 font-sans",
                  "border-border focus-visible:border-primary focus-visible:ring-primary/30",
                  errors.username && touched.username && "border-[#FF6B6B] focus-visible:border-[#FF6B6B] focus-visible:ring-[#FF6B6B]/30"
                )}
              />
              {isFieldValid("username") && (
                <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-500" />
              )}
            </div>
            {errors.username && touched.username && (
              <p className="text-sm text-[#FF6B6B]">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                type="email"
                placeholder="Email"
                className={cn(
                  "h-11 bg-background pl-10 pr-10 font-sans",
                  "border-border focus-visible:border-primary focus-visible:ring-primary/30",
                  errors.email && touched.email && "border-[#FF6B6B] focus-visible:border-[#FF6B6B] focus-visible:ring-[#FF6B6B]/30"
                )}
              />
              {isFieldValid("email") && (
                <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-500" />
              )}
            </div>
            {errors.email && touched.email && (
              <p className="text-sm text-[#FF6B6B]">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                className={cn(
                  "h-11 bg-background pl-10 pr-10 font-sans",
                  "border-border focus-visible:border-primary focus-visible:ring-primary/30",
                  errors.password && touched.password && "border-[#FF6B6B] focus-visible:border-[#FF6B6B] focus-visible:ring-[#FF6B6B]/30"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-sm text-[#FF6B6B]">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Подтвердите пароль"
                className={cn(
                  "h-11 bg-background pl-10 pr-10 font-sans",
                  "border-border focus-visible:border-primary focus-visible:ring-primary/30",
                  errors.confirmPassword && touched.confirmPassword && "border-[#FF6B6B] focus-visible:border-[#FF6B6B] focus-visible:ring-[#FF6B6B]/30"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-sm text-[#FF6B6B]">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => {
                  handleChange("terms", checked === true)
                  setTouched((prev) => ({ ...prev, terms: true }))
                }}
                className="mt-0.5 border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
              >
                Я согласен с{" "}
                <Link
                  href="/rules"
                  className="text-primary underline-offset-4 transition-colors hover:underline"
                >
                  правилами
                </Link>
              </label>
            </div>
            {errors.terms && touched.terms && (
              <p className="text-sm text-[#FF6B6B]">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={cn(
              "h-12 w-full font-sans text-base font-semibold",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(127,255,212,0.3)]",
              "disabled:scale-100 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:shadow-none"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="size-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Регистрация...
              </span>
            ) : (
              "Зарегистрироваться"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

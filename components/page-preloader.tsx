"use client"

import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

const MIN_DISPLAY_MS = 800
const FADE_OUT_MS = 400

export function PagePreloader() {
  const [exiting, setExiting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    const startTime = Date.now()

    const tryHide = () => {
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, MIN_DISPLAY_MS - elapsed)
      tid = setTimeout(() => {
        setExiting(true)
        if (typeof window !== "undefined") {
          ;(window as unknown as { __preloaderHidden?: boolean }).__preloaderHidden = true
          window.dispatchEvent(new CustomEvent("preloader-hidden"))
        }
        tid = setTimeout(() => setMounted(false), FADE_OUT_MS)
      }, delay)
    }

    setMounted(true)
    if (document.readyState === "complete") {
      tryHide()
    } else {
      window.addEventListener("load", tryHide)
    }
    return () => {
      window.removeEventListener("load", tryHide)
      clearTimeout(tid)
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-[${FADE_OUT_MS}ms] ease-out ${exiting ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-primary/[0.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,var(--primary)/0.12,transparent)]" />

      <div className="relative flex flex-col items-center gap-10">
        <div className="preloader-icon-wrap flex items-center justify-center">
          <Shield className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Заголовок: раскрытие сверху вниз */}
          <div className="preloader-reveal-wrap h-14 overflow-hidden">
            <span className="block font-serif text-4xl font-bold tracking-tight text-primary">
              Rampartx
            </span>
          </div>
          {/* Подзаголовок «Загрузка» с такой же анимацией, с задержкой */}
          <div className="preloader-reveal-wrap preloader-reveal-delay h-8 overflow-hidden">
            <span className="block font-sans text-lg font-medium text-muted-foreground">
              Загрузка...
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-44 overflow-hidden rounded-full bg-muted">
            <div
              className="preloader-bar h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
              style={{ width: "0%" }}
            />
          </div>
          <div className="h-1 w-32 rounded-full bg-muted/60">
            <div
              className="preloader-bar preloader-bar-delay h-full rounded-full bg-primary/80"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

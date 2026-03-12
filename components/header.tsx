"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Menu, Bell, ShoppingCart, User, LogOut, Settings, Package, Wallet, MessageCircle, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { usePurchaseNotifications } from "@/hooks/use-purchase-notifications"

interface HeaderProps {
  isLoggedIn?: boolean
  user?: {
    name: string
    avatar?: string
  }
  notificationCount?: number
  cartCount?: number
  balance?: number
}

export function Header({ 
  isLoggedIn: isLoggedInProp, 
  user: userProp,
  notificationCount = 0,
  cartCount: cartCountProp,
  balance: balanceProp,
}: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [authUser, setAuthUser] = useState<{ name: string; avatar?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [balance, setBalance] = useState<number | undefined>(balanceProp)
  const [cartCount, setCartCount] = useState<number>(cartCountProp ?? 0)
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [topUpSubmitting, setTopUpSubmitting] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string; title: string; body?: string; read: boolean; createdAt: string }[]>([])
  const [unreadCount, setUnreadCount] = useState(notificationCount)
  const [notifOpen, setNotifOpen] = useState(false)
  const pathname = usePathname()
  
  // Initialize purchase notifications
  usePurchaseNotifications()

  useEffect(() => {
    setMounted(true)
  }, [])

  const refetchAuth = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setAuthUser(data.user)
        setIsAdmin(!!data?.isAdmin)
        if (data?.balance != null) setBalance(data.balance)
        if (data?.cartCount != null) setCartCount(data.cartCount)
        if (data?.notificationCount != null) setUnreadCount(data.notificationCount)
      })
      .catch(() => {})
  }

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data?.notifications ?? [])
        setUnreadCount(data?.unreadCount ?? 0)
      })
      .catch(() => {})
  }
  
  // Function to refresh notifications when a new one is added
  const refreshNotifications = () => {
    if (notifOpen) {
      fetchNotifications();
    }
  };

  // Listen for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      refreshNotifications();
      // Also refetch the user data to update notification count
      refetchAuth();
    };
    
    document.addEventListener('notification-update', handleNotificationUpdate);
    
    return () => {
      document.removeEventListener('notification-update', handleNotificationUpdate);
    };
  }, [notifOpen, refetchAuth]);

  useEffect(() => {
    refetchAuth()
  }, [])

  useEffect(() => {
    const onRefresh = () => refetchAuth()
    window.addEventListener("header-refresh", onRefresh)
    return () => window.removeEventListener("header-refresh", onRefresh)
  }, [])

  async function handleTopUp() {
    const amount = Math.round(parseFloat(topUpAmount) * 100) / 100
    if (amount < 1) return
    setTopUpSubmitting(true)
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      setBalance(data.balance)
      setTopUpAmount("")
      setBalanceModalOpen(false)
    } finally {
      setTopUpSubmitting(false)
    }
  }

  const isLoggedIn = isLoggedInProp ?? !!authUser
  const user = userProp ?? authUser ?? undefined
  const displayBalance = balance ?? balanceProp ?? 0

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/create-lot", label: "Продать" },
    { href: "/chats", label: "Чаты" },
    { href: "/#how-it-works", label: "Как работает" },
    { href: "/faq", label: "FAQ" },
  ]

  const isActiveLink = (href: string) => {
    if (href.startsWith("/#")) return false
    return pathname === href
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-[#1A1A1A] h-20">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <Image
              src="/shield.png"
              alt="Rampartx"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
            <span className="font-serif font-bold text-white text-2xl group-hover:text-[#7fffd4] transition-colors duration-300">
              Rampartx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[15px] transition-colors duration-200 relative py-2 ${
                  isActiveLink(link.href)
                    ? "text-[#7fffd4]"
                    : "text-white hover:text-[#7fffd4]"
                }`}
              >
                {link.label}
                {isActiveLink(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7fffd4]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search — переход в каталог с запросом */}
            <form action="/catalog" method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFEEEE]" />
              <Input
                type="search"
                name="search"
                placeholder="Поиск товаров..."
                className="header-search-input w-[250px] pl-10 bg-[#111111] border-[#1A1A1A] text-white placeholder:text-[#666666] focus:border-[#7fffd4] focus:ring-[#7fffd4]/20 font-sans text-sm h-10"
                defaultValue=""
              />
            </form>

            {isLoggedIn ? (
              <>
                {/* Balance */}
                <div className="font-sans text-sm text-[#7fffd4] font-medium px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2a2a2a]">
                  {displayBalance.toLocaleString("ru-RU")} ₽
                </div>

                {/* Notifications */}
                <DropdownMenu open={notifOpen} onOpenChange={(open) => { setNotifOpen(open); if (open) fetchNotifications() }}>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 text-white hover:text-[#7fffd4] transition-colors">
                      <Bell className="w-5 h-5" />
                      {(unreadCount ?? 0) > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#7fffd4] text-black text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto bg-[#0a0a0a] border-[#1A1A1A]">
                    <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
                      <span className="font-sans font-medium text-white">Уведомления</span>
                      {(unreadCount ?? 0) > 0 && (
                        <button
                          type="button"
                          className="text-xs text-[#7fffd4] hover:underline"
                          onClick={async () => {
                            await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) })
                            setUnreadCount(0)
                            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                          }}
                        >
                          Прочитано всё
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-4 font-sans text-sm text-gray-500">Нет уведомлений</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`px-3 py-2 border-b border-[#1A1A1A]/50 ${!n.read ? "bg-[#1A1A1A]/50" : ""}`}>
                          <p className="font-sans text-sm text-white">{n.title}</p>
                          {n.body && <p className="font-sans text-xs text-gray-400 mt-0.5">{n.body}</p>}
                          <p className="font-sans text-[11px] text-gray-500 mt-1">{n.createdAt}</p>
                        </div>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Cart */}
                <Link href="/cart" className="relative p-2 text-white hover:text-[#7fffd4] transition-colors" title="Корзина">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#7fffd4] text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-[#1A1A1A] transition-colors">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar || "/placeholder.svg"} 
                          alt={user.name}
                          className="w-9 h-9 rounded-full border-2 border-[#7fffd4]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7fffd4] to-[#40E0D0] flex items-center justify-center">
                          <User className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-[#1A1A1A]">
                    <div className="px-3 py-2">
                      <p className="font-sans font-medium text-white">{user?.name || "Пользователь"}</p>
                      <p className="font-sans text-xs text-[#7fffd4] mt-0.5">Баланс: {displayBalance.toLocaleString("ru-RU")} ₽</p>
                    </div>
                    <DropdownMenuSeparator className="bg-[#1A1A1A]" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 text-white hover:text-[#7fffd4] cursor-pointer">
                        <User className="w-4 h-4" />
                        <span className="font-sans">Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-white hover:text-[#7fffd4] cursor-pointer"
                      onSelect={(e) => { e.preventDefault(); setBalanceModalOpen(true) }}
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="font-sans">Пополнить баланс</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center gap-2 text-white hover:text-[#7fffd4] cursor-pointer">
                        <Package className="w-4 h-4" />
                        <span className="font-sans">Мои заказы</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chats" className="flex items-center gap-2 text-white hover:text-[#7fffd4] cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-sans">Чаты</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 text-white hover:text-[#7fffd4] cursor-pointer">
                        <Settings className="w-4 h-4" />
                        <span className="font-sans">Настройки</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 text-[#7fffd4] hover:text-[#AFEEEE] cursor-pointer">
                          <Shield className="w-4 h-4" />
                          <span className="font-sans">Админ-панель</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#1A1A1A]" />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" })
                        window.location.href = "/"
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-sans">Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={balanceModalOpen} onOpenChange={setBalanceModalOpen}>
                  <DialogContent className="bg-[#0a0a0a] border-[#1A1A1A] text-white">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Пополнить баланс</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label className="text-gray-400 font-sans">Сумма (₽)</Label>
                        <Input
                          type="number"
                          min={1}
                          step={100}
                          placeholder="1000"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="bg-[#111111] border-[#2a2a2a] text-white"
                        />
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setBalanceModalOpen(false)}
                          className="border-[#2a2a2a] font-sans"
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleTopUp}
                          disabled={topUpSubmitting || !topUpAmount || parseFloat(topUpAmount) < 1}
                          className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans"
                        >
                          {topUpSubmitting ? "..." : "Пополнить"}
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  variant="outline"
                  className="border-primary text-foreground hover:bg-primary/10 hover:text-primary font-sans text-sm font-medium px-5 h-10 transition-all duration-200 bg-transparent"
                  asChild
                >
                  <Link href="/login">Вход</Link>
                </Button>

                {/* Register Button */}
                <Button
                  className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans text-sm font-medium px-5 h-10 transition-all duration-200"
                  asChild
                >
                  <Link href="/register">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu — рендерим Sheet только после монтирования, чтобы избежать hydration mismatch (Radix генерирует разные ID на сервере и клиенте) */}
          <div className="lg:hidden">
            {mounted ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="w-6 h-6 text-[#7fffd4]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0a] border-[#1A1A1A] w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-white">
                    <Image
                      src="/shield.png"
                      alt="Rampartx"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <span className="font-serif font-bold text-xl">Rampartx</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Search — переход в каталог с запросом */}
                  <form action="/catalog" method="GET" className="relative" onSubmit={() => setSheetOpen(false)}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFEEEE]" />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Поиск товаров..."
                      className="header-search-input w-full pl-10 bg-[#111111] border-[#1A1A1A] text-white placeholder:text-[#666666] focus:border-[#7fffd4] font-sans text-sm"
                      defaultValue=""
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className={`font-sans text-base py-2 transition-colors ${
                          isActiveLink(link.href)
                            ? "text-[#7fffd4]"
                            : "text-white hover:text-[#7fffd4]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth */}
                  <div className="flex flex-col gap-3 pt-6 border-t border-[#1A1A1A]">
                    {isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          {user?.avatar ? (
                            <img 
                              src={user.avatar || "/placeholder.svg"} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-[#7fffd4]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7fffd4] to-[#40E0D0] flex items-center justify-center">
                              <User className="w-5 h-5 text-black" />
                            </div>
                          )}
                          <div>
                            <span className="font-sans font-medium text-white block">{user?.name || "Пользователь"}</span>
                            <span className="font-sans text-xs text-[#7fffd4]">Баланс: {displayBalance.toLocaleString("ru-RU")} ₽</span>
                          </div>
                        </div>
                        <Link 
                          href="/profile" 
                          onClick={() => setSheetOpen(false)}
                          className="font-sans text-white hover:text-[#7fffd4] py-2"
                        >
                          Профиль
                        </Link>
                        <Link 
                          href="/orders" 
                          onClick={() => setSheetOpen(false)}
                          className="font-sans text-white hover:text-[#7fffd4] py-2"
                        >
                          Мои заказы
                        </Link>
                        <Link 
                          href="/chats" 
                          onClick={() => setSheetOpen(false)}
                          className="font-sans text-white hover:text-[#7fffd4] py-2"
                        >
                          Чаты
                        </Link>
                        <Link 
                          href="/cart" 
                          onClick={() => setSheetOpen(false)}
                          className="font-sans text-white hover:text-[#7fffd4] py-2 flex items-center justify-between"
                        >
                          Корзина
                          {cartCount > 0 && (
                            <span className="w-5 h-5 bg-[#7fffd4] text-black text-xs font-bold rounded-full flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          className="font-sans text-white hover:text-[#7fffd4] py-2 text-left"
                          onClick={() => { setSheetOpen(false); setBalanceModalOpen(true) }}
                        >
                          Пополнить баланс
                        </button>
                        <button
                          type="button"
                          className="font-sans text-red-400 hover:text-red-300 py-2 text-left"
                          onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" })
                            window.location.href = "/"
                          }}
                        >
                          Выйти
                        </button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="border-primary text-foreground hover:bg-primary/10 hover:text-primary font-sans w-full bg-transparent"
                          asChild
                        >
                          <Link href="/login" onClick={() => setSheetOpen(false)}>Вход</Link>
                        </Button>
                        <Button
                          className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans w-full"
                          asChild
                        >
                          <Link href="/register" onClick={() => setSheetOpen(false)}>Регистрация</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            ) : (
              <button type="button" className="p-2" aria-label="Меню">
                <Menu className="w-6 h-6 text-[#7fffd4]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

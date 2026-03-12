"use client"

import Link from "next/link"
import Image from "next/image"

// Custom social icons as components
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

function VKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.719-1.033-1.033-1.49-1.171-1.745-1.171-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.657 4 8.189c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.489 2.27 4.675 2.862 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.182-3.625 2.182-3.625.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.716-.576.716z"/>
    </svg>
  )
}

const navigationLinks = [
  { label: "Каталог", href: "/catalog" },
  { label: "Продать товар", href: "/create-lot" },
  { label: "Как это работает", href: "/#how-it-works" },
  { label: "О проекте", href: "/about" },
  { label: "FAQ", href: "/faq" },
]

const helpLinks = [
  { label: "Правила платформы", href: "/rules" },
  { label: "Как купить", href: "/how-to-buy" },
  { label: "Как продать", href: "/how-to-sell" },
  { label: "Безопасность", href: "/security" },
  { label: "Контакты", href: "/contacts" },
]

const legalLinks = [
  { label: "Пользовательское соглашение", href: "/terms" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Возврат средств", href: "/refunds" },
  { label: "Cookie", href: "/cookies" },
]

const socialLinks = [
  { icon: TelegramIcon, href: "https://t.me/rampartx", label: "Telegram" },
  { icon: VKIcon, href: "https://vk.com/rampartx", label: "VK" },
]

export function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-[#1A1A1A]">
      <div className="container mx-auto px-4 pt-[60px] pb-[30px]">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Column 1 - About */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <Image
                src="/shield.png"
                alt="Rampartx"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="font-serif font-bold text-foreground text-xl tracking-tight">
                Rampartx
              </span>
            </Link>
            
            {/* Description */}
            <p className="font-sans text-sm text-[#6B7280] mb-6 leading-relaxed max-w-xs">
              Безопасный P2P маркетплейс для торговли цифровыми товарами
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-white hover:text-primary transition-all duration-300 hover:scale-[1.2]"
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Navigation */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">
              Навигация
            </h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-[#6B7280] hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Help */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">
              Помощь
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-[#6B7280] hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">
              Юридическое
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-[#6B7280] hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1A1A1A] pt-6">
          <p className="font-sans text-sm text-[#6B7280] text-center">
            © 2026 Rampartx. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}

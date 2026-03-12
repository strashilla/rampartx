# Rampartx — P2P маркетплейс цифровых товаров

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Server-4479a1?logo=mysql)](https://www.mysql.com/)

**Rampartx** — безопасная торговля цифровыми товарами без посредников и рисков. P2P маркетплейс с защитой сделок и низкими комиссиями.

---

## 📋 О проекте

Современный маркетплейс для торговли цифровыми товарами с полным циклом сделок: от создания лота до безопасной передачи товара покупателю.

### Ключевые возможности

- 🔐 **Безопасные сделки** — защита интересов покупателя и продавца
- 🛒 **Корзина и заказы** — удобное управление покупками
- 💬 **Чат между пользователями** — коммуникация в реальном времени
- 📊 **Личный кабинет** — управление профилем, балансом, настройками
- 📦 **Каталог товаров** — фильтрация и поиск по категориям
- 🎨 **Создание лотов** — интуитивный интерфейс для продавцов
- 🌙 **Тёмная тема** — современный дизайн с поддержкой тёмной темы
- 📱 **Адаптивность** — корректная работа на всех устройствах

---

## 🚀 Технологии

| Категория | Технологии |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Стили** | Tailwind CSS 4, shadcn/ui, Motion |
| **UI компоненты** | Radix UI, Lucide Icons |
| **Backend** | Next.js API Routes |
| **База данных** | MySQL (через mysql2) |
| **Аутентификация** | bcryptjs, Zod валидация |
| **Уведомления** | Nodemailer, Sonner |
| **Аналитика** | Vercel Analytics |

---

## 📁 Структура проекта

```
rampartx/
├── app/                      # Next.js App Router
│   ├── about/               # О проекте
│   ├── admin/               # Админ-панель
│   ├── api/                 # API endpoints
│   ├── balance/             # Баланс пользователя
│   ├── cart/                # Корзина
│   ├── catalog/             # Каталог товаров
│   ├── chat/                # Чат
│   ├── contacts/            # Контакты
│   ├── create-lot/          # Создание лота
│   ├── deal/                # Сделки
│   ├── faq/                 # FAQ
│   ├── login/               # Вход
│   ├── orders/              # Заказы
│   ├── profile/             # Профиль
│   ├── register/            # Регистрация
│   ├── settings/            # Настройки
│   ├── support/             # Поддержка
│   └── ...                  # Другие страницы
├── components/              # React компоненты
│   ├── ui/                  # UI компоненты (shadcn)
│   ├── header.tsx           # Шапка
│   ├── footer.tsx           # Подвал
│   └── ...                  # Другие компоненты
├── lib/                     # Утилиты и хелперы
├── hooks/                   # Кастомные хуки
├── rampartx.sql            # SQL дамп базы данных
└── package.json            # Зависимости проекта
```

---

## ⚙️ Установка и запуск

### Требования

- Node.js 18+
- MySQL 8+ или MariaDB 10+
- npm / pnpm / yarn

### 1. Клонирование репозитория

```bash
git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/rampartx.git
cd rampartx
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

1. Создайте базу данных `rampartx`:

```sql
CREATE DATABASE rampartx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Импортируйте структуру БД:

```bash
mysql -u root -p rampartx < rampartx.sql
```

### 4. Настройка переменных окружения

Скопируйте файл `env.example` в `.env.local`:

```bash
cp env.example .env.local
```

Отредактируйте `.env.local` и укажите ваши данные:

```env
# Подключение к MySQL
DATABASE_URL="mysql://root:ВАШ_ПАРОЛЬ@localhost:3306/rampartx"
```

### 5. Запуск проекта

**Режим разработки:**

```bash
npm run dev
```

Проект откроется по адресу [http://localhost:3000](http://localhost:3000)

**Сборка для продакшена:**

```bash
npm run build
npm run start
```

---

## 📦 Доступные скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшена |
| `npm run start` | Запуск продакшен-сборки |
| `npm run lint` | Проверка кода через ESLint |

---

## 🔐 Безопасность

- Хеширование паролей через `bcryptjs`
- Валидация данных с помощью `Zod`
- Защита от SQL-инъекций (параметризированные запросы)

---

<p align="center">
  <strong>Rampartx</strong> — безопасная торговля цифровыми товарами
</p>

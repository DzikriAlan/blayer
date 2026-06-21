# Next Starter

---

## Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 14 (Pages Router) + React 18 + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Server State | TanStack Query (`@tanstack/react-query`) |
| Client State | Zustand |
| Form | React Hook Form + Zod |
| Animation | Framer Motion |
| ORM | Prisma |
| Database | PostgreSQL (`pg`) |
| i18n | i18next + react-i18next |
| Icons | Lucide React |

---

## Struktur Project

```
src/
├── pages/                  # Next.js Pages Router
│   ├── _app.tsx            # App wrapper (TanStack Query provider)
│   ├── _document.tsx       # HTML document
│   └── index.tsx           # Home page
├── features/               # Modul fitur (feature-based)
│   └── {feature-name}/
│       ├── types/          # TypeScript interfaces
│       ├── states/         # Zustand stores
│       ├── services/       # API call functions
│       ├── controllers/    # TanStack Query hooks
│       └── components/     # React components
└── shared/
    ├── lib/
    │   ├── prisma.ts       # Prisma client singleton
    │   └── utils.ts        # cn() utility (clsx + tailwind-merge)
    ├── styles/
    │   └── globals.css     # Tailwind base + Shadcn CSS variables
    └── locales/
        ├── en.json
        └── id.json
```

---

## Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL database (lokal atau cloud)

### 1. Clone dan Install

```bash
git clone <repo-url>
cd next-starter
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Isi `.env.local` sesuai konfigurasi kamu:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/db_name"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

> Generate `NEXTAUTH_SECRET` dengan: `openssl rand -base64 32`

### 3. Setup Database

```bash
npx prisma db push
npx prisma generate
```

> `db:push` otomatis dijalankan saat `npm install` (via `postinstall` script).

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan production build |
| `npm run lint` | Jalankan ESLint |
| `npm run db:push` | Push schema Prisma ke database |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |

---

## Panduan Arsitektur

Lihat [CODE.md](./CODE.md) untuk aturan lengkap mengenai:
- Konvensi penamaan fungsi, file, dan folder
- Struktur per file (Types, States, Services, Controllers, Components)
- Aturan penggunaan TanStack Query dan Zustand
- Aturan penulisan komponen React

---

## Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: deskripsi singkat'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## License

MIT License

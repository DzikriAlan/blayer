# Next Starter

Production-ready template for building modern fullstack web applications with Next.js 14, React 18, TypeScript, Prisma ORM, and PostgreSQL.

## 🎯 Overview

**Next Starter** is a comprehensive web application template that combines modern frontend with backend capabilities:
- **Frontend**: Next.js 14 (Pages Router) + React 18 + TypeScript with Tailwind CSS & Shadcn/UI components
- **Backend**: Built-in API routes for server-side logic and database operations
- **Database**: Prisma ORM + PostgreSQL for robust data management
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form + Zod for form handling and validation
- **Internationalization**: i18next for multi-language support
- **Animations**: Framer Motion for smooth user interactions

Use this starter for:
- Fullstack web applications with server-side rendering
- Rapid prototyping and MVP development
- Teams wanting React ecosystem best practices built-in

---

## 📚 Tech Stack

| Concern | Package |
|---------|---------|
| Framework | Next.js 14 (Pages Router) + React 18 + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Server State | TanStack Query (@tanstack/react-query) |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| ORM | Prisma |
| Database Driver | PostgreSQL (pg) |
| Internationalization | i18next + react-i18next |
| Animations | Framer Motion |
| Icons | Lucide React |
| Node Version | v20+ |

---

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10+ or yarn/pnpm
- **PostgreSQL**: v12+ (local or cloud)
- **Git**: for version control

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd next-starter
```

### 2. Install Dependencies

```bash
npm install
```

> Note: Database migration runs automatically via postinstall script.

### 3. Setup Environment

Copy environment example file and adjust for your local configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/next_starter"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

> Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 4. Setup Database

```bash
npx prisma db push
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
src/
├── pages/                    # Next.js Pages Router
│   ├── _app.tsx             # App wrapper (TanStack Query provider)
│   ├── _document.tsx        # HTML document setup
│   └── index.tsx            # Home page
├── features/
│   └── {featureName}/
│       ├── types/           # TypeScript interfaces & types
│       ├── states/          # Zustand stores
│       ├── services/        # API call functions
│       ├── controllers/     # TanStack Query hooks
│       └── components/      # React components
├── shared/
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── utils.ts        # cn() utility & helper functions
│   ├── styles/
│   │   └── globals.css     # Tailwind base & CSS variables
│   └── locales/
│       ├── en.json         # English translations
│       └── id.json         # Indonesian translations
└── public/                 # Static files
```

---

## 💻 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run db:push` | Push Prisma schema to database (prototyping) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## 🏗️ Architecture Guide

Complete documentation for architecture, naming conventions, and best practices is available in [CODE.md](./CODE.md).

**Key Topics:**
- Naming conventions (functions, files, folders)
- Layer structure (Types, States, Services, Controllers, Components)
- React component best practices
- TanStack Query (React Query) patterns
- Zustand store management
- Zod validation schema
- API integration patterns

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

Developed by Dzikri Alan's Team

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
│   └── {folderName}/        # kebab-case, derived from endpoint (see standards/FECODE.md)
│       ├── types/           # {fileName}Types.ts — TypeScript interfaces & types
│       ├── states/          # {fileName}States.ts — Zustand stores
│       ├── services/        # {fileName}Services.ts — API call functions
│       ├── controllers/     # {fileName}Controllers.ts — TanStack Query hooks
│       └── components/      # {fileName}{Action}.tsx — React components
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

server/                       # Backend (see standards/BECODE.md)
├── config/                  # Env configuration
├── routes/                  # Mount feature routers
├── api/
│   └── features/
│       └── {folder-name}/   # dto, entities, repositories, services, controllers, module.ts
└── shared/                  # prisma, middlewares, filters, interceptors, queues, services, utils
```

---

## 💻 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database (prototyping) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## 🧭 Next Steps: Building on This Starter

After the Quick Start, every new feature must follow the documents in the [standards/](./standards) folder. Read them before writing code.

| Step | What to do | Standard |
|------|-----------|----------|
| 1 | Define the endpoint and derive names from the URL (drop base URL, `api`, `v{n}`, and dynamic segments) → `folderName`, `fileName`, `resourceName` | [FECODE.md](./standards/FECODE.md#penamaan-folder--file) |
| 2 | Design the API response contract (`success`, `data`, `error`, `pagination`, `message`) and HTTP status codes | [RESPONSE.md](./standards/RESPONSE.md) |
| 3 | Build the backend feature in `server/api/features/{folder-name}/`: DTO → Entity → Repository → Service → Controller → `module.ts`, then mount it in `server/routes/index.ts` | [BECODE.md](./standards/BECODE.md) |
| 4 | Build the frontend feature in `src/features/{folderName}/`: Types → States → Services → Controllers → Components | [FECODE.md](./standards/FECODE.md) |
| 5 | Verify: `npm run lint` and `npx tsc --noEmit` pass, and no function name uses a prefix outside the convention | [FECODE.md](./standards/FECODE.md#final-rules), [BECODE.md](./standards/BECODE.md#final-rules) |

### Frontend flow (FECODE)

```txt
src/features/{folderName}/
├── types/{fileName}Types.ts
├── states/{fileName}States.ts
├── services/{fileName}Services.ts
├── controllers/{fileName}Controllers.ts
└── components/{fileName}{Action}.tsx
```

### Backend flow (BECODE)

```txt
server/api/features/{folder-name}/
├── dto/{fileName}.dto.ts
├── entities/{fileName}.entity.ts
├── repositories/{fileName}.repository.ts
├── services/{fileName}.service.ts
├── controllers/{fileName}.controller.ts
└── module.ts
```

### Function prefixes per layer

| Layer | Prefixes |
|-------|----------|
| FE Service | `get` `post` `update` `patch` `delete` |
| FE Controller | `fetch` `store` `modify` `remove` |
| FE Component / emit | `load` `submit` `edit` `clear` |
| BE Repository | `get` `post` `update` `patch` `delete` |
| BE Service | `fetch` `store` `change` `remove` |
| BE Controller | `load` `save` `modify` `destroy` |

> Do not introduce prefixes outside these lists (e.g. `create`, `find`, `handle`, `process`).

---

## 🏗️ Architecture Guide

Complete documentation for architecture, naming conventions, and best practices lives in the [standards/](./standards) folder:

| Document | Scope |
|----------|-------|
| [FECODE.md](./standards/FECODE.md) | Frontend architecture, naming, Types/States/Services/Controllers/Components rules |
| [BECODE.md](./standards/BECODE.md) | Backend architecture, layer boundaries, error handling, Redis/queue, testing |
| [RESPONSE.md](./standards/RESPONSE.md) | Standard API response and HTTP status codes |

**Key Topics:**
- Naming conventions (functions, files, folders)
- Layer structure (FE: Types, States, Services, Controllers, Components; BE: DTO, Entity, Repository, Service, Controller, Module)
- React component best practices
- TanStack Query (React Query) patterns
- Zustand store management
- Zod validation schema
- API integration patterns
- Standard API response format

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

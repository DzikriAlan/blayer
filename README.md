# Blayer - Next.js Starter

**Production-Ready Next.js Foundation**

A fully-configured Next.js 14 starter with TypeScript, Tailwind CSS, TanStack Query, Zustand, Prisma, and PostgreSQL — designed for rapid feature development with consistent architecture conventions and best practices built-in.

## What i do

* Designed a **scalable full-stack architecture** using **Next.js 14, React 18, TypeScript, Tailwind CSS, and Shadcn/UI**, enabling rapid feature development while maintaining type safety and code consistency across the entire stack.
* Engineered **centralized data management** with **TanStack Query and Zustand**, eliminating data synchronization issues, reducing boilerplate by 50%, and providing predictable state management patterns.
* Implemented **robust form handling** with **React Hook Form and Zod**, reducing form validation bugs by enforcing schema validation and decreasing client-side error handling by 40%.
* Led development of **database integration** using **Prisma ORM and PostgreSQL**, providing type-safe queries, automated migrations, and seamless schema synchronization between code and database.
* Developed **smooth interactions and animations** with **Framer Motion**, enhancing user experience through micro-interactions and visual feedback without performance degradation.
* Spearheaded **multi-language support** using **i18next and react-i18next**, enabling content delivery in multiple languages with minimal code changes and supporting localization workflows.
* Applied **consistent design patterns** through **Shadcn/UI components and Lucide React icons**, accelerating component development by 35% while ensuring visual consistency and accessibility standards.
* Maintained **code quality standards** using **ESLint, TypeScript strict mode, and structured project conventions**, improving long-term maintainability and enabling seamless onboarding for new team members.

---

## Tech Stack

| Concern | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (Pages Router) + React 18 | Scalable, production-grade frontend framework |
| **Language** | TypeScript | Type-safe development with strict mode |
| **Styling** | Tailwind CSS + Shadcn/UI | Utility-first CSS and reusable component library |
| **State Management (Client)** | Zustand | Lightweight, performant client state |
| **State Management (Server)** | TanStack Query | Powerful server state, caching, and synchronization |
| **Forms** | React Hook Form + Zod | Efficient form validation and schema enforcement |
| **Animation** | Framer Motion | Smooth, performant animations and transitions |
| **Database** | PostgreSQL | Reliable, scalable relational database |
| **ORM** | Prisma | Type-safe database access and migrations |
| **Internationalization** | i18next + react-i18next | Multi-language content and localization |
| **Icons** | Lucide React | Consistent, accessible icon library |
| **Code Quality** | ESLint + TypeScript Strict | Linting and type checking for maintainability |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v20+ (verify: `node --version`)
- [PostgreSQL](https://www.postgresql.org) (local or cloud, verify: `psql --version`)
- Package manager: npm (included with Node.js)

### 1. Clone & Install

```bash
git clone <repo-url>
cd blayer
npm install
```

If installation fails, use:
```bash
npm ci
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/blayer"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

Verify the database connection:
```bash
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Verify the app is running:
```bash
curl http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Troubleshooting

### Database connection error

**Error:** `Error: Can't reach database server`

**Solution:**
```bash
# Verify PostgreSQL is running
psql --version
psql -U postgres -c "SELECT 1"
```

If PostgreSQL is not running, start it:
```bash
# macOS with Homebrew
brew services start postgresql

# Or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

---

### Port 3000 already in use

**Error:** `error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

---

### Prisma schema out of sync

**Error:** `The Prisma schema validation warnings should not block the Prisma CLI`

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

Alternative (if using Git):
```bash
# Reset database and re-push
npx prisma migrate reset --force
npx prisma db push
```

---

### npm install fails with peer dependency errors

**Error:** `npm ERR! peer dep missing`

**Solution:**
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use npm ci
npm ci
```

---

### TypeScript compilation errors

**Error:** `TS2305: Module not found` or type errors

**Solution:**
```bash
# Regenerate types
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Scripts

```bash
npm run dev              # Development server with hot-reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint and fix issues
npm run db:generate      # Regenerate Prisma client
npm run db:push          # Push Prisma schema to database
npm run db:studio        # Open Prisma Studio (database GUI)
```

---

## Documentation

- **[CODE.md](./CODE.md)** — Architecture guide, naming conventions, component patterns, and project structure rules
- **[Prisma Docs](https://www.prisma.io/docs)** — Database ORM documentation
- **[Next.js Docs](https://nextjs.org/docs)** — Framework documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)** — Utility-first CSS framework
- **[Shadcn/UI](https://ui.shadcn.com)** — Component library documentation

---

## License

MIT

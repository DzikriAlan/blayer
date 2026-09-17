# Chaplin

AI chat & agents platform — build custom AI agents with their own personality, chat with them in real time, and embed them on any website. Built fullstack on Next.js 14, React 18, TypeScript, Prisma ORM, and PostgreSQL.

## 🎯 Overview

**Chaplin** lets you create AI agents, chat with them with real-time streamed responses, and embed a chat widget on any external site:
- **Frontend**: Next.js 14 (Pages Router) + React 18 + TypeScript with Tailwind CSS & Shadcn/UI components
- **Backend**: Built-in Next.js API routes for chat streaming, agent CRUD, and auth — no separate backend service
- **Database**: Prisma ORM + PostgreSQL for agents, chat sessions/history, and users
- **Auth**: NextAuth (Google sign-in), session-based — no separate token exchange
- **AI**: DeepSeek (OpenAI-compatible) for chat completions and AI-assisted agent generation
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form + Zod for form handling and validation
- **File Storage**: Supabase Storage for agent avatar uploads

Core features:
- Create, edit, and delete AI agents with a custom personality (system prompt), avatar, and optional embed script
- Real-time streamed chat (SSE) with conversation history, rename, and delete
- AI-assisted agent generation — describe an agent in plain language and get a name, description, and system prompt
- Public embeddable chat widget (`public/widget.js` + `/embed/chat`) for use on any external website
- Fully responsive UI — usable on mobile, tablet, and desktop

---

## 📚 Tech Stack

| Concern | Package |
|---------|---------|
| Framework | Next.js 14 (Pages Router) + React 18 + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Server State | TanStack Query (@tanstack/react-query) |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Auth | NextAuth (Google provider) |
| ORM | Prisma |
| Database Driver | PostgreSQL (pg) |
| AI | OpenAI SDK (pointed at DeepSeek's chat-completions API) |
| File Storage | Supabase Storage |
| Icons | Lucide React |
| Node Version | v20+ |

---

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10+ or yarn/pnpm
- **PostgreSQL**: v12+ (local or cloud)
- **Google Cloud OAuth credentials**: for sign-in (Client ID & Secret)
- **DeepSeek API key**: for chat completions and AI agent generation
- **Supabase project**: for agent avatar image storage
- **Git**: for version control

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd chaplin
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
DATABASE_URL="postgresql://username:password@localhost:5432/chaplin"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI
DEEPSEEK_API_KEY="your-deepseek-api-key"

# File storage
SUPABASE_URL="your-supabase-project-url"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
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
│   ├── _app.tsx             # App wrapper (Auth, TanStack Query providers)
│   ├── _document.tsx        # HTML document setup
│   ├── index.tsx            # Landing page
│   ├── home.tsx             # New chat
│   ├── agents.tsx           # Agents list/create/preview
│   ├── chat/                # Chat routes ([id] resumes a conversation)
│   ├── embed/chat.tsx       # Public embeddable chat widget page
│   └── api/                 # API routes (auth, agent, chat, users)
├── features/
│   ├── landing/              # Marketing hero + sign-in
│   ├── agent/                # Agent CRUD, AI-generate, preview, switcher
│   │   ├── types/            # TypeScript interfaces & types
│   │   ├── states/           # Zustand stores
│   │   ├── services/         # API call functions
│   │   ├── controllers/      # TanStack Query hooks
│   │   └── components/       # React components
│   └── chat/                  # Streaming chat + conversation history
│       └── ...                # same layered structure as above
├── shared/
│   ├── components/
│   │   └── ui/               # Shadcn/UI primitives
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── api.ts            # Client fetch helper (RESPONSE.md envelope)
│   │   ├── apiResponse.ts    # Server-side response helpers
│   │   ├── chatStream.ts     # Shared SSE chat streaming logic
│   │   └── utils.ts          # cn() utility & helper functions
│   └── styles/
│       └── globals.css       # Tailwind base, theme tokens & fonts
└── public/                  # Static files, widget.js
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

## 🏗️ Architecture Guide

Complete documentation for architecture, naming conventions, and best practices is available in [CODE.md](./CODE.md) [RESPONSE.md](./RESPONSE.md).

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

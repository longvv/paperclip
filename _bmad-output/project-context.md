---
project_name: "paperclip"
user_name: "rian.vu"
date: "2026-05-01"
sections_completed: ["technology_stack"]
existing_patterns_found: 5
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Runtime**: Node.js (>= 20)
- **Package Manager**: pnpm (9.15.4)
- **Language**: TypeScript (5.7.3)
- **Backend**: Express (5.1.0)
- **Frontend**: React (19.0.0) + Vite (6.1.0)
- **Database**: PostgreSQL + Drizzle ORM (0.38.4)
- **Auth**: better-auth (1.4.18)
- **Validation**: Zod (3.24.2), Ajv (8.18.0)
- **Testing**: Vitest (3.0.5), Playwright (1.58.2)
- **Styling**: Tailwind CSS (4.0.7)

## Critical Implementation Rules

1.  **Company Scoping**: Every domain entity MUST be scoped to a company. Company boundaries MUST be enforced in all routes and services.
2.  **Contract Synchronization**: Changes to the schema (`packages/db`) MUST be synced through `packages/shared` (types/validators), `server` (routes/services), and `ui` (API clients/pages).
3.  **Single-Assignee Model**: Tasks have a single assignee; atomic issue checkout semantics apply.
4.  **Activity Logging**: All mutating actions MUST write an entry to the activity log.
5.  **Drizzle Flow**: When changing the data model:
    - Edit `packages/db/src/schema/*.ts`.
    - Export new tables from `packages/db/src/schema/index.ts`.
    - Run `pnpm db:generate`.
    - Validate with `pnpm -r typecheck`.
6.  **API Structure**: Base path is `/api`. Return consistent HTTP errors (400, 401, 403, 404, 409, 422, 500).

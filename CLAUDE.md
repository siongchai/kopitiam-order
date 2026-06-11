# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kopitiam Order — a web app for group ordering Singapore kopitiam/hawker centre drinks (kopi, teh, milo, etc.). One person creates an order, shares a link/QR code, others add their drinks, organizer sees a consolidated summary to read off at the stall.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Prisma schema changes to SQLite
npm run db:generate  # Regenerate Prisma client
```

After changing `prisma/schema.prisma`, run `npm run db:push` to sync the database.

## Architecture

**Stack:** Next.js 14 (App Router) + Prisma/SQLite + Tailwind CSS

**Real-time:** In-memory pub/sub (`src/lib/events.ts`) pushes Server-Sent Events to connected clients via `/api/orders/[id]/events`. API routes call `notify(orderId)` after mutations. The client uses `EventSource` with a 30s fallback poll.

**Auth model:** No login. Organizer identity is a random token stored in an httpOnly cookie (`organizer_<orderId>`). Anyone with the link can add drinks.

**Drink name generation:** `src/lib/drinks.ts` defines all kopitiam drink bases and modifiers. `buildDrinkName()` composes the canonical name (e.g. "Kopi-C Siu Dai Peng") from structured selections. `getDrinkIcon()` maps a drink name back to its emoji.

**Key data flow:**
- `POST /api/orders` → creates GroupOrder, sets organizer cookie, returns id
- `GET /api/orders/[id]` → returns order + drinks + `isOrganizer` flag (derived from cookie)
- `POST /api/orders/[id]/drinks` → adds drink, calls `notify()` for SSE
- `GET /api/orders/[id]/events` → SSE stream, pushes "update" on every mutation

**Database:** SQLite file at `prisma/dev.db` (gitignored). Two tables: `GroupOrder` and `DrinkOrder` linked by `groupId`.

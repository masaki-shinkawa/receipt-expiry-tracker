# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint (zero warnings policy)
```

## Architecture

**賞味期限トラッカー** — PWA for tracking food expiry dates via receipt scanning.

### Stack
- React 18 + Vite 5 + Tailwind CSS v3
- Google Apps Script (GAS) as backend API + Google Spreadsheet as DB
- OpenAI GPT-4o Vision (receipt scanning), text-embedding-3-small/256dim (expiry DB search)
- Cloudflare Pages for deployment

### Data flow
All mutations use **optimistic update** first, then sync to GAS best-effort. localStorage (`receipt_tracker_products`, `receipt_tracker_settings`) always stays in sync as offline cache. On mount, GAS is fetched if URL is configured, otherwise localStorage is used.

### GAS API
All endpoints use a single URL (server-side fixed, not user-configurable):
- `GET ?action=getProducts` — fetch all products
- `POST` with JSON body `{ action, ...params }` for all mutations
- Common response format: `{ success: boolean, data: object|null, error: string|null }`
- GAS requires `Access-Control-Allow-Origin: *` and frontend must use `redirect: "follow"`

### Expiry DB matching (Phase 4)
Two-stage lookup: ① string fuzzy match (katakana/hiragana normalization + partial match, no API) → ② embedding similarity via GAS if score is low (text-embedding-3-small, 256 dimensions, stored pre-computed in Spreadsheet `expiryDB` sheet).

### State management
No external state library. Two custom hooks own all state:
- `useProducts` (`src/hooks/useProducts.js`) — product CRUD + GAS sync + localStorage cache
- `useSettings` (`src/hooks/useSettings.js`) — settings persisted to localStorage only

### Component structure
```
App.jsx               — layout shell, tab routing (list|scan), modal orchestration
components/
  ProductList.jsx     — filtered/sorted product list
  Scanner.jsx         — camera + gallery capture → GAS scan
  ManualAddModal.jsx  — manual entry form with AI button
  EditModal.jsx       — edit/delete existing product
  SettingsModal.jsx   — notification settings
  BottomNav.jsx       — tab switcher
```

### PWA / notifications
`vite-plugin-pwa` + Workbox — to be added in Phase 5. Push notifications use VAPID + GAS daily trigger (background push only — no local Notification API). iOS requires home screen install; show banner when detected but not in standalone mode.

### Development phases
See [GitHub Wiki](https://github.com/masaki-shinkawa/receipt-expiry-tracker/wiki) and issues #2–#9 for phase breakdown. Currently in Phase 1 (UI components, no GAS).

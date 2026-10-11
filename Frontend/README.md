# CareLine Frontend

React + Vite desk for the Hospital Agent backend.

Stack: **Tailwind CSS v4**, **shadcn/ui**, **TanStack Query**, React Router.

## Run

```bash
# terminal 1 — backend
cd ../Backend && npm run dev

# terminal 2 — frontend
cd Frontend && npm run dev
```

Open http://localhost:5173

Vite proxies `/api` → `http://localhost:3000`.

## Pages

- **Home** — product overview
- **Doctors** — create / list (role: admin)
- **Slots** — single + bulk availability
- **Book** — text booking (same path as voice intent)
- **Patients** — create / lookup by phone

Use the sidebar **Acting as** role selector for protected APIs (`role` header).

## UI toolkit

```bash
npx shadcn@latest add <component>
```

Components live in `src/components/ui`.

# Dashboard Boilerplate

React + TypeScript dashboard with [shadcn/ui](https://ui.shadcn.com), login/logout, and a ready structure for building on.

## Stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **shadcn/ui** (New York style, neutral)
- **React Router v6**
- **Lucide React** icons

## Structure

```
src/
├── components/
│   ├── ui/           # shadcn components (button, input, card, etc.)
│   ├── dashboard/    # layout: sidebar, header, dashboard-layout
│   └── protected-route.tsx
├── contexts/
│   └── auth-context.tsx   # login/logout state (replace with your API)
├── lib/
│   └── utils.ts
├── pages/
│   ├── login.tsx
│   └── dashboard/    # home, analytics, documents, projects, settings
├── App.tsx
├── main.tsx
└── index.css
```

## Auth (boilerplate)

- **Login**: any email + password (no validation); user is stored in `localStorage`.
- **Logout**: clears user and redirects.
- Replace the logic in `src/contexts/auth-context.tsx` with your real API.

## Commands

```bash
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview
```

## Adding more shadcn components

```bash
npx shadcn@latest add sidebar
npx shadcn@latest add table
# etc.
```

## Routes

| Path       | Description        | Protected |
|-----------|--------------------|-----------|
| `/login`  | Sign in            | No        |
| `/`       | Dashboard home     | Yes       |
| `/analytics` | Analytics       | Yes       |
| `/documents` | Documents       | Yes       |
| `/projects`  | Projects        | Yes       |
| `/settings`  | Settings        | Yes       |

Unauthenticated users are redirected to `/login`; after login they are sent back to the page they tried to open.

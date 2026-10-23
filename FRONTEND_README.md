# PropMatch frontend (Poojitha's area)

This covers `app/` (outside `app/api/`), `components/`, `public/`, `services/`, `context/`,
`hooks/`, `utils/`, `types/`, `mocks/` and `proxy.ts` — see `PROPMATCH_PROJECT_SPEC.md`
Section 15.1 for the full ownership split.

## Running it stand-alone (no backend yet)

```bash
npm install
cp .env.example .env.local     # NEXT_PUBLIC_USE_MOCKS=true is already set
npm run dev
```

Every page works against `services/mock/store.ts`, an in-memory fake backend that
matches the shapes in `PROPMATCH_PROJECT_SPEC.md` Section 10 exactly. It now has a
real (in-memory) accounts table: you must **register** an account before you can
**log in** with it, exactly like the real system will behave. Six accounts are
pre-registered so the test credentials from spec Section 18.6 work immediately:

| Email | Password | Role |
|---|---|---|
| `admin@propmatch.test` | `Test@1234` | Admin |
| `agent1@propmatch.test` | `Test@1234` | Agent (verified) |
| `agent2@propmatch.test` | `Test@1234` | Agent (verified) |
| `agent3@propmatch.test` | `Test@1234` | Agent (**unverified** — for the verification-queue demo) |
| `buyer1@propmatch.test` | `Test@1234` | Buyer |
| `buyer2@propmatch.test` | `Test@1234` | Buyer |

Any account you register yourself is added to this same in-memory table and works
immediately — the mock state just resets whenever the dev server restarts, since
nothing here is written to a real database yet.

## Switching to the real API

Once Bhuvana's routes under `app/api/` are up, flip one line in `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCKS=false
```

No page or component changes needed — every page calls the functions in
`services/*.ts`, and those functions are the only place that knows about the
mock/real switch.

## What's implemented

- **Public**: home (`/`), listings with filters/search/sort/pagination (`/properties`),
  property detail with gallery, specs, amenities, agent card, price history chart,
  similar properties, enquiry + visit-booking modals (`/properties/[id]`), login,
  register (with agent fields)
- **Buyer** (route-guarded by `proxy.ts`): favourites, recommendations with match
  score + reasons, preferences editor, my enquiries, my site visits
- **Agent** (route-guarded): dashboard with KPIs, listing management (create, edit,
  deactivate/reactivate, mark sold/rented), enquiries inbox, visit requests
- **Admin** (route-guarded): analytics dashboard, user management, agent
  verification queue, listing moderation
- **Shared**: navbar (role-aware links), footer, toast notifications, loading /
  empty / error states on every data page, `AuthContext` wired to `GET /api/auth/me`

## Conventions

- Every field name matches `types/api.ts`, which mirrors spec Section 10 exactly.
  If Bhuvana's API ever returns something different, fix it in one of two places:
  her route handler, or `types/api.ts` + this app — never silently reshape data
  in a component.
- `utils/schemas.ts` has temporary Zod validation copied from spec Section 12.
  Once `lib/validators/*` exists on her side, both sides should import from there
  instead (spec Section 18.8).

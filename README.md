# Huo App

The creative network connecting Ohio’s creative community — UI foundation and app codebase.

**Repository:** https://github.com/Rob-code-94/HUO-APP  
**Landing (Vercel):** https://huo-app.vercel.app  
**UI kit demo:** https://huo-app.vercel.app/app  
**Google AI Studio app:** https://ai.studio/apps/a17ea1b2-e391-4d40-9790-36ecc7066132

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Editorial talent-call landing (link-in-bio) |
| `/join` | Talent-call form for creatives |
| `/hire` | Hire-interest form for businesses |
| `/app` | Interactive UI kit / wireframes |

## Intake forms

Both forms live in `src/components/shadcn-space/blocks/forms-06/` and share styles from `form-kit.tsx`.
Rows land in Supabase (`supabase/migrations/`); the public key can only insert.

| Form | Where | Table |
| --- | --- | --- |
| Talent call (multi-step) | `/join` (old `/#talent-call` links redirect) | `talent_call_submissions` |
| Hire interest | `/hire` | `business_interest_submissions` |

**Tracking where signups come from.** Each form saves `?utm_source=` into the `source` column.
Share tagged links so Studio shows which channel works:

| Channel | Link |
| --- | --- |
| Instagram bio | `/?utm_source=ig_bio` |
| Instagram stories | `/join?utm_source=ig_story` |
| Collaborator posts | `/join?utm_source=collab_<handle>` |
| Business outreach | `/hire?utm_source=outreach` |
| Thank-you share button | `referral` (set automatically) |

**Link preview image.** `public/og.png` and `public/apple-touch-icon.png` are rendered from
`scripts/og/*.html`. After editing those, run `./scripts/og/render.sh` (needs Google Chrome).
The absolute URLs in the `og:` tags in `index.html` use the Vercel domain; change them if Huo
moves to a custom domain.

## Workflow (locked)

| Stage | Tool |
| --- | --- |
| Edit UI / explore layouts | Google AI Studio |
| Shareable client demo | **Vercel** (free Hobby) |
| Fixes, backend, final pack | **Cursor** |

Full detail: [`docs/WORKFLOW.md`](docs/WORKFLOW.md)

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

## What’s in this repo

| Path | Purpose |
| --- | --- |
| `src/pages/LandingPage.tsx` | Editorial landing poster |
| `src/` | Interactive UI kit, screens, wireframes |
| `docs/PRODUCT-BIBLE.md` | Authoritative product bible |
| `docs/FOUNDATION.md` | Condensed working summary |
| `docs/WORKFLOW.md` | Studio → Vercel → Cursor process |
| `Design Reference/` | Milanote screenshots, wireframes, brand references |

## Docs

1. [`docs/PRODUCT-BIBLE.md`](docs/PRODUCT-BIBLE.md)
2. [`docs/FOUNDATION.md`](docs/FOUNDATION.md)
3. [`docs/WORKFLOW.md`](docs/WORKFLOW.md)

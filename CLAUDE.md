# NEU Home Services — Claude Code Guide

## Project Overview
Next.js 15 lead-generation site for home improvement services. Each service page collects leads via a multi-step wizard form, validates ZIP codes against Supabase, and routes submissions to the right contractor by email.

## Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL) — one table per service for leads, one table per service for ZIP codes
- **CMS**: Payload CMS at `http://admin.neuhomeservices.com/admin/` (proxied via `/cms-api/*`)
- **Analytics**: PostHog (proxied via `/ingest/*`), Facebook Pixel, Microsoft Clarity
- **Phone validation**: Trestle API (`/api/validate-phone`)
- **Email**: Brevo (`/api/sendEmail`)
- **A/B testing**: PostHog feature flags + middleware cookie assignment

## Dev Commands
```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build (lint disabled)
npm run lint     # ESLint
npx tsc --noEmit # type-check only
```

## Key Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_API_KEY` | Supabase client |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Analytics |
| `BREVO_API_KEY` | Email sending |
| `TRESTLE_API_KEY` | Phone validation |
| `IPINFO_TOKEN` | IP geolocation |
| `FACEBOOK_PIXEL_ID` | Meta Pixel |
| `EXP_LANDING_SLUGS` | Comma-separated slugs for A/B testing |
| `NEXT_PUBLIC_AB_TIMEOUT_MS` | A/B variant fetch timeout (default 800ms) |
| `PAYLOAD_URL` | CMS base URL |
| `CACHE_REVALIDATE_SECRET` | On-demand revalidation secret |

## Project Structure
```
src/
├── app/
│   ├── (service)/[id]/     # Service landing pages (main lead-gen pages)
│   ├── (pages)/pages/[slug]/ # CMS-driven content pages
│   ├── (main)/             # Homepage and main site pages
│   ├── thank-you/          # Post-submission thank-you page
│   ├── version/[slug]/[variant]/ # A/B test variants
│   └── api/                # API routes (sendEmail, validate-phone, getIP, ab-variant)
├── components/
│   ├── sections/WizardCard.tsx    # Inline wizard form (radio questions → contact info)
│   ├── SubmitForm/SubmitForm.tsx  # Modal step-by-step form (used in ZipSearchForm)
│   ├── DetailsPage/ZipSearchForm/ # ZIP validation → opens SubmitForm modal
│   └── ContactForm/               # Contact Us page form
├── lib/
│   ├── normalize-cms-questions.ts # Normalizes CMS question data → typed Step objects
│   ├── validate-service-zip.ts    # Supabase ZIP lookup helper
│   └── api.ts                     # CMS fetch helpers (fetchHeader, getServicesBySlug, etc.)
├── middleware.js                  # A/B variant assignment via cookies
└── providers/PostHogProvider.tsx  # PostHog init + page_view tracking
```

## Form Architecture
Two separate form implementations exist:

**WizardCard** (`src/components/sections/WizardCard.tsx`)
- Fully inline, no modal named as LP3
- Radio question steps → combined name/email/ZIP/phone step → submit
- Handles ZIP validation internally, no pre-check required
- Used on newer LP variants

**SubmitForm** (`src/components/SubmitForm/SubmitForm.tsx`)
- Multi-step modal wizard (opened by ZipSearchForm after ZIP match) 
- ZIP must be validated first in ZipSearchForm before the modal opens
- Questions driven by `questions` prop (always pass through `normalizeWizardRadioQuestionsFromCms()`)

## Critical Patterns

### Duplicate submission prevention
Both form components use a `useRef` guard — not just state — because state updates are async:
```ts
const submitGuardRef = useRef(false);
// In handler:
if (submitGuardRef.current) return;
submitGuardRef.current = true;
// ... in finally:
submitGuardRef.current = false;
```

### Passing questions to SubmitForm
Always normalize CMS questions before passing — never pass raw `serviceData.questions`:
```ts
questions={normalizeWizardRadioQuestionsFromCms(serviceData.questions, serviceData.openingWizard) as any}
```
`serviceData.questions` can be `null` for some services; the normalizer safely returns `[]`.

### Supabase lead insertion
Each service has its own table name stored in `serviceData.serviceRequest`. Always guard against null:
```ts
const table = typeof serviceData?.serviceRequest === "string" ? serviceData.serviceRequest.trim() : "";
if (!table) { /* demo mode */ return; }
```

### Thank-you page data
Passed via `sessionStorage` key `neu_ty` (set before `window.location.href` redirect):
```ts
sessionStorage.setItem("neu_ty", JSON.stringify({ companyName, heroImage, contactPhone, customerLogo, returnUrl }));
window.location.href = `/thank-you?s=${encodeURIComponent(service)}`;
```

### A/B testing middleware
`src/middleware.js` rewrites slugs in `EXP_LANDING_SLUGS` to `/version/[slug]/[variant]`. The thank-you page and API routes are unaffected.

## Supabase Tables
- **ZIP tables**: queried with `.eq("Zip_Code", zip).eq("Service_Slug", service)` — columns: `Zip_Code`, `City`, `State`, `Service`, `Company name`, `Lead Delivery Email`
- **Lead tables**: one per service, named by `serviceData.serviceRequest` — columns vary by service but always include `fullName`, `Email`, `phoneNumber`, `Zip_code`, `city`, `state`, `firstName`, `lastName`, `ip_address`, `os`, `browser`, `utm_source`

## Do Not
- Pass `serviceData.questions` directly to `SubmitForm` — always normalize first
- Use `useState` alone as a submit guard — always pair with `useRef`
- Add comments explaining what code does — only comment non-obvious WHY
- Create new API routes without checking if `/api/sendEmail` or existing routes cover the need

# FinLife — Schweizer Finanz-App mit Gamification

FinLife ist eine umfassende Finanz-App für die Schweiz: Vermögens- und Budget-Tracking, Säule-3a-Rechner, Steueroptimierung, gamifizierte Lernreise (PeakScore, XP, Badges, Streaks), KI-gestützter Finanz-Coach und ein vollständiges CRM für Beraterinnen und Berater.

Gebaut mit **React + Vite + TypeScript + Tailwind + shadcn/ui** und **Supabase** (Auth, Datenbank, Storage, Edge Functions).

---

## Quickstart (lokal)

Voraussetzungen: **Node.js 20+** und **npm** (oder bun/pnpm).

```sh
# 1. Repo klonen
git clone <REPO_URL>
cd <PROJECT_DIR>

# 2. Dependencies installieren
npm install

# 3. Environment-Datei einrichten
cp .env.example .env
# danach .env mit echten Werten füllen (siehe unten)

# 4. Dev-Server starten
npm run dev
```

Die App läuft anschliessend unter `http://localhost:8080`.

---

## Environment Variables

Alle Frontend-Variablen müssen mit `VITE_` beginnen, damit Vite sie ins Bundle exposed.

| Variable                        | Pflicht | Beschreibung                                                  |
| ------------------------------- | :-----: | ------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             |    ✓    | Projekt-URL (z. B. `https://xxxx.supabase.co`)                |
| `VITE_SUPABASE_PUBLISHABLE_KEY` |    ✓    | Anon/Publishable Key des Supabase-Projekts                    |
| `VITE_SUPABASE_PROJECT_ID`      |    ✓    | Projekt-Ref (Subdomain-Teil der Supabase-URL)                 |
| `SUPABASE_URL`                  |    –    | Spiegel von `VITE_SUPABASE_URL` für lokale Skripte (optional) |
| `SUPABASE_PUBLISHABLE_KEY`      |    –    | Spiegel des Anon-Keys für lokale Skripte (optional)           |

Eine fertige Vorlage liegt in **`.env.example`**.

> Wichtig: In Lovable wird `.env` automatisch generiert. Die Datei darf nicht committed werden.

---

## Edge Functions & benötigte Secrets

Alle Edge Functions liegen in `supabase/functions/`. Sie laufen auf Deno und werden bei jedem Deploy automatisch publiziert. Die folgenden Secrets müssen im Supabase-Projekt unter **Settings → Edge Functions → Secrets** gesetzt sein:

### Immer benötigt
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### KI-Funktionen (Lovable AI Gateway)
- `LOVABLE_API_KEY` — verwendet von:
  - `coach-analyze` — analysiert Coach-Antworten und erzeugt Empfehlungen
  - `generate-xray` — erstellt den monatlichen Finanz-Röntgenblick
  - `analyze-3a` — analysiert hochgeladene 3a-Dokumente
  - `extract-document` — KI-Extraktion aus Belegen / Verträgen

### Stripe (Premium-Abo)
- `STRIPE_SECRET_KEY` — verwendet von:
  - `create-checkout` — startet die Stripe-Checkout-Session
  - `customer-portal` — öffnet das Stripe-Billing-Portal
  - `check-subscription` — synchronisiert den Abo-Status

### Übersicht aller Edge Functions

| Function                   | Zweck                                            | Secret                |
| -------------------------- | ------------------------------------------------ | --------------------- |
| `admin-create-user`        | Admin legt neuen Benutzer an                     | Service-Key           |
| `admin-list-users`         | Admin listet Benutzer mit Auth-Daten             | Service-Key           |
| `admin-manage-user`        | Admin aktualisiert / löscht Benutzer             | Service-Key           |
| `admin-resend-invite`      | Einladungs-E-Mail erneut versenden               | Service-Key           |
| `analyze-3a`               | KI-Analyse von 3a-Dokumenten                     | LOVABLE_API_KEY       |
| `check-subscription`       | Abo-Status mit Stripe abgleichen                 | STRIPE_SECRET_KEY     |
| `cleanup-trash`            | Soft-deleted Datensätze nach 30 Tagen entfernen  | Service-Key           |
| `coach-analyze`            | KI-gestützte Coach-Analyse                       | LOVABLE_API_KEY       |
| `create-checkout`          | Stripe-Checkout-Session erstellen                | STRIPE_SECRET_KEY     |
| `customer-portal`          | Stripe-Billing-Portal öffnen                     | STRIPE_SECRET_KEY     |
| `extract-document`         | KI-Datenextraktion aus Belegen                   | LOVABLE_API_KEY       |
| `generate-xray`            | Monatlicher Finanz-Röntgenblick                  | LOVABLE_API_KEY       |
| `submit-lead`              | Öffentlicher Lead-Eingang (mit Rate-Limit)       | Service-Key           |
| `verify-strategy-password` | Server-side Passwortprüfung für Strategie-Seiten | Service-Key           |

---

## Datenbank & Migrationen

Das Schema ist in `supabase/migrations/` versioniert (122 Migrationsdateien). Für ein lokales Setup mit der Supabase CLI:

```sh
supabase start
supabase db reset  # spielt alle Migrationen ein
```

Ohne CLI kann gegen das gehostete Supabase-Projekt gearbeitet werden — dann reichen die `VITE_SUPABASE_*` Variablen.

---

## Verfügbare Skripte

```sh
npm run dev        # Dev-Server (Port 8080)
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal preview
npm run lint       # ESLint
```

---

## Tech-Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind v3, shadcn/ui, Framer Motion, Recharts, React Router, TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions auf Deno)
- **KI**: Lovable AI Gateway (Gemini 2.5 / GPT-5)
- **Payments**: Stripe (Subscription)
- **PDF/Export**: html2canvas, jspdf

---

## Deployment

Die App wird via **Lovable** deployed: jeder Push auf `develop` wird automatisch publiziert. Der Production-Build ist eine reine statische SPA, die auf jedem Static-Host (Vercel, Netlify, Cloudflare Pages, Nginx) läuft — Vite gibt das fertige Bundle in `dist/` aus.

---

## Lizenz

Proprietär — © Daniel Seglias.

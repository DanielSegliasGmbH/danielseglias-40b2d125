
# Event-Tracking-System — Implementierungsplan

## Übersicht

Aufbau eines zentralen, nicht-blockierenden Event-Tracking-Systems. Bestehende Logik (Gamification, Memories, Auth) bleibt unverändert. Alles wird additiv hinzugefügt.

---

## 1. Datenbank: Neue Tabelle `tracking_events`

Migration erstellt eine Tabelle mit folgenden Spalten:

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| id | uuid PK | |
| user_id | uuid | auth.uid(), nullable für anonyme Events |
| session_id | text | Client-generierte Session-ID |
| event_type | text | z.B. page_view, login, tool_opened |
| event_name | text | Detailname, z.B. "inflationsrechner" |
| page_path | text | window.location.pathname |
| page_title | text | document.title |
| module_key | text | optional |
| tool_key | text | optional |
| content_key | text | optional |
| duration_seconds | numeric | optional |
| metadata | jsonb | flexibel erweiterbar |
| created_at | timestamptz | now() |

RLS-Policies:
- Users können eigene Events einfügen (`user_id = auth.uid()`)
- Users können eigene Events lesen
- Admins können alle Events lesen
- Kein UPDATE/DELETE für normale User

Index auf `(user_id, created_at)` und `(event_type)` für spätere Queries.

---

## 2. Session-Tracking: Neue Tabelle `tracking_sessions`

| Spalte | Typ |
|--------|-----|
| id | text PK (client-generierte UUID) |
| user_id | uuid |
| started_at | timestamptz |
| last_activity_at | timestamptz |
| ended_at | timestamptz (nullable) |
| user_agent | text |
| metadata | jsonb |

RLS: Gleich wie tracking_events (insert/select own, admin select all). Zusätzlich update own für heartbeat.

---

## 3. Zentraler Hook: `src/hooks/useTracking.ts`

Neuer Hook mit folgender API:

```text
const { trackEvent } = useTracking();

trackEvent({
  eventType: 'tool_opened',
  eventName: 'inflationsrechner',
  toolKey: 'inflationsrechner',
  metadata: { source: 'dashboard' }
});
```

Intern:
- **Session-Management**: Erzeugt eine `session_id` (UUID in sessionStorage), sendet `session_start` beim ersten Aufruf
- **Fire-and-forget**: Alle DB-Inserts laufen async ohne await, Fehler werden nur geloggt (`console.warn`)
- **Automatisch**: `user_id`, `session_id`, `page_path`, `page_title` werden automatisch gesetzt
- **Session-End**: `beforeunload`-Event sendet `session_end` via `navigator.sendBeacon` (best-effort)
- **Heartbeat**: Aktualisiert `last_activity_at` in `tracking_sessions` alle 60s

---

## 4. Page-View-Tracker: `src/components/PageViewTracker.tsx`

Kleine Komponente in `App.tsx` eingebunden:
- Lauscht auf `useLocation()` Änderungen
- Sendet automatisch `page_view` Events
- Kein UI-Output (returns null)

---

## 5. Basis-Integrationen (additive Änderungen)

| Stelle | Event | Aufwand |
|--------|-------|--------|
| `useAuth.tsx` signIn | `login` | +3 Zeilen |
| `useAuth.tsx` signOut | `logout` + `session_end` | +3 Zeilen |
| `App.tsx` | `<PageViewTracker />` einbinden | +1 Zeile |
| `ChatDrawer.tsx` | `chat_opened`, `chat_message_sent` | +4 Zeilen |

Keine bestehende Logik wird verändert. Keine UI-Änderungen.

---

## 6. Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| **NEU** `src/hooks/useTracking.ts` | Zentraler Tracking-Hook + Session-Logic |
| **NEU** `src/components/PageViewTracker.tsx` | Automatisches Page-View-Tracking |
| **NEU** Migration SQL | tracking_events + tracking_sessions Tabellen |
| `src/hooks/useAuth.tsx` | +5 Zeilen: login/logout Events |
| `src/App.tsx` | +2 Zeilen: Import + PageViewTracker |
| `src/components/client-portal/ChatDrawer.tsx` | +4 Zeilen: chat Events |

---

## 7. Was bewusst NICHT gemacht wird

- Kein Admin-Dashboard / UI
- Keine Tool-spezifischen Integrationen (API ist bereit)
- Keine Aggregations-Views / Export

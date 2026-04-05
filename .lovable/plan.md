## Erinnerungszentrale – Implementierungsplan

### 1. Datenbank (Migration)
- Neue Tabelle `memories` mit: user_id, tool_slug, action, title, input_data (jsonb), output_data (jsonb), created_at
- RLS: Nutzer sehen nur eigene Einträge, Admins sehen alle

### 2. Hook: `useMemories`
- CRUD-Operationen für Erinnerungen
- Pagination (20 pro Seite)
- Filter nach Tool und Zeitraum
- Suchfunktion

### 3. Hook: `useMemorySnapshot`
- Einfache Funktion `saveSnapshot(toolSlug, action, inputData, outputData)` 
- Wird in Tools aufgerufen wenn Ergebnis berechnet wird
- **Additiv** – keine bestehende Logik wird verändert

### 4. Neue Seite: `/app/client-portal/memories`
- Timeline-Darstellung gruppiert nach Datum
- Detailansicht per Dialog
- „Erneut öffnen" Button → navigiert zum Tool mit State

### 5. Navigation
- Neuer Eintrag in BottomNavigation/MoreSheet
- Icon: Clock/History

### 6. Tool-Integration (Phase 1 – 3 Tools)
- Inflationsrechner, Finanzcheck, Mini-3a-Kurzcheck
- Snapshot wird beim Ergebnis-Schritt gespeichert
- Beim Öffnen via Memory werden gespeicherte Daten geladen

### Nicht verändert:
- Bestehende Tool-Logik bleibt unberührt
- Bestehende Navigation bleibt stabil
- Nur additive Ergänzungen

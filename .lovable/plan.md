## Meta-Profil – Implementierungsplan

### 1. Datenbank (2 Migrationen)
**Tabelle `meta_profiles`** – Zentrale User-Daten:
- user_id (unique), monthly_income, fixed_costs, savings_rate, wealth, debts, age, occupation, financial_goal, tax_burden, risk_tolerance
- last_confirmed_at (für 90-Tage-Check)
- RLS: Nur eigene Daten lesen/schreiben

**Tabelle `meta_profile_history`** – Versionierung:
- user_id, field_name, old_value, new_value, source (tool_slug), created_at
- RLS: Nur eigene lesen, Insert nur eigene

### 2. Hook: `useMetaProfile`
- Liest/schreibt Meta-Profil des aktuellen Users
- `updateField(field, value, source)` → aktualisiert Profil + schreibt History + speichert Erinnerung
- `getFieldValue(field)` → aktuellen Wert holen
- `needsCheckup` → true wenn last_confirmed_at > 90 Tage
- `confirmProfile()` → setzt last_confirmed_at auf jetzt

### 3. Komponente: `MetaProfilePrefill`
- Wrapper-Komponente für Input-Felder
- Zeigt "Vorausgefüllt aus deinem Profil" Badge
- Bei Änderung: Toast mit "Dauerhaft aktualisieren?" Option

### 4. Seite: `/app/client-portal/profile-data`
- "Mein Finanzprofil" – alle Meta-Daten editierbar
- Visuell gruppiert (Finanzen, Persönlich)
- Letzter Check-Up Status

### 5. Tool-Integration (Phase 1 – 3 Tools)
- Inflationsrechner, Finanzcheck, Mini-3a-Kurzcheck
- Felder werden aus Meta-Profil vorausgefüllt
- **Additiv** – bestehende Logik bleibt unberührt

### 6. 90-Tage Check-Up
- Banner auf Dashboard wenn `needsCheckup === true`
- Link zur Profil-Seite

### Nicht verändert:
- Bestehende Tool-Berechnungslogik
- Bestehende Navigation (Seite nur über Dashboard/Profil erreichbar)
- Erinnerungssystem bleibt getrennt


## Übersicht

Die App wird in 5 klar getrennten Modulen zur produktiven Kundenversion weiterentwickelt. Jedes Modul wird einzeln umgesetzt und getestet.

---

### Modul 1: Benutzer- & Login-Management

**Was bereits existiert:**
- Admin kann Benutzer erstellen (Edge Function `admin-create-user`)
- Rollen-System (admin/staff/client) mit `user_roles` Tabelle
- Login/Signup Seiten, Passwort-Änderung im Profil
- E-Mail-Verifizierung ist standardmässig aktiv

**Was neu kommt:**
- **Einladungsflow**: Beim Erstellen eines Benutzers wird automatisch eine Einladungsmail versendet → Nutzer setzt eigenes Passwort über einen Link
- **Passwort vergessen**: Dedizierter Flow mit "Passwort vergessen"-Link auf der Login-Seite und `/reset-password`-Seite
- **Admin-Übersicht erweitern**: Anzeige von Einladungsstatus, letztem Login, Aktivierungsstatus in der Benutzerverwaltung
- **Fehlerbehandlung**: Saubere Meldungen für alle Edge Cases (E-Mail vergeben, Link abgelaufen etc.)

**Technisch:**
- Edge Function `admin-create-user` anpassen → Einladungs-E-Mail statt sofortige Aktivierung
- Neue Seite `/reset-password` für Passwort-Zurücksetzen
- "Passwort vergessen"-Link auf Login-Seite

---

### Modul 2: Admin-Schaltzentrale (Freigaben & Sichtbarkeit)

**Was bereits existiert:**
- `customer_portal_settings` Tabelle mit Toggles pro Kunde (show_tools, show_library, show_strategies etc.)
- Tools-Tabelle mit `enabled_for_clients` Flag

**Was neu kommt:**
- **Standard-Freigaben**: Neue Tabelle `default_portal_settings` – definiert, was ALLE Kunden standardmässig sehen
- **Individuelle Abweichungen**: Pro Kunde können einzelne Bereiche abweichend aktiviert/deaktiviert werden, mit klarer Kennzeichnung "weicht vom Standard ab"
- **Granulare Tool-Freigabe**: Pro Kunde einzelne Tools freischalten/sperren (neue Tabelle `customer_tool_access`)
- **Admin-UI**: Neue Schaltzentrale mit Kategorien (Übersicht, Werkzeugkiste, Wissensbibliothek, Anlagestrategien, Mehr) und Toggle-Switches
- **Suchfunktion** für Nutzer in der Freigabe-Verwaltung

---

### Modul 3: Mobile Bottom Navigation anpassen

**Was bereits existiert:**
- `BottomNavigation.tsx` im Client-Portal mit Home, Tasks, Goals, Library, Mehr

**Was sich ändert:**
- Neue Reihenfolge: **Übersicht → Werkzeugkiste → Wissensbibliothek → Anlagestrategien → Mehr**
- Icons und Labels anpassen
- Bestehende mobile Optimierungen beibehalten

---

### Modul 4: In-App-Benachrichtigungssystem

**Was neu kommt:**
- **Neue Tabellen**: `notifications` (Titel, Text, Link, Zielgruppe, Status, Veröffentlichungsdatum) + `notification_recipients` (gelesen/ungelesen) + `notification_exclusions`
- **Admin-UI**: Benachrichtigungen erstellen, Zielgruppe wählen, einzelne Personen ausschliessen, Entwurf/Veröffentlicht
- **Kunden-UI**: Benachrichtigungsliste mit gelesen/ungelesen-Status, Badge-Indikator
- **Architektur** für spätere echte Push-Notifications vorbereitet

---

### Modul 5: App aufräumen & entschlacken

**Was sich ändert:**
- Unfertige Bereiche (z.B. Kurse, bestimmte Tools) für Kunden ausblenden, für Admin weiterhin sichtbar
- Navigation entschlacken – sekundäre Inhalte nach "Mehr" verschieben
- Überladene Dashboards reduzieren
- Fokus auf Kernfunktionen: Übersicht, Werkzeugkiste, Wissensbibliothek, Anlagestrategien

---

### Reihenfolge der Umsetzung

1. **Modul 3** (Navigation) – schnell, Grundlage für alles Weitere
2. **Modul 1** (Login/Einladung) – kritisch für echte Nutzer
3. **Modul 2** (Freigaben) – Zugriffssteuerung
4. **Modul 5** (Aufräumen) – Klarheit schaffen
5. **Modul 4** (Benachrichtigungen) – Nice-to-have, am Ende

Soll ich mit diesem Plan starten?

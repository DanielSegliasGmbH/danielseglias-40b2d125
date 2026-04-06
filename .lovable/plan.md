# Automations-Engine — Implementierungsplan

## Übersicht
Aufbau eines einfachen, stabilen Regelsystems nach dem Prinzip «Wenn X, dann Y». Bestehende Freigabe-, Tracking- und Nutzerlogik wird wiederverwendet. Kein visueller Automation-Builder — nur solides Fundament.

---

## 1. Datenbank: Neue Tabellen

### `automation_rules`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid | PK |
| name | text | Regelname (z.B. «Nach erstem Login → Onboarding») |
| description | text | Kurzbeschreibung |
| is_active | boolean | Regel aktiv/inaktiv |
| condition_type | text | z.B. `first_login`, `tool_completed`, `sessions_reached`, `days_inactive`, `event_occurred` |
| condition_config | jsonb | Bedingungsparameter (z.B. `{"tool_key": "finanzcheck"}`) |
| action_type | text | z.B. `unlock_tool`, `unlock_module`, `set_flag`, `set_portal_section` |
| action_config | jsonb | Aktionsparameter (z.B. `{"tool_key": "inflationsrechner"}`) |
| priority | int | Ausführungsreihenfolge |
| scope | text | `global` / `segment` / `individual` |
| created_by | uuid | Admin-Referenz |
| last_triggered_at | timestamptz | Letzte Auslösung |
| trigger_count | int | Wie oft ausgelöst |
| created_at / updated_at | timestamptz | Zeitstempel |

### `automation_rule_logs`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid | PK |
| rule_id | uuid | FK → automation_rules |
| user_id | uuid | Betroffener Nutzer |
| condition_snapshot | jsonb | Bedingungszustand zum Zeitpunkt |
| action_executed | text | Ausgeführte Aktion |
| result | jsonb | Was wurde geändert (alt → neu) |
| created_at | timestamptz | Wann ausgelöst |

RLS: Nur Admins haben Zugriff auf beide Tabellen.

---

## 2. Regel-Engine (Client-Hook)

**`useAutomationEngine`** — wird beim Login und bei relevanten Events aufgerufen:
1. Lädt alle aktiven Regeln (`is_active = true`), sortiert nach `priority`
2. Prüft pro Regel, ob die Bedingung für den aktuellen Nutzer erfüllt ist
3. Prüft, ob bereits ein manueller Admin-Override existiert → wenn ja, Regel überspringen
4. Führt die Aktion aus (z.B. `customer_tool_access` Insert)
5. Schreibt einen Log-Eintrag in `automation_rule_logs`
6. Aktualisiert `last_triggered_at` und `trigger_count`

**Prioritätslogik:**
- Manueller Admin-Override hat IMMER Vorrang
- Automationen wirken nur, wenn KEIN Override existiert
- Bei Konflikten zwischen Regeln: höhere Priorität gewinnt

---

## 3. Unterstützte Bedingungen (Phase 1)

| condition_type | Beschreibung | Prüfung via |
|---|---|---|
| `first_login` | Nutzer hat sich erstmals eingeloggt | tracking_events: login count = 1 |
| `event_count_reached` | Bestimmtes Event X-mal aufgetreten | tracking_events count |
| `tool_opened` | Bestimmtes Tool wurde geöffnet | tracking_events: tool_opened |
| `tool_completed` | Bestimmtes Tool wurde abgeschlossen | tracking_events: tool_completed |
| `sessions_reached` | X Sessions erreicht | tracking_sessions count |
| `days_inactive` | X Tage ohne Aktivität | tracking_sessions: letzte Aktivität |

---

## 4. Unterstützte Aktionen (Phase 1)

| action_type | Beschreibung | Umsetzung |
|---|---|---|
| `unlock_tool` | Tool freischalten | customer_tool_access upsert |
| `lock_tool` | Tool sperren | customer_tool_access upsert |
| `unlock_module` | Modul freischalten | customer_module_access upsert |
| `lock_module` | Modul sperren | customer_module_access upsert |
| `set_flag` | Internes Flag setzen | automation_rule_logs (als Marker) |

---

## 5. Beispielregeln (als Seed-Daten)

1. **Nach erstem Login** → Basis-Onboarding-Hinweis (Flag)
2. **Nach Abschluss Finanzcheck** → Inflationsrechner freischalten
3. **Nach 5 Sessions** → Erweiterte Tools sichtbar
4. **7 Tage inaktiv** → Reaktivierungs-Flag setzen

---

## 6. Admin-UI

### Neue Seite: `/app/automations`
- Listenansicht aller Regeln
- Name, Status (aktiv/inaktiv), Bedingung, Aktion, Scope
- Toggle für aktiv/inaktiv
- Letzte Auslösung + Trigger-Count
- Link zur Navigation im Sidebar

### UserActivityDetail erweitert
- Neuer Bereich: «Automatische Einflüsse»
- Zeigt Rule-Logs für diesen Nutzer
- z.B. «Inflationsrechner freigeschaltet durch Regel ‹Nach Finanzcheck-Abschluss›»

---

## 7. Dateien

| Datei | Änderung |
|---|---|
| Migration SQL | automation_rules + automation_rule_logs Tabellen |
| `src/hooks/useAutomationEngine.ts` | NEU: Regel-Engine |
| `src/pages/AdminAutomations.tsx` | NEU: Admin-Regelübersicht |
| `src/pages/UserActivityDetail.tsx` | Erweiterung: Automation-Logs |
| `src/App.tsx` | Route + Engine-Integration |
| `src/components/AppSidebar.tsx` | Menüeintrag |

---

## 8. Was bewusst NICHT gemacht wird
- Kein visueller Drag-and-Drop-Builder
- Keine komplexen UND/ODER-Verknüpfungen (vorbereitet in JSONB)
- Keine Echtzeit-Trigger (Regeln werden bei Login/Navigation geprüft)
- Keine automatische Segmentierung (Struktur vorbereitet)

---
name: Mandatory Linear Onboarding
description: Erzwungener 6-Step-Wizard für neue Client-Nutzer mit DB-Resume und Route-Gate
type: feature
---
Verbindlicher 6-Schritte-Onboarding-Flow unter `/onboarding` für alle Client-Nutzer:

**Steps**: (1) Willkommen, (2) Basis-Daten → meta_profiles, (3) Finanz-Typ Quick-Quiz (6 Fragen) → finanz_type_results, (4) Avatar/Zukunfts-Ich → user_avatars, (5) Manifest → user_manifest_acceptance, (6) PeakScore-Reveal + Confetti.

**Erzwingung**: `OnboardingGate` ist in `RouteGuard` integriert und leitet jeden Client mit `profiles.onboarding_completed = false` zwingend nach `/onboarding`. Admin/Staff sind ausgenommen. Es gibt keinen Skip-Mechanismus – Step 6 muss erreicht werden.

**Resume**: `profiles.onboarding_current_step` wird nach jedem Step-Wechsel persistiert. Beim erneuten Login startet der Wizard genau dort weiter. Daten aus jedem Step werden in die echten Tabellen (meta_profiles etc.) geschrieben, nicht in einen separaten Onboarding-State.

**Migration für Bestand**: Beim Deploy wurden alle bestehenden Nutzer mit existierendem `meta_profile`-Eintrag automatisch als `onboarding_completed = true` markiert, damit sie nicht aus der App fliegen.

**Felder auf profiles**: `onboarding_completed boolean`, `onboarding_completed_at timestamptz`, `onboarding_current_step smallint`.

**Hook**: `useOnboardingState()` (Hook) + `OnboardingGate` (Komponente) + `OnboardingWizard` (Page). NICHT localStorage – Single Source of Truth ist die DB.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── MINDSET PROMPTS ─────────────────────────────────────────────

const MINDSET_ANALYSIS_SYSTEM = `Du bist ein klarer, ehrlicher und lösungsorientierter Finanzcoach.
Der Nutzer befindet sich im Modul "Mindset".

Ziel des Moduls:
Der Nutzer soll seine Denkweise über Geld erkennen, limitierende Überzeugungen aufdecken und eine stärkere, förderliche Perspektive entwickeln.

Analysiere die Antworten des Nutzers und erledige folgende Aufgaben:

1. Analysiere die Denkweise des Nutzers:
- Welche Überzeugungen über Geld sind erkennbar?
- Wo sind mögliche limitierende Muster?

2. Zeige dem Nutzer klar und verständlich:
- Welche Denkweisen ihn aktuell bremsen könnten
- Ohne zu verurteilen, aber ehrlich und direkt

3. Gib dem Nutzer eine neue Perspektive:
- Wie könnte eine stärkere, förderliche Denkweise aussehen?

4. Definiere 3 konkrete, einfache Aufgaben:
- sofort umsetzbar
- maximal 5–10 Minuten Aufwand
- direkt im Alltag anwendbar

WICHTIG:
- Schreibe klar, einfach und direkt
- Keine unnötig langen Texte
- Kein Fachjargon
- Fokus auf Umsetzung
- Alles individuell basierend auf den Antworten des Nutzers

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Deine aktuelle Denkweise
[Analyse]

## Was dich aktuell bremst
[Limitierende Muster]

## Neue Perspektive
[Förderliche Denkweise]

## Deine nächsten Schritte
[Genau 3 konkrete Aufgaben als nummerierte Liste, jede Aufgabe mit einem klaren Titel in **fett** am Anfang, gefolgt von einer kurzen Beschreibung]`;

const MINDSET_REFLECTION_SYSTEM = `Du bist ein motivierender und reflektierender Finanzcoach.
Der Nutzer hat im Mindset-Modul konkrete Aufgaben umgesetzt.

Deine Aufgaben:

1. Hilf dem Nutzer zu erkennen:
- Was er konkret erreicht hat
- Auch kleine Fortschritte sichtbar machen

2. Verstärke den Fortschritt:
- Zeige, warum das wichtig ist
- Was sich langfristig daraus entwickeln kann

3. Verbinde es mit etwas Grösserem:
- Er baut gerade aktiv seine finanzielle Zukunft

4. Halte es kurz, klar und motivierend

WICHTIG:
- Keine Floskeln
- Kein unnötiges Gelaber
- Echt, direkt und positiv

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Das hast du erreicht
[Konkrete Fortschritte]

## Warum das wichtig ist
[Bedeutung]

## Was das für deine Zukunft bedeutet
[Ausblick]`;

// ─── KLARHEIT PROMPTS ────────────────────────────────────────────

const KLARHEIT_ANALYSIS_SYSTEM = `Du bist ein klarer, ehrlicher und lösungsorientierter Finanzcoach.
Der Nutzer befindet sich im Modul "Klarheit".

Ziel des Moduls:
Der Nutzer soll einen realistischen Überblick über seine finanzielle Situation erhalten, Unsicherheiten abbauen und die wichtigsten nächsten Schritte erkennen.

Du erhältst:
- die Freitext-Antworten des Nutzers
- optional strukturierte Finanzangaben (Einkommen, Ausgaben, Erspartes, Schulden etc.)

Deine Aufgaben:

1. Analysiere die aktuelle finanzielle Situation des Nutzers
- Was ist bereits stabil?
- Wo fehlt Übersicht?
- Wo bestehen Risiken oder blinde Flecken?

2. Gib dem Nutzer eine klare, verständliche Einordnung
- ehrlich, aber nicht hart
- einfach formuliert
- kein Fachjargon
- Fokus auf Orientierung

3. Zeige dem Nutzer:
- was aktuell schon gut ist
- was dringend geklärt werden sollte
- wo die grössten Hebel für mehr Klarheit liegen

4. Erstelle 3 konkrete, einfache nächste Schritte
- sofort umsetzbar
- möglichst in 5 bis 20 Minuten machbar
- direkt hilfreich für mehr Übersicht und Kontrolle

WICHTIG:
- Keine Panikmache
- Keine unnötig langen Texte
- Verständlich und motivierend
- Individuell basierend auf den Angaben des Nutzers
- Nicht zu generisch

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Deine aktuelle finanzielle Ausgangslage
[Analyse der Situation]

## Was bereits gut ist
[Positive Aspekte]

## Wo dir aktuell Klarheit fehlt
[Blinde Flecken und Risiken]

## Deine nächsten Schritte
[Genau 3 konkrete Aufgaben als nummerierte Liste, jede Aufgabe mit einem klaren Titel in **fett** am Anfang, gefolgt von einer kurzen Beschreibung]`;

const KLARHEIT_REFLECTION_SYSTEM = `Du bist ein motivierender und reflektierender Finanzcoach.
Der Nutzer hat im Modul "Klarheit" erste Schritte umgesetzt, Informationen gesammelt oder Ordnung geschaffen.

Deine Aufgaben:

1. Hilf dem Nutzer zu erkennen:
- was er konkret geklärt oder sichtbar gemacht hat
- warum das wertvoll ist

2. Zeige:
- welche Unsicherheit dadurch kleiner geworden ist
- wo jetzt mehr Kontrolle entstanden ist

3. Mache deutlich:
- dass Klarheit die Grundlage für gute Entscheidungen ist

4. Halte es kurz, klar und stärkend

WICHTIG:
- Keine Floskeln
- Nicht künstlich motivierend
- Echt, verständlich und positiv

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Das hast du sichtbar gemacht
[Konkrete Fortschritte]

## Warum das wichtig ist
[Bedeutung der Klarheit]

## Was das für deine nächsten Entscheidungen bedeutet
[Ausblick]`;

// ─── ZIELE PROMPTS ──────────────────────────────────────────────

const ZIELE_ANALYSIS_SYSTEM = `Du bist ein klarer, ehrlicher und lösungsorientierter Finanzcoach.
Der Nutzer befindet sich im Modul "Ziele".

Ziel des Moduls:
Der Nutzer soll seine finanziellen Ziele klarer erkennen, priorisieren und so formulieren, dass daraus Orientierung und Motivation entstehen.

Du erhältst:
- die Freitext-Antworten des Nutzers
- optional strukturierte Zielangaben (Zeithorizont, Kategorie, Priorität etc.)

Deine Aufgaben:

1. Analysiere die Ziele des Nutzers
- Welche Ziele sind wirklich relevant?
- Welche sind diffus oder unscharf?
- Wo fehlt Priorität oder Klarheit?

2. Hilf dem Nutzer zu unterscheiden:
- was ihm wirklich wichtig ist
- was nur gesellschaftlich übernommen oder unklar formuliert ist

3. Formuliere die wichtigsten Ziele klarer und greifbarer
- einfach
- motivierend
- konkret
- lebensnah

4. Definiere 3 konkrete nächste Schritte
- sofort umsetzbar
- hilfreich für mehr Klarheit, Fokus oder Umsetzung
- möglichst in 5 bis 20 Minuten machbar

WICHTIG:
- Keine Floskeln
- Keine leeren Motivationssätze
- Kein Fachjargon
- Nicht zu generisch
- Individuell basierend auf den Angaben des Nutzers

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Was dir wirklich wichtig ist
[Analyse der echten Ziele]

## Welche Ziele noch unscharf sind
[Diffuse oder unklare Ziele]

## Deine klare Zielrichtung
[Klarer formulierte Ziele]

## Deine nächsten Schritte
[Genau 3 konkrete Aufgaben als nummerierte Liste, jede Aufgabe mit einem klaren Titel in **fett** am Anfang, gefolgt von einer kurzen Beschreibung]`;

const ZIELE_REFLECTION_SYSTEM = `Du bist ein motivierender und reflektierender Finanzcoach.
Der Nutzer hat im Modul "Ziele" seine finanzielle Richtung geschärft.

Deine Aufgaben:

1. Hilf dem Nutzer zu erkennen:
- was er über sich und seine Ziele verstanden hat
- was jetzt klarer ist als vorher

2. Zeige:
- warum klare Ziele wichtig sind
- wie sie Entscheidungen einfacher machen

3. Verstärke:
- dass Fokus und Klarheit Energie freisetzen

4. Halte es kurz, klar und stärkend

WICHTIG:
- Keine Floskeln
- Nicht künstlich motivierend
- Echt, verständlich und positiv

ANTWORTSTRUKTUR (verwende exakt diese Markdown-Überschriften):

## Das ist dir klarer geworden
[Konkrete Erkenntnisse]

## Warum das wichtig ist
[Bedeutung klarer Ziele]

## Was das für deine nächsten Entscheidungen bedeutet
[Ausblick]`;

// ─── Prompt selector ────────────────────────────────────────────

function getPrompts(moduleKey: string, type: string) {
  if (moduleKey === 'ziele') {
    return {
      system: type === 'reflection' ? ZIELE_REFLECTION_SYSTEM : ZIELE_ANALYSIS_SYSTEM,
      userPrefix: type === 'reflection'
        ? 'Der Nutzer beschreibt, was ihm durch das Modul Ziele klarer geworden ist:\n\n'
        : 'Der Nutzer hat folgende Angaben zu seinen finanziellen Zielen gemacht:\n\n',
    };
  }
  if (moduleKey === 'klarheit') {
    return {
      system: type === 'reflection' ? KLARHEIT_REFLECTION_SYSTEM : KLARHEIT_ANALYSIS_SYSTEM,
      userPrefix: type === 'reflection'
        ? 'Der Nutzer beschreibt, was er im Modul Klarheit umgesetzt, geordnet oder erkannt hat:\n\n'
        : 'Der Nutzer hat folgende Angaben zu seiner finanziellen Situation gemacht:\n\n',
    };
  }
  // Default: mindset
  return {
    system: type === 'reflection' ? MINDSET_REFLECTION_SYSTEM : MINDSET_ANALYSIS_SYSTEM,
    userPrefix: type === 'reflection'
      ? 'Der Nutzer beschreibt, was er umgesetzt hat und was sich verändert hat:\n\n'
      : 'Der Nutzer hat folgende Fragen zum Thema Mindset und Geld beantwortet:\n\n',
  };
}

// ─── Task extraction ────────────────────────────────────────────

function extractTasks(content: string, sectionTitle: string): { title: string; description: string }[] {
  const stepsSection = content.split(`## ${sectionTitle}`)[1] || "";
  let tasks: { title: string; description: string }[] = [];

  // Try bold pattern first
  const taskMatches = stepsSection.match(/\d+\.\s+\*\*(.+?)\*\*[:\s]*(.+?)(?=\n\d+\.|\n##|$)/gs);
  if (taskMatches) {
    tasks = taskMatches.slice(0, 3).map((match: string) => {
      const titleMatch = match.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1].trim() : match.slice(0, 60).trim();
      const desc = match.replace(/^\d+\.\s+/, "").replace(/\*\*.*?\*\*[:\s]*/, "").trim();
      return { title, description: desc };
    });
  }

  // Fallback: numbered list without bold
  if (tasks.length === 0) {
    const numberedItems = stepsSection.match(/\d+\.\s+(.+?)(?=\n\d+\.|\n##|$)/gs);
    if (numberedItems) {
      tasks = numberedItems.slice(0, 3).map((item: string) => {
        const clean = item.replace(/^\d+\.\s+/, "").trim();
        const firstSentence = clean.split(/[.!?]/)[0] || clean.slice(0, 60);
        return { title: firstSentence.trim(), description: clean };
      });
    }
  }

  return tasks;
}

// ─── Main handler ───────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userInput, moduleKey = 'mindset', structuredData } = await req.json();

    if (!userInput || typeof userInput !== "string" || userInput.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Bitte gib etwas ausführlichere Antworten ein." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { system: systemPrompt, userPrefix } = getPrompts(moduleKey, type);

    // Build user message, including structured data if provided
    let userMessage = userPrefix + userInput;
    if (structuredData && typeof structuredData === 'object') {
      const fields = Object.entries(structuredData)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
      if (fields) {
        userMessage += '\n\nStrukturierte Angaben:\n' + fields;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI-Kontingent aufgebraucht. Bitte später erneut versuchen." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Fehler bei der Analyse. Bitte versuche es erneut." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract tasks for analysis type
    let tasks: { title: string; description: string }[] = [];
    if (type === "analysis") {
      tasks = extractTasks(content, "Deine nächsten Schritte");
    }

    return new Response(
      JSON.stringify({ content, tasks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("coach-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

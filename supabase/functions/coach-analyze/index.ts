import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userInput } = await req.json();

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

    const systemPrompt = type === "reflection" ? MINDSET_REFLECTION_SYSTEM : MINDSET_ANALYSIS_SYSTEM;
    const userMessage = type === "reflection"
      ? `Der Nutzer beschreibt, was er umgesetzt hat und was sich verändert hat:\n\n${userInput}`
      : `Der Nutzer hat folgende Fragen zum Thema Mindset und Geld beantwortet:\n\n${userInput}`;

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

    // For analysis type, also extract tasks
    let tasks: { title: string; description: string }[] = [];
    if (type === "analysis") {
      const stepsSection = content.split("## Deine nächsten Schritte")[1] || "";
      const taskMatches = stepsSection.match(/\d+\.\s+\*\*(.+?)\*\*[:\s]*(.+?)(?=\n\d+\.|\n##|$)/gs);
      if (taskMatches) {
        tasks = taskMatches.slice(0, 3).map((match: string) => {
          const titleMatch = match.match(/\*\*(.+?)\*\*/);
          const title = titleMatch ? titleMatch[1].trim() : match.slice(0, 60).trim();
          const desc = match
            .replace(/^\d+\.\s+/, "")
            .replace(/\*\*.*?\*\*[:\s]*/, "")
            .trim();
          return { title, description: desc };
        });
      }
      // Fallback: try numbered list without bold
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

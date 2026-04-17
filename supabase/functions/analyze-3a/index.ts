import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ──────────────────────────────────────────────
// PLACEHOLDER PROMPTS – will be replaced with the user's actual Prompt 2 & Prompt 3
// ──────────────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `Du bist ein präziser Dokumenten-Analyst für Schweizer Säule-3a-Unterlagen.

Deine Aufgabe ist es, hochgeladene Dokumente zu einer bestehenden Säule-3a-Lösung sorgfältig zu lesen und die darin enthaltenen Informationen strukturiert zu extrahieren.

## Ziel

Extrahiere alle erkennbaren Informationen aus Policen, Verträgen, Produktblättern, Jahresauszügen, Gebührenübersichten und fondsbezogenen Unterlagen zu einer Schweizer Säule-3a-Lösung.

## Wichtige Regeln

- Arbeite nur mit Informationen, die im Dokument tatsächlich erkennbar sind
- Erfinde keine Werte
- Wenn etwas unklar oder nicht ersichtlich ist, markiere es sauber als unbekannt
- Vermutungen dürfen nicht als Fakten dargestellt werden
- Wenn mehrere Dokumente vorhanden sind, kombiniere Informationen nur dann, wenn sie klar zusammenpassen
- Gib die Ergebnisse immer in sauberem JSON zurück
- Falls möglich, gib pro extrahiertem Feld auch die Textstelle oder den Dokumentenkontext mit an
- Wenn verschiedene Werte im Dokument vorkommen, gib an, welcher Wert wofür steht und markiere Unklarheiten
- Verwende deutsche Feldnamen
- Schweizer Kontext beachten
- Ziel ist eine strukturierte Erfassung, keine Beratung

## Dokumenttypen, die vorkommen können

- Versicherungspolice Säule 3a
- Vorsorgevertrag
- Produktinformationsblatt
- Fondsübersicht
- Jahresauszug
- Gebührenübersicht
- Rückkaufswert-Mitteilung
- Allgemeine Versicherungsbedingungen
- Factsheet
- Offerte

## Produkttyp-Klassifikation

Ordne das Produkt, falls möglich, einer der folgenden Kategorien zu:
- Versicherungsgebundene Säule 3a
- Banklösung Säule 3a
- Fondsbasierte Säule 3a
- Gemischte Lösung
- Unklar

## Vertragstyp-Einordnung

Falls möglich, klassifiziere die Struktur zusätzlich in:
- eher starr
- eher flexibel
- gemischt
- unklar

## Extraktionslogik

Beachte insbesondere:
- Manche Dokumente enthalten Prämien, aber keine vollständige Gebührenstruktur
- Manche Dokumente enthalten garantierte Leistungen, aber keine realistische Nettorendite
- Manche Dokumente nennen Fondsnamen, aber keine klare Aktienquote
- Manche Dokumente zeigen Rückkaufswerte, aber keine Aussage über effektive Gesamtkosten
- Allgemeine Versicherungsbedingungen enthalten oft Hinweise zu Flexibilität, Unterbruch, Kündigung und Nachteilen
- Produktblätter oder Factsheets enthalten eher Fonds- und Gebührenangaben
- Jahresauszüge enthalten eher Vertragswert, Stand, Einzahlungen und evtl. Rückkaufswerte

## Wichtige Felddefinitionen

- "wert": nur extrahierter Wert
- "quelle": möglichst kurzer relevanter Auszug oder Dokumenthinweis
- "sicherheit": hoch = direkt klar im Dokument, mittel = gut ableitbar aber nicht ganz eindeutig, niedrig = nur schwach ableitbar

## Falls nichts Sinnvolles extrahiert werden kann

Markiere die Felder mit null oder leeren Listen.
Füge in "gesamtfazit_extraktion" einen klaren Hinweis ein, dass aus dem Dokument kaum verlässliche Daten extrahiert werden konnten.

Nutze die save_extraction Funktion um die Daten strukturiert zurückzugeben.`;

const ANALYSIS_SYSTEM_PROMPT = `Du bist ein kritischer, analytischer und faktenorientierter Analyse-Assistent für Schweizer Säule-3a-Lösungen.

Deine Aufgabe ist es, eine bestehende 3a-Lösung nicht nur zu beschreiben, sondern kritisch zu hinterfragen, einzuordnen und in einen realistischen finanziellen Kontext zu setzen.

## Ziel

Erstelle eine verständliche, aber klare und teilweise konfrontierende Analyse, die dem Nutzer aufzeigt:
- wie seine aktuelle Lösung strukturiert ist
- wie viel er insgesamt einzahlt
- was daraus voraussichtlich entsteht
- was theoretisch möglich wäre
- welche Differenzen entstehen
- welchen Einfluss Inflation hat
- wo mögliche Ineffizienzen liegen

## Wichtige Grundhaltung
- Sei kritisch, aber nicht reisserisch
- Zeige Differenzen klar auf
- Nutze Zahlen, nicht nur Worte
- Stelle berechtigte Fragen
- Vermeide Beschönigung
- Keine falschen Versprechen
- Keine Halluzinationen
- Keine definitive Handlungsempfehlung
- Sprich in der Du-Form
- Schweizer Kontext beachten

## Bewertungslogik

### Transparenz
Bewerte, wie verständlich und nachvollziehbar die Lösung auf Basis der vorliegenden Daten wirkt.
Kriterien: Sind Anbieter, Produktname und Struktur klar? Sind wichtige Kosten sichtbar? Sind Fonds/Strategie nachvollziehbar?

### Flexibilität
Bewerte, wie flexibel die Lösung vermutlich ist.
Kriterien: Beitragsanpassung möglich? Beitragsstopp möglich? Lange feste Bindung? Erkennbare Rückkaufsnachteile?

### Kostenklarheit
Bewerte nicht die absolute Höhe, sondern wie klar oder unklar die Kostenlage aktuell ist.

### Anlageklarheit
Bewerte, wie gut erkennbar ist, wie das Geld investiert wird.

### Gesamt-Einordnung
Verdichte die bisherigen Punkte zu einer vorsichtigen Gesamteinschätzung.

Bewertungsskala für alle: sehr tief, eher tief, mittel, eher hoch, hoch
Gesamt-Einordnung: eher unklar und prüfenswert, gemischt, eher solide strukturiert, aktuell nur begrenzt beurteilbar

## BERECHNUNGEN (ZWINGEND, wenn Daten vorhanden)

### BERECHNUNG 1: Gesamteinzahlungen
Wenn monatlicher Beitrag und Laufzeit vorhanden:
gesamteinzahlung = monatlicher_beitrag × 12 × laufzeit_jahre

### BERECHNUNG 2: Optimiertes Szenario
Berechne ein Vergleichsszenario mit:
- monatlicher Beitrag (gleich wie Vertrag)
- Laufzeit identisch
- Nettorendite = 8.5% p.a.
FV = monatlicher Beitrag mit monatlicher Verzinsung (8.5% / 12)

### BERECHNUNG 3: Inflationsbereinigung
Inflation = 2.4% p.a.
Berechne Realwert für Vertrags-Endwert und optimiertes Szenario:
Realwert = Nominalwert / (1 + 0.024) ^ Laufzeit

### BERECHNUNG 4: Differenzanalyse
Falls vorhanden: Differenz zwischen Prognose Versicherungsprodukt und optimiertem Szenario (absolut und prozentual).

### WICHTIGER ANALYSEBLOCK
Wenn die im Vertrag angegebene erwartete Rendite vorhanden ist:
→ rechne parallel ein Szenario mit genau dieser Rendite ohne Produktstruktur
Wenn das "nackte" Ergebnis höher ist als die Prognose, stelle die Frage:
"Wie kann es sein, dass bei gleicher Rendite ein tieferes Ergebnis entsteht?"

## Stilregeln
- Ruhig, klar, ehrlich, analytisch
- Nicht aggressiv, nicht reisserisch, nicht übertrieben
- Formulierungen wie "wirkt eher", "es gibt Hinweise darauf", "prüfenswert"
- Kurze, verständliche Sätze

## Wenn Daten fehlen:
→ keine Berechnung erzwingen
→ stattdessen Hinweis geben

Nutze die save_analysis Funktion um die Analyse strukturiert zurückzugeben.`;

// ──────────────────────────────────────────────
// Tool schemas for structured output
// ──────────────────────────────────────────────
const fieldSchema = {
  type: "object",
  properties: {
    wert: { description: "Extrahierter Wert" },
    waehrung: { type: ["string", "null"], description: "Währung (CHF)" },
    einheit: { type: ["string", "null"], description: "Einheit (% oder CHF)" },
    quelle: { type: ["string", "null"], description: "Textstelle oder Dokumenthinweis" },
    sicherheit: { type: "string", enum: ["hoch", "mittel", "niedrig"], description: "Confidence" },
  },
  required: ["sicherheit"],
};

const extractionTool = {
  type: "function",
  function: {
    name: "save_extraction",
    description: "Speichere die extrahierten 3a-Vertragsdaten strukturiert gemäss Schweizer Dokumentenanalyse",
    parameters: {
      type: "object",
      properties: {
        anbieter: fieldSchema,
        produktname: fieldSchema,
        produkttyp: fieldSchema,
        vertragstyp_einordnung: fieldSchema,
        vertragsbeginn: fieldSchema,
        vertragsende: fieldSchema,
        laufzeit_hinweis: fieldSchema,
        monatlicher_beitrag: fieldSchema,
        jaehrlicher_beitrag: fieldSchema,
        bisher_einbezahlt: fieldSchema,
        aktueller_vertragswert: fieldSchema,
        rueckkaufswert: fieldSchema,
        garantierter_wert: fieldSchema,
        todesfallleistung: fieldSchema,
        praemienbefreiung: fieldSchema,
        erwerbsunfaehigkeitselement: fieldSchema,
        anlagekomponente_vorhanden: fieldSchema,
        fonds_oder_strategien: {
          type: "object",
          properties: {
            wert: { type: "array", items: { type: "object", properties: { name: { type: "string" }, allocation: { type: ["number", "null"] }, category: { type: ["string", "null"] } }, required: ["name"] } },
            quelle: { type: ["string", "null"] },
            sicherheit: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
          },
          required: ["sicherheit"],
        },
        aktienquote: fieldSchema,
        strategie_einordnung: fieldSchema,
        abschlusskosten: fieldSchema,
        laufende_produktkosten: fieldSchema,
        verwaltungsgebuehren: fieldSchema,
        fondsgebuehren_ter: fieldSchema,
        sonstige_kosten: {
          type: "object",
          properties: {
            wert: { type: "array", items: { type: "string" } },
            quelle: { type: ["string", "null"] },
            sicherheit: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
          },
          required: ["sicherheit"],
        },
        flexibilitaet_beitragsanpassung: fieldSchema,
        flexibilitaet_beitragsstopp: fieldSchema,
        kuendigungsnachteile: fieldSchema,
        transparenz_hinweis: fieldSchema,
        auffaelligkeiten: {
          type: "object",
          properties: {
            wert: { type: "array", items: { type: "string" } },
            quelle: { type: ["string", "null"] },
            sicherheit: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
          },
          required: ["sicherheit"],
        },
        fehlende_informationen: {
          type: "object",
          properties: {
            wert: { type: "array", items: { type: "string" } },
            quelle: { type: ["string", "null"] },
            sicherheit: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
          },
          required: ["sicherheit"],
        },
        gesamtfazit_extraktion: fieldSchema,
      },
      required: ["anbieter", "produkttyp", "gesamtfazit_extraktion"],
    },
  },
};

const scorecardItemSchema = {
  type: "object",
  properties: {
    wert: { type: ["string", "null"], description: "Bewertung: sehr tief, eher tief, mittel, eher hoch, hoch" },
    begruendung: { type: ["string", "null"], description: "Kurze Begründung" },
  },
  required: ["wert", "begruendung"],
};

const sectionSchema = {
  type: "object",
  properties: {
    titel: { type: "string" },
    inhalt: { type: "array", items: { type: "string" }, description: "Liste von verständlichen Punkten" },
  },
  required: ["titel", "inhalt"],
};

const analysisTool = {
  type: "function",
  function: {
    name: "save_analysis",
    description: "Speichere die strukturierte kritische Ersteinschätzung der 3a-Lösung inkl. Berechnungen",
    parameters: {
      type: "object",
      properties: {
        einordnung: {
          type: "object",
          properties: {
            produkttyp: { type: ["string", "null"] },
            struktur: { type: ["string", "null"] },
            kurzbewertung: { type: ["string", "null"] },
            kritische_einordnung: { type: ["string", "null"], description: "Kritische Einordnung des Produkts" },
          },
        },
        scorecard: {
          type: "object",
          properties: {
            transparenz: scorecardItemSchema,
            flexibilitaet: scorecardItemSchema,
            kostenklarheit: scorecardItemSchema,
            anlageklarheit: scorecardItemSchema,
            gesamt_einordnung: {
              type: "object",
              properties: {
                wert: { type: ["string", "null"], description: "eher unklar und prüfenswert, gemischt, eher solide strukturiert, aktuell nur begrenzt beurteilbar" },
                begruendung: { type: ["string", "null"] },
              },
              required: ["wert", "begruendung"],
            },
          },
        },
        zusammenfassung: {
          type: "object",
          properties: {
            titel: { type: ["string", "null"] },
            kurztext: { type: ["string", "null"] },
          },
        },
        zahlenuebersicht: {
          type: "object",
          description: "Berechnete Zahlenübersicht: Gesamteinzahlung, Vertragsprognose, optimiertes Szenario, Differenz",
          properties: {
            gesamteinzahlung: { type: ["number", "null"], description: "monatlicher_beitrag × 12 × laufzeit_jahre" },
            vertrag_prognose: { type: ["number", "null"], description: "Vom Anbieter prognostizierter Endwert" },
            optimiertes_szenario: { type: ["number", "null"], description: "FV bei 8.5% p.a. Nettorendite" },
            differenz_absolut: { type: ["number", "null"], description: "Differenz optimiert minus Vertragsprognose" },
            differenz_prozent: { type: ["number", "null"], description: "Prozentuale Differenz" },
          },
        },
        inflationssicht: {
          type: "object",
          description: "Inflationsbereinigte Werte bei 2.4% p.a.",
          properties: {
            realwert_vertrag: { type: ["number", "null"], description: "Kaufkraftbereinigter Vertragswert" },
            realwert_optimiert: { type: ["number", "null"], description: "Kaufkraftbereinigter optimierter Wert" },
            kommentar: { type: ["string", "null"], description: "Verständliche Erklärung der Inflation" },
          },
        },
        kritische_fragen: {
          type: "array",
          items: { type: "string" },
          description: "Berechtigte kritische Fragen zur Lösung",
        },
        struktur_analyse: sectionSchema,
        beitrags_und_laufzeit_analyse: sectionSchema,
        anlage_analyse: sectionSchema,
        kosten_analyse: sectionSchema,
        kostenlogik_hinweise: {
          type: "array",
          items: { type: "string" },
          description: "Hinweise zur Kostenlogik ohne Behauptungen",
        },
        auffaelligkeiten: sectionSchema,
        hauptprobleme: {
          type: "array",
          items: { type: "string" },
          description: "Kurze, klare Hauptprobleme",
        },
        fehlende_daten_hinweise: sectionSchema,
        ersteinschaetzung: sectionSchema,
        naechste_schritte: sectionSchema,
        cta_hinweis: {
          type: "object",
          properties: {
            titel: { type: ["string", "null"] },
            text: { type: ["string", "null"] },
          },
        },
      },
      required: ["einordnung", "scorecard", "zusammenfassung", "ersteinschaetzung"],
    },
  },
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function errorResponse(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

// ──────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let analysisId: string | null = null;

  try {
    // ── Auth check (required) ─────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Unauthorized", 401);
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return errorResponse("Unauthorized", 401);
    }
    const callerUserId = claimsData.claims.sub as string;

    const body = await req.json();
    analysisId = body.analysisId;
    if (!analysisId) return errorResponse("analysisId is required", 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Authorization: caller must own this analysis ──────────
    const { data: analysisRow, error: analysisErr } = await supabaseAdmin
      .from("three_a_analyses")
      .select("user_id")
      .eq("id", analysisId)
      .maybeSingle();

    if (analysisErr || !analysisRow) {
      return errorResponse("analysis_not_found", 404);
    }
    if (analysisRow.user_id !== callerUserId) {
      return errorResponse("Forbidden", 403);
    }


    // ── Fetch documents ──
    const { data: docs, error: docsError } = await supabaseAdmin
      .from("three_a_documents")
      .select("*")
      .eq("analysis_id", analysisId);

    if (docsError || !docs?.length) {
      await supabaseAdmin
        .from("three_a_analyses")
        .update({ status: "failed", initial_assessment: "Keine Dokumente gefunden." })
        .eq("id", analysisId);
      return errorResponse("no_documents", 400);
    }

    // ── Update status: extracting ──
    await supabaseAdmin
      .from("three_a_analyses")
      .update({ status: "extracting" })
      .eq("id", analysisId);

    // ── Download PDFs and build multimodal content ──
    const pdfParts: Array<{ type: string; image_url: { url: string } }> = [];

    for (const doc of docs) {
      try {
        const { data: fileData, error: dlError } = await supabaseAdmin.storage
          .from("three-a-documents")
          .download(doc.file_path);

        if (dlError || !fileData) {
          console.error(`Download failed for ${doc.file_name}:`, dlError);
          await supabaseAdmin
            .from("three_a_documents")
            .update({ processing_status: "error" })
            .eq("id", doc.id);
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

        pdfParts.push({
          type: "image_url",
          image_url: { url: `data:application/pdf;base64,${base64}` },
        });

        await supabaseAdmin
          .from("three_a_documents")
          .update({ processing_status: "processing" })
          .eq("id", doc.id);
      } catch (e) {
        console.error(`Error processing ${doc.file_name}:`, e);
        await supabaseAdmin
          .from("three_a_documents")
          .update({ processing_status: "error" })
          .eq("id", doc.id);
      }
    }

    if (!pdfParts.length) {
      await supabaseAdmin
        .from("three_a_analyses")
        .update({
          status: "failed",
          initial_assessment:
            "Die hochgeladenen Dokumente konnten nicht verarbeitet werden. Bitte lade gut lesbare PDF-Dokumente hoch.",
        })
        .eq("id", analysisId);
      return errorResponse("no_processable_documents", 400);
    }

    // ──────────────────────────────────────────
    // STEP 1: Extraction via AI
    // ──────────────────────────────────────────
    console.log(`[analyze-3a] Step 1: Extracting data from ${pdfParts.length} document(s)…`);

    const extractionResponse = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Bitte analysiere die folgenden Säule-3a-Dokumente und extrahiere alle relevanten Vertragsdaten. Nutze die save_extraction Funktion um die Daten strukturiert zurückzugeben.",
              },
              ...pdfParts,
            ],
          },
        ],
        tools: [extractionTool],
        tool_choice: { type: "function", function: { name: "save_extraction" } },
      }),
    });

    if (!extractionResponse.ok) {
      const errText = await extractionResponse.text();
      console.error("Extraction AI error:", extractionResponse.status, errText);
      if (extractionResponse.status === 429) {
        await supabaseAdmin.from("three_a_analyses").update({ status: "failed" }).eq("id", analysisId);
        return errorResponse("rate_limited", 429);
      }
      if (extractionResponse.status === 402) {
        await supabaseAdmin.from("three_a_analyses").update({ status: "failed" }).eq("id", analysisId);
        return errorResponse("payment_required", 402);
      }
      throw new Error(`AI extraction failed: ${extractionResponse.status}`);
    }

    const extractionResult = await extractionResponse.json();
    const extractionToolCall = extractionResult.choices?.[0]?.message?.tool_calls?.[0];
    let extractedData: Record<string, unknown>;

    if (extractionToolCall) {
      extractedData = JSON.parse(extractionToolCall.function.arguments);
    } else {
      // Fallback: try content as JSON
      const content = extractionResult.choices?.[0]?.message?.content || "";
      try {
        extractedData = JSON.parse(content);
      } catch {
        console.error("Could not parse extraction result:", content);
        throw new Error("extraction_parse_error");
      }
    }

    console.log("[analyze-3a] Extraction complete, saving results…");

    // Helper to extract "wert" from the new field structure
    const v = (field: unknown) => {
      if (field && typeof field === "object" && "wert" in (field as Record<string, unknown>)) {
        return (field as Record<string, unknown>).wert;
      }
      return field ?? null;
    };

    // Helper to parse a value as number (handles strings like "573.50")
    const toNum = (val: unknown): number | null => {
      if (val === null || val === undefined) return null;
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const cleaned = val.replace(/['']/g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
      }
      return null;
    };

    // Helper to parse date string to a Date
    const toDate = (val: unknown): Date | null => {
      if (!val || typeof val !== "string") return null;
      // Try DD.MM.YYYY
      const parts = val.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
      // Try YYYY-MM-DD or ISO
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Map new prompt structure to DB columns
    const provider = v(extractedData.anbieter) as string | null;
    const produkttyp = v(extractedData.produkttyp) as string | null;
    // Map produkttyp text to DB enum
    const productTypeMap: Record<string, string> = {
      "Versicherungsgebundene Säule 3a": "versicherung",
      "Banklösung Säule 3a": "bank",
      "Fondsbasierte Säule 3a": "fonds",
      "Gemischte Lösung": "gemischt",
    };
    const productType = (produkttyp && productTypeMap[produkttyp]) || produkttyp || null;

    const monatlich = toNum(v(extractedData.monatlicher_beitrag));
    const jaehrlich = toNum(v(extractedData.jaehrlicher_beitrag));
    const contributionAmount = monatlich ?? jaehrlich ?? null;
    const contributionFrequency = monatlich ? "monatlich" : jaehrlich ? "jaehrlich" : null;

    // Calculate remaining years from contract dates
    const contractStartDate = toDate(v(extractedData.vertragsbeginn));
    const contractEndDate = toDate(v(extractedData.vertragsende));
    let remainingYears: number | null = null;
    let totalYears: number | null = null;
    if (contractStartDate && contractEndDate) {
      totalYears = (contractEndDate.getTime() - contractStartDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const now = new Date();
      remainingYears = Math.max(0, (contractEndDate.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      remainingYears = Math.round(remainingYears * 10) / 10;
      totalYears = Math.round(totalYears * 10) / 10;
    }

    const fonds = v(extractedData.fonds_oder_strategien);
    const fundsArray = Array.isArray(fonds) ? fonds : [];

    // Build costs object from new fields
    const makeCost = (field: unknown) => {
      const val = v(field);
      const numVal = toNum(val);
      const src = field && typeof field === "object" ? (field as Record<string, unknown>).quelle : null;
      const conf = field && typeof field === "object" ? (field as Record<string, unknown>).sicherheit : null;
      return { value: numVal, isVerified: conf === "hoch", source: src as string | null };
    };
    const costs = {
      acquisition: makeCost(extractedData.abschlusskosten),
      ongoing: makeCost(extractedData.laufende_produktkosten),
      management: makeCost(extractedData.verwaltungsgebuehren),
      fundFees: makeCost(extractedData.fondsgebuehren_ter),
      other: makeCost(extractedData.sonstige_kosten),
    };

    // Build flexibility
    const flexibility = {
      contributionAdjustment: v(extractedData.flexibilitaet_beitragsanpassung) as string | null,
      pause: v(extractedData.flexibilitaet_beitragsstopp) as string | null,
      cancellationDisadvantages: v(extractedData.kuendigungsnachteile) as string | null,
    };

    // Build issues from auffaelligkeiten
    const auff = v(extractedData.auffaelligkeiten);
    const issues = Array.isArray(auff)
      ? auff.map((a: string) => ({ severity: "warning", title: a, description: a }))
      : [];

    // Save extraction results
    await supabaseAdmin
      .from("three_a_analyses")
      .update({
        status: "extracted",
        raw_extraction: extractedData,
        provider,
        product_name: v(extractedData.produktname) as string | null,
        product_type: productType,
        contribution_amount: contributionAmount,
        contribution_frequency: contributionFrequency,
        contract_start: v(extractedData.vertragsbeginn) as string | null,
        contract_end: v(extractedData.vertragsende) as string | null,
        remaining_years: remainingYears,
        paid_contributions: toNum(v(extractedData.bisher_einbezahlt)),
        current_value: toNum(v(extractedData.aktueller_vertragswert)),
        guaranteed_value: toNum(v(extractedData.garantierter_wert)),
        funds: fundsArray,
        equity_quota: v(extractedData.aktienquote) as number | null,
        strategy_classification: v(extractedData.strategie_einordnung) as string | null,
        costs,
        flexibility,
        issues,
      })
      .eq("id", analysisId);

    // Update document statuses
    for (const doc of docs) {
      await supabaseAdmin
        .from("three_a_documents")
        .update({ processing_status: "extracted" })
        .eq("id", doc.id);
    }

    // ──────────────────────────────────────────
    // STEP 2: Analysis / Ersteinschätzung via AI
    // ──────────────────────────────────────────
    await supabaseAdmin
      .from("three_a_analyses")
      .update({ status: "analyzing" })
      .eq("id", analysisId);

    console.log("[analyze-3a] Step 2: Generating assessment…");

    const analysisResponse = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Hier sind die extrahierten Vertragsdaten einer Säule-3a-Lösung. Erstelle bitte eine verständliche Ersteinschätzung und identifiziere mögliche Auffälligkeiten:\n\n${JSON.stringify(extractedData, null, 2)}`,
          },
        ],
        tools: [analysisTool],
        tool_choice: { type: "function", function: { name: "save_analysis" } },
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error("Analysis AI error:", analysisResponse.status, errText);
      // Still save what we have – extraction succeeded
      await supabaseAdmin
        .from("three_a_analyses")
        .update({
          status: "completed",
          initial_assessment:
            "Die automatische Ersteinschätzung konnte nicht erstellt werden. Die extrahierten Vertragsdaten sind jedoch verfügbar.",
        })
        .eq("id", analysisId);
    } else {
      const analysisResult = await analysisResponse.json();
      const analysisToolCall = analysisResult.choices?.[0]?.message?.tool_calls?.[0];
      let analysisData: Record<string, unknown>;

      if (analysisToolCall) {
        analysisData = JSON.parse(analysisToolCall.function.arguments);
      } else {
        const content = analysisResult.choices?.[0]?.message?.content || "";
        try {
          analysisData = JSON.parse(content);
        } catch {
          analysisData = { zusammenfassung: { titel: "Ersteinschätzung", kurztext: content } };
        }
      }

      // ── Fallback calculations if AI didn't compute them ──
      const monatlich_fuer_berechnung = contributionFrequency === "monatlich" ? contributionAmount : (contributionAmount ? contributionAmount / 12 : null);
      const laufzeit = totalYears ?? remainingYears;

      const z = (analysisData.zahlenuebersicht || {}) as Record<string, unknown>;

      // Gesamteinzahlung
      if (z.gesamteinzahlung == null && monatlich_fuer_berechnung && laufzeit) {
        z.gesamteinzahlung = Math.round(monatlich_fuer_berechnung * 12 * laufzeit * 100) / 100;
      }

      // Optimiertes Szenario (FV at 8.5% p.a.)
      if (z.optimiertes_szenario == null && monatlich_fuer_berechnung && laufzeit && laufzeit > 0) {
        const r = 0.085 / 12;
        const n = Math.round(laufzeit * 12);
        let fv = 0;
        for (let i = 0; i < n; i++) fv = (fv + monatlich_fuer_berechnung) * (1 + r);
        z.optimiertes_szenario = Math.round(fv * 100) / 100;
      }

      // Differenz
      if (z.differenz_absolut == null && z.optimiertes_szenario != null && z.vertrag_prognose != null) {
        z.differenz_absolut = Math.round(((z.optimiertes_szenario as number) - (z.vertrag_prognose as number)) * 100) / 100;
        z.differenz_prozent = Math.round(((z.differenz_absolut as number) / (z.vertrag_prognose as number)) * 10000) / 100;
      }

      analysisData.zahlenuebersicht = z;

      // Inflationssicht
      const inf = (analysisData.inflationssicht || {}) as Record<string, unknown>;
      if (laufzeit && laufzeit > 0) {
        const deflator = Math.pow(1.024, laufzeit);
        if (inf.realwert_vertrag == null && z.vertrag_prognose != null) {
          inf.realwert_vertrag = Math.round((z.vertrag_prognose as number) / deflator * 100) / 100;
        }
        if (inf.realwert_optimiert == null && z.optimiertes_szenario != null) {
          inf.realwert_optimiert = Math.round((z.optimiertes_szenario as number) / deflator * 100) / 100;
        }
        if (!inf.kommentar) {
          inf.kommentar = `Die angezeigten Realwerte berücksichtigen eine angenommene Inflation von 2.4% pro Jahr über ${Math.round(laufzeit)} Jahre.`;
        }
        analysisData.inflationssicht = inf;
      }

      // Extract summary text for initial_assessment column
      const zusammenfassung = analysisData.zusammenfassung as Record<string, unknown> | undefined;
      const ersteinschaetzung = analysisData.ersteinschaetzung as Record<string, unknown> | undefined;
      const summaryText = (zusammenfassung?.kurztext as string) ||
        ((ersteinschaetzung?.inhalt as string[]) || []).join(" ") ||
        "Analyse abgeschlossen.";

      await supabaseAdmin
        .from("three_a_analyses")
        .update({
          status: "completed",
          initial_assessment: summaryText,
          analysis_result: analysisData,
        })
        .eq("id", analysisId);
    }

    console.log("[analyze-3a] Analysis complete.");

    // Fetch final result
    const { data: finalData } = await supabaseAdmin
      .from("three_a_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    return new Response(JSON.stringify({ success: true, data: finalData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[analyze-3a] Fatal error:", error);

    // Try to update status to failed
    if (analysisId) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabaseAdmin
          .from("three_a_analyses")
          .update({ status: "failed" })
          .eq("id", analysisId);
      } catch {
        // ignore
      }
    }

    const msg = error instanceof Error ? error.message : "unknown_error";
    const status = msg === "rate_limited" ? 429 : msg === "payment_required" ? 402 : 500;
    return errorResponse(msg, status);
  }
});

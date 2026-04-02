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

const ANALYSIS_SYSTEM_PROMPT = `Du bist ein vorsichtiger, strukturierter Analyse-Assistent für Schweizer Säule-3a-Lösungen.

Deine Aufgabe ist es, auf Basis bereits extrahierter Vertragsdaten eine verständliche, sachliche und nutzerfreundliche Ersteinschätzung zu erstellen.

## Ziel

Analysiere eine bestehende Säule-3a-Lösung und bewerte sie in einer vorsichtigen, nachvollziehbaren Weise hinsichtlich:
- Struktur
- Transparenz
- Flexibilität
- Kostenklarheit
- möglicher Produktlogik
- möglicher Optimierungspotenziale

## Wichtige Regeln

- Du darfst keine Fakten erfinden
- Du darfst keine definitive Finanzberatung simulieren
- Du darfst keine Kündigungs- oder Abschlussentscheidung als absolute Empfehlung ausgeben
- Du sollst vorsichtige, nachvollziehbare Formulierungen verwenden
- Wenn Daten fehlen, muss das klar benannt werden
- Wenn etwas nur vermutet werden kann, muss es als Hinweis und nicht als Fakt formuliert werden
- Sprich in der Du-Form
- Verwende klare, verständliche Sprache
- Schweizer Kontext beachten
- Keine aggressive Sales-Sprache
- Keine Panikmache
- Der Zweck ist Aufklärung und Ersteinschätzung

## Bewertungslogik

### Transparenz
Bewerte, wie verständlich und nachvollziehbar die Lösung auf Basis der vorliegenden Daten wirkt.
Kriterien: Sind Anbieter, Produktname und Struktur klar? Sind wichtige Kosten sichtbar? Sind Fonds/Strategie nachvollziehbar?

### Flexibilität
Bewerte, wie flexibel die Lösung vermutlich ist.
Kriterien: Beitragsanpassung möglich? Beitragsstopp möglich? Lange feste Bindung? Erkennbare Rückkaufsnachteile?

### Kostenklarheit
Bewerte nicht die absolute Höhe, sondern wie klar oder unklar die Kostenlage aktuell ist.
Kriterien: Sind Abschlusskosten, laufende Kosten, Fondsgebühren ersichtlich?

### Anlageklarheit
Bewerte, wie gut erkennbar ist, wie das Geld investiert wird.
Kriterien: Fonds genannt? Strategie benannt? Aktienquote bekannt?

### Gesamt-Einordnung
Verdichte die bisherigen Punkte zu einer vorsichtigen Gesamteinschätzung.

Bewertungsskala für alle: sehr tief, eher tief, mittel, eher hoch, hoch
Gesamt-Einordnung: eher unklar und prüfenswert, gemischt, eher solide strukturiert, aktuell nur begrenzt beurteilbar

## Stilregeln
- Keine übertriebene Sprache
- Formulierungen wie "wirkt eher", "es gibt Hinweise darauf", "auf Basis der vorliegenden Unterlagen", "prüfenswert", "nicht eindeutig ersichtlich", "scheint"
- Kurze, verständliche Sätze
- Keine Fachsimpelei ohne Erklärung

## Wenn die Datenlage schwach ist, dann muss die Analyse eher defensiv sein. Keine scheinpräzise Bewertung.

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

const analysisTool = {
  type: "function",
  function: {
    name: "save_analysis",
    description: "Speichere die Ersteinschätzung der 3a-Lösung",
    parameters: {
      type: "object",
      properties: {
        initialAssessment: {
          type: "string",
          description: "Zusammenfassende Ersteinschätzung in 4-8 Sätzen, verständlich formuliert",
        },
        additionalIssues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["info", "warning", "critical"] },
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["severity", "title", "description"],
          },
          description: "Zusätzliche Auffälligkeiten oder Hinweise aus der Analyse",
        },
      },
      required: ["initialAssessment"],
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
    const body = await req.json();
    analysisId = body.analysisId;
    if (!analysisId) return errorResponse("analysisId is required", 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    const monatlich = v(extractedData.monatlicher_beitrag) as number | null;
    const jaehrlich = v(extractedData.jaehrlicher_beitrag) as number | null;
    const contributionAmount = monatlich ?? jaehrlich ?? null;
    const contributionFrequency = monatlich ? "monatlich" : jaehrlich ? "jaehrlich" : null;

    const fonds = v(extractedData.fonds_oder_strategien);
    const fundsArray = Array.isArray(fonds) ? fonds : [];

    // Build costs object from new fields
    const makeCost = (field: unknown) => {
      const val = v(field);
      const src = field && typeof field === "object" ? (field as Record<string, unknown>).quelle : null;
      const conf = field && typeof field === "object" ? (field as Record<string, unknown>).sicherheit : null;
      return { value: typeof val === "number" ? val : null, isVerified: conf === "hoch", source: src as string | null };
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
        remaining_years: null,
        paid_contributions: v(extractedData.bisher_einbezahlt) as number | null,
        current_value: v(extractedData.aktueller_vertragswert) as number | null,
        guaranteed_value: v(extractedData.garantierter_wert) as number | null,
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
        analysisData = { initialAssessment: content };
      }

      // Merge issues from extraction and analysis
      const existingIssues = (extractedData.issues as unknown[]) || [];
      const additionalIssues = (analysisData.additionalIssues as unknown[]) || [];
      const allIssues = [...existingIssues, ...additionalIssues];

      await supabaseAdmin
        .from("three_a_analyses")
        .update({
          status: "completed",
          initial_assessment: analysisData.initialAssessment as string,
          issues: allIssues,
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

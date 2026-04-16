import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_PROMPTS: Record<string, string> = {
  pensionskasse: `Extrahiere aus diesem Schweizer Pensionskassenausweis die folgenden Werte und gib sie als JSON zurück:
- austrittsleistung (Zahl in CHF, ohne Tausender-Trennzeichen)
- freizuegigkeitsleistung (Zahl in CHF)
- altersrente_geschaetzt_monat (Zahl in CHF pro Monat)
- pensionskasse_name (String)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  pillar_3a: `Extrahiere aus diesem Schweizer Säule-3a-Kontoauszug die folgenden Werte als JSON:
- guthaben (Zahl in CHF)
- anbieter (String)
- rendite_ytd (Zahl in Prozent, falls vorhanden)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  freizuegigkeit: `Extrahiere aus diesem Freizügigkeitsausweis die folgenden Werte als JSON:
- guthaben (Zahl in CHF)
- anbieter (String)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  kontoauszug: `Extrahiere aus diesem Kontoauszug die folgenden Werte als JSON:
- kontostand (Zahl in CHF)
- bankname (String)
- kontobezeichnung (String, falls vorhanden)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  depot: `Extrahiere aus diesem Depot-Auszug die folgenden Werte als JSON:
- gesamtwert (Zahl in CHF)
- plattform (String)
- positionen (Array von {name: String, wert: Zahl})
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  hypothek: `Extrahiere aus diesem Hypothek-/Kreditvertrag die folgenden Werte als JSON:
- restschuld (Zahl in CHF)
- zinssatz (Zahl in Prozent)
- monatliche_rate (Zahl in CHF)
- anbieter (String)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  leasing: `Extrahiere aus diesem Leasing-Vertrag die folgenden Werte als JSON:
- restschuld (Zahl in CHF)
- monatliche_rate (Zahl in CHF)
- anbieter (String)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,

  kredit: `Extrahiere aus diesem Kredit-Vertrag die folgenden Werte als JSON:
- restschuld (Zahl in CHF)
- zinssatz (Zahl in Prozent)
- monatliche_rate (Zahl in CHF)
- anbieter (String)
Wenn ein Wert nicht erkennbar ist, gib null zurück. Gib NUR das JSON zurück.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { document_type, file_path } = await req.json();

    if (!document_type || !file_path) {
      return new Response(JSON.stringify({ error: "document_type und file_path erforderlich" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = DOCUMENT_PROMPTS[document_type];
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Unbekannter Dokumenttyp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("document-uploads")
      .download(file_path);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: "Datei konnte nicht geladen werden" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = fileData.type || "image/jpeg";

    // Call Lovable AI with vision
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "KI-Budget aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", status, errorText);
      throw new Error(`AI error: ${status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let extracted: Record<string, unknown> = {};
    let successful = false;
    let fieldCount = 0;

    try {
      // Strip markdown code fences if present
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(jsonStr);
      successful = true;
      fieldCount = Object.values(extracted).filter((v) => v !== null && v !== undefined).length;
    } catch {
      console.error("Failed to parse AI response:", content);
      extracted = {};
    }

    // Delete the file immediately
    await supabase.storage.from("document-uploads").remove([file_path]);

    // Log extraction attempt
    await supabase.from("document_extractions").insert({
      user_id: user.id,
      document_type,
      extraction_successful: successful,
      fields_extracted_count: fieldCount,
    });

    return new Response(
      JSON.stringify({ success: successful, data: extracted, fields_extracted: fieldCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

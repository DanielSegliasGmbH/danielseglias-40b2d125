import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { month_key } = await req.json();
    if (!month_key) throw new Error("month_key required");

    // Gather user data
    const [
      { data: profile },
      { data: peakScores },
      { data: assets },
      { data: liabilities },
      { data: expenses },
      { data: tasks },
      { data: habits },
      { data: goals },
      { data: metaProfile },
      { data: finanzType },
    ] = await Promise.all([
      supabase.from("profiles").select("first_name, plan, current_rank").eq("id", user.id).maybeSingle(),
      supabase.from("peak_scores").select("score, calculated_at").eq("user_id", user.id).order("calculated_at", { ascending: false }).limit(5),
      supabase.from("net_worth_assets").select("name, value, category").eq("user_id", user.id),
      supabase.from("net_worth_liabilities").select("name, amount, category, interest_rate").eq("user_id", user.id),
      supabase.from("budget_expenses").select("amount, category, expense_date").eq("user_id", user.id).order("expense_date", { ascending: false }).limit(100),
      supabase.from("client_tasks").select("title, is_completed, due_date").eq("user_id", user.id).limit(50),
      supabase.from("habits").select("name, is_active").eq("user_id", user.id),
      supabase.from("client_goals").select("title, mission_name, current_amount, target_amount, is_completed").eq("user_id", user.id),
      supabase.from("meta_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("finanz_type_results").select("finanz_type").eq("user_id", user.id).eq("completed", true).maybeSingle(),
    ]);

    const totalAssets = (assets || []).reduce((s: number, a: any) => s + Number(a.value), 0);
    const totalLiabilities = (liabilities || []).reduce((s: number, l: any) => s + Number(l.amount), 0);
    const netWorth = totalAssets - totalLiabilities;

    const completedTasks = (tasks || []).filter((t: any) => t.is_completed).length;
    const totalTasks = (tasks || []).length;

    const userName = profile?.first_name || "Nutzer";

    const [year, month] = month_key.split("-").map(Number);
    const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
    const monthLabel = `${monthNames[month - 1]} ${year}`;

    const dataContext = `
NUTZERDATEN für ${userName}:
- Nettovermögen: CHF ${netWorth.toLocaleString("de-CH")}
- Vermögenswerte: ${(assets || []).map((a: any) => `${a.name}: CHF ${a.value}`).join(", ") || "keine"}
- Verbindlichkeiten: ${(liabilities || []).map((l: any) => `${l.name}: CHF ${l.amount} (${l.interest_rate || 0}%)`).join(", ") || "keine"}
- PeakScore-Verlauf: ${(peakScores || []).map((p: any) => `${p.score} Monate (${p.calculated_at})`).join(", ") || "keine Daten"}
- Monatliches Einkommen: CHF ${metaProfile?.monthly_income || "unbekannt"}
- Fixkosten: CHF ${metaProfile?.fixed_costs || "unbekannt"}
- Sparrate: ${metaProfile?.savings_rate || "unbekannt"}%
- Vermögen: CHF ${metaProfile?.wealth || "unbekannt"}
- Schulden: CHF ${metaProfile?.debts || 0}
- Aufgaben: ${completedTasks}/${totalTasks} erledigt
- Ziele: ${(goals || []).map((g: any) => `"${g.mission_name || g.title}" (${g.current_amount}/${g.target_amount || '?'}, ${g.is_completed ? 'erledigt' : 'offen'})`).join("; ") || "keine"}
- Finanz-Typ: ${finanzType?.finanz_type || "nicht ermittelt"}
- Letzte Ausgaben (Top-Kategorien): ${summarizeExpenses(expenses || [])}
- Aktive Gewohnheiten: ${(habits || []).filter((h: any) => h.is_active).map((h: any) => h.name).join(", ") || "keine"}
`;

    const systemPrompt = `Du bist ein schonungslos ehrlicher Finanzberater für Schweizer Privatpersonen. Du schreibst ein monatliches "Finanz-Röntgenbild" – eine umfassende, ehrliche Analyse der finanziellen Gesundheit.

REGELN:
- Schreibe auf Deutsch (Schweizer Kontext, CHF)
- Sei direkt und ehrlich, aber respektvoll
- Benutze konkrete Zahlen aus den Nutzerdaten
- Wenn Daten fehlen, sage das klar
- Vermeide generische Ratschläge – sei spezifisch
- Formatiere als Markdown

STRUKTUR (halte dich exakt daran):

# Dein Finanz-Röntgenbild — ${monthLabel}

## Die Diagnose
[2-3 Sätze Gesamtzustand, basierend auf allen Daten]

## 5 Probleme, die ich sehe
[Liste 5 konkrete Probleme, priorisiert nach Impact. Jedes mit einer Erklärung und Zahlen.]

## 3 kritischste Baustellen
[Die 3 wichtigsten Punkte mit spezifischen Lösungen]

## Dein 30-Tage-Plan
[5-7 konkrete Aktionen für die nächsten 30 Tage. Jede Aktion sollte spezifisch und umsetzbar sein.]

## PeakScore-Prognose
[Einschätzung, wie sich der PeakScore bei Umsetzung verbessern könnte]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: dataContext },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const reportMarkdown = aiResult.choices?.[0]?.message?.content || "Kein Bericht generiert.";

    // Use service role to upsert
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Delete existing xray for this month if any, then insert new
    await adminClient.from("financial_xrays").delete().eq("user_id", user.id).eq("month_key", month_key);
    const { error: insertError } = await adminClient.from("financial_xrays").insert({
      user_id: user.id,
      month_key,
      report_markdown: reportMarkdown,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save report");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-xray error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function summarizeExpenses(expenses: any[]): string {
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  }
  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, total]) => `${cat}: CHF ${total.toLocaleString("de-CH")}`)
    .join(", ") || "keine Daten";
}

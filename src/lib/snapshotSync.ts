/**
 * Snapshot → Vermögen sync.
 *
 * After a user saves a Snapshot, we explode the snapshot draft into normalized
 * net_worth_assets and net_worth_liabilities rows so that PeakScore, the
 * Vermögen page and every other read consumer see the same single source of
 * truth. We also push monthly income/expenses into meta_profiles.
 *
 * The snapshot itself remains the detailed input record (history, audit) –
 * net_worth tables are the calculated, normalized result.
 */
import { supabase } from '@/integrations/supabase/client';

const num = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

interface AssetRow {
  user_id: string;
  name: string;
  category: string;
  value: number;
  platform_url?: string | null;
  expected_return?: number | null;
}

interface LiabilityRow {
  user_id: string;
  name: string;
  category: string;
  amount: number;
  monthly_payment?: number;
  interest_rate?: number | null;
}

// Loose snapshot type — we only read what we need.
type Snap = Record<string, any>;

function buildAssets(userId: string, d: Snap): AssetRow[] {
  const rows: AssetRow[] = [];
  const push = (
    name: string,
    category: string,
    value: number,
    extras: Partial<AssetRow> = {},
  ) => {
    if (value > 0 && name) rows.push({ user_id: userId, name, category, value, ...extras });
  };

  // Säule 3a
  if (!d.pillar_3a_skipped) {
    (d.pillar_3a_entries ?? []).forEach((e: any, i: number) =>
      push(e.provider || `Säule 3a #${i + 1}`, 'Säule 3a', num(e.balance), {
        platform_url: e.link || null,
        expected_return: e.expected_return ? num(e.expected_return) : null,
      }),
    );
    if ((!d.pillar_3a_entries || d.pillar_3a_entries.length === 0) && d.pillar_3a)
      push(d.pillar_3a.provider || 'Säule 3a', 'Säule 3a', num(d.pillar_3a.amount), {
        platform_url: d.pillar_3a.link || null,
      });
  }

  // Freizügigkeit
  if (!d.freizuegigkeit_skipped) {
    (d.freizuegigkeit_entries ?? []).forEach((e: any, i: number) =>
      push(e.provider || `Freizügigkeit #${i + 1}`, 'Freizügigkeit', num(e.balance), {
        platform_url: e.link || null,
        expected_return: e.expected_return ? num(e.expected_return) : null,
      }),
    );
    if ((!d.freizuegigkeit_entries || d.freizuegigkeit_entries.length === 0) && d.freizuegigkeit)
      push(d.freizuegigkeit.provider || 'Freizügigkeit', 'Freizügigkeit', num(d.freizuegigkeit.amount), {
        platform_url: d.freizuegigkeit.link || null,
      });
  }

  // Pensionskasse
  if (!d.pensionskasse_skipped) {
    (d.pensionskasse_entries ?? []).forEach((e: any, i: number) =>
      push(e.provider || `Pensionskasse #${i + 1}`, 'Pensionskasse', num(e.balance), {
        platform_url: e.link || null,
        expected_return: e.expected_return ? num(e.expected_return) : null,
      }),
    );
    if ((!d.pensionskasse_entries || d.pensionskasse_entries.length === 0) && d.pensionskasse)
      push(d.pensionskasse.provider || 'Pensionskasse', 'Pensionskasse', num(d.pensionskasse.amount), {
        platform_url: d.pensionskasse.link || null,
      });
  }

  // Bankkonten
  if (!d.bank_accounts_skipped) {
    (d.bank_accounts ?? []).forEach((b: any, i: number) =>
      push(b.name || b.bank || `Bankkonto #${i + 1}`, 'Bankkonto', num(b.balance), {
        platform_url: b.link || null,
      }),
    );
  }

  // Bargeld
  if (d.cash && !d.cash.skipped) push('Bargeld', 'Bargeld', num(d.cash.amount));

  // Wertgegenstände
  if (!d.valuables_skipped) {
    (d.valuables ?? []).forEach((v: any, i: number) =>
      push(v.name || `Wertgegenstand #${i + 1}`, v.category || 'Wertgegenstand', num(v.value)),
    );
  }

  // Investments
  if (!d.investment_positions_skipped) {
    (d.investment_positions ?? []).forEach((p: any, i: number) =>
      push(p.name || `Investment #${i + 1}`, 'Wertschriften', num(p.value), {
        platform_url: p.link || null,
      }),
    );
  }

  // Krypto
  if (!d.crypto_positions_skipped) {
    (d.crypto_positions ?? []).forEach((c: any, i: number) =>
      push(c.name || `Krypto #${i + 1}`, 'Kryptowährung', num(c.value), {
        platform_url: c.link || null,
      }),
    );
  }

  // Immobilien (equity = market_value − mortgage_amount)
  if (d.owns_property) {
    (d.properties ?? []).forEach((p: any, i: number) => {
      const equity = num(p.market_value) - num(p.mortgage_amount);
      if (equity > 0)
        push(
          p.description || `Immobilie #${i + 1}`,
          p.property_type === 'investment' ? 'Renditeobjekt' : 'Immobilie',
          equity,
          { platform_url: p.link || null },
        );
    });
  }

  // Sonstige Vermögenswerte
  if (!d.other_assets_skipped) {
    (d.other_assets ?? []).forEach((a: any, i: number) =>
      push(a.name || `Vermögenswert #${i + 1}`, 'Sonstiges', num(a.value)),
    );
  }

  return rows;
}

function buildLiabilities(userId: string, d: Snap): LiabilityRow[] {
  const rows: LiabilityRow[] = [];
  const push = (
    name: string,
    category: string,
    amount: number,
    extras: Partial<LiabilityRow> = {},
  ) => {
    if (amount > 0 && name) rows.push({ user_id: userId, name, category, amount, ...extras });
  };

  // Hypotheken (aus properties)
  if (d.owns_property) {
    (d.properties ?? []).forEach((p: any, i: number) =>
      push(
        p.description ? `Hypothek ${p.description}` : `Hypothek #${i + 1}`,
        'Hypothek',
        num(p.mortgage_amount),
        { interest_rate: p.mortgage_rate ? num(p.mortgage_rate) : null },
      ),
    );
  }

  // Kredite / Leasing
  if (!d.credits_skipped) {
    (d.credits ?? []).forEach((c: any, i: number) =>
      push(c.name || `Kredit #${i + 1}`, 'Kredit / Leasing', num(c.remaining), {
        monthly_payment: num(c.monthly_payment),
        interest_rate: c.interest_rate ? num(c.interest_rate) : null,
      }),
    );
  }

  // Sonstige Schulden
  if (!d.debts_skipped) {
    (d.debts ?? []).forEach((s: any, i: number) =>
      push(s.description || `Schuld #${i + 1}`, 'Sonstiges', num(s.amount)),
    );
  }

  return rows;
}

export interface SnapshotSyncResult {
  oldPeakScore: number | null;
  newPeakScore: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyExpensesUsed: number;
  assetsInserted: number;
  liabilitiesInserted: number;
}

/**
 * Replaces the user's net_worth_assets + net_worth_liabilities with values
 * derived from the snapshot, updates meta_profiles income/expenses/wealth/debts,
 * recalculates PeakScore (= wealth / monthlyExpenses, "months of runway") and
 * writes it back to the most recent financial_snapshots row for this user.
 */
export async function syncSnapshotToNetWorth(
  userId: string,
  draft: Snap,
): Promise<SnapshotSyncResult> {
  // 1. Capture previous PeakScore for the comparison toast.
  const { data: prevSnap } = await supabase
    .from('financial_snapshots')
    .select('peak_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(1, 1) // 2nd-most recent (the one just inserted is index 0)
    .maybeSingle();
  const oldPeakScore = prevSnap?.peak_score ?? null;

  // 2. Build new normalized rows.
  const assets = buildAssets(userId, draft);
  const liabilities = buildLiabilities(userId, draft);

  // 3. Replace existing net-worth rows for this user (delete-then-insert).
  await Promise.all([
    supabase.from('net_worth_assets').delete().eq('user_id', userId),
    supabase.from('net_worth_liabilities').delete().eq('user_id', userId),
  ]);

  if (assets.length > 0) await supabase.from('net_worth_assets').insert(assets);
  if (liabilities.length > 0) await supabase.from('net_worth_liabilities').insert(liabilities);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // 4. Sync meta_profiles (single source of truth for income/expenses).
  const monthlyIncome = draft.monthly_income && !draft.monthly_income.skipped ? num(draft.monthly_income.amount) : null;
  const monthlyExpenses = draft.monthly_expenses && !draft.monthly_expenses.skipped ? num(draft.monthly_expenses.amount) : null;

  const metaUpdate: Record<string, number | null> = {
    wealth: netWorth,
    debts: totalLiabilities,
  };
  if (monthlyIncome !== null && monthlyIncome > 0) metaUpdate.monthly_income = monthlyIncome;
  if (monthlyExpenses !== null && monthlyExpenses > 0) metaUpdate.fixed_costs = monthlyExpenses;

  await supabase
    .from('profiles')
    .update({ ...metaUpdate, last_confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any)
    .eq('id', userId);

  // 5. PeakScore = months of runway. Use snapshot expenses → fallback to profile.
  let denom = monthlyExpenses ?? 0;
  if (denom <= 0) {
    const { data: meta } = await supabase
      .from('profiles')
      .select('fixed_costs')
      .eq('id', userId)
      .maybeSingle();
    denom = num(meta?.fixed_costs);
  }
  const newPeakScore = denom > 0 ? Math.round((netWorth / denom) * 10) / 10 : 0;

  // 6. Write peak_score + net_worth onto the latest snapshot row.
  const { data: latest } = await supabase
    .from('financial_snapshots')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id) {
    await supabase
      .from('financial_snapshots')
      .update({ peak_score: newPeakScore, net_worth: netWorth })
      .eq('id', latest.id);
  }

  return {
    oldPeakScore,
    newPeakScore,
    netWorth,
    totalAssets,
    totalLiabilities,
    monthlyExpensesUsed: denom,
    assetsInserted: assets.length,
    liabilitiesInserted: liabilities.length,
  };
}

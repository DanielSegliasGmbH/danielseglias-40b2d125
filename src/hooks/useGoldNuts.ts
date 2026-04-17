import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { GOLD_NUTS, GOLD_NUT_TOTAL, GOLD_NUT_COIN_BONUS, getGoldNut, type GoldNutDef } from '@/config/goldNuts';

export interface CollectedGoldNut {
  key: string;
  earned_at: string;
}

export interface GoldNutCelebration {
  id: number;
  nut: GoldNutDef;
  bonusCoins: number;
}

// ── Module-level event bus for celebrations ───────
type CelebrationListener = (c: GoldNutCelebration) => void;
const celebrationListeners: CelebrationListener[] = [];

export function onGoldNutCelebration(fn: CelebrationListener) {
  celebrationListeners.push(fn);
  return () => {
    const i = celebrationListeners.indexOf(fn);
    if (i > -1) celebrationListeners.splice(i, 1);
  };
}

function emitCelebration(c: GoldNutCelebration) {
  celebrationListeners.forEach(fn => fn(c));
}

export function useGoldNuts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [nuts, setNuts] = useState<CollectedGoldNut[]>([]);
  const [loading, setLoading] = useState(true);
  const collectedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('gold_nut_collections')
        .select('nut_key, earned_at')
        .eq('user_id', user.id);
      if (cancelled) return;
      const list = (data ?? []).map(r => ({ key: r.nut_key, earned_at: r.earned_at }));
      setNuts(list);
      collectedKeysRef.current = new Set(list.map(n => n.key));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const hasGoldNut = useCallback((key: string) => {
    return collectedKeysRef.current.has(key);
  }, []);

  const awardGoldNut = useCallback(async (key: string): Promise<boolean> => {
    if (!user) return false;
    const def = getGoldNut(key);
    if (!def) {
      console.warn(`[useGoldNuts] Unknown gold nut key: ${key}`);
      return false;
    }
    if (collectedKeysRef.current.has(key)) return false;

    const { error } = await supabase
      .from('gold_nut_collections')
      .insert({ user_id: user.id, nut_key: key });

    if (error) {
      // unique_violation → already earned (race condition)
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        collectedKeysRef.current.add(key);
        return false;
      }
      console.error('[useGoldNuts] award error:', error);
      return false;
    }

    // Local state update
    collectedKeysRef.current.add(key);
    const newEntry: CollectedGoldNut = { key, earned_at: new Date().toISOString() };
    setNuts(prev => [...prev, newEntry]);

    // Bonus-Münzen direkt auf hamster_profiles addieren (atomar via RPC wäre besser,
    // aber wir lesen-und-schreiben hier pragmatisch).
    const { data: profile } = await supabase
      .from('hamster_profiles')
      .select('coins')
      .eq('user_id', user.id)
      .maybeSingle();
    const currentCoins = profile?.coins ?? 0;
    await supabase
      .from('hamster_profiles')
      .upsert(
        { user_id: user.id, coins: currentCoins + GOLD_NUT_COIN_BONUS, gold_nuts: collectedKeysRef.current.size },
        { onConflict: 'user_id' }
      );

    qc.invalidateQueries({ queryKey: ['hamster-profile', user.id] });

    // Celebration triggern
    emitCelebration({
      id: Date.now(),
      nut: def,
      bonusCoins: GOLD_NUT_COIN_BONUS,
    });

    return true;
  }, [user, qc]);

  return {
    nuts,
    collectedCount: nuts.length,
    totalPossible: GOLD_NUT_TOTAL,
    catalogCount: GOLD_NUTS.length,
    hasGoldNut,
    awardGoldNut,
    loading,
  };
}

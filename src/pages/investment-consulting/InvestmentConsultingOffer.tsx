import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2, Shield, ArrowRight, Sparkles,
  Target, Package, Star, Eye, EyeOff, Plus, Minus,
  Save, MessageSquare, Crown,
} from 'lucide-react';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import {
  allOfferModules,
  defaultOutcomeGoals,
  riskReversalItems,
  formatCHF,
  packageConfigs,
  type OfferModule,
  type PackageTier,
} from '@/config/investmentOfferConfig';
import { cn } from '@/lib/utils';

/* ── Derive which categories are active from selected tiles ── */
function getActiveCategoryIds(selectedTileIds: string[]): string[] {
  const active = new Set<string>();
  needsCategories.forEach((cat) => {
    cat.tiles.forEach((tile) => {
      if (selectedTileIds.includes(tile.id)) active.add(cat.id);
    });
  });
  return Array.from(active);
}

export default function InvestmentConsultingOffer() {
  const navigate = useNavigate();
  const { consultationData, updateData } = useInvestmentConsultationState();

  /* ── Read needs data ── */
  const needsData = (consultationData?.additionalData as any)?.needs as
    | { tiles: Record<string, { selected: boolean; note: string }> }
    | undefined;

  const selectedTileIds = useMemo(() => {
    if (!needsData?.tiles) return [];
    return Object.entries(needsData.tiles)
      .filter(([, v]) => v.selected)
      .map(([id]) => id);
  }, [needsData]);

  /* ── Read module selections from answers ── */
  const answersData = (consultationData?.additionalData as any)?.answers as
    | Record<string, { selectedModuleIds?: string[] }>
    | undefined;

  const answerSelectedModuleIds = useMemo(() => {
    if (!answersData) return new Set<string>();
    const ids = new Set<string>();
    Object.values(answersData).forEach((a) => {
      a.selectedModuleIds?.forEach((id) => ids.add(id));
    });
    return ids;
  }, [answersData]);

  /* ── Modules derived from answers ── */
  const relevantModules = useMemo(() => {
    if (answerSelectedModuleIds.size === 0) return [];
    return allOfferModules.filter((m) => answerSelectedModuleIds.has(m.id));
  }, [answerSelectedModuleIds]);

  /* ── Advisor controls ── */
  const [showAdvisorView, setShowAdvisorView] = useState(false);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [extraModules, setExtraModules] = useState<OfferModule[]>([]);
  const [recommendedTier, setRecommendedTier] = useState<PackageTier>('standard');

  // Package tier assignments: moduleId → set of tiers
  const [tierAssignments, setTierAssignments] = useState<Record<string, Set<PackageTier>>>(() => {
    // Default: all modules in standard + premium, subset in starter
    const assignments: Record<string, Set<PackageTier>> = {};
    relevantModules.forEach((mod, idx) => {
      assignments[mod.id] = new Set(
        idx < 3 ? ['starter', 'standard', 'premium'] : ['standard', 'premium']
      );
    });
    return assignments;
  });

  // Package prices
  const [packagePrices, setPackagePrices] = useState<Record<PackageTier, number | null>>({
    starter: null,
    standard: null,
    premium: null,
  });

  /* ── All modules for display ── */
  const allModules = useMemo(() => {
    const mods = relevantModules.map((m) => ({
      ...m,
      value: priceOverrides[m.id] ?? m.value,
    }));
    return [...mods, ...extraModules];
  }, [relevantModules, priceOverrides, extraModules]);

  /* ── Modules per tier ── */
  const getModulesForTier = useCallback((tier: PackageTier) => {
    return allModules.filter((m) => tierAssignments[m.id]?.has(tier));
  }, [allModules, tierAssignments]);

  const getTierValue = useCallback((tier: PackageTier) => {
    return getModulesForTier(tier).reduce((sum, m) => sum + m.value, 0);
  }, [getModulesForTier]);

  const getTierPrice = useCallback((tier: PackageTier) => {
    if (packagePrices[tier] !== null) return packagePrices[tier]!;
    const value = getTierValue(tier);
    const discounts: Record<PackageTier, number> = { starter: 0.5, standard: 0.35, premium: 0.25 };
    return Math.round(value * (1 - discounts[tier]));
  }, [packagePrices, getTierValue]);

  /* ── Tier assignment toggle ── */
  const toggleTierAssignment = useCallback((moduleId: string, tier: PackageTier) => {
    setTierAssignments((prev) => {
      const current = prev[moduleId] ?? new Set();
      const next = new Set(current);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return { ...prev, [moduleId]: next };
    });
  }, []);

  /* ── Ensure new modules get default tier assignments ── */
  useMemo(() => {
    allModules.forEach((mod) => {
      if (!tierAssignments[mod.id]) {
        setTierAssignments((prev) => ({
          ...prev,
          [mod.id]: new Set(['standard', 'premium'] as PackageTier[]),
        }));
      }
    });
  }, [allModules]);

  /* ── Broadcast ── */
  useSectionBroadcast({
    section: 'offer',
    title: 'Dein individuelles Angebot',
    subtitle: 'Basierend auf unserem Gespräch zusammengestellt',
    items: defaultOutcomeGoals,
    extra: {
      offerModules: allModules.map((m) => ({ title: m.title, description: m.description })),
      offerPrice: formatCHF(getTierPrice('standard')),
      offerTotalValue: formatCHF(getTierValue('standard')),
    },
  });

  /* ── Advisor: add extra module ── */
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleValue, setNewModuleValue] = useState(500);
  const addExtraModule = useCallback(() => {
    if (!newModuleTitle.trim()) return;
    const id = `custom-${Date.now()}`;
    setExtraModules((prev) => [
      ...prev,
      { id, title: newModuleTitle.trim(), description: 'Individueller Baustein', value: newModuleValue },
    ]);
    setTierAssignments((prev) => ({ ...prev, [id]: new Set(['standard', 'premium'] as PackageTier[]) }));
    setNewModuleTitle('');
    setNewModuleValue(500);
  }, [newModuleTitle, newModuleValue]);

  const removeExtraModule = useCallback((id: string) => {
    setExtraModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /* ── No data state ── */
  if (selectedTileIds.length === 0 && allModules.length === 0) {
    return (
      <AppLayout>
        <div className="container py-12 max-w-3xl text-center space-y-4">
          <Package className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-semibold">Noch kein Angebot verfügbar</h1>
          <p className="text-muted-foreground">
            Wähle zuerst in der Vorsorgeoptimierung die relevanten Fragen aus, damit ein individuelles Angebot erstellt werden kann.
          </p>
          <Button onClick={() => navigate('/app/investment-consulting/needs')}>
            Zur Vorsorgeoptimierung
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 space-y-6 max-w-5xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dein individuelles Angebot</h1>
            <p className="text-muted-foreground mt-1">
              Basierend auf unserem Gespräch zusammengestellt
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {showAdvisorView ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <Switch checked={showAdvisorView} onCheckedChange={setShowAdvisorView} />
              <span className="text-xs text-muted-foreground">Berateransicht</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* BLOCK 1 – Outcome Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Das Ziel
            </CardTitle>
            <CardDescription>Was du am Ende dieses Prozesses hast</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {defaultOutcomeGoals.map((goal) => (
                <li key={goal} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* BLOCK 2 – 3 Package Tiers (Customer View) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packageConfigs.map((pkg) => {
            const tierModules = getModulesForTier(pkg.tier);
            const tierValue = getTierValue(pkg.tier);
            const tierPrice = getTierPrice(pkg.tier);
            const isRecommended = pkg.tier === recommendedTier;

            return (
              <Card
                key={pkg.tier}
                className={cn(
                  'relative transition-all',
                  isRecommended
                    ? 'border-primary shadow-md ring-1 ring-primary/20'
                    : 'border-border',
                )}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Star className="w-3 h-3" />
                      Empfohlen
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {pkg.tier === 'premium' && <Crown className="w-4 h-4 text-primary" />}
                    {pkg.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Module list */}
                  <ul className="space-y-2">
                    {tierModules.map((mod) => (
                      <li key={mod.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{mod.title}</span>
                      </li>
                    ))}
                    {tierModules.length === 0 && (
                      <li className="text-xs text-muted-foreground">Keine Bausteine zugeordnet</li>
                    )}
                  </ul>

                  <Separator />

                  {/* Value + Price */}
                  <div className="space-y-1 text-center">
                    <p className="text-xs text-muted-foreground line-through">
                      Wert: {formatCHF(tierValue)}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold',
                      isRecommended ? 'text-primary' : 'text-foreground',
                    )}>
                      {formatCHF(tierPrice)}
                    </p>
                  </div>

                  {showAdvisorView && (
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Preis</Label>
                        <Input
                          type="number"
                          className="h-7 text-xs flex-1"
                          placeholder="Auto"
                          value={packagePrices[pkg.tier] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value ? parseInt(e.target.value) : null;
                            setPackagePrices((prev) => ({ ...prev, [pkg.tier]: v }));
                          }}
                        />
                      </div>
                      <Button
                        variant={isRecommended ? 'default' : 'outline'}
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setRecommendedTier(pkg.tier)}
                      >
                        {isRecommended ? '✓ Empfohlen' : 'Als Empfehlung setzen'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* BLOCK 3 – Advisor: Module ↔ Tier Assignment */}
        {showAdvisorView && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Bausteine den Paketen zuordnen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b">
                <span>Baustein</span>
                <span className="text-center">Wert</span>
                <span className="text-center">Einst.</span>
                <span className="text-center">Stand.</span>
                <span className="text-center">Prem.</span>
              </div>
              {allModules.map((mod) => (
                <div key={mod.id} className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 items-center text-sm py-1.5 border-b border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-xs">{mod.title}</span>
                    {mod.id.startsWith('custom-') && (
                      <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => removeExtraModule(mod.id)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <Input
                      type="number"
                      className="h-6 text-[11px] text-center w-full"
                      value={mod.value}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        if (mod.id.startsWith('custom-')) {
                          setExtraModules((prev) => prev.map((m) => (m.id === mod.id ? { ...m, value: v } : m)));
                        } else {
                          setPriceOverrides((prev) => ({ ...prev, [mod.id]: v }));
                        }
                      }}
                    />
                  </div>
                  {(['starter', 'standard', 'premium'] as PackageTier[]).map((tier) => (
                    <div key={tier} className="flex justify-center">
                      <Checkbox
                        checked={tierAssignments[mod.id]?.has(tier) ?? false}
                        onCheckedChange={() => toggleTierAssignment(mod.id, tier)}
                      />
                    </div>
                  ))}
                </div>
              ))}

              {/* Add custom module */}
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Baustein hinzufügen…"
                  className="h-7 text-xs flex-1"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
                <Input
                  type="number"
                  className="w-20 h-7 text-xs"
                  value={newModuleValue}
                  onChange={(e) => setNewModuleValue(parseInt(e.target.value) || 0)}
                />
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addExtraModule}>
                  <Plus className="w-3 h-3 mr-1" /> Hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLOCK 4 – Risk Reversal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Deine Sicherheit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {riskReversalItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* BLOCK 5 – Next Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Nächste Schritte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button className="w-full" size="lg">
                <Star className="w-4 h-4 mr-2" />
                Zusammenarbeit starten
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Angebot speichern
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => navigate('/app/investment-consulting/answers')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Fragen klären
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advisor: Internal Assessment */}
        {showAdvisorView && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Interne Berater-Einschätzung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {(['bereit', 'unsicher', 'offen'] as const).map((status) => (
                  <div
                    key={status}
                    className={cn(
                      'p-2 rounded-lg border cursor-pointer transition-colors text-xs font-medium',
                      'hover:bg-accent',
                    )}
                  >
                    {status === 'bereit' && '✅ Bereit'}
                    {status === 'unsicher' && '⚠️ Unsicher'}
                    {status === 'offen' && '❓ Offen'}
                  </div>
                ))}
              </div>
              <Input
                placeholder="z. B. Kunde bereit zur Entscheidung / hat letzte Unsicherheiten / braucht Bestätigung"
                className="text-xs"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, Shield, ArrowRight, Target, Package, Star,
  Eye, Crown, Gift, TrendingUp, ChevronDown, ChevronUp, RotateCcw,
  BarChart3,
} from 'lucide-react';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { useViewMode } from '@/hooks/useViewMode';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import {
  preWork, products, scoreProducts, generatePackages, formatCHF,
  packageConfigs, riskReversalItems, defaultCategoryWeights, categoryLabels,
  getDefaultOfferState, SCORE_THRESHOLDS,
  type ScoredProduct, type PackageTier, type GeneratedPackage, type QuestionCategory,
} from '@/config/investmentProductConfig';
import { cn } from '@/lib/utils';

const tierIcons: Record<PackageTier, typeof Star> = {
  starter: Target,
  standard: Star,
  premium: Crown,
};

export default function InvestmentConsultingOffer() {
  const navigate = useNavigate();
  const { consultationData, updateData } = useInvestmentConsultationState();
  const { isPresentation } = useViewMode();

  /* ── Read selected tiles ── */
  const needsData = (consultationData?.additionalData as Record<string, unknown>)?.needs as
    | { tiles: Record<string, { selected: boolean }> }
    | undefined;

  const selectedTileIds = useMemo(() => {
    if (!needsData?.tiles) return [];
    return Object.entries(needsData.tiles)
      .filter(([, v]) => v.selected)
      .map(([id]) => id);
  }, [needsData]);

  /* ── Offer state from consultation data ── */
  const offerData = (consultationData?.additionalData as Record<string, unknown>)?.offer as
    ReturnType<typeof getDefaultOfferState> | undefined;

  const [overrides, setOverrides] = useState<Record<string, number>>(offerData?.overrides ?? {});
  const [disabledProducts, setDisabledProducts] = useState<Set<string>>(new Set(offerData?.disabledProducts ?? []));
  const [categoryWeights, setCategoryWeights] = useState<Record<QuestionCategory, number>>(
    offerData?.categoryWeights ?? { ...defaultCategoryWeights },
  );
  const [priceOverrides, setPriceOverrides] = useState<Record<PackageTier, number | null>>(
    offerData?.priceOverrides ?? { starter: null, standard: null, premium: null },
  );
  const [recommendedTier, setRecommendedTier] = useState<PackageTier>(offerData?.recommendedTier ?? 'standard');
  const [internalNote, setInternalNote] = useState(offerData?.internalNote ?? '');
  const [readiness, setReadiness] = useState(offerData?.readiness ?? '');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  /* ── Scoring ── */
  const scoringResult = useMemo(
    () => scoreProducts(selectedTileIds, overrides, disabledProducts, categoryWeights),
    [selectedTileIds, overrides, disabledProducts, categoryWeights],
  );
  const scored = scoringResult.products;
  const categoryScores = scoringResult.categoryScores;
  const maxScore = scoringResult.maxScore;

  const packages = useMemo(() => generatePackages(scored), [scored]);

  /* ── Persist ── */
  const persistOffer = useCallback(
    (partial: Record<string, unknown>) => {
      updateData((prev) => ({
        ...prev,
        additionalData: {
          ...(prev.additionalData as Record<string, unknown>),
          offer: {
            ...((prev.additionalData as Record<string, unknown>)?.offer as Record<string, unknown> ?? {}),
            ...partial,
          },
        },
      }));
    },
    [updateData],
  );

  const setOverrideAndPersist = (productId: string, bonus: number) => {
    const next = { ...overrides, [productId]: bonus };
    setOverrides(next);
    persistOffer({ overrides: next });
  };

  const toggleProduct = (productId: string) => {
    const next = new Set(disabledProducts);
    if (next.has(productId)) next.delete(productId); else next.add(productId);
    setDisabledProducts(next);
    persistOffer({ disabledProducts: Array.from(next) });
  };

  const setCategoryWeightAndPersist = (cat: QuestionCategory, value: number) => {
    const next = { ...categoryWeights, [cat]: value };
    setCategoryWeights(next);
    persistOffer({ categoryWeights: next });
  };

  const setPriceOverrideAndPersist = (tier: PackageTier, value: number | null) => {
    const next = { ...priceOverrides, [tier]: value };
    setPriceOverrides(next);
    persistOffer({ priceOverrides: next });
  };

  const setRecommendedAndPersist = (tier: PackageTier) => {
    setRecommendedTier(tier);
    persistOffer({ recommendedTier: tier });
  };

  const resetAll = () => {
    const defaults = getDefaultOfferState();
    setOverrides(defaults.overrides);
    setDisabledProducts(new Set(defaults.disabledProducts));
    setCategoryWeights(defaults.categoryWeights);
    setPriceOverrides(defaults.priceOverrides);
    setRecommendedTier(defaults.recommendedTier);
    setInternalNote(defaults.internalNote);
    setReadiness(defaults.readiness);
    persistOffer(defaults);
  };

  /* ── Package price ── */
  const getPackagePrice = (pkg: GeneratedPackage, tier: PackageTier): number => {
    if (priceOverrides[tier] !== null && priceOverrides[tier] !== undefined) return priceOverrides[tier]!;
    const discounts: Record<PackageTier, number> = { starter: 0.5, standard: 0.35, premium: 0.25 };
    return Math.round(pkg.totalValue * (1 - discounts[tier]));
  };

  /* ── Broadcast ── */
  const recPkg = packages.find((p) => p.config.tier === recommendedTier);
  useSectionBroadcast({
    section: 'offer',
    title: 'Das ergibt sich aus unserem Gespräch',
    subtitle: 'Deine individuelle Empfehlung',
    items: scored.filter((p) => p.tier === 'main').map((p) => p.name),
    extra: {
      offerModules: scored.map((p) => ({ title: p.name, description: p.description })),
      offerPrice: recPkg ? formatCHF(getPackagePrice(recPkg, recommendedTier)) : '',
      offerTotalValue: recPkg ? formatCHF(recPkg.totalValue) : '',
    },
  });

  /* ── Empty state ── */
  if (selectedTileIds.length === 0) {
    return (
      <AppLayout>
        <div className="container py-12 max-w-3xl text-center space-y-4">
          <Package className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-semibold">Noch kein Angebot verfügbar</h1>
          <p className="text-muted-foreground">
            Wähle zuerst die relevanten Themen aus, damit sich ein individuelles Angebot ergeben kann.
          </p>
          <Button onClick={() => navigate('/app/investment-consulting/needs')}>
            Zur Vorsorgeoptimierung
          </Button>
        </div>
      </AppLayout>
    );
  }

  /* ================================================================ */
  /* PRESENTATION VIEW                                                 */
  /* ================================================================ */
  if (isPresentation) {
    // Category score visualization data
    const catEntries = Object.entries(categoryScores)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);
    const catMax = catEntries.length > 0 ? catEntries[0][1] : 1;

    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl py-12 space-y-10">
            {/* Header */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Das ergibt sich aus unserem Gespräch
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Basierend auf deinen Themen und Fragen habe ich eine individuelle Empfehlung für dich zusammengestellt.
              </p>
            </div>

            {/* Category visualization */}
            {catEntries.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Basierend auf unserem Gespräch:
                    </p>
                    <div className="space-y-3">
                      {catEntries.map(([cat, score]) => {
                        const pct = Math.round((score / catMax) * 100);
                        const label = categoryLabels[cat as QuestionCategory] ?? cat;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground font-medium">{label}</span>
                              <span className="text-muted-foreground tabular-nums">{pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Phase 1 – Pre-work */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              <Card className="border-primary/20 bg-primary/[0.02]">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-foreground">{preWork.title}</h3>
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                          Bereits für dich gemacht
                        </Badge>
                      </div>
                      <ul className="space-y-1.5">
                        {preWork.items.map((item) => (
                          <li key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            {item.label}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                        Diese Analyse hast du bereits im heutigen Gespräch erhalten.
                        <span className="font-medium text-foreground ml-1">Wert: {formatCHF(preWork.value)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phase 2 – Recommendations */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '350ms', animationFillMode: 'backwards' }}>
              <h2 className="text-xl font-semibold text-foreground">Deine nächsten sinnvollen Schritte</h2>

              {scored.filter((p) => p.tier === 'main').length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Hauptfokus
                  </p>
                  {scored.filter((p) => p.tier === 'main').map((p) => (
                    <ProductCard key={p.id} product={p} emphasis="high" maxScore={maxScore} />
                  ))}
                </div>
              )}

              {scored.filter((p) => p.tier === 'complementary').length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Ergänzende Empfehlungen
                  </p>
                  {scored.filter((p) => p.tier === 'complementary').map((p) => (
                    <ProductCard key={p.id} product={p} emphasis="medium" maxScore={maxScore} />
                  ))}
                </div>
              )}

              {scored.filter((p) => p.tier === 'optional').length > 0 && (
                <CollapsibleSection label="Weitere Optionen" defaultOpen={false}>
                  {scored.filter((p) => p.tier === 'optional').map((p) => (
                    <ProductCard key={p.id} product={p} emphasis="low" maxScore={maxScore} />
                  ))}
                </CollapsibleSection>
              )}
            </div>

            {/* Packages */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
              <h2 className="text-xl font-semibold text-foreground">Dein individuelles Konzept</h2>
              <p className="text-sm text-muted-foreground">
                Drei Varianten – passend zu deinen Prioritäten und deinem Tempo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.config.tier}
                    pkg={pkg}
                    price={getPackagePrice(pkg, pkg.config.tier)}
                    isRecommended={pkg.config.tier === recommendedTier}
                  />
                ))}
              </div>
            </div>

            {/* Risk Reversal */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '650ms', animationFillMode: 'backwards' }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Deine Sicherheit</h3>
                      <ul className="space-y-2">
                        {riskReversalItems.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  /* ================================================================ */
  /* ADMIN VIEW                                                        */
  /* ================================================================ */
  return (
    <AppLayout>
      <div className="container px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold">Produkt- & Angebotslogik</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {selectedTileIds.length} Themen · {scored.length} Produkte aktiv
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{showAdminPanel ? 'Steuerung ausblenden' : 'Steuerung einblenden'}</span>
              <span className="sm:hidden">Steuerung</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Pre-work */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{preWork.title}</p>
                <p className="text-xs text-muted-foreground">
                  Fixe Vorleistung · {formatCHF(preWork.value)} · Wird immer angezeigt
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">Phase 1</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category scores visualization (admin) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Kategorie-Scores
            </CardTitle>
            <CardDescription>
              Gewichtete Relevanz pro Themenbereich basierend auf ausgewählten Fragen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categoryScores)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, score]) => {
                const maxCat = Math.max(...Object.values(categoryScores), 1);
                const pct = Math.round((score / maxCat) * 100);
                const label = categoryLabels[cat as QuestionCategory] ?? cat;
                const weight = categoryWeights[cat as QuestionCategory] ?? 1;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        Score: {score.toFixed(1)} · Gewicht: ×{weight}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {Object.values(categoryScores).every((v) => v === 0) && (
              <p className="text-xs text-muted-foreground">Noch keine Kategorie-Scores vorhanden.</p>
            )}
          </CardContent>
        </Card>

        {/* Scored products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Produkt-Scoring
            </CardTitle>
            <CardDescription>
              Höherer Score = stärkere Empfehlung · Schwellenwerte: {'>'}6 Haupt / {'>'}4 Ergänz. / {'>'}2 Optional / {'<'}2 versteckt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="grid grid-cols-[1fr_100px_80px_80px_50px] gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
              <span>Produkt</span>
              <span className="text-center">Score</span>
              <span className="text-center">Tier</span>
              <span className="text-center">Wert</span>
              <span className="text-center">An</span>
            </div>
            {products.filter((p) => p.active).map((product) => {
              const sp = scored.find((s) => s.id === product.id);
              const isDisabled = disabledProducts.has(product.id);
              const score = sp?.score ?? 0;
              const tier = sp?.tier;
              const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

              return (
                <div
                  key={product.id}
                  className={cn(
                    'grid grid-cols-[1fr_100px_80px_80px_50px] gap-2 items-center py-2 border-b border-border/40 text-sm',
                    isDisabled && 'opacity-40',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-xs">{product.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          score > SCORE_THRESHOLDS.complementary ? 'bg-primary' :
                          score > SCORE_THRESHOLDS.optional ? 'bg-amber-500' :
                          'bg-muted-foreground/40',
                        )}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums w-8 text-right font-mono">{score}</span>
                  </div>
                  <div className="text-center">
                    {tier ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          tier === 'main' && 'border-primary text-primary',
                          tier === 'complementary' && 'border-amber-500 text-amber-600',
                        )}
                      >
                        {tier === 'main' ? 'Haupt' : tier === 'complementary' ? 'Ergänz.' : 'Optional'}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    {formatCHF(product.baseValue)}
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={!isDisabled}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Admin controls panel */}
        {showAdminPanel && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Manuelle Steuerung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category weights */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Kategorie-Gewichtung (Multiplikator)</Label>
                {(Object.entries(categoryWeights) as [QuestionCategory, number][]).map(([cat, w]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs w-32 truncate">{categoryLabels[cat]}</span>
                    <Slider
                      className="flex-1"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={[w]}
                      onValueChange={([v]) => setCategoryWeightAndPersist(cat, v)}
                    />
                    <span className="text-xs w-10 text-right font-mono tabular-nums">×{w.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Score overrides */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Produkt-Bonus (manuell)</Label>
                {scored.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs w-40 truncate">{p.name}</span>
                    <Slider
                      className="flex-1"
                      min={-5}
                      max={10}
                      step={1}
                      value={[overrides[p.id] ?? 0]}
                      onValueChange={([v]) => setOverrideAndPersist(p.id, v)}
                    />
                    <span className="text-xs w-8 text-right font-mono">
                      {(overrides[p.id] ?? 0) > 0 ? '+' : ''}{overrides[p.id] ?? 0}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Package price overrides */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Paketpreise überschreiben</Label>
                <div className="grid grid-cols-3 gap-3">
                  {packageConfigs.map((cfg) => (
                    <div key={cfg.tier} className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">{cfg.label}</Label>
                      <Input
                        type="number"
                        placeholder="Auto"
                        className="h-8 text-xs"
                        value={priceOverrides[cfg.tier] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value ? parseInt(e.target.value) : null;
                          setPriceOverrideAndPersist(cfg.tier, v);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recommended tier */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Empfohlenes Paket</Label>
                <div className="flex gap-2">
                  {packageConfigs.map((cfg) => (
                    <Button
                      key={cfg.tier}
                      variant={recommendedTier === cfg.tier ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRecommendedAndPersist(cfg.tier)}
                    >
                      {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Internal note & readiness */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Interne Notiz</Label>
                  <Input
                    placeholder="z. B. Kunde offen für Premium…"
                    className="text-xs h-8"
                    value={internalNote}
                    onChange={(e) => {
                      setInternalNote(e.target.value);
                      persistOffer({ internalNote: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bereitschaft</Label>
                  <div className="flex gap-1">
                    {['bereit', 'unsicher', 'offen'].map((s) => (
                      <Button
                        key={s}
                        variant={readiness === s ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => { setReadiness(s); persistOffer({ readiness: s }); }}
                      >
                        {s === 'bereit' ? '✅' : s === 'unsicher' ? '⚠️' : '❓'} {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Package preview */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Paket-Vorschau (Kundenansicht)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.config.tier}
                pkg={pkg}
                price={getPackagePrice(pkg, pkg.config.tier)}
                isRecommended={pkg.config.tier === recommendedTier}
              />
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => navigate('/app/investment-consulting/answers')}>
            Zurück zu Antworten
          </Button>
          <Button onClick={() => navigate('/app/investment-consulting/summary')}>
            Weiter zur Zusammenfassung
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

/* ── Sub-components ── */

function ProductCard({ product, emphasis, maxScore }: { product: ScoredProduct; emphasis: 'high' | 'medium' | 'low'; maxScore: number }) {
  return (
    <Card
      className={cn(
        'transition-all',
        emphasis === 'high' && 'border-primary/30 bg-primary/[0.02]',
        emphasis === 'low' && 'opacity-80',
      )}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <CheckCircle2
          className={cn(
            'h-4 w-4 shrink-0 mt-0.5',
            emphasis === 'high' ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', emphasis === 'high' && 'text-foreground')}>
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PackageCard({ pkg, price, isRecommended }: { pkg: GeneratedPackage; price: number; isRecommended: boolean }) {
  const TierIcon = tierIcons[pkg.config.tier];
  return (
    <Card
      className={cn(
        'relative transition-all',
        isRecommended ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border',
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Star className="w-3 h-3" /> Empfohlen
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-base flex items-center gap-2">
          <TierIcon className="w-4 h-4 text-primary" />
          {pkg.config.label}
        </CardTitle>
        <CardDescription className="text-xs">{pkg.config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
            {preWork.title}
          </li>
          {pkg.products.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
              {p.name}
            </li>
          ))}
        </ul>
        <Separator />
        <div className="text-center space-y-0.5">
          <p className="text-[11px] text-muted-foreground line-through">
            Wert: {formatCHF(pkg.totalValue)}
          </p>
          <p className={cn('text-xl font-bold', isRecommended ? 'text-primary' : 'text-foreground')}>
            {formatCHF(price)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CollapsibleSection({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {label}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

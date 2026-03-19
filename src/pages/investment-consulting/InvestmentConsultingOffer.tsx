import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2, Gift, Shield, ArrowRight, Sparkles,
  Target, Package, Star, Percent, Eye, EyeOff, Plus, Minus,
  Save, MessageSquare,
} from 'lucide-react';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { needsCategories } from '@/config/investmentNeedsConfig';
import {
  categoryOfferMappings,
  defaultOutcomeGoals,
  riskReversalItems,
  formatCHF,
  type OfferModule,
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
  const { t } = useTranslation();
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

  const activeCategoryIds = useMemo(
    () => getActiveCategoryIds(selectedTileIds),
    [selectedTileIds],
  );

  /* ── Advisor controls ── */
  const [showAdvisorView, setShowAdvisorView] = useState(false);
  const [removedModuleIds, setRemovedModuleIds] = useState<Set<string>>(new Set());
  const [extraModules, setExtraModules] = useState<OfferModule[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  /* ── Computed modules ── */
  const autoModules = useMemo(() => {
    const modules: OfferModule[] = [];
    categoryOfferMappings.forEach((mapping) => {
      if (activeCategoryIds.includes(mapping.categoryId)) {
        mapping.modules.forEach((mod) => {
          if (!removedModuleIds.has(mod.id)) {
            modules.push({ ...mod, value: priceOverrides[mod.id] ?? mod.value });
          }
        });
      }
    });
    return modules;
  }, [activeCategoryIds, removedModuleIds, priceOverrides]);

  const allModules = useMemo(
    () => [...autoModules, ...extraModules],
    [autoModules, extraModules],
  );

  const totalValue = useMemo(
    () => allModules.reduce((sum, m) => sum + m.value, 0),
    [allModules],
  );

  const finalPrice = customPrice ?? Math.round(totalValue * (1 - discountPercent / 100));
  const savings = totalValue - finalPrice;

  /* ── Advisor: toggle module ── */
  const toggleModule = useCallback((id: string) => {
    setRemovedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ── Advisor: update value ── */
  const updateModuleValue = useCallback((id: string, value: number) => {
    setPriceOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);

  /* ── Advisor: add extra module ── */
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleValue, setNewModuleValue] = useState(500);
  const addExtraModule = useCallback(() => {
    if (!newModuleTitle.trim()) return;
    setExtraModules((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: newModuleTitle.trim(),
        description: 'Individueller Baustein',
        value: newModuleValue,
      },
    ]);
    setNewModuleTitle('');
    setNewModuleValue(500);
  }, [newModuleTitle, newModuleValue]);

  const removeExtraModule = useCallback((id: string) => {
    setExtraModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /* ── No data state ── */
  if (selectedTileIds.length === 0) {
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
      <div className="container py-6 space-y-6 max-w-4xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dein individuelles Konzept</h1>
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
              <Switch
                checked={showAdvisorView}
                onCheckedChange={setShowAdvisorView}
              />
              <span className="text-xs text-muted-foreground">Berateransicht</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════
            BLOCK 1 – Outcome / Goal
            ═══════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════
            BLOCK 2 – Dynamic Modules
            ═══════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Was du bekommst
            </CardTitle>
            <CardDescription>
              Individuell zusammengestellt aus {activeCategoryIds.length} Themenbereichen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allModules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{mod.title}</span>
                    {showAdvisorView && (
                      <Badge variant="outline" className="text-[10px]">
                        {formatCHF(mod.value)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                </div>
                {showAdvisorView && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Input
                      type="number"
                      className="w-20 h-7 text-xs"
                      value={mod.value}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        if (mod.id.startsWith('custom-')) {
                          setExtraModules((prev) =>
                            prev.map((m) => (m.id === mod.id ? { ...m, value: v } : m))
                          );
                        } else {
                          updateModuleValue(mod.id, v);
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        if (mod.id.startsWith('custom-')) removeExtraModule(mod.id);
                        else toggleModule(mod.id);
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Advisor: add custom module */}
            {showAdvisorView && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  placeholder="Baustein hinzufügen…"
                  className="h-8 text-xs flex-1"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
                <Input
                  type="number"
                  className="w-20 h-8 text-xs"
                  value={newModuleValue}
                  onChange={(e) => setNewModuleValue(parseInt(e.target.value) || 0)}
                />
                <Button variant="outline" size="sm" className="h-8" onClick={addExtraModule}>
                  <Plus className="w-3 h-3 mr-1" /> Hinzufügen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════
            BLOCK 3 – Value Stack (Hormozi)
            ═══════════════════════════════════════════ */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Dein Gesamtwert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {allModules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between text-sm">
                  <span>{mod.title}</span>
                  <span className="text-muted-foreground">{formatCHF(mod.value)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Gesamtwert</span>
              <span className="text-lg">{formatCHF(totalValue)}+</span>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════
            BLOCK 4 – Price
            ═══════════════════════════════════════════ */}
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Dein Preis heute</p>
            <div className="text-4xl font-bold text-primary">
              {formatCHF(finalPrice)}
            </div>
            {savings > 0 && (
              <p className="text-sm text-muted-foreground">
                Du sparst {formatCHF(savings)} gegenüber dem Einzelwert
              </p>
            )}
            {showAdvisorView && (
              <div className="flex items-center justify-center gap-4 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Rabatt %</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    value={discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)));
                      setCustomPrice(null);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Festpreis</Label>
                  <Input
                    type="number"
                    className="w-24 h-7 text-xs"
                    placeholder="optional"
                    value={customPrice ?? ''}
                    onChange={(e) => {
                      const v = e.target.value ? parseInt(e.target.value) : null;
                      setCustomPrice(v);
                    }}
                  />
                </div>
                {customPrice !== null && (
                  <Badge variant="outline" className="text-[10px]">
                    Marge: {formatCHF(totalValue - finalPrice)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════
            BLOCK 5 – Risk Reversal
            ═══════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════
            BLOCK 6 – Next Steps
            ═══════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════
            Advisor: Internal Assessment
            ═══════════════════════════════════════════ */}
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

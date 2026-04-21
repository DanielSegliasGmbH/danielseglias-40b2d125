import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Calculator, PieChart, TrendingUp, FileText, ChevronRight, Search, LucideIcon, Archive, AlertTriangle, Clock } from 'lucide-react';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import type { Tool } from '@/hooks/useTools';
import { resolveToolText } from '@/lib/toolTranslations';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
};

export default function ClientPortalTools() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isUnlocked, currentPhase, loading: unlockLoading } = useFeatureUnlock();
  const [search, setSearch] = useState('');

  // Fetch all client-enabled tools (active + planned) regardless of visibility,
  // so we can split into "available" and "coming soon" groups.
  const { data: tools, isLoading: toolsLoading, error } = useQuery({
    queryKey: ['client-tools-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('enabled_for_clients', true)
        .in('status', ['active', 'planned'])
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Tool[];
    },
  });

  const isLoading = toolsLoading || unlockLoading;

  // ARCHIVED for v1.0: phase-unlock disabled. Show all non-hidden/non-admin tools.
  const isAccessible = (tool: Tool): boolean => {
    if (tool.status !== 'active') return false;
    if (tool.visibility === 'hidden' || tool.visibility === 'admin_only') return false;
    return tool.visibility === 'public' || tool.visibility === 'phase_locked';
  };

  const isComingSoon = (tool: Tool): boolean => {
    if (tool.visibility === 'hidden' || tool.visibility === 'admin_only') return false;
    return tool.status === 'planned';
  };

  const matchesSearch = (tool: Tool): boolean => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = resolveToolText(t, tool.name_key, 'name').toLowerCase();
    const desc = resolveToolText(t, tool.description_key, 'description').toLowerCase();
    return name.includes(q) || desc.includes(q);
  };

  const { accessibleTools, comingSoonTools } = useMemo(() => {
    const accessible: Tool[] = [];
    const coming: Tool[] = [];
    for (const tool of tools ?? []) {
      if (!matchesSearch(tool)) continue;
      if (isAccessible(tool)) accessible.push(tool);
      else if (isComingSoon(tool)) coming.push(tool);
    }
    return { accessibleTools: accessible, comingSoonTools: coming };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools, search, currentPhase, t]);

  const renderAccessibleCard = (tool: Tool, idx: number) => {
    const IconComponent = iconMap[tool.icon] || Wrench;
    return (
      <motion.button
        key={tool.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: idx * 0.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => tool.slug && navigate(`/app/client-portal/tools/${tool.slug}`)}
        disabled={!tool.slug}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card text-left transition-colors",
          "hover:bg-accent/40 active:bg-accent/60",
          !tool.slug && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
          <IconComponent className="h-[18px] w-[18px] text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground truncate">
            {resolveToolText(t, tool.name_key, 'name')}
          </p>
          <p className="text-[13px] text-muted-foreground line-clamp-2">
            {resolveToolText(t, tool.description_key, 'description')}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      </motion.button>
    );
  };

  const renderComingSoonCard = (tool: Tool, idx: number) => {
    const IconComponent = iconMap[tool.icon] || Wrench;
    return (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: idx * 0.03 }}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/30 text-left",
          "opacity-70"
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Clock className="h-[18px] w-[18px] text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-muted-foreground truncate">
            {resolveToolText(t, tool.name_key, 'name')}
          </p>
          <p className="text-[13px] text-muted-foreground/80 line-clamp-2">
            {resolveToolText(t, tool.description_key, 'description')}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1">
          <Clock className="h-3 w-3" />
          Bald verfügbar
        </Badge>
        <IconComponent className="hidden" />
      </motion.div>
    );
  };

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">🔧 Werkzeuge</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Analyse- & Planungstools für deine Finanzen</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => navigate('/app/client-portal/tool-archive')}
          >
            <Archive className="h-3.5 w-3.5" />
            Mein Archiv
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Hinweis:</strong>{' '}
            Die Berechnungen der Werkzeuge sind Schätzungen und dienen nur zur Orientierung. Zahlen bitte immer kritisch prüfen und nicht als verbindlich betrachten.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tool suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-muted/50 border-border/50"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-sm text-destructive">
              {t('app.loadError')}
            </CardContent>
          </Card>
        )}

        {/* No search results */}
        {!isLoading && !error && search.trim() && accessibleTools.length === 0 && comingSoonTools.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Kein Tool gefunden für „{search}"</p>
          </div>
        )}

        {/* Section 1 — Verfügbare Tools */}
        {!isLoading && !error && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Verfügbare Tools
            </p>
            {accessibleTools.length > 0 ? (
              <div className="space-y-1.5">
                {accessibleTools.map((tool, idx) => renderAccessibleCard(tool, idx))}
              </div>
            ) : (
              !search.trim() && (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-xl border border-border/50 bg-muted/20">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Wrench className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Noch keine Tools verfügbar</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Dein Berater schaltet sie schrittweise frei.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Section 2 — Demnächst verfügbar */}
        {!isLoading && !error && comingSoonTools.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Demnächst verfügbar
            </p>
            <div className="space-y-1.5">
              {comingSoonTools.map((tool, idx) => renderComingSoonCard(tool, idx))}
            </div>
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

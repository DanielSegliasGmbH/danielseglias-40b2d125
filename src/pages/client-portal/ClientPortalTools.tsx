import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Calculator, PieChart, TrendingUp, FileText, ChevronRight, Search, LucideIcon, Archive } from 'lucide-react';
import { useClientToolsFiltered } from '@/hooks/useClientPortal';
import { groupToolsByCluster } from '@/config/toolClusters';
import { resolveToolText } from '@/lib/toolTranslations';
import { Separator } from '@/components/ui/separator';
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
  const { data: tools, isLoading, error } = useClientToolsFiltered();
  const [search, setSearch] = useState('');

  const hasTools = tools && tools.length > 0;
  const clusteredTools = hasTools ? groupToolsByCluster(tools) : [];

  // Filter by search
  const filteredClusters = clusteredTools.map(({ cluster, tools: clusterTools }) => ({
    cluster,
    tools: clusterTools.filter(tool => {
      if (!search.trim()) return true;
      const name = resolveToolText(t, tool.name_key, 'name').toLowerCase();
      const desc = resolveToolText(t, tool.description_key, 'description').toLowerCase();
      return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    }),
  })).filter(c => c.tools.length > 0);

  let globalIndex = 0;

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5 overflow-x-hidden w-full">
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

        {/* Empty */}
        {!isLoading && !hasTools && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Noch keine Tools freigeschaltet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Dein Berater schaltet die passenden Analyse-Tools für dich frei.
            </p>
          </div>
        )}

        {/* No results */}
        {!isLoading && hasTools && filteredClusters.length === 0 && search.trim() && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Kein Tool gefunden für „{search}"</p>
          </div>
        )}

        {/* Tool list */}
        {filteredClusters.map(({ cluster, tools: clusterTools }, clusterIdx) => (
          <div key={cluster.key}>
            {clusterIdx > 0 && <Separator className="mb-4" />}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {t(cluster.i18nKey)}
            </p>
            <div className="space-y-1.5">
              {clusterTools.map((tool) => {
                const IconComponent = iconMap[tool.icon] || Wrench;
                const idx = globalIndex++;
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
                      <p className="text-[13px] text-muted-foreground truncate">
                        {resolveToolText(t, tool.description_key, 'description')}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ClientPortalLayout>
  );
}

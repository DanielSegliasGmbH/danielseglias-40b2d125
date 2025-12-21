import { useTranslation } from 'react-i18next';
import { X, ArrowRight, ArrowLeft, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SystemMapNode, SystemMapEdge } from '@/hooks/useSystemMap';

interface SystemMapDetailPanelProps {
  node: SystemMapNode;
  edges: SystemMapEdge[];
  nodes: SystemMapNode[];
  onClose: () => void;
  onCompare: () => void;
  compareNodeKey: string | null;
  shortestPath: string[];
}

const categoryLabels: Record<string, string> = {
  core: 'Core',
  module: 'Module',
  ui: 'UI',
  security: 'Security',
  automation: 'Automation',
  integration: 'Integration',
};

const categoryColors: Record<string, string> = {
  core: 'bg-primary/10 text-primary',
  module: 'bg-chart-2/10 text-chart-2',
  ui: 'bg-chart-3/10 text-chart-3',
  security: 'bg-destructive/10 text-destructive',
  automation: 'bg-chart-4/10 text-chart-4',
  integration: 'bg-chart-5/10 text-chart-5',
};

export function SystemMapDetailPanel({
  node,
  edges,
  nodes,
  onClose,
  onCompare,
  compareNodeKey,
  shortestPath,
}: SystemMapDetailPanelProps) {
  const { t } = useTranslation();

  const outgoingEdges = edges.filter((e) => e.source_key === node.key);
  const incomingEdges = edges.filter((e) => e.target_key === node.key);

  const getNodeLabel = (key: string) => nodes.find((n) => n.key === key)?.label || key;

  return (
    <div className="w-80 bg-card border-l h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">{node.label}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Category */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('systemMap.category')}</p>
            <Badge className={categoryColors[node.category]}>
              {categoryLabels[node.category]}
            </Badge>
          </div>

          {/* Description */}
          {node.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('systemMap.description')}</p>
              <p className="text-sm">{node.description}</p>
            </div>
          )}

          <Separator />

          {/* Outgoing (uses/contains) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{t('systemMap.uses')}</p>
            </div>
            {outgoingEdges.length > 0 ? (
              <div className="space-y-1">
                {outgoingEdges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{edge.relation}:</span>
                    <span>{getNodeLabel(edge.target_key)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t('systemMap.noConnections')}</p>
            )}
          </div>

          {/* Incoming (depends on) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{t('systemMap.dependsOn')}</p>
            </div>
            {incomingEdges.length > 0 ? (
              <div className="space-y-1">
                {incomingEdges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{edge.relation}:</span>
                    <span>{getNodeLabel(edge.source_key)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t('systemMap.noConnections')}</p>
            )}
          </div>

          <Separator />

          {/* Compare Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onCompare}
            disabled={compareNodeKey === node.key}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {compareNodeKey ? t('systemMap.compareTo') : t('systemMap.selectForCompare')}
          </Button>

          {/* Shortest Path Display */}
          {shortestPath.length > 1 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium mb-2">{t('systemMap.shortestPath')}</p>
              <div className="flex flex-wrap items-center gap-1 text-sm">
                {shortestPath.map((key, i) => (
                  <span key={key} className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {getNodeLabel(key)}
                    </Badge>
                    {i < shortestPath.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {compareNodeKey && shortestPath.length === 0 && (
            <div className="mt-4 p-3 bg-destructive/5 rounded-lg">
              <p className="text-sm text-destructive">{t('systemMap.noPathFound')}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

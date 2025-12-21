import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  NODE_CATEGORIES,
  NODE_IMPORTANCE,
  NODE_PHASES,
  EDGE_RELATIONS,
  categoryColors,
} from './types';

const PHASE_NAMES = ['Foundation', 'Core CRM', 'Processes', 'Client Portal', 'Expert Modules'] as const;

const RELATION_STYLES: Record<string, { strokeDasharray?: string; strokeWidth: number }> = {
  owns: { strokeWidth: 2.5 },
  contains: { strokeWidth: 2.5 },
  depends_on: { strokeDasharray: '4 2', strokeWidth: 1.5 },
  uses: { strokeWidth: 1.5 },
  manages: { strokeWidth: 1.5 },
  creates: { strokeDasharray: '2 2', strokeWidth: 1.5 },
};

export const SystemMapLegend = memo(function SystemMapLegend() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="w-auto shadow-lg">
          <CollapsibleTrigger asChild>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4" />
                {t('systemMap.legend.title')}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-3 pt-0 space-y-4 max-w-xs">
              {/* Categories */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  {t('systemMap.legend.categories')}
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {NODE_CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColors[cat] }}
                      />
                      <span className="text-xs truncate">
                        {t(`systemMap.legend.category.${cat}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Relations */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  {t('systemMap.legend.relations')}
                </h4>
                <div className="space-y-1.5">
                  {EDGE_RELATIONS.map((rel) => {
                    const style = RELATION_STYLES[rel] || { strokeWidth: 1.5 };
                    return (
                      <div key={rel} className="flex items-center gap-2">
                        <svg width="24" height="12" className="shrink-0">
                          <line
                            x1="0"
                            y1="6"
                            x2="20"
                            y2="6"
                            stroke="currentColor"
                            strokeWidth={style.strokeWidth}
                            strokeDasharray={style.strokeDasharray}
                            className="text-muted-foreground"
                          />
                          <polygon
                            points="20,6 16,3 16,9"
                            fill="currentColor"
                            className="text-muted-foreground"
                          />
                        </svg>
                        <span className="text-xs">
                          {t(`systemMap.legend.relation.${rel}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Importance */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  {t('systemMap.legend.importance')}
                </h4>
                <div className="space-y-1">
                  {NODE_IMPORTANCE.map((imp) => (
                    <div key={imp} className="flex items-start gap-2">
                      <span className="text-xs font-medium shrink-0 w-16">
                        {t(`systemMap.legend.importanceLevel.${imp}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(`systemMap.legend.importanceDesc.${imp}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  {t('systemMap.legend.phases')}
                </h4>
                <div className="space-y-1">
                  {NODE_PHASES.map((phase, idx) => (
                    <div key={phase} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-6 shrink-0">
                        {phase}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(`systemMap.legend.phase.${phase}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
});

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText } from 'lucide-react';
import type { CaseStudyData, CaseStudyStatus, CustomerType } from './types';
import {
  MOCK_CASE_STUDIES,
  STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
} from './types';

interface Props {
  onEdit: (cs: CaseStudyData) => void;
  onNew: () => void;
}

const STATUS_COLORS: Record<CaseStudyStatus, string> = {
  entwurf: 'bg-muted text-muted-foreground',
  freigabe: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  freigegeben: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  veroeffentlicht: 'bg-primary/10 text-primary',
};

export function CaseStudyOverview({ onEdit, onNew }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = MOCK_CASE_STUDIES.filter(cs => {
    if (statusFilter !== 'all' && cs.status !== statusFilter) return false;
    if (typeFilter !== 'all' && cs.customerType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Alle Case Studies</h2>
          <p className="text-sm text-muted-foreground">{MOCK_CASE_STUDIES.length} Case Studies erstellt</p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4 mr-2" /> Neue Case Study
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kundentyp filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Keine Case Studies gefunden</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cs, idx) => (
            <Card
              key={idx}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => onEdit(cs)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-xs ${STATUS_COLORS[cs.status]}`}>
                    {STATUS_LABELS[cs.status]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {CUSTOMER_TYPE_LABELS[cs.customerType]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                  {cs.publicTitle || cs.internalTitle}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {cs.initialSituation}
                </p>
                {cs.estimatedValueCHF > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Mehrwert: <span className="font-semibold text-foreground">CHF {cs.estimatedValueCHF.toLocaleString('de-CH')}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

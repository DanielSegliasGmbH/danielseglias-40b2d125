import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { CaseStudyData, CaseStudyStatus } from './types';
import {
  STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
} from './types';
import { generateSlug } from '@/hooks/useCaseStudies';

interface Props {
  caseStudies: CaseStudyData[];
  onEdit: (cs: CaseStudyData) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<CaseStudyStatus, string> = {
  entwurf: 'bg-muted text-muted-foreground',
  freigabe: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  freigegeben: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  veroeffentlicht: 'bg-primary/10 text-primary',
};

export function CaseStudyOverview({ caseStudies, onEdit, onNew, onDelete }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = caseStudies.filter(cs => {
    if (statusFilter !== 'all' && cs.status !== statusFilter) return false;
    if (typeFilter !== 'all' && cs.customerType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Alle Case Studies</h2>
          <p className="text-sm text-muted-foreground">{caseStudies.length} Case Studies</p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4 mr-2" /> Neue Case Study
        </Button>
      </div>

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

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Keine Case Studies gefunden</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(cs => {
            const slug = generateSlug(cs.publicTitle || cs.internalTitle);
            const isPublished = cs.status === 'veroeffentlicht';

            return (
              <Card key={cs.id} className="hover:border-primary/30 transition-colors">
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
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {cs.initialSituation}
                  </p>
                  {cs.estimatedValueCHF > 0 && (
                    <div className="mb-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Mehrwert: <span className="font-semibold text-foreground">CHF {cs.estimatedValueCHF.toLocaleString('de-CH')}</span>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {isPublished && slug && (
                      <Link to={`/case-studies/${slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
                          <ExternalLink className="h-3 w-3" /> Ansehen
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-8" onClick={() => onEdit(cs)}>
                      <Pencil className="h-3 w-3" /> Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" /> Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Case Study löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bist du sicher? Diese Case Study wird aus der Übersicht und dem öffentlichen Bereich entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(cs.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

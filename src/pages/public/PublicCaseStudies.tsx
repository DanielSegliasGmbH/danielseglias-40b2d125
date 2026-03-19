import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, TrendingUp, Target } from 'lucide-react';
import { useCaseStudies, generateSlug } from '@/hooks/useCaseStudies';
import { CUSTOMER_TYPE_LABELS, ACQUISITION_SOURCE_LABELS } from '@/components/tools/case-study-generator/types';

export default function PublicCaseStudies() {
  const { getPublished } = useCaseStudies();
  const published = getPublished();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filtered = published.filter(cs => {
    if (typeFilter !== 'all' && cs.customerType !== typeFilter) return false;
    if (sourceFilter !== 'all' && cs.acquisitionSource !== sourceFilter) return false;
    return true;
  });

  function formatCHF(v: number) {
    return `CHF ${Math.round(v / 100) * 100 > 0 ? (Math.round(v / 100) * 100).toLocaleString('de-CH') : v.toLocaleString('de-CH')}`;
  }

  return (
    <PublicLayout title="Case Studies" description="Echte Ergebnisse aus der Finanzberatung">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Case Studies</h1>
          <p className="text-muted-foreground">
            Echte Ergebnisse. Echte Menschen. So sieht der Unterschied aus, wenn du deine Finanzen professionell aufstellst.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kundentyp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kundentypen</SelectItem>
              {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Quelle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Quellen</SelectItem>
              {Object.entries(ACQUISITION_SOURCE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Noch keine veröffentlichten Case Studies.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {filtered.map(cs => {
              const slug = generateSlug(cs.publicTitle || cs.internalTitle);
              return (
                <Card key={cs.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="text-xs mb-3">
                      {CUSTOMER_TYPE_LABELS[cs.customerType]}
                    </Badge>

                    <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                      {cs.publicTitle || cs.internalTitle}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {cs.initialSituation}
                    </p>

                    {/* Kennzahlen */}
                    <div className="flex gap-3 mb-4">
                      {cs.estimatedValueCHF > 0 && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-center flex-1">
                          <p className="text-[10px] text-muted-foreground">Mehrwert</p>
                          <p className="text-sm font-bold text-foreground">{formatCHF(cs.estimatedValueCHF)}</p>
                        </div>
                      )}
                      {cs.feeSavings > 0 && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-center flex-1">
                          <p className="text-[10px] text-muted-foreground">Ersparnis</p>
                          <p className="text-sm font-bold text-foreground">{formatCHF(cs.feeSavings)}/J</p>
                        </div>
                      )}
                      {cs.roiMonths > 0 && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-center flex-1">
                          <p className="text-[10px] text-muted-foreground">ROI</p>
                          <p className="text-sm font-bold text-foreground">{cs.roiMonths} Mt.</p>
                        </div>
                      )}
                    </div>

                    <Link to={`/case-studies/${slug}`}>
                      <Button variant="outline" className="w-full gap-2">
                        Mehr erfahren <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Upload } from 'lucide-react';
import type {
  CaseStudyData,
  CustomerType,
  AgeRange,
  CaseStudyStatus,
  StrategyType,
  PreviousSolution,
  MainProblem,
  CtaType,
} from './types';
import {
  CUSTOMER_TYPE_LABELS,
  AGE_RANGE_LABELS,
  STATUS_LABELS,
  STRATEGY_LABELS,
  PREVIOUS_SOLUTION_LABELS,
  MAIN_PROBLEM_LABELS,
  CTA_LABELS,
} from './types';

interface Props {
  data: CaseStudyData;
  onChange: (data: CaseStudyData) => void;
}

export function CaseStudyEditor({ data, onChange }: Props) {
  const update = <K extends keyof CaseStudyData>(key: K, value: CaseStudyData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updateBenefit = (index: number, value: string) => {
    const benefits = [...data.additionalBenefits];
    benefits[index] = value;
    onChange({ ...data, additionalBenefits: benefits });
  };

  const addBenefit = () => {
    onChange({ ...data, additionalBenefits: [...data.additionalBenefits, ''] });
  };

  const removeBenefit = (index: number) => {
    onChange({ ...data, additionalBenefits: data.additionalBenefits.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
      {/* Grunddaten */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Grunddaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Interner Titel</Label>
            <Input value={data.internalTitle} onChange={e => update('internalTitle', e.target.value)} placeholder="z. B. Familie Meier – 3a Optimierung" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Öffentlicher Titel</Label>
            <Input value={data.publicTitle} onChange={e => update('publicTitle', e.target.value)} placeholder="z. B. Wie eine junge Familie CHF 2'400 pro Jahr spart" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kundentyp</Label>
              <Select value={data.customerType} onValueChange={v => update('customerType', v as CustomerType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Altersspanne</Label>
              <Select value={data.ageRange} onValueChange={v => update('ageRange', v as AgeRange)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(AGE_RANGE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Lebenssituation</Label>
              <Input value={data.lifeSituation} onChange={e => update('lifeSituation', e.target.value)} placeholder="optional" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Region</Label>
              <Input value={data.region} onChange={e => update('region', e.target.value)} placeholder="optional" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={data.status} onValueChange={v => update('status', v as CaseStudyStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ausgangssituation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ausgangssituation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Beschreibung der Ausgangslage</Label>
            <Textarea value={data.initialSituation} onChange={e => update('initialSituation', e.target.value)} rows={3} placeholder="Beschreibe die Situation vor der Beratung..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bisherige Lösung</Label>
            <Select value={data.previousSolution} onValueChange={v => update('previousSolution', v as PreviousSolution)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PREVIOUS_SOLUTION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hauptproblem</Label>
            <Select value={data.mainProblem} onValueChange={v => update('mainProblem', v as MainProblem)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAIN_PROBLEM_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data.mainProblem === 'andere' && (
            <div>
              <Label className="text-xs text-muted-foreground">Problem beschreiben</Label>
              <Input value={data.mainProblemCustom} onChange={e => update('mainProblemCustom', e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lösung / Strategie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lösung & Strategie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Empfohlene Lösung</Label>
            <Textarea value={data.recommendedSolution} onChange={e => update('recommendedSolution', e.target.value)} rows={3} placeholder="Was wurde empfohlen?" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Strategie-Typ</Label>
            <Select value={data.strategyType} onValueChange={v => update('strategyType', v as StrategyType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Struktur</Label>
            <Input value={data.structure} onChange={e => update('structure', e.target.value)} placeholder="z. B. 4 Konten, gestaffelter Bezug" />
          </div>
        </CardContent>
      </Card>

      {/* Resultate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resultate & Mehrwert</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Geschätzter Mehrwert (CHF)</Label>
              <Input type="number" value={data.estimatedValueCHF || ''} onChange={e => update('estimatedValueCHF', Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gebührenersparnis (CHF/Jahr)</Label>
              <Input type="number" value={data.feeSavings || ''} onChange={e => update('feeSavings', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Erwartete Verbesserung</Label>
            <Textarea value={data.expectedImprovement} onChange={e => update('expectedImprovement', e.target.value)} rows={2} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Zusätzliche Vorteile</Label>
            <div className="space-y-2">
              {data.additionalBenefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={b} onChange={e => updateBenefit(i, e.target.value)} placeholder="Vorteil eingeben..." />
                  {data.additionalBenefits.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeBenefit(i)} className="shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addBenefit}>
                <Plus className="h-3 w-3 mr-1" /> Vorteil hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medien (Mock) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Medien & Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Dateien hierher ziehen oder klicken</p>
            <p className="text-xs text-muted-foreground mt-1">Bilder, PDFs, Screenshots (noch nicht aktiv)</p>
          </div>
        </CardContent>
      </Card>

      {/* Anonymisierung & Freigabe */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Anonymisierung & Freigabe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Firmenname anzeigen</Label>
            <Switch checked={data.showCompanyName} onCheckedChange={v => update('showCompanyName', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Zahlen gerundet anzeigen</Label>
            <Switch checked={data.roundNumbers} onCheckedChange={v => update('roundNumbers', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Testimonial anzeigen</Label>
            <Switch checked={data.showTestimonial} onCheckedChange={v => update('showTestimonial', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Veröffentlichung erlaubt</Label>
            <Switch checked={data.publishingAllowed} onCheckedChange={v => update('publishingAllowed', v)} />
          </div>

          {data.showTestimonial && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Testimonial-Text</Label>
                <Textarea value={data.testimonialText} onChange={e => update('testimonialText', e.target.value)} rows={2} placeholder="Was sagt der Kunde?" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Autor</Label>
                <Input value={data.testimonialAuthor} onChange={e => update('testimonialAuthor', e.target.value)} placeholder="z. B. Familie M., Zürich" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Call-to-Action</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={data.ctaType} onValueChange={v => update('ctaType', v as CtaType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CTA_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}

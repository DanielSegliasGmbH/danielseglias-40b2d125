import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';
import type {
  CaseStudyData,
  CustomerType,
  AgeRange,
  CaseStudyStatus,
  AcquisitionSource,
  Duration,
  PreviousSolution,
  MainProblem,
} from './types';
import {
  CUSTOMER_TYPE_LABELS,
  AGE_RANGE_LABELS,
  STATUS_LABELS,
  ACQUISITION_SOURCE_LABELS,
  DURATION_LABELS,
  PREVIOUS_SOLUTION_LABELS,
  MAIN_PROBLEM_LABELS,
  BENEFIT_OPTIONS,
} from './types';

interface Props {
  data: CaseStudyData;
  onChange: (data: CaseStudyData) => void;
}

export function CaseStudyEditor({ data, onChange }: Props) {
  const update = <K extends keyof CaseStudyData>(key: K, value: CaseStudyData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const toggleBenefit = (benefit: string) => {
    const current = data.benefits;
    const next = current.includes(benefit)
      ? current.filter(b => b !== benefit)
      : [...current, benefit];
    update('benefits', next);
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
              <Label className="text-xs text-muted-foreground">Wie hat der Kunde uns gefunden?</Label>
              <Select value={data.acquisitionSource} onValueChange={v => update('acquisitionSource', v as AcquisitionSource)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACQUISITION_SOURCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Start der Zusammenarbeit</Label>
              <Input type="date" value={data.startDate} onChange={e => update('startDate', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Betreuungsdauer</Label>
              <Select value={data.duration} onValueChange={v => update('duration', v as Duration)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DURATION_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label className="text-xs text-muted-foreground">Wie war die Situation vor der Beratung?</Label>
            <Textarea value={data.initialSituation} onChange={e => update('initialSituation', e.target.value)} rows={3} placeholder="Beschreibe die Ausgangslage des Kunden..." />
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

      {/* Resultate & Mehrwert */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resultate & Mehrwert</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Mehrwert (CHF)</Label>
              <Input type="number" value={data.estimatedValueCHF || ''} onChange={e => update('estimatedValueCHF', Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ersparnis (CHF/Jahr)</Label>
              <Input type="number" value={data.feeSavings || ''} onChange={e => update('feeSavings', Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ROI (Monate)</Label>
              <Input type="number" value={data.roiMonths || ''} onChange={e => update('roiMonths', Number(e.target.value))} placeholder="Break-even" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Erwartete Verbesserung</Label>
            <Textarea value={data.expectedImprovement} onChange={e => update('expectedImprovement', e.target.value)} rows={2} placeholder="z. B. bessere Entwicklung, mehr Klarheit..." />
          </div>
        </CardContent>
      </Card>

      {/* Zusätzliche Vorteile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Zusätzliche Vorteile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BENEFIT_OPTIONS.map(benefit => (
              <label key={benefit} className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={data.benefits.includes(benefit)}
                  onCheckedChange={() => toggleBenefit(benefit)}
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{benefit}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonial / Google Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Testimonial / Google Bewertung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Testimonial anzeigen</Label>
            <Switch checked={data.showTestimonial} onCheckedChange={v => update('showTestimonial', v)} />
          </div>
          {data.showTestimonial && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Kundenname (optional, anonym möglich)</Label>
                <Input value={data.testimonialName} onChange={e => update('testimonialName', e.target.value)} placeholder="z. B. Familie M., Zürich" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bewertungstext</Label>
                <Textarea value={data.testimonialText} onChange={e => update('testimonialText', e.target.value)} rows={3} placeholder="Was sagt der Kunde?" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Link zur Google Bewertung (optional)</Label>
                <Input value={data.testimonialGoogleLink} onChange={e => update('testimonialGoogleLink', e.target.value)} placeholder="https://g.co/kgs/..." />
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">Kundenbild hochladen (optional, noch nicht aktiv)</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Medien */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Medien & Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Dateien hierher ziehen oder klicken</p>
            <p className="text-xs text-muted-foreground mt-1">Vergleichsbilder, Screenshots, PDFs (noch nicht aktiv)</p>
          </div>
        </CardContent>
      </Card>

      {/* Einstellungen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Zahlen gerundet anzeigen</Label>
            <Switch checked={data.roundNumbers} onCheckedChange={v => update('roundNumbers', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Veröffentlichung erlaubt</Label>
            <Switch checked={data.publishingAllowed} onCheckedChange={v => update('publishingAllowed', v)} />
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Call-to-Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Button: «15 Minuten Gespräch buchen»</p>
          <div>
            <Label className="text-xs text-muted-foreground">Link (URL)</Label>
            <Input value={data.ctaLink} onChange={e => update('ctaLink', e.target.value)} placeholder="https://calendly.com/..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CaseStudyData,
  CustomerType,
  AgeRange,
  CaseStudyStatus,
  AcquisitionSource,
  Duration,
  PreviousSolution,
  MainProblem,
  MediaItem,
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
  GLOBAL_CTA_LINK,
  generateAutoTitle,
} from './types';

interface Props {
  data: CaseStudyData;
  onChange: (data: CaseStudyData) => void;
}

export function CaseStudyEditor({ data, onChange }: Props) {
  const customerImageRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

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

  const handleAutoTitle = () => {
    const title = generateAutoTitle(data.customerType, data.feeSavings);
    if (title) {
      update('publicTitle', title);
      toast.success('Titel automatisch generiert');
    } else {
      toast.error('Bitte zuerst Kundentyp und Ersparnis angeben');
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data: uploadData, error } = await supabase.storage
      .from('case-study-media')
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('case-study-media')
      .getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const handleCustomerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Nur Bilddateien erlaubt');
      return;
    }
    const path = `customers/${data.id}/${Date.now()}_${file.name}`;
    const url = await uploadFile(file, path);
    if (url) {
      update('customerImageUrl', url);
      toast.success('Kundenbild hochgeladen');
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia: MediaItem[] = [...data.media];
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImage && !isPdf) {
        toast.error(`${file.name}: Nur JPG, PNG oder PDF erlaubt`);
        continue;
      }
      const path = `media/${data.id}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      if (url) {
        newMedia.push({ type: isImage ? 'image' : 'pdf', url, name: file.name });
      }
    }
    update('media', newMedia);
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const removeMedia = (idx: number) => {
    update('media', data.media.filter((_, i) => i !== idx));
  };

  const testimonialWordCount = data.testimonialText.trim().split(/\s+/).filter(Boolean).length;
  const testimonialTooShort = data.showTestimonial && data.testimonialText.trim().length > 0 && testimonialWordCount < 10;

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
            <div className="flex gap-2">
              <Input className="flex-1" value={data.publicTitle} onChange={e => update('publicTitle', e.target.value)} placeholder="z. B. Wie eine junge Familie CHF 2'400 pro Jahr spart" />
              <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleAutoTitle}>
                <Sparkles className="h-3.5 w-3.5" /> Auto
              </Button>
            </div>
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
                {testimonialTooShort && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs">Aussagekräftiges Feedback erhöht Vertrauen (min. 10 Wörter empfohlen)</span>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Link zur Google Bewertung (optional)</Label>
                <Input value={data.testimonialGoogleLink} onChange={e => update('testimonialGoogleLink', e.target.value)} placeholder="https://g.co/kgs/..." />
              </div>
              {/* Customer Image Upload */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Kundenbild (optional)</Label>
                {data.customerImageUrl ? (
                  <div className="relative inline-block">
                    <img src={data.customerImageUrl} alt="Kunde" className="w-20 h-20 rounded-full object-cover border border-border" />
                    <button
                      onClick={() => update('customerImageUrl', '')}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => customerImageRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Kundenbild hochladen (JPG/PNG)</p>
                  </div>
                )}
                <input ref={customerImageRef} type="file" accept="image/*" className="hidden" onChange={handleCustomerImageUpload} />
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
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => mediaRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Dateien hochladen</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF</p>
          </div>
          <input ref={mediaRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleMediaUpload} />
          {data.media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.media.map((item, idx) => (
                <div key={idx} className="relative group border border-border rounded-lg p-3">
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-20 object-cover rounded" />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5 shrink-0" />
                      <span className="text-xs truncate">{item.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
          <div>
            <Label className="text-xs text-muted-foreground">Button-Text</Label>
            <Input value={data.ctaButtonText} onChange={e => update('ctaButtonText', e.target.value)} placeholder="15 Minuten Gespräch buchen" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">Fix</Badge>
            <span className="truncate">{GLOBAL_CTA_LINK}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

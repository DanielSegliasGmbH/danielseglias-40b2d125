import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Mini3aInputs } from './types';

interface InputFormProps {
  inputs: Mini3aInputs;
  onChange: (inputs: Mini3aInputs) => void;
}

export function InputForm({ inputs, onChange }: InputFormProps) {
  const set = <K extends keyof Mini3aInputs>(key: K, value: Mini3aInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basisdaten */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Basisdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Kundenname</Label>
              <Input value={inputs.kundenname} onChange={e => set('kundenname', e.target.value)} placeholder="Name des Kunden" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Firma / Anbieter</Label>
              <Input value={inputs.firma} onChange={e => set('firma', e.target.value)} placeholder="z.B. Swisslife, VIAC" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Produkt</Label>
              <Input value={inputs.produkt} onChange={e => set('produkt', e.target.value)} placeholder="z.B. Freizügigkeit Plus" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Typ</Label>
              <Select value={inputs.typ} onValueChange={v => set('typ', v as 'bank' | 'versicherung')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="versicherung">Versicherung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {inputs.typ === 'bank' && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Bank-Art</Label>
              <Select value={inputs.bankArt} onValueChange={v => set('bankArt', v as 'digital' | 'hausbank')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digitale Plattform</SelectItem>
                  <SelectItem value="hausbank">Hausbank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Laufzeit / Kunde */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Laufzeit & Einzahlung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Alter</Label>
              <Input type="number" value={inputs.alter} onChange={e => set('alter', +e.target.value)} min={18} max={64} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Pensionsalter</Label>
              <Input type="number" value={inputs.pensionsalter} onChange={e => set('pensionsalter', +e.target.value)} min={58} max={70} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Monatl. Einzahlung (CHF)</Label>
              <Input type="number" value={inputs.monatlicheEinzahlung} onChange={e => set('monatlicheEinzahlung', +e.target.value)} min={0} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment / Rendite */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Investment & Rendite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={inputs.inAktienInvestiert} onCheckedChange={v => set('inAktienInvestiert', v)} />
            <Label className="text-sm">In Aktien investiert?</Label>
          </div>
          {inputs.inAktienInvestiert ? (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Aktienquote: {inputs.aktienquote}%</Label>
              <Slider value={[inputs.aktienquote]} onValueChange={([v]) => set('aktienquote', v)} min={0} max={100} step={5} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Technischer Zins (% p.a.)</Label>
              <Input type="number" value={inputs.technischerZins} onChange={e => set('technischerZins', +e.target.value)} min={0} max={10} step={0.1} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Laufende Verwaltungsgebühren (% p.a.)</Label>
            <Input type="number" value={inputs.verwaltungsgebuehren} onChange={e => set('verwaltungsgebuehren', +e.target.value)} min={0} max={5} step={0.05} />
          </div>
        </CardContent>
      </Card>

      {/* Kosten */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Kosten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Abschlusskosten (CHF)</Label>
              <Input type="number" value={inputs.abschlusskosten} onChange={e => set('abschlusskosten', +e.target.value)} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Ausgabeaufschlag (%)</Label>
              <Input type="number" value={inputs.ausgabeaufschlag} onChange={e => set('ausgabeaufschlag', +e.target.value)} min={0} max={10} step={0.1} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Rücknahmekommission (%)</Label>
              <Input type="number" value={inputs.ruecknahmekommission} onChange={e => set('ruecknahmekommission', +e.target.value)} min={0} max={10} step={0.1} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Transparenz-Aufwand (1–10)</Label>
              <div className="pt-1">
                <Slider value={[inputs.transparenzAufwand]} onValueChange={([v]) => set('transparenzAufwand', v)} min={1} max={10} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Transparent</span>
                  <span>{inputs.transparenzAufwand}</span>
                  <span>Intransparent</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renditeannahme */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Renditeannahme (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Erwartete Rendite (% p.a.) – überschreibt Schätzung</Label>
            <Input type="number" value={inputs.renditeAnnahme} onChange={e => set('renditeAnnahme', +e.target.value)} min={0} max={15} step={0.1} placeholder="0 = automatische Schätzung" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Rendite-Erklärung (optional)</Label>
            <Input value={inputs.renditeErklaerung} onChange={e => set('renditeErklaerung', e.target.value)} placeholder="z.B. Historische Durchschnittsrendite" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

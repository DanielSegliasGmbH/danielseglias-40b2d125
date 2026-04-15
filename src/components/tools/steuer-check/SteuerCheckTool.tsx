import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useGamification } from '@/hooks/useGamification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Calculator, MessageCircle, CheckSquare, Sparkles, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CANTONS = [
  'AG','AI','AR','BE','BL','BS','FR','GE','GL','GR',
  'JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG',
  'TI','UR','VD','VS','ZG','ZH',
];

const CANTON_LABELS: Record<string, string> = {
  AG:'Aargau',AI:'Appenzell I.',AR:'Appenzell A.',BE:'Bern',BL:'Basel-Land',BS:'Basel-Stadt',
  FR:'Freiburg',GE:'Genf',GL:'Glarus',GR:'Graubünden',JU:'Jura',LU:'Luzern',NE:'Neuenburg',
  NW:'Nidwalden',OW:'Obwalden',SG:'St. Gallen',SH:'Schaffhausen',SO:'Solothurn',SZ:'Schwyz',
  TG:'Thurgau',TI:'Tessin',UR:'Uri',VD:'Waadt',VS:'Wallis',ZG:'Zug',ZH:'Zürich',
};

// Approximate marginal tax rates by canton (simplified, top bracket)
const CANTON_MARGINAL_RATES: Record<string, number> = {
  AG:0.27,AI:0.19,AR:0.22,BE:0.30,BL:0.29,BS:0.31,FR:0.28,GE:0.33,GL:0.24,GR:0.25,
  JU:0.30,LU:0.22,NE:0.31,NW:0.20,OW:0.19,SG:0.25,SH:0.26,SO:0.28,SZ:0.18,TG:0.24,
  TI:0.28,UR:0.21,VD:0.32,VS:0.27,ZG:0.15,ZH:0.28,
};

const DEDUCTIONS = [
  { key: 'homeoffice', label: 'Homeoffice-Abzug', task: 'Homeoffice-Abzug prüfen und geltend machen' },
  { key: 'berufskosten', label: 'Berufskosten (Fahrweg, Verpflegung)', task: 'Berufskosten (Fahrweg, Verpflegung) zusammenstellen' },
  { key: 'weiterbildung', label: 'Weiterbildungskosten', task: 'Weiterbildungskosten für Steuererklärung sammeln' },
  { key: 'krankheit', label: 'Krankheitskosten über Selbstbehalt', task: 'Krankheitskosten über Selbstbehalt prüfen' },
  { key: 'spenden', label: 'Spendenabzüge', task: 'Spendenquittungen für Steuerabzug zusammenstellen' },
];

interface Props {
  mode?: 'internal' | 'public';
}

export function SteuerCheckTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const { profile } = useMetaProfile();

  // Inputs
  const [canton, setCanton] = useState('ZH');
  const [income, setIncome] = useState('');
  const [employment, setEmployment] = useState<'employed' | 'selfemployed'>('employed');
  const [current3a, setCurrent3a] = useState('');
  const [married, setMarried] = useState(false);
  const [children, setChildren] = useState('0');
  const [showResults, setShowResults] = useState(false);
  const [checkedDeductions, setCheckedDeductions] = useState<Set<string>>(new Set());

  // Prefill from meta profile
  useEffect(() => {
    if (profile) {
      if (profile.monthly_income) setIncome(String(Math.round(profile.monthly_income * 12)));
      if (profile.occupation === 'selbstständig') setEmployment('selfemployed');
    }
  }, [profile]);

  const max3a = employment === 'employed' ? 7258 : 36288;
  const contributed = parseFloat(current3a) || 0;
  const remaining3a = Math.max(0, max3a - contributed);
  const marginalRate = CANTON_MARGINAL_RATES[canton] || 0.25;
  const taxSavings = Math.round(remaining3a * marginalRate);
  const annualIncome = parseFloat(income) || 0;

  const handleCalculate = () => {
    if (!income || annualIncome <= 0) {
      toast.error('Bitte Bruttoeinkommen eingeben');
      return;
    }
    setShowResults(true);
  };

  const toggleDeduction = (key: string) => {
    setCheckedDeductions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const unchecked = DEDUCTIONS.filter(d => !checkedDeductions.has(d.key));
      if (unchecked.length === 0) {
        toast.info('Alle Abzüge bereits abgehakt!');
        return;
      }
      const inserts = unchecked.map(d => ({
        user_id: user.id,
        title: d.task,
        is_completed: false,
      }));
      const { error } = await supabase.from('client_tasks').insert(inserts);
      if (error) throw error;
      return unchecked.length;
    },
    onSuccess: (count) => {
      if (count && count > 0) {
        queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
        toast.success(`${count} Aufgabe${count > 1 ? 'n' : ''} hinzugefügt ✓`);
        awardPoints('task_completed', `steuer_tasks_${Date.now()}`);
      }
    },
    onError: () => toast.error('Fehler beim Erstellen der Aufgaben'),
  });

  return (
    <div className="space-y-5">
      {/* Input form */}
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-5 w-5 text-primary" />
                  Deine Angaben
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Kanton</Label>
                  <Select value={canton} onValueChange={setCanton}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CANTONS.map(c => (
                        <SelectItem key={c} value={c}>{c} – {CANTON_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Brutto-Jahreseinkommen (CHF)</Label>
                  <Input type="number" min="0" step="1000" value={income} onChange={e => setIncome(e.target.value)} placeholder="z.B. 85000" />
                </div>

                <div>
                  <Label>Erwerbsstatus</Label>
                  <Select value={employment} onValueChange={(v: any) => setEmployment(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Angestellt</SelectItem>
                      <SelectItem value="selfemployed">Selbstständig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Aktuelle Säule 3a Einzahlung dieses Jahr (CHF)</Label>
                  <Input type="number" min="0" step="100" value={current3a} onChange={e => setCurrent3a(e.target.value)} placeholder="0" />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer">Verheiratet?</Label>
                  <Switch checked={married} onCheckedChange={setMarried} />
                </div>

                <div>
                  <Label>Anzahl Kinder</Label>
                  <Input type="number" min="0" max="10" value={children} onChange={e => setChildren(e.target.value)} placeholder="0" />
                </div>

                <Button onClick={handleCalculate} className="w-full gap-2 h-12 rounded-xl text-base mt-2">
                  <Sparkles className="h-4 w-4" /> Steuer-Check starten
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Back */}
            <Button variant="ghost" size="sm" onClick={() => setShowResults(false)} className="text-muted-foreground">
              ← Eingaben ändern
            </Button>

            {/* Summary header */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Geschätztes Sparpotenzial</p>
                <p className="text-3xl font-bold text-primary">
                  CHF {taxSavings.toLocaleString('de-CH')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  bei Kanton {canton} · Grenzsteuersatz ~{Math.round(marginalRate * 100)}%
                </p>
              </CardContent>
            </Card>

            {/* Card 1: Säule 3a */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🔐 Säule 3a Potenzial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-[11px] text-muted-foreground">Maximum {employment === 'employed' ? '(Angestellt)' : '(Selbstst.)'}</p>
                      <p className="text-sm font-semibold">CHF {max3a.toLocaleString('de-CH')}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-[11px] text-muted-foreground">Bereits eingezahlt</p>
                      <p className="text-sm font-semibold">CHF {contributed.toLocaleString('de-CH')}</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-[11px] text-primary">Verbleibendes Potenzial</p>
                      <p className="text-sm font-bold text-primary">CHF {remaining3a.toLocaleString('de-CH')}</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-[11px] text-primary">Steuerersparnis</p>
                      <p className="text-sm font-bold text-primary">CHF {taxSavings.toLocaleString('de-CH')}</p>
                    </div>
                  </div>

                  {remaining3a > 0 && (
                    <div className="flex items-start gap-2 bg-accent/50 rounded-lg p-3 text-xs text-muted-foreground">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <p>Wenn du noch <strong>CHF {remaining3a.toLocaleString('de-CH')}</strong> einzahlst, sparst du ca. <strong>CHF {taxSavings.toLocaleString('de-CH')}</strong> an Steuern.</p>
                    </div>
                  )}

                  {mode === 'internal' && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => navigate('/app/client-portal/library')}
                    >
                      Mehr erfahren <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Pensionskasse */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🏛️ Einkaufspotenzial Pensionskasse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Falls deine Pensionskasse eine Lücke aufweist, kannst du freiwillige Einkäufe tätigen. 
                    Diese sind <strong>vollständig steuerlich absetzbar</strong> – oft das grösste Steuerspar-Potenzial überhaupt.
                  </p>
                  <div className="bg-accent/50 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <p>Prüfe deinen PK-Ausweis auf die Zeile «Einkaufspotenzial» oder frage deinen Berater.</p>
                  </div>

                  {mode === 'internal' && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        // Open chat - navigate to chat area
                        toast.success('Thema an Berater gesendet');
                      }}
                    >
                      <MessageCircle className="h-4 w-4" /> Dieses Thema mit Berater besprechen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Weitere Abzüge */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    ✅ Weitere Abzüge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Hast du diese Abzüge bereits in deiner Steuererklärung berücksichtigt?
                  </p>
                  <div className="space-y-2">
                    {DEDUCTIONS.map(d => (
                      <label key={d.key} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors cursor-pointer">
                        <Checkbox
                          checked={checkedDeductions.has(d.key)}
                          onCheckedChange={() => toggleDeduction(d.key)}
                        />
                        <span className={cn(
                          "text-sm",
                          checkedDeductions.has(d.key) && "line-through text-muted-foreground"
                        )}>
                          {d.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {mode === 'internal' && DEDUCTIONS.some(d => !checkedDeductions.has(d.key)) && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 mt-2"
                      disabled={addTasksMutation.isPending}
                      onClick={() => addTasksMutation.mutate()}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Offene Punkte zu meinen Aufgaben ({DEDUCTIONS.filter(d => !checkedDeductions.has(d.key)).length})
                    </Button>
                  )}

                  {DEDUCTIONS.every(d => checkedDeductions.has(d.key)) && (
                    <p className="text-xs text-primary text-center font-medium pt-1">
                      🎉 Alle Abzüge berücksichtigt – sehr gut!
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

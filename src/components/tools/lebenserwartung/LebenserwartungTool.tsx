import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Hourglass, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtNum = (v: number) => Math.round(v).toLocaleString('de-CH');

const CANTONS = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR',
  'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG',
  'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
];

// Base life expectancy (Swiss BFS 2026)
const BASE_LE = { female: 85.5, male: 81.9 };

function calcLifeExpectancy(
  birthYear: number,
  sex: 'female' | 'male',
  smoker: boolean,
  exercise: boolean,
  chronic: boolean,
  parentsLong: boolean,
) {
  const cohortAdj = (birthYear - 1970) * 0.1;
  let le = BASE_LE[sex] + cohortAdj;
  if (smoker) le -= 10;
  if (exercise) le += 3;
  if (chronic) le -= 5;
  if (parentsLong) le += 3;
  return Math.round(le * 10) / 10;
}

export function LebenserwartungTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();

  const currentYear = new Date().getFullYear();
  const defaultBirthYear = profile?.age ? String(currentYear - profile.age) : '';

  const [birthYear, setBirthYear] = useState(defaultBirthYear);
  const [sex, setSex] = useState<'female' | 'male'>('male');
  const [canton, setCanton] = useState('');
  const [smoker, setSmoker] = useState(false);
  const [exercise, setExercise] = useState(false);
  const [chronic, setChronic] = useState(false);
  const [parentsLong, setParentsLong] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => {
    const by = parseInt(birthYear);
    if (!by || by < 1920 || by > currentYear) return null;

    const age = currentYear - by;
    const le = calcLifeExpectancy(by, sex, smoker, exercise, chronic, parentsLong);
    const remaining = Math.max(0, le - age);
    const retirementAge = 65;
    const yearsToRetirement = Math.max(0, retirementAge - age);

    // Context stats
    const monthlyIncome = profile?.monthly_income || 6000;
    const humankapital = monthlyIncome * 12 * yearsToRetirement;
    const sleepHours = Math.round(remaining * 365 * 8);

    return { age, le, remaining, retirementAge, yearsToRetirement, humankapital, sleepHours };
  }, [birthYear, sex, smoker, exercise, chronic, parentsLong, currentYear, profile]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user && results) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'lebenserwartung',
        points_awarded: 15,
      });
    }
  };

  const isValid = !!results;

  // Timeline markers
  const markers = results ? [
    { pos: results.age, label: `Heute (${results.age})` },
    ...(results.age < 65 ? [{ pos: 65, label: 'Pension (65)' }] : []),
    ...(results.le >= 80 ? [{ pos: 80, label: '80' }] : []),
    ...(results.le >= 90 ? [{ pos: 90, label: '90' }] : []),
    { pos: results.le, label: `~${results.le}` },
  ] : [];

  return (
    <PdfExportWrapper toolName="Lebenserwartung">
      <div className="space-y-6">
        {/* Inputs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Geburtsjahr</Label>
                <Input type="number" min="1920" max={currentYear} value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="z.B. 1990" />
                {profile?.age && !birthYear && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil geschätzt</p>
                )}
              </div>
              <div>
                <Label>Geschlecht</Label>
                <Select value={sex} onValueChange={(v: 'female' | 'male') => setSex(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Weiblich</SelectItem>
                    <SelectItem value="male">Männlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kanton (optional)</Label>
                <Select value={canton} onValueChange={setCanton}>
                  <SelectTrigger><SelectValue placeholder="Wählen…" /></SelectTrigger>
                  <SelectContent>
                    {CANTONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Lifestyle-Fragen (optional)</p>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Raucher/in?</Label>
                <Switch checked={smoker} onCheckedChange={setSmoker} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Regelmässig Sport?</Label>
                <Switch checked={exercise} onCheckedChange={setExercise} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Bekannte chronische Krankheiten?</Label>
                <Switch checked={chronic} onCheckedChange={setChronic} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Beide Eltern 80+ geworden?</Label>
                <Switch checked={parentsLong} onCheckedChange={setParentsLong} />
              </div>
            </div>

            <Button onClick={handleCalculate} disabled={!isValid} className="w-full gap-2">
              <Hourglass className="h-4 w-4" /> Lebenserwartung berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && results && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Hero */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Deine geschätzte Lebenserwartung</p>
                <p className="text-4xl font-bold text-primary">{results.le} Jahre</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Du bist <strong>{results.age}</strong> Jahre alt — das bedeutet noch etwa <strong>{Math.round(results.remaining)}</strong> Jahre.
                </p>
              </CardContent>
            </Card>

            {/* Timeline Bar */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-4">Deine Lebenszeit</p>
                <div className="relative h-10 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/30 rounded-full"
                    style={{ width: `${Math.min(100, (results.age / results.le) * 100)}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-l-full"
                    style={{ width: `${Math.min(100, (results.age / results.le) * 100)}%` }}
                  >
                    <div className="absolute right-0 top-0 w-0.5 h-full bg-primary-foreground/50" />
                  </div>
                </div>
                {/* Markers */}
                <div className="relative h-8 mt-1">
                  {markers.map((m, i) => (
                    <div
                      key={i}
                      className="absolute text-[9px] text-muted-foreground -translate-x-1/2 leading-tight text-center"
                      style={{ left: `${Math.min(95, Math.max(5, (m.pos / results.le) * 100))}%` }}
                    >
                      <div className="w-px h-2 bg-muted-foreground/40 mx-auto mb-0.5" />
                      {m.label}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0 Jahre</span>
                  <span>{results.le} Jahre</span>
                </div>
              </CardContent>
            </Card>

            {/* Context */}
            <Card>
              <CardContent className="py-5 space-y-2">
                <p className="text-sm font-medium">In deiner verbleibenden Zeit wirst du etwa:</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
                  <li>💰 <strong>CHF {fmtNum(results.humankapital)}</strong> verdienen (Humankapital)</li>
                  <li>😴 <strong>{fmtNum(results.sleepHours)}</strong> Stunden schlafen</li>
                  <li>🧭 Entscheidungen treffen, die dein Leben prägen</li>
                </ul>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardContent className="py-4 space-y-2">
                <a
                  href="https://www.bfs.admin.ch/bfs/de/home/statistiken/bevoelkerung/geburten-todesfaelle/lebenserwartung.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Offizielle Daten: BFS Sterbetafeln
                </a>
              </CardContent>
            </Card>

            {/* Snapshot */}
            {mode === 'internal' && (
              <ToolSnapshotButton
                toolSlug="lebenserwartung"
                toolName="Lebenserwartung"
                snapshotData={{
                  lifeExpectancy: results.le,
                  currentAge: results.age,
                  remaining: results.remaining,
                  sex,
                  smoker,
                  exercise,
                  chronic,
                  parentsLong,
                }}
              />
            )}

            {mode === 'internal' && (
              <ToolReflection
                question="Was möchtest du mit deiner verbleibenden Zeit anfangen?"
                context="Die eigene Lebenserwartung zu kennen, kann motivieren — oder zum Nachdenken anregen."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Dies ist eine statistische Schätzung basierend auf BFS-Daten. Dein individueller Verlauf hängt von vielen Faktoren ab." />
      </div>
    </PdfExportWrapper>
  );
}

import { useState, useMemo } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Heart, UserPlus, Users, Target, Shield, MessageSquare,
  Send, Link2, Unlink, CheckCircle2, AlertTriangle, Plus,
  FileText, HelpCircle, ArrowRight, Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  usePartnership,
  usePartnerProfile,
  useInvitePartner,
  useAcceptPartnership,
  useDissolvePartnership,
  useJointGoals,
  useSaveJointGoal,
  useConflictEntries,
  useSubmitConflictEntry,
  useUpdateSharingSettings,
  usePendingInvitation,
} from '@/hooks/usePartnership';

/* ── No Partnership: Invite Flow ── */
function InviteSection() {
  const [email, setEmail] = useState('');
  const invite = useInvitePartner();
  const pendingInvite = usePendingInvitation();
  const acceptPartnership = useAcceptPartnership();

  return (
    <div className="space-y-4">
      {/* Pending invitation for current user */}
      {pendingInvite.data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <p className="text-sm font-bold text-foreground">Partnerschafts-Einladung</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Jemand möchte seine Finanzen mit dir teilen. Möchtest du die Verbindung annehmen?
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => acceptPartnership.mutate(pendingInvite.data!.id)}
                disabled={acceptPartnership.isPending}
              >
                <CheckCircle2 className="h-4 w-4" /> Annehmen
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 grid place-content-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Partner verbinden</p>
              <p className="text-xs text-muted-foreground">Teile deine Finanzen mit deinem Partner</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Möchtest du deine Finanzen mit einem Partner teilen? Verbindet eure Konten
            für eine gemeinsame Übersicht, geteilte Ziele und volle Transparenz.
          </p>

          <div className="space-y-2">
            <Label className="text-xs">E-Mail deines Partners</Label>
            <Input
              type="email"
              placeholder="partner@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => { invite.mutate(email); setEmail(''); }}
            disabled={invite.isPending || !email.includes('@')}
          >
            <Send className="h-4 w-4" /> Partner einladen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Active Partnership: Main View ── */
function PartnerDashboard({ partnership }: { partnership: NonNullable<ReturnType<typeof usePartnership>['data']> }) {
  const { user } = useAuth();
  const partnerId = partnership.user_id_1 === user?.id ? partnership.user_id_2 : partnership.user_id_1;
  const { data: partnerProfile } = usePartnerProfile(partnerId);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4">
      {/* Partner Header */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 grid place-content-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                Verbunden mit {partnerProfile ? `${partnerProfile.first_name} ${partnerProfile.last_name}` : 'Partner'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Seit {partnership.started_at ? new Date(partnership.started_at).toLocaleDateString('de-CH') : '—'}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
              Aktiv
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="overview" className="text-[10px]">Übersicht</TabsTrigger>
          <TabsTrigger value="goals" className="text-[10px]">Ziele</TabsTrigger>
          <TabsTrigger value="ehevertrag" className="text-[10px]">Ehevertrag</TabsTrigger>
          <TabsTrigger value="conflict" className="text-[10px]">Streit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          <SharingSettings partnership={partnership} />
          <DissolveSection partnershipId={partnership.id} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-3 mt-3">
          <JointGoalsSection partnershipId={partnership.id} />
        </TabsContent>

        <TabsContent value="ehevertrag" className="mt-3">
          <EhevertragChecklist />
        </TabsContent>

        <TabsContent value="conflict" className="mt-3">
          <ConflictMode partnershipId={partnership.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Sharing Settings ── */
function SharingSettings({ partnership }: { partnership: NonNullable<ReturnType<typeof usePartnership>['data']> }) {
  const updateSettings = useUpdateSharingSettings();
  const settings = partnership.sharing_settings as { tasks: boolean; peakscore: boolean; goals: boolean; reports: boolean };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings.mutate({
      partnershipId: partnership.id,
      settings: { ...settings, [key]: !settings[key] },
    });
  };

  const items = [
    { key: 'tasks' as const, label: 'Aufgaben teilen', icon: CheckCircle2 },
    { key: 'peakscore' as const, label: 'PeakScore teilen', icon: Target },
    { key: 'goals' as const, label: 'Ziele teilen', icon: Target },
    { key: 'reports' as const, label: 'Monatsberichte teilen', icon: FileText },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Transparenz-Einstellungen</p>
        </div>
        {items.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{label}</span>
            </div>
            <Switch checked={settings[key]} onCheckedChange={() => toggleSetting(key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Joint Goals ── */
function JointGoalsSection({ partnershipId }: { partnershipId: string }) {
  const { data: goals, isLoading } = useJointGoals(partnershipId);
  const saveGoal = useSaveJointGoal(partnershipId);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSave = () => {
    saveGoal.mutate({
      title,
      target_amount: targetAmount ? parseFloat(targetAmount) : null,
    });
    setTitle('');
    setTargetAmount('');
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Gemeinsame Ziele
        </p>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" /> Neues Ziel
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : !goals?.length ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Noch keine gemeinsamen Ziele.</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" /> Erstes Ziel erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        goals.map((goal) => {
          const pct = goal.target_amount ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
          return (
            <Card key={goal.id} className={cn(goal.is_completed && 'border-success/30 bg-success/5')}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                  {goal.is_completed && <Badge variant="outline" className="text-[10px] text-success">Erreicht</Badge>}
                </div>
                {goal.target_amount && (
                  <>
                    <Progress value={pct} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>CHF {goal.current_amount.toLocaleString('de-CH')}</span>
                      <span>CHF {goal.target_amount.toLocaleString('de-CH')}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gemeinsames Ziel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Ziel</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Haus kaufen" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Zielbetrag (optional)</Label>
              <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="100000" className="mt-1" />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!title || saveGoal.isPending}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Ehevertrag Checklist ── */
const EHEVERTRAG_ITEMS = [
  {
    question: 'Welcher Güterstand soll gelten?',
    help: 'In der Schweiz gilt standardmässig die Errungenschaftsbeteiligung. Alternativ: Gütertrennung oder Gütergemeinschaft. Ein Ehevertrag wird benötigt, um vom Standard abzuweichen.',
    options: ['Errungenschaftsbeteiligung', 'Gütertrennung', 'Gütergemeinschaft', 'Noch unklar'],
  },
  {
    question: 'Wer bringt was in die Ehe ein?',
    help: 'Eigengut (vor der Ehe, Erbschaften, Schenkungen) bleibt bei der Person. Errungenschaft (während der Ehe erworben) wird bei Auflösung geteilt.',
    options: [],
  },
  {
    question: 'Was soll bei einer Trennung passieren?',
    help: 'Ein klarer Plan vermeidet Streit und gibt Sicherheit. Besonders wichtig bei gemeinsamen Immobilien oder Geschäften.',
    options: [],
  },
  {
    question: 'Wer übernimmt welche Kosten?',
    help: 'Definiert die Aufteilung laufender Kosten: Miete, Versicherung, Kinder, Freizeit. Mögliche Modelle: 50/50, nach Einkommen, oder feste Bereiche.',
    options: [],
  },
  {
    question: 'Soll es einen schriftlichen Ehevertrag geben?',
    help: 'Ein Ehevertrag muss in der Schweiz von einem Notar beurkundet werden. Kosten: ca. CHF 500-2\'000. Empfohlen bei unterschiedlichem Vermögen, Selbstständigkeit oder Immobilien.',
    options: ['Ja, wir möchten einen', 'Nein, Standardregelung reicht', 'Noch unklar — erst beraten lassen'],
  },
];

function EhevertragChecklist() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Scale className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-foreground">Ehevertrags-Checkliste</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Fragen, die ihr zusammen besprechen solltet — als Grundlage für ein Gespräch mit dem Notar.
      </p>

      {EHEVERTRAG_ITEMS.map((item, i) => (
        <Card key={i} className="cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="size-7 rounded-lg bg-primary/10 grid place-content-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                {expanded === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.help}</p>
                    {item.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.options.map((opt) => (
                          <Badge key={opt} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10">
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Conflict Mode (Streit-Modus) ── */
function ConflictMode({ partnershipId }: { partnershipId: string }) {
  const { user } = useAuth();
  const { data: entries } = useConflictEntries(partnershipId);
  const submitEntry = useSubmitConflictEntry();
  const [showForm, setShowForm] = useState(false);
  const [whatHappened, setWhatHappened] = useState('');
  const [howIFeel, setHowIFeel] = useState('');
  const [whatIWish, setWhatIWish] = useState('');

  // Group by round
  const rounds = useMemo(() => {
    if (!entries?.length) return [];
    const grouped: Record<number, ConflictEntry[]> = {};
    entries.forEach((e) => {
      if (!grouped[e.round]) grouped[e.round] = [];
      grouped[e.round].push(e);
    });
    return Object.entries(grouped)
      .map(([round, items]) => ({ round: parseInt(round), items }))
      .sort((a, b) => b.round - a.round);
  }, [entries]);

  const currentRound = rounds.length > 0 ? rounds[0].round + 1 : 1;
  const hasSubmittedCurrentRound = entries?.some(
    (e) => e.round === currentRound && e.user_id === user?.id
  );

  const handleSubmit = () => {
    submitEntry.mutate({
      partnership_id: partnershipId,
      round: currentRound,
      what_happened: whatHappened,
      how_i_feel: howIFeel,
      what_i_wish: whatIWish,
    });
    setShowForm(false);
    setWhatHappened('');
    setHowIFeel('');
    setWhatIWish('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-foreground">Finanzielles Missverständnis?</p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Beide Partner füllen unabhängig voneinander drei Fragen aus.
        Die Antworten werden erst sichtbar, wenn beide abgegeben haben —
        so wird emotionale Reibung durch Struktur reduziert.
      </p>

      {!hasSubmittedCurrentRound && (
        <Button className="w-full gap-2" variant="outline" onClick={() => setShowForm(true)}>
          <MessageSquare className="h-4 w-4" /> Neue Runde starten
        </Button>
      )}

      {hasSubmittedCurrentRound && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">
              Du hast deine Antworten abgegeben. Warte auf deinen Partner.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Previous rounds */}
      {rounds.map(({ round, items }) => {
        const bothCompleted = items.length >= 2;
        const myEntry = items.find((e) => e.user_id === user?.id);
        const partnerEntry = items.find((e) => e.user_id !== user?.id);

        if (!bothCompleted) return null;

        return (
          <Card key={round}>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground">Runde {round}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-primary mb-1">Du</p>
                  <p className="text-[11px] text-foreground">{myEntry?.what_happened}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">{myEntry?.how_i_feel}</p>
                  <p className="text-[10px] text-primary mt-1">{myEntry?.what_i_wish}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary mb-1">Partner</p>
                  <p className="text-[11px] text-foreground">{partnerEntry?.what_happened}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">{partnerEntry?.how_i_feel}</p>
                  <p className="text-[10px] text-primary mt-1">{partnerEntry?.what_i_wish}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Streit-Modus — Runde {currentRound}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Was ist passiert?</Label>
              <Textarea value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} placeholder="Beschreibe die Situation..." className="mt-1 min-h-[60px]" />
            </div>
            <div>
              <Label className="text-xs font-medium">Wie fühle ich mich?</Label>
              <Textarea value={howIFeel} onChange={(e) => setHowIFeel(e.target.value)} placeholder="Beschreibe deine Gefühle..." className="mt-1 min-h-[60px]" />
            </div>
            <div>
              <Label className="text-xs font-medium">Was wünsche ich mir?</Label>
              <Textarea value={whatIWish} onChange={(e) => setWhatIWish(e.target.value)} placeholder="Was wäre dein Wunsch..." className="mt-1 min-h-[60px]" />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitEntry.isPending || !whatHappened}>
              Abschicken
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Dissolve Section ── */
function DissolveSection({ partnershipId }: { partnershipId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dissolve = useDissolvePartnership();

  return (
    <>
      <Card className="border-destructive/20">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full text-xs text-destructive gap-2 hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Unlink className="h-4 w-4" /> Partnerschaft auflösen
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Partnerschaft auflösen?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Die gemeinsamen Daten werden getrennt. Gemeinsame Ziele können archiviert werden.
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>Abbrechen</Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => { dissolve.mutate(partnershipId); setConfirmOpen(false); }}
              disabled={dissolve.isPending}
            >
              Auflösen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Main Page ── */
export default function ClientPortalPartner() {
  const { data: partnership, isLoading } = usePartnership();

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <ScreenHeader title="Partner-Modus" backTo="/app/client-portal" />

        <p className="text-xs text-muted-foreground px-1">
          Verbinde dein Konto mit deinem Partner für gemeinsame Finanzziele und volle Transparenz.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : partnership?.status === 'active' ? (
          <PartnerDashboard partnership={partnership} />
        ) : partnership?.status === 'pending' && partnership.user_id_1 ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center space-y-2">
              <Users className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-bold text-foreground">Einladung gesendet</p>
              <p className="text-xs text-muted-foreground">
                Warte auf die Bestätigung von {partnership.invite_email}
              </p>
            </CardContent>
          </Card>
        ) : (
          <InviteSection />
        )}
      </div>
    </ClientPortalLayout>
  );
}

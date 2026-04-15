import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, MessageCircle, Mail, Users, UserPlus, Crown, TrendingUp, TrendingDown, Minus, Trophy, Globe, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankForScore, usePeakScore } from '@/hooks/usePeakScore';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeDialog } from '@/components/client-portal/ChallengeDialog';
import { ActiveChallengeCards } from '@/components/client-portal/ActiveChallengeCard';

const INVITE_MESSAGE = (code: string) =>
  `Hey! Ich tracke meinen PeakScore mit FinLife. Was ist deiner? 🔥 Nutze meinen Code ${code} und wir können uns vergleichen! finlife.ch`;

interface FriendProfile {
  id: string;
  first_name: string;
  last_name: string;
  current_rank: number;
}

interface FriendRow {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: string;
  created_at: string;
}

interface FriendEntry {
  id: string;
  name: string;
  peakScore: number;
  rank: ReturnType<typeof getRankForScore>;
  trend: number | null;
  isMe?: boolean;
}

const PODIUM_COLORS = [
  'border-amber-500/40 bg-amber-500/5',   // gold
  'border-zinc-400/40 bg-zinc-400/5',      // silver
  'border-orange-700/40 bg-orange-700/5',  // bronze
];

export default function ClientPortalFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [friendCode, setFriendCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<FriendEntry | null>(null);
  const myPeak = usePeakScore();
  const { canCreateChallenge, createChallenge } = useChallenges();

  // Fetch own referral code
  const { data: myProfile } = useQuery({
    queryKey: ['my-referral', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('referral_code, first_name, last_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const myCode = myProfile?.referral_code || '...';

  // Fetch friends list with trend data
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends-list', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: friendRows } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!friendRows || friendRows.length === 0) return [];

      const friendIds = [...new Set((friendRows as FriendRow[]).map(f =>
        f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
      ))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, current_rank')
        .in('id', friendIds);

      const { data: scores } = await supabase
        .from('peak_scores')
        .select('user_id, score')
        .in('user_id', friendIds)
        .eq('is_snapshot', false);

      // Get last month snapshots for trend
      const { data: snapshots } = await supabase
        .from('peak_scores')
        .select('user_id, score')
        .in('user_id', friendIds)
        .eq('is_snapshot', true)
        .order('calculated_at', { ascending: false });

      const snapshotMap = new Map<string, number>();
      snapshots?.forEach((s: { user_id: string; score: number }) => {
        if (!snapshotMap.has(s.user_id)) snapshotMap.set(s.user_id, s.score);
      });

      return friendIds.map(fid => {
        const profile = (profiles as FriendProfile[] | null)?.find(p => p.id === fid);
        const scoreRow = (scores as Array<{ user_id: string; score: number }> | null)?.find(s => s.user_id === fid);
        const peakScore = scoreRow?.score ?? 0;
        const rank = getRankForScore(peakScore);
        const lastScore = snapshotMap.get(fid);
        const trend = lastScore !== undefined ? Math.round((peakScore - lastScore) * 10) / 10 : null;
        return {
          id: fid,
          name: profile ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.` : 'Unbekannt',
          peakScore,
          rank,
          trend,
        };
      });
    },
    enabled: !!user?.id,
  });

  // Build leaderboard: friends + me, sorted
  const leaderboard: FriendEntry[] = useMemo(() => {
    const myEntry: FriendEntry = {
      id: user?.id || 'me',
      name: myProfile ? `${myProfile.first_name} ${(myProfile as any).last_name?.charAt(0) || ''}.` : 'Du',
      peakScore: myPeak.score ?? 0,
      rank: myPeak.rank,
      trend: myPeak.trend,
      isMe: true,
    };
    return [...friends, myEntry].sort((a, b) => b.peakScore - a.peakScore);
  }, [friends, user?.id, myProfile, myPeak.score, myPeak.rank, myPeak.trend]);

  // Schweiz tab: anonymous aggregate stats
  const { data: swissStats } = useQuery({
    queryKey: ['swiss-stats', user?.id],
    queryFn: async () => {
      // Get all peak_scores (non-snapshot) for aggregate
      const { data: allScores } = await supabase
        .from('peak_scores')
        .select('score')
        .eq('is_snapshot', false);

      if (!allScores || allScores.length === 0) return null;

      const scores = (allScores as Array<{ score: number }>).map(s => s.score).sort((a, b) => a - b);
      const total = scores.length;
      const myScore = myPeak.score ?? 0;
      const belowMe = scores.filter(s => s < myScore).length;
      const percentile = total > 0 ? Math.round((belowMe / total) * 100) : 50;
      const avg = Math.round((scores.reduce((s, v) => s + v, 0) / total) * 10) / 10;
      const top10Idx = Math.floor(total * 0.9);
      const top10Threshold = scores[top10Idx] ?? avg;
      const myPosition = total - belowMe;

      return { percentile, avg, top10Threshold: Math.round(top10Threshold * 10) / 10, myPosition, total };
    },
    enabled: !!user?.id && myPeak.score !== null,
  });

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    toast.success('Code kopiert!');
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(INVITE_MESSAGE(myCode))}`, '_blank', 'noopener,noreferrer');
  };

  const shareSms = () => {
    window.open(`sms:?body=${encodeURIComponent(INVITE_MESSAGE(myCode))}`, '_blank', 'noopener,noreferrer');
  };

  const connectFriend = async () => {
    if (!user?.id || !friendCode.trim()) return;
    setConnecting(true);
    try {
      const { data: friendProfile, error: lookupError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('referral_code', friendCode.trim().toUpperCase())
        .maybeSingle();

      if (lookupError || !friendProfile) {
        toast.error('Code nicht gefunden. Bitte überprüfe die Eingabe.');
        return;
      }
      if (friendProfile.id === user.id) {
        toast.error('Du kannst dich nicht selbst hinzufügen.');
        return;
      }

      const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${friendProfile.id}),and(user_id_1.eq.${friendProfile.id},user_id_2.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast.info('Ihr seid bereits verbunden!');
        return;
      }

      const { error: insertError } = await supabase.from('friends').insert([
        { user_id_1: user.id, user_id_2: friendProfile.id, status: 'accepted' },
      ]);
      if (insertError) {
        toast.error('Verbindung fehlgeschlagen.');
        return;
      }
      await supabase.from('friends').insert([
        { user_id_1: friendProfile.id, user_id_2: user.id, status: 'accepted' },
      ]);

      toast.success(`${friendProfile.first_name} wurde hinzugefügt! 🎉`);
      setFriendCode('');
      queryClient.invalidateQueries({ queryKey: ['friends-list'] });
    } catch {
      toast.error('Ein Fehler ist aufgetreten.');
    } finally {
      setConnecting(false);
    }
  };

  const TrendIcon = ({ trend }: { trend: number | null }) => {
    if (trend === null) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const hasFriends = friends.length > 0;
  const defaultTab = hasFriends ? 'friends' : 'schweiz';

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Deine Finanz-Crew" />

      <div className="px-4 pb-32 space-y-6 max-w-lg mx-auto">
        {/* Invite + Add Friend sections */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">Freund einladen</h2>
              </div>
              <div className="bg-muted/50 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Dein Einladungscode</p>
                <p className="text-2xl font-black tracking-widest text-foreground">{myCode}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={copyCode} className="gap-2">
                  <Copy className="h-4 w-4" /> Code kopieren
                </Button>
                <Button onClick={shareWhatsApp} className="gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white">
                  <MessageCircle className="h-4 w-4" /> Via WhatsApp teilen
                </Button>
                <Button variant="secondary" onClick={shareSms} className="gap-2">
                  <Mail className="h-4 w-4" /> Via SMS / E-Mail teilen
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">Freund hinzufügen</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Einladungscode eingeben"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-wider"
                />
                <Button onClick={connectFriend} disabled={connecting || !friendCode.trim()}>
                  {connecting ? '...' : 'Verbinden'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator />

        {/* Rangliste Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="friends" className="flex-1 gap-1.5">
              <Trophy className="h-4 w-4" /> Meine Freunde
            </TabsTrigger>
            <TabsTrigger value="schweiz" className="flex-1 gap-1.5">
              <Globe className="h-4 w-4" /> Schweiz
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Meine Freunde ── */}
          <TabsContent value="friends">
            {loadingFriends ? (
              <div className="space-y-2 mt-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !hasFriends ? (
              <Card className="border-dashed mt-3">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Lade Freunde ein um zu vergleichen!</p>
                  <p className="text-xs text-muted-foreground">
                    Teile deinen Code oben und vergleicht eure PeakScores.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 mt-3">
                {leaderboard.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className={cn(
                      'transition-all',
                      entry.isMe && 'ring-1 ring-primary/30 bg-primary/5',
                      idx < 3 && PODIUM_COLORS[idx],
                    )}>
                      <CardContent className="p-3 flex items-center gap-3">
                        {/* Position */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          idx === 0 ? "bg-amber-500/20 text-amber-600" :
                          idx === 1 ? "bg-zinc-400/20 text-zinc-500" :
                          idx === 2 ? "bg-orange-700/20 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          #{idx + 1}
                        </div>

                        {/* Rank emoji */}
                        <span className="text-lg shrink-0">{entry.rank.emoji}</span>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-sm truncate",
                            entry.isMe ? "text-primary" : "text-foreground"
                          )}>
                            {entry.isMe ? 'Du' : entry.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.rank.name}</p>
                        </div>

                        {/* Score + Trend + Challenge */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!entry.isMe && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setChallengeTarget(entry); }}
                              className="w-7 h-7 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
                              title="Challenge starten"
                            >
                              <Swords className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{entry.peakScore}</p>
                            <div className="flex items-center gap-0.5 justify-end">
                              <TrendIcon trend={entry.trend} />
                              {entry.trend !== null && entry.trend !== 0 && (
                                <span className={cn(
                                  "text-[10px]",
                                  entry.trend > 0 ? "text-emerald-500" : "text-red-500"
                                )}>
                                  {entry.trend > 0 ? '+' : ''}{entry.trend}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Schweiz ── */}
          <TabsContent value="schweiz">
            <div className="space-y-4 mt-3">
              {myPeak.score === null ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Globe className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Erfasse zuerst dein Vermögen und deine Ausgaben, um deinen PeakScore zu berechnen.
                    </p>
                  </CardContent>
                </Card>
              ) : swissStats ? (
                <>
                  {/* Percentile hero */}
                  <Card>
                    <CardContent className="p-5 text-center space-y-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Dein Rang in der Schweiz</p>
                      <p className="text-4xl font-black text-foreground">
                        Top {100 - swissStats.percentile}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Du bist besser als <strong className="text-foreground">{swissStats.percentile}%</strong> aller FinLife-Nutzer
                      </p>
                      <Progress value={swissStats.percentile} className="h-2" />
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Ø PeakScore</p>
                        <p className="text-xl font-bold text-foreground">{swissStats.avg}</p>
                        <p className="text-[10px] text-muted-foreground">Monate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Top 10% ab</p>
                        <p className="text-xl font-bold text-foreground">{swissStats.top10Threshold}</p>
                        <p className="text-[10px] text-muted-foreground">Monate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Deine Position</p>
                      <p className="text-lg font-bold text-foreground">
                        #{swissStats.myPosition} <span className="text-sm font-normal text-muted-foreground">von {swissStats.total}</span>
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {!hasFriends && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      🏆 Lade Freunde ein um zu vergleichen!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Teile deinen Code und seht, wer die bessere Finanzlage hat.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {/* Active Challenges */}
        <ActiveChallengeCards />
      </div>

      {/* Challenge Dialog */}
      <ChallengeDialog
        open={!!challengeTarget}
        onOpenChange={(open) => !open && setChallengeTarget(null)}
        friendName={challengeTarget?.name || ''}
        disabled={!canCreateChallenge}
        loading={createChallenge.isPending}
        onConfirm={() => {
          if (!challengeTarget) return;
          createChallenge.mutate(
            { friendId: challengeTarget.id, myScore: myPeak.score ?? 0, friendScore: challengeTarget.peakScore },
            { onSuccess: () => setChallengeTarget(null) }
          );
        }}
      />
    </ClientPortalLayout>
  );
}

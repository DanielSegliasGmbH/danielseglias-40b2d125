import { useState } from 'react';
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
import { toast } from 'sonner';
import { Copy, MessageCircle, Mail, Users, Sparkles, Flame, UserPlus, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankForScore } from '@/hooks/usePeakScore';
import { cn } from '@/lib/utils';

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

export default function ClientPortalFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [friendCode, setFriendCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  // Fetch own referral code
  const { data: myProfile } = useQuery({
    queryKey: ['my-referral', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('referral_code, first_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const myCode = myProfile?.referral_code || '...';

  // Fetch friends list
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

      const friendIds = (friendRows as FriendRow[]).map(f =>
        f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
      );

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, current_rank')
        .in('id', friendIds);

      // Fetch PeakScores
      const { data: scores } = await supabase
        .from('peak_scores')
        .select('user_id, score')
        .in('user_id', friendIds)
        .eq('is_snapshot', false);

      return friendIds.map(fid => {
        const profile = (profiles as FriendProfile[] | null)?.find(p => p.id === fid);
        const scoreRow = (scores as Array<{ user_id: string; score: number }> | null)?.find(s => s.user_id === fid);
        const peakScore = scoreRow?.score ?? 0;
        const rank = getRankForScore(peakScore);
        return {
          id: fid,
          name: profile ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.` : 'Unbekannt',
          peakScore,
          rank,
        };
      }).sort((a, b) => b.peakScore - a.peakScore);
    },
    enabled: !!user?.id,
  });

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    toast.success('Code kopiert!');
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(INVITE_MESSAGE(myCode))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareSms = () => {
    const url = `sms:?body=${encodeURIComponent(INVITE_MESSAGE(myCode))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const connectFriend = async () => {
    if (!user?.id || !friendCode.trim()) return;
    setConnecting(true);
    try {
      // Find the user by referral code
      const { data: friendProfile, error: lookupError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('referral_code', friendCode.trim().toUpperCase())
        .maybeSingle();

      if (lookupError || !friendProfile) {
        toast.error('Code nicht gefunden. Bitte überprüfe die Eingabe.');
        setConnecting(false);
        return;
      }

      if (friendProfile.id === user.id) {
        toast.error('Du kannst dich nicht selbst hinzufügen.');
        setConnecting(false);
        return;
      }

      // Check if friendship already exists (in either direction)
      const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .or(
          `and(user_id_1.eq.${user.id},user_id_2.eq.${friendProfile.id}),and(user_id_1.eq.${friendProfile.id},user_id_2.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) {
        toast.info('Ihr seid bereits verbunden!');
        setConnecting(false);
        return;
      }

      // Create friendship (bidirectional - insert in both directions)
      const { error: insertError } = await supabase.from('friends').insert([
        { user_id_1: user.id, user_id_2: friendProfile.id, status: 'accepted' },
      ]);

      if (insertError) {
        toast.error('Verbindung fehlgeschlagen. Bitte versuche es erneut.');
        setConnecting(false);
        return;
      }

      // Insert reverse direction too
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

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Deine Finanz-Crew" />

      <div className="px-4 pb-32 space-y-6 max-w-lg mx-auto">
        {/* Section 1: Invite */}
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

        {/* Section 2: Add Friend */}
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

        {/* Section 3: Friends List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Deine Freunde</h2>
            {friends.length > 0 && (
              <Badge variant="secondary" className="text-xs">{friends.length}</Badge>
            )}
          </div>

          {loadingFriends ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Noch keine Freunde verbunden</p>
                <p className="text-xs text-muted-foreground">
                  Teile deinen Code und vergleicht eure PeakScores!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {friends.map((friend, idx) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0",
                        idx === 0 ? "bg-primary/15" : "bg-muted"
                      )}>
                        {friend.rank.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {friend.rank.name} · {friend.peakScore} Monate
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {idx === 0 && friends.length > 1 && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0 mt-1">
                            #1
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </ClientPortalLayout>
  );
}

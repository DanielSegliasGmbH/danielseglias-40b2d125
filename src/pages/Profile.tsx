import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useGamification, getLevel, LEVELS } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useFinanzType } from '@/hooks/useFinanzType';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  KeyRound, LogOut, ChevronRight, User, RotateCcw,
  Flame, CheckCircle2, Target, BookOpen, Lock, Sparkles,
  Shield, Award, Zap, Trophy, Star, Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PasswordStrengthChecker } from '@/components/PasswordStrengthChecker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// ─── Achievement definitions ───
interface AchievementDef {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  check: (stats: ProfileStats) => boolean;
  requirement: string;
}

interface ProfileStats {
  tasksCompleted: number;
  goalsReached: number;
  articlesRead: number;
  longestStreak: number;
  totalXp: number;
  toolsUsed: string[];
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'erster-schritt',
    label: 'Erster Schritt',
    description: 'Onboarding abgeschlossen',
    icon: Star,
    check: (s) => s.totalXp > 0,
    requirement: 'Schliesse das Onboarding ab',
  },
  {
    id: 'sparfuchs',
    label: 'Sparfuchs',
    description: 'Über CHF 1\'000 gespart',
    icon: Zap,
    check: (s) => s.totalXp >= 1000,
    requirement: 'Erreiche 1\'000 XP',
  },
  {
    id: 'wissenshungrig',
    label: 'Wissenshungrig',
    description: '10 Artikel gelesen',
    icon: BookOpen,
    check: (s) => s.articlesRead >= 10,
    requirement: 'Lies 10 Artikel in der Wissensbibliothek',
  },
  {
    id: 'aufgaben-profi',
    label: 'Aufgaben-Profi',
    description: '10 Aufgaben erledigt',
    icon: CheckCircle2,
    check: (s) => s.tasksCompleted >= 10,
    requirement: 'Erledige 10 Aufgaben',
  },
  {
    id: 'streak-held',
    label: 'Streak-Held',
    description: '7-Tage-Streak',
    icon: Flame,
    check: (s) => s.longestStreak >= 7,
    requirement: 'Erreiche einen 7-Tage-Streak',
  },
  {
    id: 'versicherungs-check',
    label: 'Versicherungs-Check',
    description: 'Versicherungs-Check abgeschlossen',
    icon: Shield,
    check: (s) => s.toolsUsed.some(t => t.includes('versicherungs-check')),
    requirement: 'Schliesse den Versicherungs-Check ab',
  },
  {
    id: 'vorsorge-koenig',
    label: 'Vorsorge-König',
    description: 'Vorsorge-Check ausgefüllt',
    icon: Trophy,
    check: (s) => s.toolsUsed.some(t => t.includes('vorsorgecheck') || t.includes('finanzcheck')),
    requirement: 'Fülle den Vorsorge-Check aus',
  },
];

function ProfileRankBadge() {
  const { score, rank } = usePeakScore();
  if (score === null) return null;
  return (
    <Badge variant="outline" className="text-xs gap-1">
      {rank.emoji} {rank.name}
    </Badge>
  );
}

function ProfileFinanzTypBadge() {
  const navigate = useNavigate();
  const { completed, info } = useFinanzType();
  if (!completed || !info) return null;
  return (
    <Badge
      variant="outline"
      className="text-xs gap-1 cursor-pointer hover:bg-accent"
      onClick={() => navigate('/app/client-portal/finanz-typ')}
    >
      {info.emoji} {info.shortTitle}
    </Badge>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    points, streakDays, levelLabel, progressPercent, pointsToNext, maxLevel, level,
  } = useGamification();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async (): Promise<ProfileStats> => {
      if (!user?.id) return { tasksCompleted: 0, goalsReached: 0, articlesRead: 0, longestStreak: 0, totalXp: 0, toolsUsed: [] };

      const [tasksRes, goalsRes, articlesRes, actionsRes] = await Promise.all([
        supabase.from('client_tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true),
        supabase.from('client_goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true),
        supabase.from('article_reads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('gamification_actions').select('action_type, action_ref').eq('user_id', user.id),
      ]);

      // Calculate longest streak from daily_login actions
      const dailyLogins = (actionsRes.data || [])
        .filter(a => a.action_type === 'daily_login')
        .map(a => a.action_ref)
        .sort();
      let longest = 0, current = 1;
      for (let i = 1; i < dailyLogins.length; i++) {
        const prev = new Date(dailyLogins[i - 1] + 'T12:00:00');
        const curr = new Date(dailyLogins[i] + 'T12:00:00');
        const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diff === 1) { current++; } else if (diff > 1) { current = 1; }
        longest = Math.max(longest, current);
      }
      if (dailyLogins.length === 1) longest = 1;

      const toolRefs = (actionsRes.data || [])
        .filter(a => a.action_type === 'tool_used')
        .map(a => a.action_ref);

      return {
        tasksCompleted: tasksRes.count || 0,
        goalsReached: goalsRes.count || 0,
        articlesRead: articlesRes.count || 0,
        longestStreak: Math.max(longest, streakDays),
        totalXp: points,
        toolsUsed: toolRefs,
      };
    },
    enabled: !!user?.id,
  });

  const profileStats = stats || { tasksCompleted: 0, goalsReached: 0, articlesRead: 0, longestStreak: streakDays, totalXp: points, toolsUsed: [] };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwörter stimmen nicht überein.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        if (error.message.includes('same')) {
          toast.error('Das neue Passwort darf nicht mit dem alten identisch sein.');
        } else { throw error; }
      } else {
        toast.success('Passwort erfolgreich geändert.');
        setNewPassword(''); setConfirmPassword(''); setShowPasswordSection(false);
      }
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally { setLoading(false); }
  };

  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : user?.email || '';
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : (user?.email?.charAt(0) || 'U').toUpperCase();
  const memberSince = user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy', { locale: de }) : '';

  const isClient = role === 'client';

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(profileStats)).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background page-transition">
        <ScreenHeader title="Profil" />

        <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-24">

          {/* ─── Profile Header ─── */}
          <Card className="overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>
              {displayName && <p className="text-lg font-bold text-foreground">{displayName}</p>}
              <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Award className="h-3 w-3" /> {levelLabel}
                </Badge>
                <ProfileRankBadge />
                <ProfileFinanzTypBadge />
              </div>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                {memberSince && <span>Mitglied seit {memberSince}</span>}
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" />{points} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* ─── XP Progress ─── */}
          {isClient && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Level {level}</span>
                  <span className="text-xs text-muted-foreground">
                    {maxLevel ? 'Max Level!' : `Noch ${pointsToNext} XP bis Level ${level + 1}`}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
                <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                  <span>{levelLabel}</span>
                  {!maxLevel && <span>{LEVELS.find(l => l.level === level + 1)?.label}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Stats Row ─── */}
          {isClient && (
            <div className="grid grid-cols-4 gap-2">
              <StatCard emoji="🔥" value={profileStats.longestStreak} label="Streak" />
              <StatCard emoji="✅" value={profileStats.tasksCompleted} label="Aufgaben" />
              <StatCard emoji="🎯" value={profileStats.goalsReached} label="Ziele" />
              <StatCard emoji="📚" value={profileStats.articlesRead} label="Artikel" />
            </div>
          )}

          {/* ─── Achievements ─── */}
          {isClient && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Errungenschaften</h3>
                  <span className="text-xs text-muted-foreground">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {ACHIEVEMENTS.map(ach => {
                    const unlocked = ach.check(profileStats);
                    const Icon = ach.icon;
                    return (
                      <div key={ach.id} className="flex flex-col items-center gap-1 group" title={unlocked ? ach.description : ach.requirement}>
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
                          unlocked
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "bg-muted/60"
                        )}>
                          <Icon className={cn("h-5 w-5", unlocked ? "text-primary" : "text-muted-foreground/40")} />
                          {!unlocked && (
                            <Lock className="h-3 w-3 text-muted-foreground/50 absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] text-center leading-tight",
                          unlocked ? "text-foreground font-medium" : "text-muted-foreground/60"
                        )}>
                          {ach.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Account Info ─── */}
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex items-center gap-3 px-4 py-4 min-h-[56px]">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Konto</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-accent/50 transition-colors min-h-[56px]"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <KeyRound className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Passwort ändern</p>
                  <p className="text-xs text-muted-foreground">Neues Passwort setzen</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </CardContent>
          </Card>

          {showPasswordSection && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input id="newPassword" type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} required minLength={8}
                      placeholder="Mindestens 8 Zeichen" className="h-14 rounded-2xl" />
                    {newPassword.length > 0 && <PasswordStrengthChecker password={newPassword} />}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required minLength={8}
                      placeholder="Passwort wiederholen" className="h-14 rounded-2xl" />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwörter stimmen nicht überein</p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                    className="w-full h-14 rounded-2xl">
                    {loading ? 'Wird gespeichert…' : 'Passwort ändern'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Design</span>
                <ThemeSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sprache</span>
                <LanguageSwitcher />
              </div>
              {isClient && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Einführung erneut starten</span>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5"
                    onClick={() => {
                      localStorage.removeItem('client_onboarding_complete');
                      toast.success('Einführung wird beim nächsten Besuch angezeigt.');
                      navigate('/app/client-portal');
                    }}>
                    <RotateCcw className="h-3.5 w-3.5" /> Starten
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline"
            className="w-full h-14 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={signOut}>
            <LogOut className="h-5 w-5 mr-2" /> Abmelden
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <span className="text-lg">{emoji}</span>
        <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, MessageCircle, Mail, Gift, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const INVITE_MESSAGE = (code: string) =>
  `Hey! Ich nutze diese App um meine Finanzen zu optimieren – macht wirklich Spass. Probier's aus mit meinem Code ${code} und wir beide bekommen Bonus-XP! 🚀`;

export default function ClientPortalInvite() {
  const { user } = useAuth();

  // Fetch referral code
  const { data: profile } = useQuery({
    queryKey: ['referral-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch referral count
  const { data: referralCount = 0 } = useQuery({
    queryKey: ['referral-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const { data: completedCount = 0 } = useQuery({
    queryKey: ['referral-completed-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('status', 'completed');
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const code = profile?.referral_code || '...';
  const message = INVITE_MESSAGE(code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code kopiert!');
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Probier diese Finanz-App aus! 🚀');
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <ScreenHeader title="Freunde einladen" backTo="/app/client-portal/friends" />

        <div className="py-2 space-y-5 pb-24">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  +500 XP pro eingeladenem Freund
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Teile deinen persönlichen Einladungscode mit Freunden.
                  Sobald sie das Onboarding abschliessen, erhältst du automatisch 500 Bonus-XP!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Code display */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5 text-center space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Dein Einladungscode
                </p>
                <div className="bg-muted rounded-xl py-4 px-6">
                  <p className="text-2xl font-bold text-primary tracking-widest font-mono">
                    {code}
                  </p>
                </div>
                <Button variant="outline" className="w-full h-11 rounded-xl gap-2" onClick={handleCopy}>
                  <Copy className="h-4 w-4" /> Code kopieren
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share options */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-14 rounded-xl gap-2 text-sm"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5 text-success" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-xl gap-2 text-sm"
                onClick={handleEmail}
              >
                <Mail className="h-5 w-5 text-primary" />
                E-Mail
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {referralCount} {referralCount === 1 ? 'Freund' : 'Freunde'} eingeladen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedCount} davon mit Onboarding abgeschlossen
                    </p>
                  </div>
                  {completedCount > 0 && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3" /> +{completedCount * 500} XP
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">So funktioniert's</h3>
                <div className="space-y-2">
                  {[
                    'Teile deinen Einladungscode mit Freunden',
                    'Dein Freund gibt den Code bei der Registrierung ein',
                    'Sobald dein Freund das Onboarding abschliesst, erhältst du +500 XP',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ClientPortalLayout>
  );
}

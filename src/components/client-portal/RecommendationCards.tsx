import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, Wrench, BookOpen, Compass, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useChatDrawer } from '@/hooks/useChatDrawer';
import type { Recommendation } from '@/config/recommendationConfig';

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  title?: string;
}

export function RecommendationCards({
  recommendations,
  title = 'Dein nächster sinnvoller Schritt',
}: RecommendationCardsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lockedRec, setLockedRec] = useState<Recommendation | null>(null);
  const [requesting, setRequesting] = useState(false);

  // Fetch tool slugs the current user can access
  const { data: accessibleSlugs = new Set<string>() } = useQuery({
    queryKey: ['accessible-tool-slugs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('slug, visibility')
        .eq('enabled_for_clients', true)
        .eq('status', 'active');
      if (error) throw error;
      return new Set(
        (data || [])
          .filter((t: any) => t.visibility === 'public' || t.visibility === 'phase_locked')
          .map((t: any) => t.slug as string)
      );
    },
    enabled: !!user,
  });

  if (!recommendations.length) return null;

  const handleClick = (rec: Recommendation) => {
    if (rec.type === 'tool') {
      if (!accessibleSlugs.has(rec.ref)) {
        setLockedRec(rec);
        return;
      }
      navigate(`/app/client-portal/tools/${rec.ref}`);
    } else {
      navigate(`/app/client-portal/library`);
    }
  };

  const handleRequestUnlock = async () => {
    if (!lockedRec || !user) return;
    setRequesting(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        title: `Tool-Freischaltung angefragt: ${lockedRec.title}`,
        body: `Ein Nutzer möchte das Werkzeug «${lockedRec.title}» (${lockedRec.ref}) freigeschaltet bekommen.`,
        category: 'tool_unlock_request',
        target_role: 'admin',
        status: 'published',
        published_at: new Date().toISOString(),
        created_by: user.id,
      } as any);
      if (error) throw error;
      toast.success('Anfrage gesendet. Dein Berater meldet sich.');
      setLockedRec(null);
    } catch (e: any) {
      toast.error('Anfrage konnte nicht gesendet werden.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <div className="space-y-3 mt-6" data-pdf-hide="true">
        <div className="flex items-center gap-2 px-1">
          <Compass className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.slice(0, 3).map((rec) => {
            const isLocked = rec.type === 'tool' && !accessibleSlugs.has(rec.ref);
            return (
              <Card
                key={`${rec.type}-${rec.ref}`}
                className="border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleClick(rec)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {rec.type === 'tool' ? (
                        <Wrench className="h-4 w-4 text-primary" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {rec.type === 'tool' ? 'Werkzeug' : 'Artikel'}
                    </span>
                    {isLocked && (
                      <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{rec.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full justify-between text-primary group-hover:bg-primary/5"
                  >
                    {isLocked ? 'Freischaltung anfragen' : 'Jetzt ansehen'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!lockedRec} onOpenChange={(open) => !open && setLockedRec(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Noch nicht freigeschaltet</DialogTitle>
            <DialogDescription className="pt-2">
              Dieses Tool ist noch nicht freigeschaltet.
              <br /><br />
              Möchtest du deinen Berater anfragen, es für dich freizuschalten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setLockedRec(null)} disabled={requesting}>
              Abbrechen
            </Button>
            <Button onClick={handleRequestUnlock} disabled={requesting}>
              {requesting ? 'Wird gesendet…' : 'Anfrage senden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

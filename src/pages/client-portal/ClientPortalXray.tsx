import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Stethoscope, ListChecks, Share2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(): string {
  const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const d = new Date();
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ClientPortalXray() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const monthKey = getMonthKey();
  const [generating, setGenerating] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);

  const { data: xray, isLoading } = useQuery({
    queryKey: ['financial-xray', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('financial_xrays')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const generateXray = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-xray', {
        body: { month_key: monthKey },
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['financial-xray', user.id, monthKey] });
      await awardPoints('tool_used', 'xray_reviewed', 100);
      toast.success('+100 XP für dein Finanz-Röntgenbild!');
    } catch (err: any) {
      console.error('Xray generation error:', err);
      toast.error('Röntgenbild konnte nicht erstellt werden.');
    } finally {
      setGenerating(false);
    }
  };

  const createTasksFromPlan = async () => {
    if (!user || !xray) return;
    setCreatingTasks(true);
    try {
      // Extract action items from report (lines starting with numbered items in 30-Tage-Plan section)
      const reportText = xray.report_markdown || '';
      const planSection = reportText.split('## Dein 30-Tage-Plan')[1]?.split('##')[0] || '';
      const taskLines = planSection
        .split('\n')
        .filter(line => /^\d+\.|^-\s/.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*|^-\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 7);

      if (taskLines.length === 0) {
        toast.error('Keine Aufgaben im Plan gefunden.');
        setCreatingTasks(false);
        return;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().slice(0, 10);

      for (const title of taskLines) {
        await supabase.from('client_tasks').insert({
          user_id: user.id,
          title: title.slice(0, 200),
          due_date: dueDateStr,
          notes: `Aus Finanz-Röntgenbild ${getMonthLabel()}`,
        });
      }

      // Mark tasks as created
      await supabase
        .from('financial_xrays')
        .update({ tasks_created: true })
        .eq('id', xray.id);

      queryClient.invalidateQueries({ queryKey: ['financial-xray', user.id, monthKey] });
      queryClient.invalidateQueries({ queryKey: ['open-tasks-count'] });

      await awardPoints('task_completed', 'xray_tasks_created', 250);
      toast.success(`${taskLines.length} Aufgaben erstellt! +250 XP Bonus 🎉`);
    } catch (err) {
      console.error(err);
      toast.error('Aufgaben konnten nicht erstellt werden.');
    } finally {
      setCreatingTasks(false);
    }
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <ScreenHeader title="Finanz-Röntgenbild" subtitle={getMonthLabel()} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !xray ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    Dein Röntgenbild für {getMonthLabel()}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Eine KI-gestützte, ehrliche Analyse deiner finanziellen Gesundheit —
                    basierend auf all deinen Daten.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={generateXray}
                  disabled={generating}
                  className="gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Wird erstellt…
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-4 w-4" />
                      Röntgenbild erstellen
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground">+100 XP für die Erstellung</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Report rendered */}
            <Card>
              <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{xray.report_markdown}</ReactMarkdown>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {!xray.tasks_created && (
                <Button
                  size="lg"
                  onClick={createTasksFromPlan}
                  disabled={creatingTasks}
                  className="gap-2 w-full"
                >
                  {creatingTasks ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ListChecks className="h-4 w-4" />
                  )}
                  Aufgaben aus dem Plan erstellen
                  <span className="text-[10px] opacity-70 ml-1">+250 XP</span>
                </Button>
              )}

              {xray.tasks_created && (
                <p className="text-xs text-center text-muted-foreground">
                  ✅ Aufgaben wurden bereits erstellt
                </p>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={generateXray}
                disabled={generating}
                className="gap-2 w-full"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Neues Röntgenbild erstellen
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

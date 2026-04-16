import { useState, useMemo } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Heart, ClipboardList, ArrowLeft, Quote, Target, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuccessStories, useMotivateStory, useCreateStoryTasks, type SuccessStory } from '@/hooks/useSuccessStories';
import { useFinanzType } from '@/hooks/useFinanzType';

const TAG_FILTERS = [
  { label: 'Alle', value: 'all' },
  { label: 'Sparen', value: 'sparen' },
  { label: 'Investieren', value: 'investieren' },
  { label: 'Familie', value: 'familie' },
  { label: 'Eigenheim', value: 'eigenheim' },
  { label: 'Schulden', value: 'schulden' },
  { label: 'Selbstständig', value: 'selbststaendig' },
];

function MiniChart({ data }: { data: number[] }) {
  if (!data?.length || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (() => {
        const lastX = w;
        const lastY = h - ((data[data.length - 1] - min) / range) * (h - 8) - 4;
        return <circle cx={lastX} cy={lastY} r="4" fill="hsl(var(--primary))" />;
      })()}
    </svg>
  );
}

function StoryDetail({ story, onBack }: { story: SuccessStory; onBack: () => void }) {
  const motivate = useMotivateStory();
  const createTasks = useCreateStoryTasks();
  const actions = (story.actions_taken || []) as string[];
  const journey = (story.peakscore_journey || []) as number[];
  const startSit = story.start_situation || {};
  const endRes = story.end_result || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{story.title}</h1>
          <p className="text-xs text-muted-foreground">{story.persona_context}</p>
        </div>
      </div>

      {/* PeakScore Journey */}
      {journey.length >= 2 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PeakScore-Verlauf</p>
            <MiniChart data={journey} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Start: {journey[0]} Mt.</span>
              <span className="font-bold text-primary">Heute: {journey[journey.length - 1]} Mt.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Situation */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-destructive" /> Startsituation
          </h3>
          <div className="space-y-1.5">
            {Object.entries(startSit).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground">{String(val)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      {story.goals && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">🎯 Ziele</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{story.goals}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions Taken */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" /> Was {story.persona_name.split(',')[0]} tat
          </h3>
          <div className="space-y-2">
            {actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="size-6 rounded-full bg-primary/10 grid place-content-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* End Result */}
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-success" /> Ergebnis
          </h3>
          <div className="space-y-1.5">
            {Object.entries(endRes).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-bold text-success">{String(val)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quote */}
      {story.quote && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <Quote className="h-5 w-5 text-primary/40 mb-2" />
            <p className="text-sm italic text-foreground leading-relaxed">„{story.quote}"</p>
            <p className="text-xs text-muted-foreground mt-2">— {story.persona_name}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => motivate.mutate(story.id)}
          disabled={motivate.isPending}
        >
          <Heart className="h-4 w-4" /> Das motiviert mich
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={() => createTasks.mutate(actions)}
          disabled={createTasks.isPending || actions.length === 0}
        >
          <ClipboardList className="h-4 w-4" /> Aufgaben erstellen
        </Button>
      </div>
    </div>
  );
}

export default function ClientPortalSuccessStories() {
  const { data: stories, isLoading } = useSuccessStories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!stories) return [];
    if (activeFilter === 'all') return stories;
    return stories.filter(s => s.tags?.includes(activeFilter));
  }, [stories, activeFilter]);

  const selected = stories?.find(s => s.id === selectedId);

  if (selected) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
          <StoryDetail story={selected} onBack={() => setSelectedId(null)} />
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <ScreenHeader title="Erfolgsgeschichten" backTo="/app/client-portal" />

        <p className="text-xs text-muted-foreground px-1">
          Echte Transformationen von echten Menschen. Anonymisiert, aber wahr.
        </p>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 no-scrollbar">
          {TAG_FILTERS.map(f => (
            <Badge
              key={f.value}
              variant={activeFilter === f.value ? 'default' : 'outline'}
              className="cursor-pointer shrink-0 text-xs"
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>

        {/* Story Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Noch keine Geschichten in dieser Kategorie.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((story, i) => {
              const journey = (story.peakscore_journey || []) as number[];
              const startScore = journey[0];
              const endScore = journey[journey.length - 1];

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="cursor-pointer active:scale-[0.99] transition-all hover:shadow-md"
                    onClick={() => setSelectedId(story.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="size-11 rounded-2xl bg-success/10 grid place-content-center shrink-0">
                          <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{story.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{story.persona_context}</p>
                          {startScore != null && endScore != null && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[10px]">
                                Score {startScore} → {endScore}
                              </Badge>
                            </div>
                          )}
                          {story.quote && (
                            <p className="text-[11px] text-muted-foreground mt-1.5 italic line-clamp-1">
                              „{story.quote}"
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

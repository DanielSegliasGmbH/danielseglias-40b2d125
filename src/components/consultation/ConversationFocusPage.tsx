import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  FOCUS_TOPICS,
  QUALIFICATION_ITEMS,
  TIMELINE_STEPS,
  generateDefaultFocusData,
  type ConversationFocusData,
  type TopicTag,
} from './ConversationFocusConfig';

// ─── Admin: Topic Selection Cards ───────────────────────────────────
function AdminTopicCard({
  topic,
  state,
  onToggle,
  onTagToggle,
}: {
  topic: (typeof FOCUS_TOPICS)[number];
  state: { selected: boolean; tags: TopicTag[] };
  onToggle: () => void;
  onTagToggle: (tag: TopicTag) => void;
}) {
  const tags: { key: TopicTag; label: string }[] = [
    { key: 'customer', label: 'Vom Kunden erwähnt' },
    { key: 'recommended', label: 'Von mir empfohlen' },
    { key: 'focus', label: 'Heute im Fokus' },
  ];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 border',
        state.selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/40'
      )}
      onClick={onToggle}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={state.selected}
            onCheckedChange={() => onToggle()}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5"
          />
          <span className="text-sm font-medium text-foreground leading-snug">
            {topic.label}
          </span>
        </div>
        {state.selected && (
          <div
            className="flex flex-wrap gap-1.5 pl-7"
            onClick={(e) => e.stopPropagation()}
          >
            {tags.map((tag) => (
              <Badge
                key={tag.key}
                variant={state.tags.includes(tag.key) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer text-xs transition-colors',
                  tag.key === 'focus' && state.tags.includes(tag.key) && 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                )}
                onClick={() => onTagToggle(tag.key)}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Admin: Qualification Checklist ─────────────────────────────────
function AdminQualification({
  data,
  onToggle,
  onNoteChange,
}: {
  data: ConversationFocusData['qualification'];
  onToggle: (id: string) => void;
  onNoteChange: (id: string, notes: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">
        Qualifizierung (Goldstandard)
      </h3>
      <div className="space-y-2">
        {QUALIFICATION_ITEMS.map((item) => {
          const state = data[item.id];
          return (
            <Card key={item.id} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={state?.checked ?? false}
                    onCheckedChange={() => onToggle(item.id)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.question}</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Notizen..."
                  value={state?.notes ?? ''}
                  onChange={(e) => onNoteChange(item.id, e.target.value)}
                  className="text-xs min-h-[48px] resize-none"
                  rows={2}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Presentation: Selected Topics ──────────────────────────────────
function PresentationTopics({
  data,
}: {
  data: ConversationFocusData['focusTopics'];
}) {
  const selected = FOCUS_TOPICS.filter((t) => data[t.id]?.selected);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-wrap-balance leading-tight">
          Das schauen wir uns heute gemeinsam an
        </h2>
        <p className="text-muted-foreground text-base max-w-prose">
          Mir ist wichtig, dass wir uns heute auf die Themen konzentrieren, die für dich wirklich relevant sind.
        </p>
      </div>
      {selected.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {selected.map((topic, i) => (
            <li
              key={topic.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{topic.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Noch keine Themen ausgewählt.
        </p>
      )}
    </section>
  );
}

// ─── Presentation: Timeline ─────────────────────────────────────────
function PresentationTimeline() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-wrap-balance leading-tight">
        So läuft unser Gespräch heute ab
      </h2>
      <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
        {TIMELINE_STEPS.map((step, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[calc(0.75rem+1px)] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-muted/50 p-5 space-y-2">
        <p className="text-sm font-medium text-foreground">Wichtig für dich:</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Das Gespräch heute ist darauf ausgelegt, dir Klarheit zu geben.
          Ob du danach etwas verändern möchtest, entscheidest ganz alleine du.
        </p>
      </div>
    </section>
  );
}

// ─── Presentation: Qualification Speech ─────────────────────────────
function PresentationQualification() {
  const statements = [
    'Du hast mir ja bereits gesagt, dass du dich mit deiner aktuellen Situation auseinandersetzen möchtest und offen bist, Optimierungen anzuschauen.',
    'Für mich ist wichtig: Wenn wir heute feststellen, dass es eine bessere Lösung gibt – bist du grundsätzlich auch bereit, etwas zu verändern?',
    'Und du entscheidest das Ganze auch selbst für dich, korrekt?',
    'Wenn wir eine sinnvolle Lösung finden – wäre es für dich auch in Ordnung, dafür etwas zu investieren?',
    'Und zeitlich: Wenn es Sinn macht, würdest du das auch zeitnah umsetzen wollen?',
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-wrap-balance leading-tight">
        Wichtiger Punkt vorab
      </h2>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed max-w-prose">
        <p>
          Mir ist noch ein Punkt wichtig, bevor wir ins Detail gehen:
        </p>
        <p>
          Das, was ich dir heute zeige, ist nicht einfach eine Standardlösung.
          Es ist eine sehr hochwertige und durchdachte Strategie, die nicht für jeden geeignet ist – auch wenn grundsätzlich jeder davon profitieren könnte.
        </p>
        <p>
          Darum ist es mir wichtig, dass wir kurz sicherstellen, dass die Rahmenbedingungen bei dir passen.
        </p>
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-primary/20">
        {statements.map((s, i) => (
          <p key={i} className="text-sm text-foreground/80 leading-relaxed italic">
            „{s}"
          </p>
        ))}
      </div>

      <div className="rounded-xl bg-muted/50 p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          „Mir ist das wichtig, weil ich dir nichts zeigen möchte, was am Ende sowieso nicht umgesetzt wird.
          Wenn wir das anschauen, dann richtig – und mit dem Ziel, eine klare Entscheidung treffen zu können."
        </p>
      </div>
    </section>
  );
}

// ─── Main Page Component ────────────────────────────────────────────
interface ConversationFocusPageProps {
  /** Current focus data from consultation state */
  focusData?: ConversationFocusData;
  /** Called on any data change (debounced by parent) */
  onDataChange?: (data: ConversationFocusData) => void;
}

export default function ConversationFocusPage({
  focusData: externalData,
  onDataChange,
}: ConversationFocusPageProps) {
  const { isPresentation } = useViewMode();
  const [data, setData] = useState<ConversationFocusData>(
    externalData ?? generateDefaultFocusData()
  );

  // Sync from external
  useEffect(() => {
    if (externalData) setData(externalData);
  }, [externalData]);

  const update = useCallback(
    (updater: (prev: ConversationFocusData) => ConversationFocusData) => {
      setData((prev) => {
        const next = updater(prev);
        onDataChange?.(next);
        return next;
      });
    },
    [onDataChange]
  );

  const toggleTopic = (id: string) =>
    update((d) => ({
      ...d,
      focusTopics: {
        ...d.focusTopics,
        [id]: { ...d.focusTopics[id], selected: !d.focusTopics[id]?.selected },
      },
    }));

  const toggleTag = (id: string, tag: TopicTag) =>
    update((d) => {
      const current = d.focusTopics[id]?.tags ?? [];
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return {
        ...d,
        focusTopics: {
          ...d.focusTopics,
          [id]: { ...d.focusTopics[id], tags: next },
        },
      };
    });

  const toggleQualification = (id: string) =>
    update((d) => ({
      ...d,
      qualification: {
        ...d.qualification,
        [id]: { ...d.qualification[id], checked: !d.qualification[id]?.checked },
      },
    }));

  const setQualificationNotes = (id: string, notes: string) =>
    update((d) => ({
      ...d,
      qualification: {
        ...d.qualification,
        [id]: { ...d.qualification[id], notes },
      },
    }));

  // ─── PRESENTATION VIEW ────────────────────────────────────────
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-16">
          <PresentationTopics data={data.focusTopics} />
          <PresentationTimeline />
          <PresentationQualification />
        </div>
      </div>
    );
  }

  // ─── ADMIN VIEW ───────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-10">
        {/* Section A: Topic Selection */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Gesprächsfokus festlegen
            </h2>
            <p className="text-sm text-muted-foreground">
              Wähle die Themen aus, die heute im Gespräch behandelt werden sollen.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FOCUS_TOPICS.map((topic) => (
              <AdminTopicCard
                key={topic.id}
                topic={topic}
                state={data.focusTopics[topic.id] ?? { selected: false, tags: [] }}
                onToggle={() => toggleTopic(topic.id)}
                onTagToggle={(tag) => toggleTag(topic.id, tag)}
              />
            ))}
          </div>
        </section>

        {/* Section B: Timeline preview hint */}
        <section className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            Erwartungen & Ablauf
          </h3>
          <p className="text-sm text-muted-foreground">
            Die Timeline und der Gesprächsablauf werden dem Kunden in der Präsentationsansicht angezeigt.
          </p>
        </section>

        {/* Section C: Qualification */}
        <AdminQualification
          data={data.qualification}
          onToggle={toggleQualification}
          onNoteChange={setQualificationNotes}
        />
      </div>
    </AppLayout>
  );
}

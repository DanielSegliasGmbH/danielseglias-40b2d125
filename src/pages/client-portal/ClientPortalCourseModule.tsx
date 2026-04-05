import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Lock, Clock, MessageSquareHeart, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import {
  useCourseModules,
  useCourseLessons,
  useLessonAccess,
  useMyCustomerId,
  useLessonFeedback,
  useSendCourseFeedback,
  CourseLesson,
} from '@/hooks/useCourseData';

export default function ClientPortalCourseModule() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const { data: modules } = useCourseModules();
  const { data: lessons, isLoading } = useCourseLessons(moduleId);
  const { data: customerId } = useMyCustomerId();
  const { data: lessonAccess } = useLessonAccess(customerId || undefined);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const currentModule = modules?.find(m => m.id === moduleId);

  const isLessonUnlocked = (lessonId: string) => {
    if (!lessonAccess) return false;
    return lessonAccess.find(a => a.lesson_id === lessonId)?.is_unlocked ?? false;
  };

  const selectedLesson = lessons?.[selectedIdx];
  const selectedUnlocked = selectedLesson ? isLessonUnlocked(selectedLesson.id) : false;

  // Find next unlocked lesson for "Next Lesson" teaser
  const nextLesson = lessons?.[selectedIdx + 1];
  const nextUnlocked = nextLesson ? isLessonUnlocked(nextLesson.id) : false;

  return (
    <ClientPortalLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <Link to="/app/client-portal/courses" className="hover:text-foreground transition-colors">
            Videokurs
          </Link>
          <span>/</span>
          {currentModule && (
            <>
              <span className="text-foreground font-medium">{currentModule.title}</span>
              {selectedLesson && (
                <>
                  <span>/</span>
                  <span className="text-foreground font-medium">{selectedLesson.title}</span>
                </>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 animate-pulse"><CardContent className="p-0 h-80" /></Card>
            <Card className="animate-pulse"><CardContent className="p-0 h-80" /></Card>
          </div>
        ) : !lessons?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Noch keine Lektionen in diesem Modul.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main grid: Video + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Video hero */}
              <div className="lg:col-span-2 space-y-4">
                <VideoHero
                  lesson={selectedLesson!}
                  unlocked={selectedUnlocked}
                />

                {/* Next lesson teaser */}
                {nextLesson && (
                  <Card
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-shadow',
                      !nextUnlocked && 'opacity-60'
                    )}
                    onClick={() => nextUnlocked && setSelectedIdx(selectedIdx + 1)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {nextLesson.thumbnail_url ? (
                        <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-muted">
                          <img src={nextLesson.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Nächste Lektion</p>
                        <p className="text-sm font-medium text-foreground truncate">{nextLesson.title}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                )}

                {/* Lesson details + feedback */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedLesson!.title}</h2>
                    {currentModule && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {currentModule.icon_emoji} {currentModule.title}
                      </p>
                    )}
                  </div>

                  {selectedLesson!.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedLesson!.description}
                    </p>
                  )}

                  {/* Feedback section */}
                  {selectedUnlocked && (
                    <FeedbackSection
                      lessonId={selectedLesson!.id}
                      customerId={customerId}
                      userId={user?.id}
                    />
                  )}
                </div>
              </div>

              {/* Right: Lesson sidebar */}
              <div>
                <Card className="sticky top-4">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-foreground text-sm">
                      {currentModule?.icon_emoji} {currentModule?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{lessons.length} Lektionen</p>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {lessons.map((lesson, idx) => {
                      const unlocked = isLessonUnlocked(lesson.id);
                      const isActive = idx === selectedIdx;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => unlocked ? setSelectedIdx(idx) : toast.info('Dieser Inhalt ist aktuell noch nicht freigeschaltet.')}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-b-0',
                            isActive ? 'bg-primary/5' : 'hover:bg-muted/50',
                            !unlocked && 'opacity-50'
                          )}
                        >
                          <span className="text-xs text-muted-foreground w-4 shrink-0 text-center">{idx + 1}</span>
                          {lesson.thumbnail_url ? (
                            <div className="w-14 h-10 rounded-md overflow-hidden shrink-0 bg-muted">
                              <img src={lesson.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                              {unlocked ? <Play className="h-3 w-3 text-muted-foreground" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm truncate', isActive ? 'font-semibold text-foreground' : 'text-foreground')}>
                              {lesson.title}
                            </p>
                            {isActive && lesson.duration_text && (
                              <p className="text-xs text-muted-foreground mt-0.5">{lesson.duration_text}</p>
                            )}
                          </div>
                          {unlocked ? (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </ClientPortalLayout>
  );
}

/* ─── Video Hero ─── */
function VideoHero({ lesson, unlocked }: { lesson: CourseLesson; unlocked: boolean }) {
  const handlePlay = () => {
    if (!unlocked) {
      toast.info('Dieser Inhalt ist aktuell noch nicht freigeschaltet.');
      return;
    }
    if (lesson.video_url) {
      window.open(lesson.video_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Für diese Lektion ist noch kein Video hinterlegt.');
    }
  };

  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-2xl overflow-hidden bg-muted cursor-pointer group',
        !unlocked && 'cursor-not-allowed'
      )}
      onClick={handlePlay}
    >
      {lesson.thumbnail_url ? (
        <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
          <span className="text-4xl">{unlocked ? '🎬' : '🔒'}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        {unlocked ? (
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 text-foreground ml-1" />
          </div>
        ) : (
          <div className="text-center text-white space-y-2">
            <Lock className="h-8 w-8 mx-auto" />
            <p className="text-sm font-medium">Noch nicht freigeschaltet</p>
          </div>
        )}
      </div>

      {/* Duration badge */}
      {lesson.duration_text && unlocked && (
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lesson.duration_text}
        </div>
      )}
    </div>
  );
}

/* ─── Feedback Section ─── */
function FeedbackSection({
  lessonId,
  customerId,
  userId,
}: {
  lessonId: string;
  customerId?: string | null;
  userId?: string;
}) {
  const [feedbackText, setFeedbackText] = useState('');
  const { data: feedbacks } = useLessonFeedback(lessonId);
  const sendFeedback = useSendCourseFeedback();

  const handleSend = async () => {
    if (!feedbackText.trim() || !customerId || !userId) return;
    try {
      await sendFeedback.mutateAsync({
        lesson_id: lessonId,
        customer_id: customerId,
        user_id: userId,
        message: feedbackText.trim(),
      });
      setFeedbackText('');
      toast.success('Danke für dein Feedback! 🙌');
    } catch {
      toast.error('Feedback konnte nicht gesendet werden.');
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Feedback
            {feedbacks && feedbacks.length > 0 && (
              <span className="ml-1.5 text-muted-foreground font-normal">{feedbacks.length}</span>
            )}
          </h3>
        </div>

        {feedbacks && feedbacks.length > 0 && (
          <div className="space-y-2">
            {feedbacks.map(fb => (
              <div key={fb.id} className="text-sm bg-muted/50 rounded-lg p-3">
                <p className="text-foreground">{fb.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(fb.created_at).toLocaleDateString('de-CH')}
                </p>
              </div>
            ))}
          </div>
        )}

        <Textarea
          placeholder="Dein Feedback zu dieser Lektion…"
          value={feedbackText}
          onChange={e => setFeedbackText(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!feedbackText.trim() || sendFeedback.isPending}
        >
          {sendFeedback.isPending ? 'Wird gesendet…' : 'Feedback senden'}
        </Button>
      </CardContent>
    </Card>
  );
}

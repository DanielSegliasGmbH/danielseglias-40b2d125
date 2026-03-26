import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Lock, Clock, MessageSquareHeart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
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
  const { data: modules } = useCourseModules();
  const { data: lessons, isLoading } = useCourseLessons(moduleId);
  const { data: customerId } = useMyCustomerId();
  const { data: lessonAccess } = useLessonAccess(customerId || undefined);

  const currentModule = modules?.find(m => m.id === moduleId);

  const isLessonUnlocked = (lessonId: string) => {
    if (!lessonAccess) return false;
    const access = lessonAccess.find(a => a.lesson_id === lessonId);
    return access?.is_unlocked ?? false;
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back + Title */}
        <div>
          <Link
            to="/app/client-portal/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Link>
          {currentModule && (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${currentModule.color}15` }}
              >
                {currentModule.icon_emoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{currentModule.title}</h1>
                {currentModule.description && (
                  <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lessons */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 h-24" />
              </Card>
            ))}
          </div>
        ) : lessons?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Noch keine Lektionen in diesem Modul.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lessons?.map((lesson, idx) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={idx}
                unlocked={isLessonUnlocked(lesson.id)}
                customerId={customerId}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

function LessonCard({
  lesson,
  index,
  unlocked,
  customerId,
  userId,
}: {
  lesson: CourseLesson;
  index: number;
  unlocked: boolean;
  customerId?: string | null;
  userId?: string;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { data: feedbacks } = useLessonFeedback(showFeedback ? lesson.id : undefined);
  const sendFeedback = useSendCourseFeedback();

  const handleVideoClick = () => {
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

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || !customerId || !userId) return;
    try {
      await sendFeedback.mutateAsync({
        lesson_id: lesson.id,
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
    <Card className={cn(!unlocked && 'opacity-70')}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail / Number */}
          {lesson.thumbnail_url ? (
            <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img
                src={lesson.thumbnail_url}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                {lesson.duration_text && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.duration_text}
                  </div>
                )}
              </div>

              {unlocked ? (
                <Button size="sm" onClick={handleVideoClick} className="shrink-0 gap-1.5">
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Video ansehen</span>
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Gesperrt</span>
                </div>
              )}
            </div>

            {/* Feedback toggle */}
            {unlocked && (
              <div className="mt-3">
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquareHeart className="h-3.5 w-3.5" />
                  Feedback zu dieser Lektion
                </button>

                {showFeedback && (
                  <div className="mt-3 space-y-3">
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
                      onClick={handleSendFeedback}
                      disabled={!feedbackText.trim() || sendFeedback.isPending}
                    >
                      {sendFeedback.isPending ? 'Wird gesendet…' : 'Feedback senden'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

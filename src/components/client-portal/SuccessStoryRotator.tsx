import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSuccessStories } from '@/hooks/useSuccessStories';

export function SuccessStoryRotator() {
  const { data: stories } = useSuccessStories();

  // Rotate weekly based on week number
  const weeklyStory = useMemo(() => {
    if (!stories?.length) return null;
    const now = new Date();
    const weekNum = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return stories[weekNum % stories.length];
  }, [stories]);

  if (!weeklyStory) return null;

  const startScore = (weeklyStory.peakscore_journey as number[])?.[0];
  const endScore = (weeklyStory.peakscore_journey as number[])?.[(weeklyStory.peakscore_journey as number[]).length - 1];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
      <Link to="/app/client-portal/success-stories">
        <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-success/10 grid place-content-center shrink-0">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Erfolgsgeschichte der Woche
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {weeklyStory.persona_name}, {weeklyStory.persona_age}
                </p>
                {startScore != null && endScore != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PeakScore {startScore} → {endScore} Monate
                  </p>
                )}
                {weeklyStory.quote && (
                  <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                    „{weeklyStory.quote}"
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Search, ArrowLeft, ExternalLink, ChevronRight,
  Lightbulb, AlertCircle, Target, LinkIcon, CheckCircle2, Clock, Sparkles,
  Building2, TrendingUp, ShieldCheck, PiggyBank, Home, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KNOWLEDGE_CATEGORIES,
  type KnowledgeCategory,
  type KnowledgeArticle,
  getCategoryById,
  getAllArticles,
} from '@/config/knowledgeLibraryConfig';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, PiggyBank, TrendingUp, ShieldCheck, Home, FileText,
};

const NEW_THRESHOLD_DAYS = 30;

function isNew(addedAt?: string): boolean {
  if (!addedAt) return false;
  const diff = Date.now() - new Date(addedAt).getTime();
  return diff < NEW_THRESHOLD_DAYS * 86400000;
}

export default function ClientPortalLibrary() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  const allArticles = useMemo(() => getAllArticles(), []);

  // Fetch read articles
  const { data: readArticles = [] } = useQuery({
    queryKey: ['article-reads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('article_reads')
        .select('article_id, first_read_at')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const readSet = useMemo(() => new Set(readArticles.map(r => r.article_id)), [readArticles]);

  const markAsRead = useMutation({
    mutationFn: async (articleId: string) => {
      if (!user?.id || readSet.has(articleId)) return;
      await supabase.from('article_reads').upsert(
        { user_id: user.id, article_id: articleId, last_read_at: new Date().toISOString() },
        { onConflict: 'user_id,article_id' }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['article-reads'] }),
  });

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return allArticles;
    const q = search.toLowerCase();
    return allArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.shortDescription.toLowerCase().includes(q) ||
      a.categoryId.toLowerCase().includes(q)
    );
  }, [search, allArticles]);

  const currentCategory = activeCategory ? getCategoryById(activeCategory) : null;
  const currentArticle = activeArticle ? allArticles.find(a => a.id === activeArticle) : null;

  // Article Detail View
  if (currentArticle) {
    const cat = getCategoryById(currentArticle.categoryId);
    return (
      <ClientPortalLayout>
        <ScreenHeader
          title={currentArticle.title}
          breadcrumb={['Bibliothek', cat?.title || '', currentArticle.title]}
        />
        <div className="max-w-3xl mx-auto">
          <ArticleDetail
            article={currentArticle}
            isRead={readSet.has(currentArticle.id)}
            onComplete={() => {
              markAsRead.mutate(currentArticle.id);
              const today = new Date().toISOString().slice(0, 10);
              const hasReadToday = readArticles.some(r =>
                r.first_read_at?.startsWith(today) && r.article_id !== currentArticle.id
              );
              awardPoints('tool_used', `article-read_${currentArticle.id}`);
              if (!hasReadToday) {
                awardPoints('daily_login', `article-bonus_${today}`);
              }
            }}
          />
        </div>
      </ClientPortalLayout>
    );
  }

  // Category Detail View
  if (currentCategory) {
    const catArticles = currentCategory.articles;
    const readCount = catArticles.filter(a => readSet.has(a.id)).length;
    return (
      <ClientPortalLayout>
        <ScreenHeader
          title={currentCategory.title}
          breadcrumb={['Bibliothek', currentCategory.title]}
          backTo="/app/client-portal/library"
        />
        <div className="max-w-4xl mx-auto">
          <CategoryHeader category={currentCategory} />
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{readCount} von {catArticles.length} Artikeln gelesen</span>
              <span>{Math.round((readCount / catArticles.length) * 100)}%</span>
            </div>
            <Progress value={(readCount / catArticles.length) * 100} className="h-2" />
          </div>
          <div className="grid gap-3">
            {catArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isRead={readSet.has(article.id)}
                onClick={() => setActiveArticle(article.id)}
              />
            ))}
          </div>
        </div>
      </ClientPortalLayout>
    );
  }

  // Main Library View
  return (
    <ClientPortalLayout>
      <ScreenHeader title="📚 Wissensbibliothek" backTo="/app/client-portal" />
      <div className="max-w-5xl mx-auto">

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach «Steuern», «ETF», «3a»…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {search.trim() ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredArticles.length} Ergebnis{filteredArticles.length !== 1 ? 'se' : ''} für «{search}»
            </p>
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isRead={readSet.has(article.id)}
                showCategory
                onClick={() => { setActiveArticle(article.id); setSearch(''); }}
              />
            ))}
            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Keine Ergebnisse gefunden.
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KNOWLEDGE_CATEGORIES.map(category => {
              const readCount = category.articles.filter(a => readSet.has(a.id)).length;
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  readCount={readCount}
                  onClick={() => setActiveCategory(category.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

// ─── Sub-Components ───

function CategoryCard({ category, readCount, onClick }: { category: KnowledgeCategory; readCount: number; onClick: () => void }) {
  const Icon = ICON_MAP[category.icon] || BookOpen;
  const total = category.articles.length;
  const pct = Math.round((readCount / total) * 100);
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{category.emoji}</span>
          {readCount === total && total > 0 && (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          )}
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
          {category.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {category.description}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{readCount}/{total} gelesen</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryHeader({ category }: { category: KnowledgeCategory }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{category.emoji}</span>
      <div>
        <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
    </div>
  );
}

function ArticleCard({
  article, isRead, showCategory, onClick,
}: {
  article: KnowledgeArticle;
  isRead: boolean;
  showCategory?: boolean;
  onClick: () => void;
}) {
  const cat = showCategory ? getCategoryById(article.categoryId) : null;
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group",
        isRead && "opacity-80"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {cat && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {cat.emoji} {cat.title}
                </Badge>
              )}
              {isNew(article.addedAt) && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-0">
                  Neu
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
              {isRead && <CheckCircle2 className="h-3.5 w-3.5 text-primary inline mr-1.5 -mt-0.5" />}
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {article.shortDescription}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {article.readingMinutes} Min. Lesezeit
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                <Sparkles className="h-3 w-3" />
                +{article.xpReward} XP
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleDetail({ article, isRead, onComplete }: { article: KnowledgeArticle; isRead: boolean; onComplete: () => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(isRead);
  const [showXp, setShowXp] = useState(false);

  useEffect(() => {
    if (completed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !completed) {
          setCompleted(true);
          setShowXp(true);
          onComplete();
          setTimeout(() => setShowXp(false), 2000);
        }
      },
      { threshold: 0.5 }
    );
    if (endRef.current) observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [completed, onComplete]);

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showXp && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -40 }}
            exit={{ opacity: 0, y: -80 }}
            className="fixed top-20 right-8 z-50 text-primary font-bold text-lg flex items-center gap-1"
          >
            <Sparkles className="h-5 w-5" />
            +{article.xpReward} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {article.readingMinutes} Min.
          </span>
          {completed && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Gelesen
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{article.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{article.shortDescription}</p>
      </div>

      {/* Warum ist das wichtig? */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Warum ist das wichtig?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.whyImportant}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Praxisbeispiel */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
              <Target className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Praxisbeispiel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.practiceExample}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typische Fehler */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Typische Fehler</h3>
              <ul className="space-y-1.5">
                {article.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>{mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relevanz */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-1">Was bedeutet das für dich?</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{article.customerRelevance}</p>
        </CardContent>
      </Card>

      {/* Verlinktes Tool */}
      {article.linkedToolLabel && (
        <Card className="border-primary/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Passendes Tool</h3>
              <p className="text-xs text-muted-foreground">Vertiefe dieses Thema interaktiv</p>
            </div>
            <Button size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              {article.linkedToolLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quellen */}
      {article.sources && article.sources.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">Quellen</h3>
            <ul className="space-y-1.5">
              {article.sources.map((source, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>•</span>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline-offset-2 hover:underline">
                      {source.title}
                    </a>
                  ) : source.title}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* End marker for scroll tracking */}
      <div ref={endRef} className="pt-2">
        <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Mehr Themen entdecken
        </Button>
      </div>
    </div>
  );
}

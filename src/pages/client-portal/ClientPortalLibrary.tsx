import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BookOpen, Search, Eye, EyeOff, Building2, PiggyBank, TrendingUp,
  AlertTriangle, Map, Users, HelpCircle, BookCheck, ArrowLeft,
  ExternalLink, ChevronRight, Lightbulb, AlertCircle, Target, LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  KNOWLEDGE_CATEGORIES,
  type KnowledgeCategory,
  type KnowledgeArticle,
  getCategoryById,
  getAllArticles,
} from '@/config/knowledgeLibraryConfig';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, PiggyBank, TrendingUp, AlertTriangle, Map, Users, HelpCircle, BookCheck,
};

const PRIVATE_MODE_KEY = 'knowledge-library-private-mode';

export default function ClientPortalLibrary() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState(() => {
    try { return localStorage.getItem(PRIVATE_MODE_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(PRIVATE_MODE_KEY, String(isPrivateMode)); } catch { /* ignore */ }
  }, [isPrivateMode]);

  const allArticles = useMemo(() => getAllArticles(), []);

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
  const currentArticle = activeArticle
    ? allArticles.find(a => a.id === activeArticle)
    : null;

  // ─── Article Detail View ───
  if (currentArticle) {
    const cat = getCategoryById(currentArticle.categoryId);
    return (
      <ClientPortalLayout>
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground"
            onClick={() => setActiveArticle(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {cat ? cat.title : 'Zurück'}
          </Button>

          <ArticleDetail article={currentArticle} isPrivateMode={isPrivateMode} />
        </div>
      </ClientPortalLayout>
    );
  }

  // ─── Category Detail View ───
  if (currentCategory) {
    return (
      <ClientPortalLayout>
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground"
            onClick={() => setActiveCategory(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Alle Kategorien
          </Button>

          <CategoryHeader category={currentCategory} />

          <div className="grid gap-4 mt-6">
            {currentCategory.articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => setActiveArticle(article.id)}
              />
            ))}
          </div>
        </div>
      </ClientPortalLayout>
    );
  }

  // ─── Main Library View ───
  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Wissensbibliothek</h1>
              <p className="text-muted-foreground text-sm">
                Finanzwissen einfach erklärt – für bessere Entscheidungen
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Begriffen wie «Steuern», «ETF», «3a»…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {search.trim() ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredArticles.length} Ergebnis{filteredArticles.length !== 1 ? 'se' : ''} für «{search}»
            </p>
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                showCategory
                onClick={() => { setActiveArticle(article.id); setSearch(''); }}
              />
            ))}
            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Keine Ergebnisse gefunden. Versuche einen anderen Begriff.
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Category Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KNOWLEDGE_CATEGORIES.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

// ─── Sub-Components ───

function CategoryCard({ category, onClick }: { category: KnowledgeCategory; onClick: () => void }) {
  const Icon = ICON_MAP[category.icon] || BookOpen;
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
          `bg-${category.color}/10`
        )}
        style={{ backgroundColor: `hsl(var(--${category.color}) / 0.1)` }}
        >
          <Icon className="h-5 w-5" style={{ color: `hsl(var(--${category.color}))` }} />
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
          {category.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {category.articles.length} Artikel
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryHeader({ category }: { category: KnowledgeCategory }) {
  const Icon = ICON_MAP[category.icon] || BookOpen;
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `hsl(var(--${category.color}) / 0.1)` }}
      >
        <Icon className="h-6 w-6" style={{ color: `hsl(var(--${category.color}))` }} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  showCategory,
  onClick,
}: {
  article: KnowledgeArticle;
  showCategory?: boolean;
  onClick: () => void;
}) {
  const cat = showCategory ? getCategoryById(article.categoryId) : null;
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {cat && (
              <Badge variant="outline" className="text-xs mb-2">
                {cat.title}
              </Badge>
            )}
            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {article.shortDescription}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </div>
        {article.linkedToolLabel && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <LinkIcon className="h-3 w-3" />
              {article.linkedToolLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ArticleDetail({ article, isPrivateMode }: { article: KnowledgeArticle; isPrivateMode: boolean }) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
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

      {/* Visualisierung */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-2">Visualisierung</h3>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground italic">
            {article.visualization}
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
              <h3 className="font-semibold text-foreground text-sm mb-2">Typische Fehler & Missverständnisse</h3>
              <ul className="space-y-1.5">
                {article.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relevanz für den Kunden */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground text-sm mb-1">Was bedeutet das für dich?</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{article.customerRelevance}</p>
        </CardContent>
      </Card>

      {/* Technische Details – nur im öffentlichen Modus */}
      {!isPrivateMode && article.technicalDetails && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-1">Technische Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.technicalDetails}</p>
          </CardContent>
        </Card>
      )}

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

      {/* Quellen – nur im öffentlichen Modus */}
      {!isPrivateMode && article.sources && article.sources.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">Quellen</h3>
            <ul className="space-y-1.5">
              {article.sources.map((source, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>•</span>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Back-Link */}
      <div className="pt-2">
        <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Mehr Themen entdecken
        </Button>
      </div>
    </div>
  );
}

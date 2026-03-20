import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CATEGORY_KEYS, CATEGORY_LABELS, CategoryLink, CategoryLinks } from './types';
import { ExternalLink } from 'lucide-react';

interface LinksSectionProps {
  links: CategoryLinks;
  onChange: (links: CategoryLinks) => void;
  readOnly?: boolean;
}

export function LinksSection({ links, onChange, readOnly }: LinksSectionProps) {
  const updateLink = (category: string, index: number, field: 'titel' | 'url', value: string) => {
    const catLinks = [...(links[category] || [{titel:'',url:''},{titel:'',url:''},{titel:'',url:''}])];
    catLinks[index] = { ...catLinks[index], [field]: value };
    onChange({ ...links, [category]: catLinks });
  };

  if (readOnly) {
    const hasAnyLinks = CATEGORY_KEYS.some(key => links[key]?.some(l => l.url));
    if (!hasAnyLinks) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weiterführende Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_KEYS.map(key => {
              const catLinks = (links[key] || []).filter(l => l.url);
              if (!catLinks.length) return null;
              return (
                <div key={key}>
                  <h4 className="text-sm font-medium text-foreground mb-1">{CATEGORY_LABELS[key]}</h4>
                  {catLinks.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-0.5">
                      <ExternalLink className="h-3 w-3" />{l.titel || l.url}
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Links pro Kategorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {CATEGORY_KEYS.map(key => {
          const catLinks = links[key] || [{titel:'',url:''},{titel:'',url:''},{titel:'',url:''}];
          return (
            <div key={key}>
              <Label className="text-sm font-medium">{CATEGORY_LABELS[key]}</Label>
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Titel ${i+1}`}
                      value={catLinks[i]?.titel || ''}
                      onChange={e => updateLink(key, i, 'titel', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder={`URL ${i+1}`}
                      value={catLinks[i]?.url || ''}
                      onChange={e => updateLink(key, i, 'url', e.target.value)}
                      className="flex-[2]"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

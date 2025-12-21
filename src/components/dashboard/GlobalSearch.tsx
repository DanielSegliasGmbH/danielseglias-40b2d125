import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Users, Briefcase, ClipboardList, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'client' | 'case' | 'task';
  title: string;
  subtitle?: string;
  link: string;
}

export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      const searchTerm = `%${query}%`;
      const allResults: SearchResult[] = [];

      // Search clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5);

      if (clients) {
        clients.forEach((c) => {
          allResults.push({
            id: c.id,
            type: 'client',
            title: `${c.first_name} ${c.last_name}`,
            subtitle: c.email || undefined,
            link: `/app/clients/${c.id}`,
          });
        });
      }

      // Search cases
      const { data: cases } = await supabase
        .from('cases')
        .select('id, title, client:clients(first_name, last_name)')
        .ilike('title', searchTerm)
        .limit(5);

      if (cases) {
        cases.forEach((c) => {
          allResults.push({
            id: c.id,
            type: 'case',
            title: c.title,
            subtitle: c.client ? `${c.client.first_name} ${c.client.last_name}` : undefined,
            link: `/app/cases/${c.id}`,
          });
        });
      }

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, case_id, case:cases(title)')
        .ilike('title', searchTerm)
        .limit(5);

      if (tasks) {
        tasks.forEach((t) => {
          allResults.push({
            id: t.id,
            type: 'task',
            title: t.title,
            subtitle: t.case?.title || undefined,
            link: `/app/cases/${t.case_id}`,
          });
        });
      }

      return allResults;
    },
    enabled: query.length >= 2,
    staleTime: 1000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].link);
          setQuery('');
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    setQuery('');
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'case':
        return <Briefcase className="h-4 w-4 text-muted-foreground" />;
      case 'task':
        return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return t('client.singular');
      case 'case':
        return t('case.singular');
      case 'task':
        return t('task.singular');
    }
  };

  return (
    <div ref={containerRef} className="relative w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {t('search.loading')}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {t('search.noResults')}
            </div>
          ) : (
            <ul className="py-1 max-h-80 overflow-auto">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors',
                      index === selectedIndex && 'bg-muted'
                    )}
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {getTypeLabel(result.type)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

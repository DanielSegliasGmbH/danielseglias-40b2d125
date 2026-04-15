import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark' | 'system';

const applyThemeToDOM = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', systemDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  // Load theme from Supabase on mount
  useEffect(() => {
    const loadTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data?.theme_preference && ['light', 'dark', 'system'].includes(data.theme_preference)) {
        const saved = data.theme_preference as Theme;
        setTheme(saved);
        localStorage.setItem('theme', saved);
        applyThemeToDOM(saved);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeToDOM('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleChange = useCallback(async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Persist to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme } as any)
        .eq('id', user.id);
    }
  }, []);

  const iconMap = { light: Sun, dark: Moon, system: Monitor };
  const CurrentIcon = iconMap[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {theme === 'light' && t('theme.light', 'Hell')}
            {theme === 'dark' && t('theme.dark', 'Dunkel')}
            {theme === 'system' && t('theme.system', 'System')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleChange('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="h-4 w-4 mr-2" />
          {t('theme.light', 'Hell')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChange('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="h-4 w-4 mr-2" />
          {t('theme.dark', 'Dunkel')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChange('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="h-4 w-4 mr-2" />
          {t('theme.system', 'System')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

type Theme = 'light' | 'dark' | 'system';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (newTheme: Theme) => {
      if (newTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
      } else {
        root.classList.toggle('dark', newTheme === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const currentIcon = theme === 'dark' ? Moon : Sun;
  const CurrentIcon = currentIcon;

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
          <Sun className="h-4 w-4 mr-2" />
          {t('theme.system', 'System')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

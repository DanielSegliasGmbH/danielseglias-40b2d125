import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PublicLayout({ children, title }: PublicLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {title && (
        <title>{title} | {t('public.brand')}</title>
      )}

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="https://danielseglias.ch"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            ← danielseglias.ch
          </a>

          <Link to="/login">
            <Button variant="outline" size="sm">
              Anmelden
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

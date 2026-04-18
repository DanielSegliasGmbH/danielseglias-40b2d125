import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
}

/**
 * Standardisierter Kopfbereich für alle Client-Portal-Sub-Seiten.
 * Layout-Vorlage entspricht 1:1 der "Werkzeuge"-Seite:
 *  - Emoji + Titel als h1 (text-lg, bold)
 *  - Optionaler Untertitel (text-sm, muted)
 *  - Optionale rechte Action (z.B. Button)
 */
export function PageHeader({ title, subtitle, rightAction }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightAction && <div className="shrink-0 ml-2">{rightAction}</div>}
    </div>
  );
}

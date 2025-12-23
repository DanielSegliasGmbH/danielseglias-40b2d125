import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Phone, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PublicLayout({ children, title, description }: PublicLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('public.nav.home') },
    { href: '/blog', label: t('public.nav.blog') },
    { href: '/tools', label: t('public.nav.tools') },
    { href: '/contact', label: t('public.nav.contact') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SEO Meta Tags */}
      {title && (
        <title>{title} | {t('public.brand')}</title>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            {t('public.brand')}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors',
                  isActive(link.href) && 'text-foreground font-medium'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" size="sm">
                {t('auth.login')}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 text-muted-foreground hover:text-foreground transition-colors',
                    isActive(link.href) && 'text-foreground font-medium'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  {t('auth.login')}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">{t('public.brand')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('public.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('public.footer.links')}</h4>
              <ul className="space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/impressum" className="text-muted-foreground hover:text-foreground">
                    {t('public.footer.imprint')}
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground">
                    {t('public.footer.privacy')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('public.footer.contact')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +41 44 000 00 00
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@example.com
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t('public.brand')}. {t('public.footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}

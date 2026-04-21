import { useState, FormEvent } from 'react';
import { Lock, Sparkles, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  toolSlug: string;
  toolName: string;
  requiredPassword: string;
  hint?: string | null;
  onSuccess: () => void;
}

export function PublicToolPasswordGate({
  toolSlug,
  toolName,
  requiredPassword,
  hint,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);



  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === requiredPassword) {
      sessionStorage.setItem(`tool_pw_${toolSlug}`, 'granted');
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="py-10 px-6 sm:px-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">FinLife</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Zugang zu: {toolName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Dieses Tool ist passwortgeschützt.
            </p>
            {hint && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                {hint}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool-password" className="sr-only">
                Passwort
              </Label>
              <Input
                id="tool-password"
                type="password"
                placeholder="Passwort eingeben..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-destructive">
                  Passwort nicht korrekt. Bitte versuche es erneut.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!password}>
              Zugang erhalten →
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">Noch kein Zugang?</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="mailto:hallo@danielseglias.ch"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                Per E-Mail anfragen
              </a>
              <span className="text-muted-foreground/40 hidden sm:inline">·</span>
              <a
                href="https://wa.me/41774448608"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-medium"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

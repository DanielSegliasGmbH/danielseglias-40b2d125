import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Kundenportal</h1>
            <Badge variant="outline">Client</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Willkommen im Kundenportal
          </h2>
          <p className="text-muted-foreground">
            Sie sind angemeldet als: <strong>Client</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ihre Daten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hier können Sie in Zukunft Ihre Fälle und Termine einsehen.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

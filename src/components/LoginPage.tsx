import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading, error, user } = useAuth();
  const navigate = useNavigate();

  // Wenn der Benutzer bereits angemeldet ist, zur Hauptseite weiterleiten
  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
          <CardDescription>
            Bitte melden Sie sich an, um auf die Auftragsverwaltung zuzugreifen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Sie werden zur sicheren Anmeldeseite von Authelia weitergeleitet.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird vorbereitet...
              </>
            ) : (
              'Mit Authelia anmelden'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
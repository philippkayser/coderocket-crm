import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingTime, setProcessingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setError(errorDescription || 'Authentifizierung fehlgeschlagen');
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('Kein Autorisierungscode erhalten');
          setIsProcessing(false);
          return;
        }
        
        // Starte einen Timer für die Verarbeitung
        const startTime = Date.now();
        const processingTimer = setInterval(() => {
          setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        
        try {
          await handleCallback(code);
        } catch (err) {
          setError(err.message || 'Unbekannter Fehler bei der Anmeldung');
          setIsProcessing(false);
        } finally {
          clearInterval(processingTimer);
        }
      } catch (err) {
        setError(err.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, []);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  const handleManualContinue = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        {isProcessing ? (
          <div className="text-center py-8 space-y-6">
            <div>
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Anmeldung wird verarbeitet... ({processingTime}s)</p>
              {processingTime > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Die Verarbeitung dauert länger als erwartet. Bitte haben Sie Geduld.
                </p>
              )}
            </div>
            
            {processingTime > 20 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Falls die Anmeldung zu lange dauert, können Sie versuchen, manuell fortzufahren:
                </p>
                <Button onClick={handleManualContinue} variant="outline" className="w-full">
                  Zur Anwendung
                </Button>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler bei der Anmeldung</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={handleReturnToLogin} className="w-full">
              Zurück zur Anmeldung
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
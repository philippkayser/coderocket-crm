import { createContext, useContext } from 'react';

// Authelia Konfiguration
const AUTHELIA_URL = 'https://auth.lsz.company';
const CLIENT_ID = 'lsz-crm';
const CLIENT_SECRET = '01623351902!';
const REDIRECT_URI = 'https://dev-crm.lsz.company/oauth/callback';
const SCOPES = ['openid', 'profile', 'groups', 'email'];

// Benutzertyp
export interface User {
  sub: string;
  name?: string;
  email?: string;
  groups?: string[];
  isAuthenticated: boolean;
  accessToken?: string;
  idToken?: string;
}

// Auth-Kontext
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
  getAccessToken: () => string | null;
}

// Erstelle den Auth-Kontext
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: () => {},
  logout: () => {},
  handleCallback: async () => {},
  getAccessToken: () => null
});

// Hook für den Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);

// Generiert die Authelia OAuth-Autorisierungs-URL
export function getAutheliaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state: generateRandomState(),
  });

  return `${AUTHELIA_URL}/api/oidc/authorize?${params.toString()}`;
}

// Generiert einen zufälligen State-Parameter für CSRF-Schutz
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// API-Anfrage mit Authentifizierung
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Wenn kein Token übergeben wurde, versuche es aus dem localStorage zu holen
    const accessToken = localStorage.getItem('accessToken');
    
    // Fügt den Authorization-Header hinzu, wenn ein Token vorhanden ist
    const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader,
      },
    };

    const response = await fetch(url, fetchOptions);
    
    // Wenn 401 oder 403, dann ist der Benutzer nicht authentifiziert
    if (response.status === 401 || response.status === 403) {
      // Statt einen Fehler zu werfen, geben wir die Antwort zurück und lassen den Aufrufer entscheiden
      console.warn('Authentifizierungsproblem bei Anfrage an:', url);
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('Fehler bei authentifizierter Anfrage:', error);
    throw error;
  }
}

// Hilfsfunktion zum Löschen aller Auth-Daten
export function clearAuthData(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('userInfo');
}

// Hilfsfunktion für lokalen Logout (ohne Redirect zum OIDC-Provider)
export function localLogout(): void {
  clearAuthData();
  // Zur Login-Seite weiterleiten oder Seite neu laden
  window.location.href = '/';
}
import React, { useState, useEffect } from 'react';
import { AuthContext, User, getAutheliaAuthUrl, clearAuthData } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Authelia Konfiguration
const AUTHELIA_URL = 'https://auth.lsz.company';
const CLIENT_ID = 'lsz-crm';
const CLIENT_SECRET = '01623351902!';
const REDIRECT_URI = 'https://dev-crm.lsz.company/oauth/callback';
const FETCH_TIMEOUT = 15000; // 15 Sekunden Timeout

// Hilfsfunktion für Fetch mit Timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Zeitüberschreitung bei der Anfrage an ${url}`);
    }
    throw error;
  }
};

// Hilfsfunktion zum sicheren Parsen von JSON
const safeJsonParse = async (response) => {
  try {
    // Versuche zuerst, die Antwort direkt als JSON zu lesen
    return await response.json();
  } catch (e) {
    // Wenn das fehlschlägt, versuche den Text zu lesen und dann zu parsen
    try {
      const text = await response.text();
      console.log("Erhaltene Antwort:", text.substring(0, 100) + (text.length > 100 ? "..." : ""));
      
      // Wenn der Text leer ist, gib ein leeres Objekt zurück
      if (!text.trim()) {
        return {};
      }
      
      // Versuche, den Text als JSON zu parsen
      return JSON.parse(text);
    } catch (textError) {
      console.error("Fehler beim Parsen des Textes:", textError);
      throw new Error(`Konnte Antwort nicht parsen: ${textError.message}`);
    }
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedCodes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  // Prüft den Authentifizierungsstatus beim Laden
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Prüft, ob der Benutzer bereits authentifiziert ist (Token im localStorage)
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('idToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (accessToken && idToken && userInfo) {
        // Token validieren
        try {
          const userData = JSON.parse(userInfo);
          setUser({
            ...userData,
            accessToken,
            idToken,
            isAuthenticated: true
          });
        } catch (e) {
          clearAuthData();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Authentifizierungsstatus konnte nicht geprüft werden');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Leitet zur Authelia-Anmeldeseite weiter
  const login = () => {
    const authUrl = getAutheliaAuthUrl();
    window.location.href = authUrl;
  };

  // Gibt das aktuelle Access-Token zurück
  const getAccessToken = (): string | null => {
    return user?.accessToken || localStorage.getItem('accessToken');
  };

  // Verarbeitet den OAuth-Callback
  const handleCallback = async (code: string): Promise<void> => {
    // Prüfen, ob der Code bereits verarbeitet wurde
    if (processedCodes.has(code)) {
      // Code wurde bereits verarbeitet, zur Hauptseite weiterleiten
      navigate('/');
      return;
    }
    
    // Code als verarbeitet markieren
    processedCodes.add(code);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Token-Endpunkt aufrufen
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString();
      
      // Erstelle die Basic Auth
      const basicAuth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      
      // Versuche die Token-Anfrage mit Timeout
      const tokenResponse = await fetchWithTimeout(`${AUTHELIA_URL}/api/oidc/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: formData,
      }, 20000); // Längerer Timeout für diese Anfrage
      
      if (!tokenResponse.ok) {
        const errorData = await safeJsonParse(tokenResponse).catch(() => null);
        if (errorData && (errorData.error_description || errorData.error)) {
          throw new Error(`Anmeldung fehlgeschlagen: ${errorData.error_description || errorData.error}`);
        } else {
          const errorText = await tokenResponse.text().catch(() => "Unbekannter Fehler");
          throw new Error(`Anmeldung fehlgeschlagen: ${errorText}`);
        }
      }

      // Versuche, die Token-Antwort zu parsen
      const tokenData = await safeJsonParse(tokenResponse);
      
      const { access_token, id_token } = tokenData;
      
      if (!access_token || !id_token) {
        throw new Error('Ungültige Antwort vom Authentifizierungsserver: Fehlende Token');
      }

      // Benutzerinformationen abrufen
      const userInfoResponse = await fetchWithTimeout(`${AUTHELIA_URL}/api/oidc/userinfo`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (!userInfoResponse.ok) {
        const errorData = await safeJsonParse(userInfoResponse).catch(() => null);
        if (errorData && (errorData.error_description || errorData.error)) {
          throw new Error(`Benutzerinformationen konnten nicht abgerufen werden: ${errorData.error_description || errorData.error}`);
        } else {
          const errorText = await userInfoResponse.text().catch(() => "Unbekannter Fehler");
          throw new Error(`Benutzerinformationen konnten nicht abgerufen werden: ${errorText}`);
        }
      }

      // Versuche, die UserInfo-Antwort zu parsen
      let userInfo;
      try {
        // Zuerst versuchen wir, die Antwort als JSON zu lesen
        userInfo = await userInfoResponse.clone().json();
      } catch (e) {
        // Wenn das fehlschlägt, versuchen wir, den Text zu lesen und manuell zu parsen
        try {
          const text = await userInfoResponse.text();
          console.log("UserInfo-Antwort:", text.substring(0, 100) + (text.length > 100 ? "..." : ""));
          
          // Wenn der Text mit "eyJ" beginnt, könnte es ein JWT sein
          if (text.startsWith("eyJ")) {
            // Einfache JWT-Dekodierung (nur für Payload)
            try {
              const base64Payload = text.split('.')[1];
              const payload = atob(base64Payload);
              userInfo = JSON.parse(payload);
            } catch (jwtError) {
              console.error("Fehler beim Dekodieren des JWT:", jwtError);
              throw new Error("Konnte JWT nicht dekodieren");
            }
          } else {
            // Versuche normales JSON-Parsing
            userInfo = JSON.parse(text);
          }
        } catch (textError) {
          console.error("Fehler beim Parsen der Benutzerinformationen:", textError);
          throw new Error("Konnte Benutzerinformationen nicht parsen");
        }
      }
      
      if (!userInfo || typeof userInfo !== 'object') {
        throw new Error('Ungültige Benutzerinformationen erhalten');
      }
      
      // Minimale Benutzerinformationen erstellen, wenn keine vorhanden sind
      if (Object.keys(userInfo).length === 0) {
        userInfo = {
          sub: 'unknown',
          name: 'Unbekannter Benutzer'
        };
      }
      
      // Daten speichern
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('idToken', id_token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      setUser({
        ...userInfo,
        accessToken: access_token,
        idToken: id_token,
        isAuthenticated: true
      });
      
      // Zur Hauptseite weiterleiten
      navigate('/');
    } catch (err) {
      console.error('Fehler bei der Verarbeitung des Callbacks:', err);
      setError(err.message || 'Anmeldung fehlgeschlagen');
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verbesserte Logout-Funktion mit einfacher URL
  const logout = () => {
    try {
      setIsLoading(true);
      
      // Lokale Daten löschen
      clearAuthData();
      
      // Setze den Benutzer auf null
      setUser(null);
      
      // Zu Authelia-Logout weiterleiten mit einfacher URL
      window.location.href = 'https://auth.lsz.company/logout';
    } catch (err) {
      console.error('Fehler beim Logout:', err);
      
      // Wenn der Logout fehlschlägt, führe zumindest einen lokalen Logout durch
      clearAuthData();
      setUser(null);
      
      // Zur Hauptseite weiterleiten
      window.location.href = '/';
      
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      login, 
      logout, 
      handleCallback,
      getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
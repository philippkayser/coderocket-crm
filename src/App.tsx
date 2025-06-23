import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDashboard } from '@/components/OrderDashboard';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/Toaster';
import { LoginPage } from '@/components/LoginPage';
import { OAuthCallback } from '@/components/OAuthCallback';
import { useAuth } from '@/lib/auth';
import { AuthProvider } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';

// Wrapper-Komponente für die authentifizierte Anwendung
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("orders");

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onLogout={logout}
      />
      <main className="container mx-auto py-6 px-4">
        {activeTab === "orders" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Auftragsübersicht</h1>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Alle Aufträge</TabsTrigger>
                <TabsTrigger value="open">Offen</TabsTrigger>
                <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <OrderDashboard filter="all" />
              </TabsContent>
              <TabsContent value="open">
                <OrderDashboard filter="open" />
              </TabsContent>
              <TabsContent value="completed">
                <OrderDashboard filter="completed" />
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeTab === "customers" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Kundenübersicht</h1>
            <CustomerDashboard />
          </>
        )}
      </main>
    </div>
  );
}

// Geschützte Route Komponente
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Hauptanwendung mit Routing
function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
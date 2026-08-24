import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AppLayout from './components/AppLayout';
import Discover from './pages/app/Discover';
import Mivos from './pages/app/Mivos';
import Mivibes from './pages/app/Mivibes';
import Mitribes from './pages/app/Mitribes';
import Local from './pages/app/Local';
import Profile from './pages/app/Profile';
import Onboarding from './pages/app/Onboarding';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // 1. On cherche la session tout de suite
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) fetchProfile(currentSession.user.id);
    });

    // 2. On écoute les changements (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Erreur profil:", err);
      setProfile(null);
    }
  };

  // Pas de session -> Page d'accueil (Login)
  if (!session) {
    return (
      <BrowserRouter>
        <div><Toaster position="bottom-center" />
          <Routes>
            <Route path="/" element={<Home session={null} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  // Session OK, mais pas de profil complet -> Onboarding
  const hasProfile = !!profile?.username;
  if (!hasProfile) {
    return (
      <BrowserRouter>
        <div><Toaster position="bottom-center" />
          <Routes>
            {/* On passe user et setProfile en props */}
            <Route path="/onboarding" element={<Onboarding user={session.user} setProfile={setProfile} />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  // Session OK + Profil OK -> Application
  return (
    <BrowserRouter>
      <div><Toaster position="bottom-center" />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/mivos" element={<Mivos />} />
            <Route path="/mivibes" element={<Mivibes />} />
            <Route path="/mitribes" element={<Mitribes />} />
            <Route path="/local" element={<Local />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
} 
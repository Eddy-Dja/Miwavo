import { useState, useRef, useEffect} from 'react'; // 🌟 AJOUT : useContext
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiZap, FiCompass, FiMessageCircle, FiUsers, FiMapPin, FiSearch, FiUser, FiSettings, FiLogOut, FiShield, FiSun, FiMoon } from 'react-icons/fi'; // 🌟 AJOUT : FiSun, FiMoon
import { HiUserGroup } from 'react-icons/hi2';
import { supabase } from '../lib/supabaseClient';
// NOUVEAU (On importe le hook directement)
import { useTheme } from '../context/ThemeContext'; 
import './AppLayout.css';

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null); 
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  // 🌟 AJOUT : Récupération de l'état du Dark Mode
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const getFallbackAvatar = (gender: string | null) => {
    const folder = gender === 'female' ? 'female' : 'male';
    return `https://qlpdndfwpwoisdwajdpy.supabase.co/storage/v1/object/public/avatars/defaults/${folder}/1.jpg`;
  };

  const userAvatar = profile?.avatar || getFallbackAvatar(profile?.gender);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await supabase.auth.signOut(); 
    } catch (error) {
      console.error("Erreur signOut:", error);
    } finally {
      window.location.href = '/'; 
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="app-wrapper">
      <header className="top-app-nav">
        <div className="nav-brand">
          <img src="/logo.png" alt="Miwavo" className="nav-logo-img" />
        </div>
        
        <nav className="nav-links">
          <NavLink to="/discover" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiCompass /> <span>Discover & Miwas</span>
          </NavLink>
          <NavLink to="/mivos" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiMessageCircle /> <span>Mivos</span>
          </NavLink>
          <NavLink to="/mivibes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiZap /> <span>Mivibes</span>
          </NavLink>
          <NavLink to="/mitribes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <HiUserGroup /> <span>Mitribes</span>
          </NavLink>
          <NavLink to="/local" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiMapPin /> <span>Local</span>
          </NavLink>
        </nav>

        <div className="nav-right-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Rechercher..." className="search-input" />
          </div>
          
          {/* 🌟 NOUVEAU : BOUTON DARK MODE VISIBLE EN PERMANENCE */}
          <button 
            onClick={toggleDarkMode} 
            className="theme-toggle-btn"
            title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <div className="nav-profile-container" ref={profileRef}>
            <button className="nav-profile-btn" onClick={toggleMenu}>
              <img 
                src={userAvatar} 
                alt="Profil" 
                className="nav-profile-img" 
                onError={(e) => { 
                  (e.target as HTMLImageElement).onerror = null; 
                  (e.target as HTMLImageElement).src = getFallbackAvatar(profile?.gender); 
                }}
              />
            </button>
            
            {isMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                  <FiUser /> Profil
                </div>
                <div className="dropdown-item" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                  <FiShield /> Confidentialité
                </div>
                <div className="dropdown-item" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                  <FiSettings /> Paramètres
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut /> Se déconnecter
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
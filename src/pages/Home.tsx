import { FiCompass, FiMessageCircle, FiZap, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import useHome from '../hooks/useHome';
import { useTheme } from '../context/ThemeContext';

function Home({ session }: { session: any }) {
  const navigate = useNavigate();
  
  const { isDarkMode, toggleDarkMode } = useTheme();

  // 🧠 HOOK : Logique d'authentification (Avec les nouveaux champs)
  const { 
    isLogin, setIsLogin, email, setEmail, password, setPassword, 
    confirmPassword, setConfirmPassword, birthDate, setBirthDate,
    loading, errorMessage, handleSubmit, handleSignOut 
  } = useHome();

  
              // Déjà membre ?
              // Se connecter

  return (
    <div className="home-wrapper">
      <header className="top-header">
        <img src="/logo.png" alt="Miwavo" className="header-logo" />
        
        <div className="header-right">
          <button 
            onClick={toggleDarkMode} 
            className="theme-toggle-btn"
            title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {session ? (
            <span className="header-link" onClick={handleSignOut}>Se déconnecter</span>
          ) : (
            <>
              <span className="desktop-only-text"></span>
              <span className="header-link" onClick={() => setIsLogin(true)}></span>

            </>
          )}
        </div>
      </header>

      <main className="main-content">

        <div className="home-left">
          <h1 className="brand-slogan">Find your tribe, <br /><span className="highlight-text">one connection</span> <br />at a time.</h1>
          <p className="brand-description"><span className="highlight-brand-name">Miwavo</span> te connecte à des personnes qui partagent tes passions, ta ville et tes valeurs. Pas de bruit — juste de vraies connexions.</p>
          <ul className="feature-list">
            <li><div className="feature-icon-box icon-discover"><FiCompass /></div><span className="feature-text"><strong>Discover & Miwas</strong> — Découvre des profils compatibles et envoi des invitations chaleureuses.</span></li>
            <li><div className="feature-icon-box icon-mivos"><FiMessageCircle /></div><span className="feature-text"><strong>Mivos</strong> — Discussions privées et partage authentique avec tes connexions.</span></li>
            <li><div className="feature-icon-box icon-mivibes"><FiZap /></div><span className="feature-text"><strong>Mivibes</strong> — Partage tes pensées, tes vibes et inspirations avec ta tribu.</span></li>
            <li><div className="feature-icon-box icon-mitribes"><HiUserGroup /></div><span className="feature-text"><strong>Mitribes</strong> — Rejoins des tribus autour de tes passions : sport, musique, voyage...</span></li>
            <li><div className="feature-icon-box icon-local"><FiMapPin /></div><span className="feature-text"><strong>Local</strong> — Événements et personnes près de chez toi, selon tes intérêts.</span></li>
            <li><div className="feature-icon-box icon-premium"><FiStar /></div><span className="feature-text"><strong>IA & Premium</strong> — Suggestions intelligentes, score de compatibilité et profils ultra-ciblés.</span></li>
          </ul>
        </div>

        <div className="home-right">
          <div className="auth-form-container">
            
            {/* SI CONNECTÉ MAIS SANS PROFIL : Boutons spécialisés */}
            {session ? (
              <>
                <div className="auth-subtitle">
                  <span className="subtitle-main">Bienvenue ! 🚀</span>
                  <span className="subtitle-secondary">Ton compte est créé, mais il manque une étape pour rejoindre la tribu.</span>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/onboarding')} 
                  style={{ marginBottom: '15px' }}
                >
                  Compléter mon profil <FiArrowRight />
                </button>

                <button 
                  className="btn-social" 
                  onClick={handleSignOut} 
                  style={{ width: '100%', color: '#DC2626', borderColor: '#FECACA', marginTop: '10px' }}
                >
                  Changer de compte
                </button>
              </>
            ) : (
              /* SI PAS CONNECTÉ : Formulaires classiques */
              <>
                <div className="auth-tabs">
                  <button type="button" className={`tab-button ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Connexion</button>
                  <button type="button" className={`tab-button ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Créer un compte</button>
                </div>

                <div className="auth-subtitle">
                  {isLogin ? (
                    <><span className="subtitle-main">Bon retour! 👋</span><span className="subtitle-secondary">Connecte-toi pour retrouver ta tribu</span></>
                  ) : (
                    <><span className="subtitle-main">Rejoins Miwavo 🚀</span><span className="subtitle-secondary">Trouve ta tribu dès aujourd'hui</span></>
                  )}
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form onSubmit={handleSubmit}>

                                       
                                       {/* --- CHAMPS COMMUNS --- */}

                  <div className="input-group">
                    <input 
                      type="email" 
                      placeholder="Numéro de Téléphone ou Email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                  
                  <div className="input-group">
                    <input 
                      type="password" 
                      placeholder="Mot de passe" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                  
                  {/* --- CHAMPS INSCRIPTION (Uniquement si on crée un compte) --- */}
                  {!isLogin && (
                    <> 
             {/* --- CONFIRMATION MOT DE PASSE (Uniquement si on crée un compte) --- */}
               
                    <div className="input-group">
                      <input 
                        type="password" 
                        placeholder="Confirmer le mot de passe" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                    </div>
              

                      <div className="input-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Date de naissance</label>
                        <input 
                          type="date" 
                          required 
                          value={birthDate} 
                          onChange={(e) => setBirthDate(e.target.value)} 
                          style={{ 
                            width: '100%', 
                            padding: '12px 16px', 
                            borderRadius: '12px', 
                            border: '2px solid var(--border-color)', 
                            backgroundColor: 'var(--input-bg)', 
                            color: 'var(--text-primary)', 
                            fontFamily: 'Poppins, sans-serif', 
                            boxSizing: 'border-box',
                            colorScheme: isDarkMode ? 'dark' : 'light' // Permet au sélecteur de date de s'adapter au dark mode
                          }}
                        />
                      </div>
                    </>
                  )}


                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Chargement...' : (isLogin ? "Se connecter" : "Créer mon compte")} <FiArrowRight />
                  </button>
                </form>

                <div className="divider"><span>ou</span></div>

                <div className="social-login">
                  <button type="button" className="btn-social"><img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" /> Google</button>
                  <button type="button" className="btn-social"><img src="https://img.icons8.com/ios-filled/20/000000/twitterx--v1.png" alt="X" /> X</button>
                </div>

                <p className="toggle-auth">
                  {isLogin ? (
                    <>Pas encore membre ? <span onClick={() => setIsLogin(false)}>Inscris-toi</span></>
                  ) : (
                    <>Déjà un compte ? <span onClick={() => setIsLogin(true)}>Se connecter</span></>
                  )}
                </p>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
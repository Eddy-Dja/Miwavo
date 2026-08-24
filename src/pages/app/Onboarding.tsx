import { FiArrowRight, FiArrowLeft, FiCamera, FiCheck, FiLogOut } from 'react-icons/fi';
import './Onboarding.css';
import useOnboarding from '../../hooks/useOnboarding';

const passionsList = [
  "Sport", "Musique", "Lecture", "Cinéma", "Randonnée", 
  "Voyage", "Technologie", "Cuisine", "Art", "Mode", 
  "Jeux Vidéo", "Religion", "Photographie", "Danse", "Animaux", 
  "Bien-être", "Écriture", "Design", "Finance", "Sciences"
];

const tagColors = [
  'tag-purple', 'tag-orange', 'tag-blue', 'tag-green', 
  'tag-pink', 'tag-yellow', 'tag-red', 'tag-cyan', 
  'tag-indigo', 'tag-teal', 'tag-fuchsia', 'tag-lime', 
  'tag-amber', 'tag-emerald', 'tag-sky', 'tag-rose', 
  'tag-slate', 'tag-zinc', 'tag-brown', 'tag-gold'
];

const searchTypes = [
  { id: 1, label: "Amitié", emoji: "🤝" },
  { id: 2, label: "Rencontre", emoji: "❤️" },
  { id: 3, label: "Réseau Pro", emoji: "💼" },
  { id: 4, label: "Passion commune", emoji: "🔥" }
];

// 🌟 On récupère les props envoyées par App.tsx

function Onboarding({ user, setProfile }: { user: any, setProfile: React.Dispatch<React.SetStateAction<any | null>> }) {
  
  // 🌟 On passe les props au hook au lieu d'utiliser useAuth()
  const { 
    step, setStep, firstName, setFirstName, lastName, setLastName, 
    username, handleUsernameChange, gender, setGender, 
    selectedPassions, togglePassion, selectedSearchTypes, toggleSearchType,
    isSaving, avatarPreview, handleFileChange, usernameStatus, isStep1Valid, handleFinish,
    handleLogout
  } = useOnboarding({ user, setProfile });

  return (
    <div className="onboarding-wrapper">
      
      <button 
        onClick={handleLogout} 
        style={{ 
          position: 'absolute', top: '20px', right: '20px', 
          background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', 
          fontFamily: 'Poppins', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px',
          zIndex: 10
        }}
      >
        <FiLogOut /> Se déconnecter
      </button>

      <div className="onboarding-container">
        
        <div className="progress-header">
          <div className="step-text">Étape {step} sur 4</div>
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`} />
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`} />
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`} />
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <h1>Qui es-tu ?</h1>
            <p>Dis-nous ton nom, ton pseudo et ton sexe pour personnaliser ton expérience.</p>
            <div className="gender-selection">
              <button className={`gender-card ${gender === 'male' ? 'selected' : ''}`} onClick={() => setGender('male')}>
                <span className="gender-emoji">👨</span><span className="gender-label">Homme</span>
              </button>
              <button className={`gender-card ${gender === 'female' ? 'selected' : ''}`} onClick={() => setGender('female')}>
                <span className="gender-emoji">👩</span><span className="gender-label">Femme</span>
              </button>
            </div>
            <div className="name-inputs-row">
              <div className="input-group"><label>Prénom</label><input type="text" placeholder="Kwame" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div className="input-group"><label>Nom</label><input type="text" placeholder="Asante" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            <div className="username-input-wrapper">
              <span className="username-at">@</span>
              <input type="text" placeholder="ton_pseudo" className="username-input" value={username} onChange={handleUsernameChange} maxLength={20} />
            </div>
            
            <div className="username-status-feedback">
              {usernameStatus === 'checking' && <p className="checking-text">Vérification de la disponibilité...</p>}
              {usernameStatus === 'taken' && <p className="error-text">Ce pseudo est déjà pris ❌</p>}
              {usernameStatus === 'available' && <p className="success-text">Pseudo disponible ✅</p>}
            </div>

            {!isStep1Valid && usernameStatus !== 'taken' && (firstName.length > 0 || lastName.length > 0 || username.length > 0 || gender !== null) && (
              <p className="error-text">Remplis tous les champs et choisis un pseudo valide (min. 3 caractères, sans espaces)</p>
            )}
            <button className="wizard-btn pill-btn" onClick={() => setStep(2)} disabled={!isStep1Valid}>
              {usernameStatus === 'checking' ? 'Vérification...' : 'Suivant'} <FiArrowRight />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h1>Ajoute une photo</h1>
            <p>C'est la première chose que les autres verront.</p>
            
            <label className="upload-area" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', position: 'absolute', top: 0, left: 0 }} />
              ) : (
                <>
                  <FiCamera />
                  <span>Clique pour ajouter</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            <div className="wizard-nav">
              <button className="wizard-btn secondary" onClick={() => setStep(1)}><FiArrowLeft /> Retour</button>
              <button className="wizard-btn" onClick={() => setStep(3)}>Suivant <FiArrowRight /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h1>Tes passions</h1>
            <p>Choisis entre 3 et 10 centres d'intérêt. ({selectedPassions.length}/10)</p>
            
            <div className="tags-grid">
              {passionsList.map((passion, index) => {
                const isSelected = selectedPassions.includes(passion);
                const colorClass = tagColors[index % tagColors.length];
                const isMaxedOut = selectedPassions.length >= 10 && !isSelected;

                return (
                  <button key={passion} className={`tag-select-btn ${colorClass} ${isSelected ? 'selected' : ''} ${isMaxedOut ? 'maxed-out' : ''}`} onClick={() => togglePassion(passion)}>
                    {isSelected && <FiCheck />} {passion}
                  </button>
                );
              })}
            </div>

            <div className="wizard-nav">
              <button className="wizard-btn secondary" onClick={() => setStep(2)}><FiArrowLeft /> Retour</button>
              <button className="wizard-btn" onClick={() => setStep(4)} disabled={selectedPassions.length < 3}>Suivant <FiArrowRight /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h1>Que cherches-tu ?</h1>
            <p>Sélectionne le type d'interactions qui t'intéresse.</p>
            <div className="search-grid">
              {searchTypes.map(type => (<button key={type.id} className={`search-card ${selectedSearchTypes.includes(type.id) ? 'selected' : ''}`} onClick={() => toggleSearchType(type.id)}><span className="search-emoji">{type.emoji}</span><span className="search-label">{type.label}</span></button>))}
            </div>
            <div className="wizard-nav">
              <button className="wizard-btn secondary" onClick={() => setStep(3)}><FiArrowLeft /> Retour</button>
              <button className="wizard-btn finish-btn" onClick={handleFinish} disabled={selectedSearchTypes.length === 0 || isSaving}>{isSaving ? 'Sauvegarde...' : 'Terminer'} <FiCheck /></button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Onboarding;
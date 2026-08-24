import { FiEdit3, FiArrowLeft, FiCheck, FiLogOut, FiCamera, FiMapPin, FiGlobe, FiPlus } from 'react-icons/fi';
import './Profile.css';
import useProfile from '../../hooks/useProfile';

const passionsList = [
  "Sport", "Musique", "Lecture", "Cinéma", "Randonnée", 
  "Voyage", "Technologie", "Cuisine", "Art", "Mode", 
  "Jeux Vidéo", "Religion", "Photographie", "Danse", "Animaux", 
  "Bien-être", "Écriture", "Design", "Finance", "Sciences"
];

const languagesList = [
  "Français", "Anglais", "Espagnol", "Arabe", "Mandarin", "Portugais", 
  "Allemand", "Italien", "Russe", "Japonais", "Wolof", "Lingala", "Swahili",
  "Hindi", "Bengali", "Coréen", "Turc", "Vietnamien", "Persan", "Polonais",
  "Aja", "Fon", "Mina", "Yoruba", "Zoulou"
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

function Profile() {
  const { 
    profile, isEditing, setIsEditing, loading, isSaving, 
    editFirstName, setEditFirstName, editLastName, setEditLastName,
    editBio, setEditBio, editPassions, toggleEditPassion, 
    editSearchTypes, toggleEditSearchType, editGender, setEditGender,
    editBirthDate, setEditBirthDate, editCity, setEditCity, 
    editCountry, setEditCountry, editNationality, setEditNationality,
    editLanguages, toggleEditLanguage, editSearchRadius, setEditSearchRadius, 
    handleAvatarUpload, handleSave, handleLogout, calculateAge
  } = useProfile();

  if (loading) return <div className="profile-container"><p style={{ textAlign: 'center', marginTop: '50%', color: '#64748B' }}>Chargement...</p></div>;
  if (!profile) return null;

  const displayAge = profile.birth_date ? calculateAge(profile.birth_date) : null;
  const hasExtendedInfo = profile.city || profile.country || profile.nationality || (profile.languages && profile.languages.length > 0);

  return (
    <div className="profile-container">
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-header-row">
            <h1 className="profile-title">Mon Profil</h1>
            <button className="edit-btn" onClick={() => setIsEditing(true)}><FiEdit3 /> Modifier</button>
          </div>

          <div className="profile-card">
<div className="profile-avatar-section">
  <div className="avatar-upload-wrapper">
    {/* 🌟 AJOUT DE L'IMAGE DE PROFIL ICI */}
    <img 
      src={profile.avatar || `https://qlpdndfwpwoisdwajdpy.supabase.co/storage/v1/object/public/avatars/defaults/${profile.gender === 'female' ? 'female' : 'male'}/1.jpg`} 
      alt="Mon avatar" 
      className="profile-avatar-img" 
      onError={(e) => { 
        // Si l'image principale bug, on charge celle par défaut
        (e.target as HTMLImageElement).onerror = null; 
        (e.target as HTMLImageElement).src = `https://qlpdndfwpwoisdwajdpy.supabase.co/storage/v1/object/public/avatars/defaults/${profile.gender === 'female' ? 'female' : 'male'}/1.jpg`; 
      }}
    />
    <label className="avatar-camera-btn">
      <FiCamera />
      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
    </label>
  </div>
  <div className="profile-names">
    <h2>{profile.first_name} {profile.last_name} {displayAge ? <span className="profile-age">, {displayAge} ans</span> : null}</h2>
    <span className="profile-username">@{profile.username}</span>
  </div>
</div>

            {profile.bio && <p className="profile-bio">{profile.bio}</p>}

            {profile.passions && profile.passions.length > 0 && (
              <div className="profile-section"><div className="profile-section-label">Passions :</div><div className="profile-tags">{profile.passions.map((p, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{p}</span>)}</div></div>
            )}

            {profile.search_types && profile.search_types.length > 0 && (
              <div className="profile-section"><div className="profile-section-label">Cherche :</div><div className="profile-tags">{profile.search_types.map((s, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{s}</span>)}</div></div>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <div className="profile-section">
                <div className="profile-section-label">Langues :</div>
                <div className="profile-tags">
                  {profile.languages.map((lang, index) => (
                    <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.city && profile.country && (
              <div className="profile-section">
                <div className="profile-section-label">Localisation :</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin /> {profile.city}, {profile.country}
                </div>
              </div>
            )}

            {profile.nationality && (
              <div className="profile-section">
                <div className="profile-section-label">Nationalité :</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiGlobe /> {profile.nationality}
                </div>
              </div>
            )}

            {profile.search_radius && (
              <div className="profile-section">
                <div className="profile-section-label">Rayon de recherche :</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>
                  {profile.search_radius} km
                </div>
              </div>
            )}

            {!profile.city && !profile.country && !profile.nationality && (!profile.languages || profile.languages.length === 0) && (
              <div className="profile-extended-infos" style={{ marginTop: '20px' }}>
                <button className="complete-profile-btn" onClick={() => setIsEditing(true)}>
                  <FiPlus /> Complète ton profil (Ville, Langues, etc.)
                </button>
              </div>
            )}

          </div>
          <button className="logout-btn" onClick={handleLogout}><FiLogOut /> Se déconnecter</button>
        </div>
      ) : (

        <div className="profile-edit">
          <div className="profile-header-row">
            <button className="back-btn" onClick={() => setIsEditing(false)}><FiArrowLeft /> Annuler</button>
            <h1 className="profile-title">Modifier</h1>
            <button className="save-btn" onClick={handleSave} disabled={isSaving}><FiCheck /> {isSaving ? '...' : 'Sauver'}</button>
          </div>

          <div className="edit-form">
            <div className="edit-section-title">Identité</div>
            <div className="gender-selection">
              <button className={`gender-card ${editGender === 'male' ? 'selected' : ''}`} onClick={() => setEditGender('male')}><span className="gender-emoji">👨</span><span className="gender-label">Homme</span></button>
              <button className={`gender-card ${editGender === 'female' ? 'selected' : ''}`} onClick={() => setEditGender('female')}><span className="gender-emoji">👩</span><span className="gender-label">Femme</span></button>
            </div>
            <div className="name-inputs-row">
              <div className="input-group"><label>Prénom</label><input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} /></div>
              <div className="input-group"><label>Nom</label><input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} /></div>
            </div>
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>Pseudo (non modifiable)</label><input type="text" value={profile.username} disabled className="disabled-input" />
            </div>
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>Date de naissance</label><input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className="date-input" />
            </div>

            <div className="edit-section-title" style={{ marginTop: '30px' }}>Localisation & Origines</div>
            <div className="name-inputs-row">
              <div className="input-group"><label>Ville</label><input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Ex: Paris" /></div>
              <div className="input-group"><label>Pays</label><input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="Ex: France" /></div>
            </div>
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>Nationalité</label><input type="text" value={editNationality} onChange={(e) => setEditNationality(e.target.value)} placeholder="Ex: Française" />
            </div>

            <div className="profile-section" style={{ marginTop: '30px' }}>
              <div className="profile-section-label">Langues parlées ({editLanguages.length}/5)</div>
              <div className="tags-grid">
                {languagesList.map((lang, index) => {
                  const isSelected = editLanguages.includes(lang);
                  const colorClass = tagColors[index % tagColors.length];
                  const isMaxedOut = editLanguages.length >= 5 && !isSelected;
                  return (
                    <button 
                      key={lang} 
                      className={`tag-select-btn ${colorClass} ${isSelected ? 'selected' : ''} ${isMaxedOut ? 'maxed-out' : ''}`}
                      onClick={() => toggleEditLanguage(lang)}
                    >
                      {isSelected && <FiCheck />} {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="edit-section-title" style={{ marginTop: '30px' }}>Préférences</div>
            <div className="input-group">
              <label>Rayon de recherche : <strong>{editSearchRadius} km</strong></label>
              <input type="range" min="5" max="500" value={editSearchRadius} onChange={(e) => setEditSearchRadius(parseInt(e.target.value))} className="range-slider" />
            </div>

            <div className="profile-section" style={{ marginTop: '30px' }}>
              <div className="profile-section-label">Ce que tu cherches</div>
              <div className="search-grid">
                {searchTypes.map(type => (
                  <button key={type.id} className={`search-card ${editSearchTypes.includes(type.id) ? 'selected' : ''}`} onClick={() => toggleEditSearchType(type.id)}>
                    <span className="search-emoji">{type.emoji}</span><span className="search-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-section" style={{ marginTop: '30px' }}>
              <div className="profile-section-label">Bio</div>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Parle-nous un peu de toi..." className="bio-textarea" maxLength={200} />
            </div>

            <div className="profile-section" style={{ marginTop: '30px' }}>
              <div className="profile-section-label">Tes passions ({editPassions.length}/10)</div>
              <div className="tags-grid">
                {passionsList.map((passion, index) => {
                  const isSelected = editPassions.includes(passion);
                  const colorClass = tagColors[index % tagColors.length];
                  const isMaxedOut = editPassions.length >= 10 && !isSelected;
                  return (
                    <button key={passion} className={`tag-select-btn ${colorClass} ${isSelected ? 'selected' : ''} ${isMaxedOut ? 'maxed-out' : ''}`} onClick={() => toggleEditPassion(passion)}>
                      {isSelected && <FiCheck />} {passion}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
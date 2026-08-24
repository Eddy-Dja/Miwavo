import { FiMapPin, FiX, FiSend, FiHeart, FiArrowLeft, FiMail, FiClock, FiCheck, FiEye, FiCompass, FiPercent, FiStar, FiGlobe, FiUserCheck } from 'react-icons/fi';
import { HiSparkles, HiUserGroup } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Discover.css';
import useDiscover, { tagColors } from '../../hooks/useDiscover'; // Adapte le chemin

function Discover() {
  const navigate = useNavigate();
  
  // 🧠 HOOK : Toute la logique
  const { 
    loading, activeTab, setActiveTab, showProfile, setShowProfile,
    miwaStatus, inviteTab, setInviteTab, myProfile, profiles,
    currentProfile, showMutuals, setShowMutuals, direction, swipeAction,
    receivedInvites, sentInvites, handleAcceptMiwa, handleCancelMiwa,
    handleDeclineReceivedMiwa, handleSendMiwa, handleSkip, handleSwipeRight
  } = useDiscover();

  if (loading) return (
    <div className="discover-container">
      {/* Header Squelette */}
      <div className="mivibes-header" style={{ marginBottom: '20px' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '45px', height: '45px', borderRadius: '12px' }}></div>
        <div>
          <div className="skeleton skeleton-line" style={{ width: '150px', height: '24px', marginBottom: '6px' }}></div>
          <div className="skeleton skeleton-line" style={{ width: '220px', height: '14px' }}></div>
        </div>
      </div>

      {/* Tabs Squelette */}
      <div className="discover-tabs" style={{ marginBottom: '20px' }}>
        <div className="skeleton skeleton-btn" style={{ width: '110px', height: '35px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '130px', height: '35px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '110px', height: '35px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '100px', height: '35px' }}></div>
      </div>

      {/* Carte de Swipe Squelette */}
      <div className="skeleton-card" style={{ height: '450px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '90px', height: '90px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-line" style={{ width: '150px', height: '20px' }}></div>
        <div className="skeleton skeleton-line" style={{ width: '100px', height: '14px' }}></div>
        <div style={{ height: '20px' }}></div>
        <div className="skeleton skeleton-line" style={{ width: '80%', height: '12px' }}></div>
        <div className="skeleton skeleton-line" style={{ width: '60%', height: '12px' }}></div>
      </div>

      {/* Boutons d'action Squelette */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
        <div className="skeleton skeleton-btn" style={{ width: '100px', height: '45px', borderRadius: '25px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '160px', height: '45px', borderRadius: '25px' }}></div>
      </div>
    </div>
  );
  
  // VUE PROFIL COMPLET
  if (showProfile && currentProfile) {
    return (
      <div className="discover-container">
        <div className="full-profile-view">
          <button className="back-btn" onClick={() => setShowProfile(false)}><FiArrowLeft /> Retour</button>
          <div className="fp-header">
            <img src={currentProfile.avatar} alt={currentProfile.first_name} className="fp-avatar" />
            <h2>{currentProfile.first_name} {currentProfile.last_name} {currentProfile.age ? <span className="fp-age">, {currentProfile.age} ans</span> : null}</h2>
            <span className="fp-username">@{currentProfile.username}</span>

            <div className="social-proof fp-social-proof">
              {currentProfile.mutualConnections > 0 && (
                <div className="mutual-wrapper">
                  <span className="proof-item"><FiUserCheck /> Connexions en commun : 
                    <button className="mutual-link" onClick={() => setShowMutuals(!showMutuals)}>{currentProfile.mutualConnections}</button>
                  </span>
                  {showMutuals && (
                    <div className="mutual-dropdown fp-mutual-dropdown">
                      {currentProfile.mutualList?.map((friend, index) => (
                        <div key={index} className="mutual-user">
                          <img src={friend.avatar} alt={friend.name} className="mutual-user-avatar" />
                          <span>{friend.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {currentProfile.sharedMitribes && currentProfile.sharedMitribes.length > 0 && (
                <span className="proof-item"><HiUserGroup /> Membre de : {currentProfile.sharedMitribes.join(', ')}</span>
              )}
            </div>

            {currentProfile.bio && <p className="fp-bio">{currentProfile.bio}</p>}

            {currentProfile.city && currentProfile.country && (
              <div className="profile-info-block" style={{ textAlign: 'center' }}>
                <div className="info-row-centered">
                  <FiMapPin style={{ color: '#7C3AED' }} /> {currentProfile.city}, {currentProfile.country}
                </div>
              </div>
            )}

            {currentProfile.nationality && (
              <div className="profile-info-block" style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FiGlobe style={{ color: '#7C3AED' }} /> {currentProfile.nationality}
                </div>
              </div>
            )}

            {currentProfile.search_types && currentProfile.search_types.length > 0 && (
              <div className="profile-info-block"><div className="profile-section-label">Cherche :</div><div className="profile-tags">
                {currentProfile.search_types.map((s, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{s}</span>)}
              </div></div>
            )}

            {currentProfile.passions && currentProfile.passions.length > 0 && (
              <div className="profile-info-block"><div className="profile-section-label">Passions :</div><div className="profile-tags">
                {currentProfile.passions.map((p, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{p}</span>)}
              </div></div>
            )}

            {currentProfile.languages && currentProfile.languages.length > 0 && (
              <div className="profile-info-block">
                <div className="profile-section-label">Langues parlées : </div>
                <div className="profile-tags fp-tags">
                  {currentProfile.languages.map((lang, index) => (
                    <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{lang}</span>
                  ))}
                </div>
              </div>
            )}
    
            <div className="fp-action-area">
              <div className="fp-main-actions">
                {miwaStatus === 'idle' && <button className="action-btn miwa-btn full-width-btn" onClick={handleSendMiwa}><FiSend /> Envoyer une Miwa</button>}
                {miwaStatus === 'sending' && <button className="action-btn miwa-btn full-width-btn" disabled>Envoi...</button>}
                {miwaStatus === 'sent' && <button className="action-btn miwa-sent-btn full-width-btn" disabled>Miwa envoyée ✅</button>}
              </div>
              <div className="pro-actions-group">
                <button className="action-btn pro-action-btn"><FiPercent /> Compatibilité <span className="pro-badge">PRO</span></button>
                <button className="action-btn pro-action-btn"><FiStar /> Favoris <span className="pro-badge">PRO</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VUE PRINCIPALE (TABS & SWIPE)
  return (
    <div className="discover-container">
      <div className="mivibes-header">
        <div className="mivibes-logo-main icon-discover"><FiCompass /></div>
        <div>
          <h1 className="mivibes-title">Discover & Miwas</h1>
          <p className="mivibes-subtitle">Trouve ta tribu, une connexion à la fois.</p>
        </div>
      </div>

      <div className="discover-tabs">
        <button className={activeTab === 'Recommandations' ? 'd-tab active' : 'd-tab'} onClick={() => setActiveTab('Recommandations')}><FiHeart /> Recommandations</button>
        <button className={activeTab === 'Suggestions IA PRO' ? 'd-tab active' : 'd-tab'} onClick={() => setActiveTab('Suggestions IA PRO')}>
          <HiSparkles /> Suggestions IA <span className="pro-badge">PRO</span>
        </button>
        <button className={activeTab === 'Invitations' ? 'd-tab active' : 'd-tab'} onClick={() => setActiveTab('Invitations')}><FiMail /> Invitations {receivedInvites.length > 0 && <span className="notif-dot"></span>}</button>
        <button className={activeTab === 'Historique' ? 'd-tab active' : 'd-tab'} onClick={() => setActiveTab('Historique')}><FiClock /> Historique</button>
      </div>

      {activeTab === 'Suggestions IA PRO' && (
        <div className="premium-card">
          <div className="premium-top"><div className="premium-icon-circle"><HiSparkles /></div><span className="premium-badge">Fonctionnalité Premium</span></div>
          <h2 className="premium-title">Suggestions IA</h2>
          <p className="premium-desc">Notre IA analyse en profondeur ta personnalité, tes centres d'intérêt et ton style de connexion pour te proposer les profils les plus compatibles avec toi.</p>
          <ul className="premium-features-list">
            <li><FiCheck /> Score de compatibilité détaillé (0 - 100%)</li><li><FiCheck /> Analyse de personnalité IA</li><li><FiCheck /> Recommandations illimitées</li><li><FiCheck /> Profils ultra-compatibles en priorité</li><li><FiCheck /> Insights sur les points communs</li>
          </ul>
          <button className="btn-premium-upgrade">Passer à Premium</button>
        </div>
      )}

      {activeTab === 'Invitations' && (
        <div className="invitations-view">
          <div className="inv-top-bar">
            <div className="inv-sub-tabs">
              <button className={inviteTab === 'Reçues' ? 'inv-tab active' : 'inv-tab'} onClick={() => setInviteTab('Reçues')}>Reçues</button>
              <button className={inviteTab === 'Envoyées' ? 'inv-tab active' : 'inv-tab'} onClick={() => setInviteTab('Envoyées')}>Envoyées</button>
            </div>
          </div>
          
          {inviteTab === 'Reçues' ? (
            receivedInvites.length > 0 ? (
              <div className="invites-list">
                {receivedInvites.map((inv) => (
                  <div key={inv.id} className="invite-item">
                    <img src={inv.sender?.avatar} alt="" className="invite-avatar" />
                    <span>{inv.sender?.first_name} {inv.sender?.last_name} veut se connecter</span>
                    <div className="invite-actions">
                      <button className="action-btn miwa-btn small-miwa-btn" onClick={() => handleAcceptMiwa(inv.id)}>Accepter</button>
                      <button className="action-btn invite-decline small-miwa-btn" onClick={() => handleDeclineReceivedMiwa(inv.id, inv.sender_id)}>Refuser</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-box"><FiMail className="empty-icon" /><h3>Aucune Miwa reçue</h3><p>Quand quelqu'un t'envoie une Miwa, elle apparaîtra ici.</p></div>
            )
          ) : (
            sentInvites.length > 0 ? (
              <div className="invites-list">
                {sentInvites.map((inv) => (
                  <div key={inv.id} className="invite-item">
                    <img src={inv.receiver?.avatar} alt="" className="invite-avatar" />
                    <span>Envoyé à {inv.receiver?.first_name} {inv.receiver?.last_name}</span>
                    {inv.status === 'pending' ? (
                      <button className="action-btn invite-decline" onClick={() => handleCancelMiwa(inv.id, inv.receiver_id)}>Annuler</button>
                    ) : (
                      <span className="invite-status accepted">Acceptée ✅</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-box"><FiSend className="empty-icon" /><h3>Aucune Miwa envoyée</h3><p>Envoie une Miwa pour démarrer une connexion.</p></div>
            )
          )}
        </div>
      )}

      {activeTab === 'Historique' && (
        <div className="history-view">
          <div className="empty-state-box"><FiClock className="empty-icon" /><h3>Historique des connexions</h3><p>L'historique de tes connexions passées et les visiteurs de ton profil apparaîtront ici.</p></div>
          <div className="history-features-list">
            <div className="history-item"><FiClock /> Historique des connexions — <span className="soon-badge">Bientôt disponible</span></div>
            <div className="history-item pro-item"><FiEye /> Voir les visiteurs de ton profil <span className="pro-badge">PRO</span></div>
          </div>
        </div>
      )}

      {activeTab === 'Recommandations' && (
        <>
          {myProfile && (!myProfile.city || !myProfile.country || !myProfile.languages || myProfile.languages.length === 0) && (
            <div className="complete-profile-banner" onClick={() => navigate('/profile')}>
              <div className="banner-text">
                <h4>🚀 Optimise ton profil !</h4>
                <p>Complète ton profil pour optimiser tes connexions mutuelles.</p>
              </div>
              <button className="banner-btn">Compléter</button>
            </div>
          )}

          {profiles.length === 0 || !currentProfile ? (
            <div className="empty-state-box" style={{ marginTop: '40px' }}>
              <FiCompass className="empty-icon" />
              <h3>Plus aucun profil à découvrir</h3>
              <p>Tu as interagi avec tout le monde pour le moment. Annule une Miwa envoyée ou refusée pour les revoir !</p>
            </div>
          ) : (
            <>
              <div className="swipe-container">
                <AnimatePresence custom={direction}>
                  <motion.div
                    key={currentProfile.id} className="swipe" custom={direction}
                    variants={{ enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, rotate: dir * 5 }) }}
                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                    drag="x" dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => { if (info.offset.x < -100) handleSkip(); else if (info.offset.x > 100) handleSwipeRight(); }}
                  >
                    <div className="profile-card">
                      {swipeAction && (<div className={`swipe-overlay ${swipeAction.includes('MIWA') ? 'miwa-overlay' : 'skip-overlay'}`}>{swipeAction}</div>)}
                      <div className="card-banner"></div>
                      <div className="card-avatar-wrapper">
                        <img src={currentProfile.avatar} alt={currentProfile.first_name} className="card-avatar-left" />
                        {currentProfile.isOnline && <span className="online-dot"></span>}
                      </div>

                      <div className="profile-content-below">
                        <span className="voir-profil-link-white" onClick={() => setShowProfile(true)}>Voir profil</span>
                        <h2 className="profile-name">{currentProfile.first_name} {currentProfile.last_name} {currentProfile.age ? <span className="profile-age">, {currentProfile.age} ans</span> : null}</h2>
                        <span className="profile-username">@{currentProfile.username}</span>

                        <div className="social-proof">
                          {currentProfile.mutualConnections > 0 && (
                            <div className="mutual-wrapper">
                              <span className="proof-item"><FiUserCheck /> Connexions en commun : 
                                <button className="mutual-link" onClick={() => setShowMutuals(!showMutuals)}>{currentProfile.mutualConnections}</button>
                              </span>
                              {showMutuals && (
                                <div className="mutual-dropdown">
                                  {currentProfile.mutualList?.map((friend, index) => (
                                    <div key={index} className="mutual-user">
                                      <img src={friend.avatar} alt={friend.name} className="mutual-user-avatar" />
                                      <span>{friend.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {currentProfile.sharedMitribes && currentProfile.sharedMitribes.length > 0 && (
                            <span className="proof-item"><HiUserGroup /> Membre de : {currentProfile.sharedMitribes.join(', ')}</span>
                          )}
                        </div>

                        {currentProfile.bio && <p className="profile-bio">{currentProfile.bio}</p>}
                        {currentProfile.search_types && currentProfile.search_types.length > 0 && ( <><div className="profile-section-label">Cherche :</div><div className="profile-tags">{currentProfile.search_types.map((s, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{s}</span>)}</div></> )}
                        {currentProfile.passions && currentProfile.passions.length > 0 && ( <><div className="profile-section-label">Passions :</div><div className="profile-tags">{currentProfile.passions.map((p, index) => <span key={index} className={`tag ${tagColors[index % tagColors.length]}`}>{p}</span>)}</div></> )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="profile-actions">
                <div className="card-main-actions">
                  <button className="action-btn skip-btn" onClick={handleSkip}><FiX /> Passer</button>
                  {(miwaStatus === 'idle' || miwaStatus === 'sending') && (
                    <button className="action-btn miwa-btn" onClick={handleSendMiwa} disabled={miwaStatus === 'sending'}>
                      <FiSend /> {miwaStatus === 'sending' ? 'Envoi...' : 'Envoyer une Miwa'}
                    </button>
                  )}
                  {miwaStatus === 'sent' && <button className="action-btn miwa-sent-btn" disabled>Miwa envoyée ✅</button>}
                </div>
                <div className="pro-actions-group">
                  <button className="action-btn pro-action-btn"><FiPercent /> Compatibilité <span className="pro-badge">PRO</span></button>
                  <button className="action-btn pro-action-btn"><FiStar /> Favoris <span className="pro-badge">PRO</span></button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Discover;
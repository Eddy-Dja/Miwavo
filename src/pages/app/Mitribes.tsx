import { useState } from 'react';
import { FiUsers, FiMapPin, FiArrowLeft, FiHeart, FiMessageCircle, FiUserPlus, FiGlobe, FiLock, FiSend, FiX, FiEdit3, FiShare2, FiImage, FiSettings, FiTrash2 } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi2';
import { BsFire } from 'react-icons/bs';
import './Mitribes.css';
import Modal from '../../components/Modal';
import useMitribes, { hexToRgba } from '../../hooks/useMitribes';

// 🌟 COMPOSANT POUR GÉRER LE "VOIR PLUS / VOIR MOINS"
function ReadMoreText({ text, maxChars = 250 }: { text: string, maxChars?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= maxChars || isExpanded) {
    return (
      <div className="post-body">
        {text}
        {isExpanded && text.length > maxChars && (
          <button onClick={() => setIsExpanded(false)} className="read-more-btn">
            Voir moins
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="post-body">
      {text.substring(0, maxChars)}...
      <button onClick={() => setIsExpanded(true)} className="read-more-btn">
        Voir plus
      </button>
    </div>
  );
}

function Mitribes() {
  // 🧠 HOOK
  const {
    loading, mitribes, selectedMitr, setSelectedMitr, TribePosts, currentUser, currentUserAvatar,
    isMitrModalOpen, setIsMitrModalOpen, isEditMode, newMitrName, setNewMitrName, newMitrDesc, setNewMitrDesc, newMitrType, setNewMitrType, newMitrCity, setNewMitrCity, newMitrTags, setNewMitrTags, newMitrThemeColor, setNewMitrThemeColor, handleMitrModalSubmit, openCreateModal, openEditModal,
    isMivibeModalOpen, setIsMivibeModalOpen, newMivibeContent, setNewMivibeContent, handleSendMivibe,
    newMitrMsg, setNewMitrMsg, handleSendMitrMsg,
    isEditPostModalOpen, setIsEditPostModalOpen, editPostContent, setEditPostContent, handleEditPost, openEditPostModal, handleDeletePost,
    openComments, commentText, setCommentText, toggleComments, handleAddComment,
    handleFlammeTribePost, handleJoinLeave
  } = useMitribes();

  if (loading) return (
    <div className="mitr-container">
      <div className="mitr-header" style={{ marginBottom: '24px' }}>
        <div className="mivibes-header">
          <div className="skeleton skeleton-avatar" style={{ width: '45px', height: '45px', borderRadius: '12px' }}></div>
          <div>
            <div className="skeleton skeleton-line" style={{ width: '120px', height: '24px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '200px', height: '14px' }}></div>
          </div>
        </div>
        <div className="skeleton skeleton-btn" style={{ width: '140px', height: '40px', borderRadius: '25px' }}></div>
      </div>
      <div className="mitr-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton-card" style={{ height: '300px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '12px' }}>
              <div className="skeleton skeleton-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '60%', height: '18px' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '90%', height: '12px' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '40%', height: '12px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isMitrModalOpen} onClose={() => setIsMitrModalOpen(false)} title={isEditMode ? "Modifier la Tribu ⚙️" : "Créer une Tribu 🏕️"} themeColor={newMitrThemeColor}>
        <div className="modal-form">
          <div className="input-group">
            <div className="input-label-row">
              <label>Nom de la tribu *</label>
              <span className="char-limit" style={{ color: newMitrName.length >= 25 ? '#EF4444' : '#94A3B8' }}>{newMitrName.length}/30</span>
            </div>
            <input type="text" placeholder="Ex: Les Runners de Paris" value={newMitrName} onChange={(e) => { if (e.target.value.length <= 30) setNewMitrName(e.target.value); }} className="modal-input" />
          </div>
          <textarea placeholder="Description de la tribu *" value={newMitrDesc} onChange={(e) => setNewMitrDesc(e.target.value)} className="modal-textarea" />
          <input type="text" placeholder="Ville (optionnel)" value={newMitrCity} onChange={(e) => setNewMitrCity(e.target.value)} className="modal-input" />
          <input type="text" placeholder="Tags (séparés par des virgules : Tech, Sport...)" value={newMitrTags} onChange={(e) => setNewMitrTags(e.target.value)} className="modal-input" />
          <div className="modal-row-2">
            <button type="button" onClick={() => setNewMitrType('public')} className={`type-btn ${newMitrType === 'public' ? 'active-public' : ''}`}><FiGlobe /> Public</button>
            <button type="button" onClick={() => setNewMitrType('private')} className={`type-btn ${newMitrType === 'private' ? 'active-private' : ''}`}><FiLock /> Privé</button>
          </div>
          <div className="input-group">
            <label>Couleur de la tribu :</label>
            <input type="color" value={newMitrThemeColor} onChange={(e) => setNewMitrThemeColor(e.target.value)} className="modal-color-picker" />
          </div>
        </div>
        <button onClick={handleMitrModalSubmit} className="modal-submit-btn">
          {isEditMode ? 'Sauvegarder les modifications' : 'Créer la Tribu'}
        </button>
      </Modal>

      <Modal isOpen={isMivibeModalOpen} onClose={() => setIsMivibeModalOpen(false)} title="Créer un Mivibe 📢" themeColor={selectedMitr?.theme_color}>
        <textarea value={newMivibeContent} onChange={(e) => setNewMivibeContent(e.target.value)} placeholder="Partage une annonce solennelle..." className="modal-textarea large" maxLength={2000} />
        <button onClick={handleSendMivibe} className="modal-submit-btn">Publier le Mivibe</button>
      </Modal>

      <Modal isOpen={isEditPostModalOpen} onClose={() => setIsEditPostModalOpen(false)} title="Modifier le post ✏️" themeColor={selectedMitr?.theme_color}>
        <textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} className="modal-textarea" maxLength={2000} />
        <button onClick={handleEditPost} className="modal-submit-btn">Sauvegarder</button>
      </Modal>

      {/* VUE DÉTAILLÉE */}
      {selectedMitr ? (
        <div className="mitr-detail-container" style={{ '--theme-color': selectedMitr.theme_color, '--theme-color-light': hexToRgba(selectedMitr.theme_color, 0.2), '--gradient': selectedMitr.gradient } as React.CSSProperties}>
          <button className="back-btn" onClick={() => { setSelectedMitr(null); }}><FiArrowLeft /> Retour aux Mitribes</button>
          <div className="mitr-detail-layout">
            <div className="mitr-detail-sidebar">
              <div className="about-card">
                <img src={selectedMitr.avatar_url} alt={selectedMitr.name} className="mitr-detail-avatar" />
                <div className="mitr-title-row"> <h2>{selectedMitr.name}</h2> {selectedMitr.user_role === 'admin' && (<button onClick={openEditModal} className="settings-btn"><FiSettings /></button>)} </div>
                <div className={`mitr-type-badge ${selectedMitr.type}`}> {selectedMitr.type === 'public' ? <><FiGlobe /> Public</> : <><FiLock /> Privé</>} </div>
                <p className="mitr-desc">{selectedMitr.description}</p>
                <div className="mitr-detail-tags"> {selectedMitr.tags?.map(tag => (<span key={tag} className="tag">{tag}</span>))} </div>
                <div className="mitr-join-area">
                  {selectedMitr.user_role === 'idle' && (<button className="action-btn miwa-btn join-tribe-btn full-width" onClick={() => handleJoinLeave(selectedMitr.id, selectedMitr.type, selectedMitr.user_role)}><FiUserPlus /> {selectedMitr.type === 'public' ? 'Rejoindre' : 'Demander'}</button>)}
                  {selectedMitr.user_role === 'pending' && (<button className="action-btn join-tribe-btn pending full-width" onClick={() => handleJoinLeave(selectedMitr.id, selectedMitr.type, selectedMitr.user_role)}>En attente ⏳</button>)}
                  {selectedMitr.user_role === 'member' && (<button className="action-btn join-tribe-btn member full-width" onClick={() => handleJoinLeave(selectedMitr.id, selectedMitr.type, selectedMitr.user_role)}>Membre ✅ (Quitter)</button>)}
                  {selectedMitr.user_role === 'admin' && (<button className="action-btn join-tribe-btn admin full-width" disabled>Administrateur 👑</button>)}
                </div>
              </div>
            </div>

            <div className="mitr-chat-area">
              {!(selectedMitr.user_role === 'member' || selectedMitr.user_role === 'admin') ? (
                <div className="locked-area"> <FiLock size={48} /> <h3>C'est un espace réservé aux membres</h3> <p>Rejoins cette tribu pour accéder au Feu de Camp.</p> </div>
              ) : (
                <>
                  <div className="chat-header"> <span>🔥 Feu de Camp</span> <button onClick={() => setIsMivibeModalOpen(true)} className="mivibe-create-btn"><FiEdit3 /> Créer un Mivibe</button> </div>
                  <div className="chat-messages">
                    {TribePosts.length === 0 && (<div className="empty-chat">Le feu est tout neuf. Allume la première étincelle ! ✨</div>)}
                    {TribePosts.map(msg => (
                      msg.type === 'text' ? (
                        <div key={msg.id} className="text-msg"> <img src={msg.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt="" className="msg-avatar" /> <div className="msg-body"> <div className="msg-header"> <span className="msg-author">{msg.author?.first_name} {msg.author?.last_name}</span> {currentUser === msg.user_id && (<div className="msg-actions"> <button onClick={() => openEditPostModal(msg)}><FiEdit3 /></button> <button onClick={() => handleDeletePost(msg.id)} className="delete"><FiTrash2 /></button> </div>)} </div> <p className="msg-text">{msg.content}</p> </div> </div>
                      ) : (
                        <div key={msg.id} className="post-card announcement"> 
                          <div className="post-header"> <img src={msg.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={msg.author?.first_name} className="avatar-img" /> <div className="post-info"> <span className="post-author"> {msg.author?.first_name} {msg.author?.last_name} <span className="announcement-badge">📢 Annonce Tribale</span> </span> <span className="post-community">🔥 {selectedMitr?.name} • {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span> </div> {currentUser === msg.user_id && (<div className="msg-actions"> <button onClick={() => openEditPostModal(msg)}><FiEdit3 /></button> <button onClick={() => handleDeletePost(msg.id)} className="delete"><FiTrash2 /></button> </div>)} </div> 
                          
                          {/* 🌟 REMPLACÉ PAR LE COMPOSANT READMORETEXT POUR LES ANNONCES */}
                          <ReadMoreText text={msg.content} /> 
                          
                          <div className="post-actions"> <button className={`action-btn ${msg.is_flammed ? 'vibed' : ''}`} onClick={() => handleFlammeTribePost(msg.id, msg.flames_count, msg.is_flammed)}><BsFire /> {msg.flammes_count} Flammes</button> <button className="action-btn" onClick={() => toggleComments(msg.id)}><FiMessageCircle /> {msg.comments?.length || 0}</button> <button className="action-btn"><FiShare2 /> Partager</button> </div> 
                          {openComments[msg.id] && ( <div className="comments-section"> {msg.comments?.map(comment => ( <div key={comment.id} className="comment-item"> <img src={comment.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={comment.author?.first_name} className="comment-avatar" /> <div className="comment-content"> <span className="comment-author">{comment.author?.first_name} {comment.author?.last_name}</span> <p className="comment-text">{comment.content}</p> </div> </div> ))} <div className="comment-input-area"> <img src={currentUserAvatar || "https://i.pravatar.cc/150?img=68"} alt="Moi" className="comment-avatar" /> <input type="text" placeholder="Écrire un commentaire..." className="comment-input" value={commentText[msg.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [msg.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddComment(msg.id)}/> <button className="comment-send-btn" onClick={() => handleAddComment(msg.id)}><FiSend /></button> </div> </div> )} 
                        </div>
                      )
                    ))}
                  </div>
                  <form className="chat-input-area" onSubmit={handleSendMitrMsg}> <input type="text" placeholder="Partage ta vibe..." value={newMitrMsg} onChange={(e) => setNewMitrMsg(e.target.value)} className="chat-input" maxLength={500} /> <button type="submit" className="send-btn"><FiSend /></button> </form>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // VUE LISTE
        <div className="mitr-container">
          <div className="mitr-header"> <div className="mivibes-header"> <div className="mivibes-logo-main icon-mitribes"><HiUserGroup /></div> <div><h1 className="mivibes-title">Mitribes</h1><p className="mivibes-subtitle">Connecte toi à une tribu.</p></div> </div> <button className="action-btn miwa-btn create-mitr-btn" onClick={openCreateModal}>+ Créer une Tribu</button> </div>
          <div className="mitr-grid">
            {mitribes.map(mitr => (
              <div key={mitr.id} className="mitr-card" style={{ '--theme-color': mitr.theme_color, '--theme-color-light': hexToRgba(mitr.theme_color, 0.2), '--gradient': mitr.gradient } as React.CSSProperties} onClick={() => setSelectedMitr(mitr)}>
                <div className="mitr-card-content">
                  <div className={`mitr-type-badge ${mitr.type}`}> {mitr.type === 'public' ? <><FiGlobe /> Public</> : <><FiLock /> Privé</>} </div>
                  <h2 className="mitr-name">{mitr.name}</h2>
                  <img src={mitr.avatar_url} alt={mitr.name} className="mitr-avatar" />
                  <div className="mitr-tags"> {mitr.tags?.map(tag => (<span key={tag} className="mitr-tag tag">{tag}</span>))} </div>
                  <p className="mitr-desc">{mitr.description}</p>
                  <div className="mitr-meta"> {mitr.city && <span><FiMapPin /> {mitr.city}</span>} <span><FiUsers /> {mitr.member_count}</span> </div>
                  <div className="mitr-join-area"> 
                    {(mitr.user_role === 'idle') && (<button className="mitr-join-btn" onClick={(e) => { e.stopPropagation(); handleJoinLeave(mitr.id, mitr.type, mitr.user_role); }}><FiUserPlus /> {mitr.type === 'public' ? 'Rejoindre' : 'Demander'}</button>)}
                    {mitr.user_role === 'pending' && (<button className="mitr-join-btn pending" onClick={(e) => e.stopPropagation()}>En attente ⏳</button>)}
                    {mitr.user_role === 'member' && (<button className="mitr-join-btn member" onClick={(e) => e.stopPropagation()}>Membre ✅</button>)}
                    {mitr.user_role === 'admin' && (<button className="mitr-join-btn admin" onClick={(e) => e.stopPropagation()}>Administrateur 👑</button>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Mitribes;
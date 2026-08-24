import { useState, useEffect } from 'react';
import { FiZap, FiMessageCircle, FiShare2, FiImage, FiSend, FiTrash2, FiEdit3, FiX } from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';
import { supabase } from '../../lib/supabaseClient';
import useMivibes from '../../hooks/useMivibes';
import toast from 'react-hot-toast';
import './Mivibes.css';
import Modal from '../../components/Modal';

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(124, 58, 237, ${alpha})`; // Sécurité si hex est vide
  const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface Author { first_name: string; last_name: string; avatar: string; }
interface Tribe { id: string; name: string; avatar_url: string; theme_color: string; }
interface Comment { id: string; content: string; created_at: string; author: Author; user_id: string; }
interface Mivibe { id: string; created_at: string; content: string; type: string; community: string | null; author: Author; tribe: Tribe | null; flammes_count: number; is_flammed: boolean; user_id: string; comments: Comment[]; }

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

function Mivibes() {
  // States locaux pour l'UI et l'utilisateur
  const [newMivibeText, setNewMivibeText] = useState('');
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMivibeId, setEditingMivibeId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { 
        setCurrentUserId(user.id); 
        const { data: profile } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', user.id).single(); 
        if (profile) setCurrentUser(profile as Author); 
      }
    }; 
    initUser();
  }, []);

  // 🧠 NOTRE HOOK
  const { 
    mivibes, setMivibes, loading, openComments, commentText, setCommentText,
    handleFlamme, toggleComments, handleAddComment, handleDeleteComment, handlePostMivibe
  } = useMivibes(currentUserId);

  // 🌟 FONCTION DE CRÉATION SIMPLIFIÉE
  const handleCreateMivibe = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (newMivibeText.trim() === '') return;
    
    await handlePostMivibe(newMivibeText); 
    setNewMivibeText(''); 
  };

  const openEditModal = (mivibe: Mivibe) => { setEditingMivibeId(mivibe.id); setEditContent(mivibe.content); setIsEditModalOpen(true); };
  
  const handleEditMivibe = async () => {
    if (!editContent.trim() || !editingMivibeId) return; 
    setMivibes(prev => prev.map(m => m.id === editingMivibeId ? { ...m, content: editContent.trim() } : m)); 
    setIsEditModalOpen(false);
    const { error } = await supabase.from('mivibes').update({ content: editContent.trim() }).eq('id', editingMivibeId);
    if (error) { toast.error("Erreur modification"); } else toast.success("Mivibe modifié ✏️");
  };

  const handleDeleteMivibe = async (mivibeId: string) => { 
    setMivibes(prev => prev.filter(m => m.id !== mivibeId)); 
    const { error } = await supabase.from('mivibes').delete().eq('id', mivibeId); 
    if (error) { toast.error("Erreur suppression"); } else toast.success("Mivibe supprimé 🗑️"); 
  };

  if (loading) return (
    <div className="mivibes-container">
      <div className="mivibes-header">
        <div className="mivibes-logo-main icon-mivibes"><FiZap /></div>
        <div>
          <div className="skeleton skeleton-line" style={{ width: '120px', height: '24px', marginBottom: '6px' }}></div>
          <div className="skeleton skeleton-line" style={{ width: '220px', height: '14px' }}></div>
        </div>
      </div>
      <div className="skeleton-card skeleton-post-box">
        <div className="skeleton-create-top">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton skeleton-line" style={{ height: '40px', borderRadius: '25px' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton skeleton-btn"></div>
          <div className="skeleton skeleton-btn"></div>
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card-header">
            <div className="skeleton skeleton-avatar"></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton skeleton-line short"></div>
              <div className="skeleton skeleton-line medium" style={{ height: '12px' }}></div>
            </div>
          </div>
          <div className="skeleton-card-body">
            <div className="skeleton skeleton-line"></div>
            <div className="skeleton skeleton-line medium"></div>
          </div>
          <div className="skeleton-card-actions">
            <div className="skeleton skeleton-btn"></div>
            <div className="skeleton skeleton-btn"></div>
            <div className="skeleton skeleton-btn"></div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="mivibes-container">
       {/* MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Mivibe ✏️">
        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="modal-textarea" maxLength={2000} />
        <button onClick={handleEditMivibe} className="modal-submit-btn">Sauvegarder</button>
      </Modal>

      <div className="mivibes-header">
        <div className="mivibes-logo-main icon-mivibes"><FiZap /></div>
        <div><h1 className="mivibes-title">Mivibes</h1><p className="mivibes-subtitle">Partage tes Pensées, tes Vibes et Inspirations.</p></div>
      </div>

      <form className="create-post-box" onSubmit={handleCreateMivibe}>
        <div className="create-top"> <img src={currentUser?.avatar || "https://i.pravatar.cc/150?img=68"} alt="Moi" className="avatar-img" /> <input type="text" placeholder="Allume une vibe avec ta tribu..." className="create-input" value={newMivibeText} onChange={(e) => setNewMivibeText(e.target.value)} maxLength={2000} /> </div>
        <div className="create-bottom"> <button type="button" className="media-btn"><FiImage /> Photo / Vidéo</button> <button type="submit" className="create-btn">Partager</button> </div>
      </form>

      {mivibes.length === 0 ? ( <div className="empty-state">Aucun Mivibe pour le moment. Sois le premier à poster ! 🔥</div> ) : (
        mivibes.map(mivibe => {
          const isTribeAnnouncement = mivibe.tribe !== null;
          const themeColor = mivibe.tribe?.theme_color || '#7C3AED';

          return (
            <div key={mivibe.id} className={`post-card ${isTribeAnnouncement ? 'announcement' : ''}`} style={isTribeAnnouncement ? { '--theme-color': themeColor, '--theme-color-light': hexToRgba(themeColor, 0.1) } as React.CSSProperties : {}}>
              <div className="post-header">
                <img src={mivibe.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={mivibe.author?.first_name} className="avatar-img" />
                <div className="post-info">
                  <span className="post-author"> {mivibe.author?.first_name || 'Inconnu'} {mivibe.author?.last_name} {isTribeAnnouncement && (<span className="announcement-badge">📢 Annonce</span>)} </span>
                  <span className="post-community"> {mivibe.tribe ? `🔥 ${mivibe.tribe.name}` : 'Tribu Générale'} • {new Date(mivibe.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} </span>
                </div>
                {currentUserId === mivibe.user_id && !isTribeAnnouncement && ( <div className="owner-actions"> <button onClick={() => openEditModal(mivibe)}><FiEdit3 /></button> <button onClick={() => handleDeleteMivibe(mivibe.id)} className="delete"><FiTrash2 /></button> </div> )}
              </div>
              
              <ReadMoreText text={mivibe.content || ''} />

              <div className="post-actions">
                <button className={`action-btn ${mivibe.is_flammed ? 'vibed' : ''}`} onClick={() => handleFlamme(mivibe.id, mivibe.is_flammed)}><BsFire /> {mivibe.flammes_count || 0} Flammes</button>
                {/* 🌟 SÉCURITÉ : mivibe.comments?.length || 0 pour ne jamais crasher si comments est undefined */}
                <button className="action-btn" onClick={() => toggleComments(mivibe.id)}><FiMessageCircle /> {mivibe.comments?.length || 0}</button>
                <button className="action-btn"><FiShare2 /> Partager</button>
              </div>
              {openComments[mivibe.id] && (
                <div className="comments-section">
                  {/* 🌟 SÉCURITÉ : (mivibe.comments || []).map(...) */}
                  {(mivibe.comments || []).map(comment => ( <div key={comment.id} className="comment-item"> <img src={comment.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={comment.author?.first_name} className="comment-avatar" /> <div className="comment-content"> <div className="comment-header"> <span className="comment-author">{comment.author?.first_name || 'Inconnu'} {comment.author?.last_name}</span> {currentUserId === comment.user_id && (<button onClick={() => handleDeleteComment(mivibe.id, comment.id)} className="delete-comment"><FiTrash2 /></button>)} </div> <p className="comment-text">{comment.content}</p> </div> </div> ))}
                  <div className="comment-input-area"> <img src={currentUser?.avatar || "https://i.pravatar.cc/150?img=68"} alt="Moi" className="comment-avatar" /> <input type="text" placeholder="Écrire un commentaire..." className="comment-input" value={commentText[mivibe.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [mivibe.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddComment(mivibe.id)} /> <button className="comment-send-btn" onClick={() => handleAddComment(mivibe.id)}><FiSend /></button> </div>
                </div>
              )}
            </div>
          );
        })
      )}
      <div className="mivibes-footer">Ton fil d'actualité personnalisé</div>
    </div>
  );
}

export default Mivibes;
import { useState } from 'react';
import { FiMapPin, FiUsers, FiSearch, FiPlus, FiCalendar, FiArrowLeft, FiX, FiCamera, FiSettings, FiDollarSign } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import './Local.css';
import Modal from '../../components/Modal';
import useLocal from '../../hooks/useLocal';

const categories = ["All", "Café", "Discussion", "Sport", "Randonnée", "Jeux", "Technologie"];

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function Local() {
  // 🧠 HOOK
  const { 
    events, setEvents, selectedEvent, setSelectedEvent, loading, currentUser, currentUserId,
    isRsvpd, isRsvpLoading, fetchEvents, checkRsvpStatus, handleRsvp
  } = useLocal();

  // 🎨 UI STATES
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFullLocation, setNewFullLocation] = useState('');
  const [newCategory, setNewCategory] = useState('Café');
  const [newMaxParticipants, setNewMaxParticipants] = useState(20);
  const [newThemeColor, setNewThemeColor] = useState('#7C3AED');
  const [newPrice, setNewPrice] = useState('Gratuit');
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; if (file.size > 5 * 1024 * 1024) { toast.error("L'image doit faire moins de 5MB"); return; } setFlyerFile(file); setFlyerPreview(URL.createObjectURL(file)); }
  };

  const openCreateModal = () => { setIsEditMode(false); setEditingEventId(null); setNewTitle(''); setNewDesc(''); setNewDate(''); setNewLocation(''); setNewFullLocation(''); setNewMaxParticipants(20); setNewCategory('Café'); setNewThemeColor('#7C3AED'); setNewPrice('Gratuit'); setFlyerFile(null); setFlyerPreview(null); setIsModalOpen(true); };

  const openEditModal = (event: any) => { setIsEditMode(true); setEditingEventId(event.id); setNewTitle(event.title); setNewDesc(event.description || ''); setNewDate(event.rawDate); setNewLocation(event.location); setNewFullLocation(event.fullLocation); setNewCategory(event.category); setNewMaxParticipants(event.max_participants); setNewThemeColor(event.themeColor); setNewPrice(event.price); setFlyerFile(null); setFlyerPreview(event.image_url); setIsModalOpen(true); };

  const handleModalSubmit = async () => { if (isEditMode) await handleUpdateEvent(); else await handleCreateEvent(); };

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newDate || !newLocation.trim() || !currentUser || !currentUserId) { toast.error("Remplis au moins le titre, la date et le lieu"); return; }
    setIsSaving(true);
    const gradient = `linear-gradient(135deg, ${hexToRgba(newThemeColor, 0.15)} 0%, ${hexToRgba(newThemeColor, 0.05)} 100%)`;
    let finalImageUrl = null;
    if (flyerFile) { const fileExt = flyerFile.name.split('.').pop(); const filePath = `${currentUserId}/${Date.now()}.${fileExt}`; const { error: uploadError } = await supabase.storage.from('event-flyers').upload(filePath, flyerFile, { cacheControl: '3600', upsert: true }); if (!uploadError) { const { data: urlData } = supabase.storage.from('event-flyers').getPublicUrl(filePath); if (urlData) finalImageUrl = urlData.publicUrl; } }
    const { data, error } = await supabase.from('local_events').insert({ user_id: currentUserId, title: newTitle.trim(), description: newDesc.trim(), date: newDate, location: newLocation.trim(), full_location: newFullLocation.trim() || null, category: newCategory, max_participants: newMaxParticipants, gradient, theme_color: newThemeColor, image_url: finalImageUrl, price: newPrice.trim() || 'Gratuit' }).select('*, author:profiles!user_id(first_name, last_name, avatar)').single();
    if (error) { toast.error("Erreur lors de la création"); console.error(error); } 
    else if (data) { const dateObj = new Date(data.date); const formatted = { ...data, date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), rawDate: dateObj.toISOString().slice(0, 16), participants_count: 0, fullLocation: data.full_location || data.location, themeColor: data.theme_color, gradient: data.gradient, image_url: data.image_url, price: data.price || 'Gratuit', author: data.author } as any; setEvents([formatted, ...events]); toast.success("Événement créé ! 🎉"); setIsModalOpen(false); }
    setIsSaving(false);
  };

  // 🌟 FONCTION MODIFIÉE : Mise à jour instantanée sans rechargement
  const handleUpdateEvent = async () => {
    if (!editingEventId || !currentUserId) return; setIsSaving(true);
    const gradient = `linear-gradient(135deg, ${hexToRgba(newThemeColor, 0.15)} 0%, ${hexToRgba(newThemeColor, 0.05)} 100%)`; 
    let finalImageUrl = selectedEvent?.image_url || null;

    if (flyerFile) { 
      const fileExt = flyerFile.name.split('.').pop(); 
      const filePath = `${currentUserId}/${Date.now()}.${fileExt}`; 
      const { error: uploadError } = await supabase.storage.from('event-flyers').upload(filePath, flyerFile, { cacheControl: '3600', upsert: true }); 
      if (!uploadError) { const { data: urlData } = supabase.storage.from('event-flyers').getPublicUrl(filePath); if (urlData) finalImageUrl = urlData.publicUrl; } 
    }

    const updates = { title: newTitle.trim(), description: newDesc.trim(), date: newDate, location: newLocation.trim(), full_location: newFullLocation.trim() || null, category: newCategory, max_participants: newMaxParticipants, gradient, theme_color: newThemeColor, image_url: finalImageUrl, price: newPrice.trim() || 'Gratuit' }; 
    
    const { data, error } = await supabase.from('local_events').update(updates).eq('id', editingEventId).select('*, author:profiles!user_id(first_name, last_name, avatar)').single();

    if (error) { toast.error("Erreur lors de la mise à jour"); console.error(error); } 
    else { 
      const dateObj = new Date(data.date); 
      const formatted = { 
        ...data, 
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 
        fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
        rawDate: dateObj.toISOString().slice(0, 16), 
        participants_count: selectedEvent?.participants_count || 0, // On garde le compte actuel
        fullLocation: data.full_location || data.location, 
        themeColor: data.theme_color, 
        gradient: data.gradient, 
        image_url: data.image_url, 
        price: data.price || 'Gratuit', 
        author: data.author 
      } as any; 

      // 1. On met à jour l'événement dans la liste globale
      setEvents(prev => prev.map(e => e.id === editingEventId ? formatted : e));

      // 2. Si l'événement est actuellement ouvert en vue détaillée, on le met à jour instantanément
      if (selectedEvent && selectedEvent.id === editingEventId) {
        setSelectedEvent(formatted);
      }

      toast.success("Événement mis à jour ! ✏️"); 
      setIsModalOpen(false); 
    } 
    setIsSaving(false);
  };

  const filteredEvents = events.filter(event => { const matchesCategory = activeCategory === 'All' || event.category === activeCategory; const matchesSearch = searchQuery === '' || event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.location.toLowerCase().includes(searchQuery.toLowerCase()); return matchesCategory && matchesSearch; });
  
  if (loading) return (
    <div className="local-container">
      <div className="local-header">
        <div className="mivibes-header">
          <div className="skeleton skeleton-avatar" style={{ width: '45px', height: '45px', borderRadius: '12px' }}></div>
          <div>
            <div className="skeleton skeleton-line" style={{ width: '120px', height: '24px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '220px', height: '14px' }}></div>
          </div>
        </div>
        <div className="skeleton skeleton-btn" style={{ width: '80px', height: '40px', borderRadius: '25px' }}></div>
      </div>
      <div className="skeleton skeleton-line" style={{ height: '45px', borderRadius: '25px', margin: '16px 0' }}></div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflow: 'hidden' }}>
        <div className="skeleton skeleton-btn" style={{ width: '50px', height: '32px', borderRadius: '20px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '60px', height: '32px', borderRadius: '20px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '55px', height: '32px', borderRadius: '20px' }}></div>
        <div className="skeleton skeleton-btn" style={{ width: '65px', height: '32px', borderRadius: '20px' }}></div>
      </div>
      <div className="local-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton" style={{ height: '140px', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ padding: '16px' }}>
              <div className="skeleton skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '12px' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '90%', height: '12px', marginBottom: '8px' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '40%', height: '12px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Modifier l'événement ⚙️" : "Créer un Événement 📍"} themeColor={newThemeColor}>
        <div className="modal-form">
          <label className="upload-area"> {flyerPreview ? <img src={flyerPreview} alt="Aperçu" className="upload-preview" /> : <><FiCamera size={30} /><span>Ajouter un Flyer</span></>} <input type="file" accept="image/*" onChange={handleFlyerChange} style={{ display: 'none' }} /> </label>
          <input type="text" placeholder="Titre de l'événement *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="modal-input" />
          <div style={{ position: 'relative' }}> <textarea placeholder="Description (max 500 caractères)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={500} className="modal-textarea" /> <span className="char-count" style={{ color: newDesc.length >= 450 ? '#DC2626' : '#94A3B8' }}>{newDesc.length}/500</span> </div>
          <div className="modal-row-2"> <div className="input-group"> <label>Date et Heure *</label> <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="modal-input" /> </div> <div className="input-group"> <label>Catégorie</label> <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="modal-input"> {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)} </select> </div> </div>
          <input type="text" placeholder="Ville / Lieu principal *" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="modal-input" />
          <input type="text" placeholder="Adresse complète (optionnel)" value={newFullLocation} onChange={(e) => setNewFullLocation(e.target.value)} className="modal-input" />
          <div className="modal-row-2"> <div className="input-group"> <label>Participants max</label> <input type="number" value={newMaxParticipants} onChange={(e) => setNewMaxParticipants(parseInt(e.target.value) || 20)} min="2" className="modal-input" /> </div> <div className="input-group"> <label>Prix / Tarif</label> <input type="text" placeholder="Ex: Gratuit, 5€" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="modal-input" /> </div> </div>
          <div className="input-group"> <label>Couleur de l'événement</label> <input type="color" value={newThemeColor} onChange={(e) => setNewThemeColor(e.target.value)} className="modal-color-picker" /> </div>
        </div>
        <button onClick={handleModalSubmit} disabled={isSaving} className="modal-submit-btn"> {isSaving ? 'Sauvegarde...' : isEditMode ? 'Sauvegarder les modifications' : 'Créer l\'événement'} </button>
      </Modal>

      {/* VUE DÉTAILLÉE */}
      {selectedEvent ? (
        <div className="local-container" style={{ '--theme-color': selectedEvent.themeColor, '--theme-color-light': hexToRgba(selectedEvent.themeColor, 0.2), '--gradient': selectedEvent.gradient } as React.CSSProperties}>
          <button className="back-btn" onClick={() => setSelectedEvent(null)}><FiArrowLeft /> Back to Local</button>
          <div className="event-detail-card">
            <div className="event-detail-hero"> {selectedEvent.image_url && <img src={selectedEvent.image_url} alt="Flyer" className="event-flyer-img" />} {selectedEvent.image_url && <div className="event-flyer-overlay" />} <span className="event-detail-category">{selectedEvent.category}</span> </div>
            <div className="event-detail-body">
              <div className="detail-title-row"> <h1 className="event-detail-title">{selectedEvent.title}</h1> {currentUserId === selectedEvent.user_id && (<button onClick={() => openEditModal(selectedEvent)} className="settings-btn"><FiSettings size={20} /></button>)} </div>
              <p className="event-detail-desc">{selectedEvent.description}</p>
              <div className="event-detail-info"> <div className="event-info-row"><FiCalendar /><span>{selectedEvent.fullDate}</span></div> <div className="event-info-row"><FiMapPin /><span>{selectedEvent.fullLocation}</span></div> <div className="event-info-row"><FiUsers /><span>{selectedEvent.participants_count} attending / {selectedEvent.max_participants} max</span></div> <div className="event-info-row"><FiDollarSign /><span className="price-text">{selectedEvent.price}</span></div> </div>
              <div className="event-detail-organizer"> <img src={selectedEvent.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={selectedEvent.author?.first_name} className="host-avatar" /> <div> <span className="organizer-label">Organized by</span> <span className="organizer-name">{selectedEvent.author?.first_name} {selectedEvent.author?.last_name}</span> </div> </div>
              <button className={`action-btn rsvp-btn ${isRsvpd ? 'cancel-rsvp-btn' : 'miwa-btn'}`} onClick={handleRsvp} disabled={isRsvpLoading}> {isRsvpLoading ? 'Chargement...' : isRsvpd ? '❌ Annuler ma participation' : '🚀 Participer'} </button>
            </div>
          </div>
        </div>
      ) : (
        // VUE LISTE
        <div className="local-container">
          <div className="local-header"> <div className="mivibes-header"> <div className="mivibes-logo-main icon-local"><FiMapPin /></div> <div> <h1 className="mivibes-title">Local Events</h1> <p className="mivibes-subtitle">Explore ce qui se passe autour de toi.</p> </div> </div> <button className="action-btn miwa-btn create-event-btn" onClick={openCreateModal}><FiPlus /> Créer</button> </div>
          <div className="local-search-bar"> <FiSearch className="search-icon" /> <input type="text" placeholder="Search city, place..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> </div>
          <div className="local-categories"> {categories.map(cat => (<button key={cat} className={activeCategory === cat ? 'local-cat active' : 'local-cat'} onClick={() => setActiveCategory(cat)}> {cat} </button>))} </div>
          <div className="local-grid">
            {filteredEvents.length === 0 ? ( <div className="empty-state">Aucun événement trouvé. Sois le premier à en créer un ! 📍</div> ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="local-card" style={{ '--theme-color': event.themeColor, '--theme-color-light': hexToRgba(event.themeColor, 0.2), '--gradient': event.gradient } as React.CSSProperties} onClick={() => { setSelectedEvent(event); checkRsvpStatus(event.id); }}>
                  <div className={`local-card-top-colored ${event.image_url ? 'has-flyer' : ''}`}>
                    <div className="local-card-top-header"> <span className="local-card-date"><FiCalendar className="date-icon" />{event.date}</span> <span className="local-card-category">{event.category}</span> </div>
                    {event.image_url && (<div className="local-card-flyer-area"><img src={event.image_url} alt="Flyer" className="local-card-flyer-img" /></div>)}
                    <h3 className="local-card-title-colored">{event.title}</h3>
                    {/* 🌟 SUPPRIMÉ : La description n'apparaît plus ici */}
                  </div>
                  <div className="local-card-bottom-white"> <div className="local-card-info-row"><FiMapPin /><span>{event.location} · {event.fullLocation}</span></div> <div className="local-card-info-row"><FiUsers /><span>{event.participants_count} attending</span></div> <div className="local-card-info-row"><FiDollarSign /><span className="price-text">{event.price}</span></div> <div className="local-card-host-small"> <img src={event.author?.avatar || "https://i.pravatar.cc/150?img=68"} alt={event.author?.first_name} className="host-avatar-small" /> <span>Hosted by {event.author?.first_name} {event.author?.last_name}</span> </div> </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Local;
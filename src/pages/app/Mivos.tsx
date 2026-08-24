import { FiSearch, FiSend, FiHeart, FiMessageCircle, FiCheck } from 'react-icons/fi';
import './Mivos.css';
import useMivos from '../../hooks/useMivos'; // Adapte le chemin

function Mivos() {
  // 🧠 HOOK : Toute la logique de messagerie et Realtime
  const { 
    activeTab, setActiveTab,
    conversations, selectedContact, setSelectedContact,
    loading, messages, newMessage, setNewMessage,
    currentUser, handleSend
  } = useMivos();

  if (loading) return (
    <div className="mivos-container">
      {/* Sidebar Squelette */}
      <div className="mivos-sidebar">
        <div className="mivibes-header" style={{ marginBottom: '20px' }}>
          <div className="skeleton skeleton-avatar" style={{ width: '45px', height: '45px', borderRadius: '12px' }}></div>
          <div>
            <div className="skeleton skeleton-line" style={{ width: '80px', height: '24px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '140px', height: '14px' }}></div>
          </div>
        </div>

        <div className="skeleton skeleton-line" style={{ height: '40px', borderRadius: '25px', margin: '16px 0' }}></div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div className="skeleton skeleton-btn" style={{ width: '70px', height: '32px' }}></div>
          <div className="skeleton skeleton-btn" style={{ width: '70px', height: '32px' }}></div>
        </div>

        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="skeleton skeleton-avatar" style={{ width: '45px', height: '45px', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '6px' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '40%', height: '12px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area Squelette */}
      <div className="mivos-chat-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid #f1f1f1' }}>
          <div className="skeleton skeleton-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
          <div>
            <div className="skeleton skeleton-line" style={{ width: '120px', height: '16px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '60px', height: '12px' }}></div>
          </div>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%', height: '16px', alignSelf: 'flex-start', borderRadius: '12px' }}></div>
          <div className="skeleton skeleton-line" style={{ width: '60%', height: '16px', alignSelf: 'flex-end', borderRadius: '12px' }}></div>
          <div className="skeleton skeleton-line" style={{ width: '50%', height: '16px', alignSelf: 'flex-start', borderRadius: '12px' }}></div>
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="skeleton skeleton-line" style={{ flex: 1, height: '40px', borderRadius: '20px' }}></div>
          <div className="skeleton skeleton-btn" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        </div>
      </div>
    </div>
  );

  
  return (
    <div className="mivos-container">
      <div className="mivos-sidebar">
        <div className="mivibes-header"> 
          <div className="mivibes-logo-main icon-mivos"><FiMessageCircle /></div> 
          <div> <h1 className="mivibes-title">Mivos</h1> <p className="mivibes-subtitle">Ta messagerie privée</p> </div> 
        </div>
        
        <div className="mivos-search-bar"> <FiSearch /> <input type="text" placeholder="Rechercher une conversation..." /> </div>
        
        <div className="mivos-tabs">
          <button className={activeTab === 'Chats' ? 'mivo-tab active' : 'mivo-tab'} onClick={() => setActiveTab('Chats')}><FiMessageCircle /> Chats</button>
          <button className={activeTab === 'Favoris' ? 'mivo-tab active' : 'mivo-tab'} onClick={() => setActiveTab('Favoris')}><FiHeart /> Favoris</button>
        </div>
        
        <div className="mivos-contacts-list">
          {conversations.length === 0 ? ( 
            <div className="no-conv">Aucune connexion acceptée. Envoie des Miwas !</div> 
          ) : (
            conversations.map(contact => (
              <div key={contact.id} className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`} onClick={() => setSelectedContact(contact)}>
                <div className="contact-avatar-wrapper"> <img src={contact.avatar} alt={contact.first_name} className="contact-avatar" /> {contact.isOnline && <span className="online-dot"></span>} </div>
                <div className="contact-info"> <h3>{contact.first_name} {contact.last_name}</h3> <p>{contact.isOnline ? 'En ligne' : 'Hors ligne'}</p> </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mivos-chat-area">
        {selectedContact ? (
          <>
            <div className="chat-header"> 
              <div className="chat-header-info"> 
                <img src={selectedContact.avatar} alt={selectedContact.first_name} className="chat-header-avatar" /> 
                <div> 
                  <h2>{selectedContact.first_name} {selectedContact.last_name}</h2> 
                  <span className={`online-status ${selectedContact.isOnline ? 'online' : 'offline'}`}>{selectedContact.isOnline ? 'En ligne' : 'Hors ligne'}</span> 
                </div> 
              </div> 
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 ? ( 
                <div className="empty-chat">Pas encore de messages. Dis bonjour ! 👋</div> 
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`message-bubble ${msg.sender_id === currentUser ? 'sent' : 'received'}`}>
                    {msg.content}
                    {msg.sender_id === currentUser && ( 
                      <span className={`read-receipt ${msg.is_read ? 'read' : ''}`}> 
                        <FiCheck /> {msg.is_read && <FiCheck className="second-check" />} 
                      </span> 
                    )}
                  </div>
                ))
              )}
            </div>
            
            <form className="chat-input-area" onSubmit={handleSend}> 
              <input type="text" placeholder={`Écrire à ${selectedContact.first_name}...`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} /> 
              <button type="submit" className="send-btn"><FiSend /></button> 
            </form>
          </>
        ) : ( 
          <div className="no-chat-selected"><FiMessageCircle size={40} /><p>Sélectionne une conversation pour commencer</p></div> 
        )}
      </div>
    </div>
  );
}

export default Mivos;
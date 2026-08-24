import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adapte le chemin
import toast from 'react-hot-toast';

// --- TYPES ---
export interface Contact { 
  id: string; 
  first_name: string; 
  last_name: string; 
  avatar: string; 
  isOnline: boolean; 
}

export interface Message { 
  id: string; 
  created_at: string; 
  sender_id: string; 
  receiver_id: string; 
  content: string; 
  is_read: boolean; 
}

// --- HOOK ---
export default function useMivos() {
  const [activeTab, setActiveTab] = useState('Chats');
  const [conversations, setConversations] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Ref pour suivre le contact sélectionné dans les callbacks Realtime
  const selectedContactRef = useRef<Contact | null>(null);

  // Sync du Ref avec le State
  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);

  // 1. Initialisation
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { 
        setCurrentUser(user.id); 
        await fetchConversations(user.id); 
      }
      setLoading(false);
    }; 
    initData();
  }, []);

  // 2. Charger les messages quand on change de contact
  useEffect(() => { 
    if (selectedContact && currentUser) { 
      fetchMessages(selectedContact.id, currentUser); 
      markMessagesAsRead(selectedContact.id, currentUser); 
    } else { 
      setMessages([]); 
    } 
  }, [selectedContact, currentUser]);

  // 3. Subscription Realtime
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase.channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser}` }, (payload) => {
        const incomingMessage = payload.new as Message;
        if (selectedContactRef.current && incomingMessage.sender_id === selectedContactRef.current.id) {
          setMessages((prev) => [...prev, incomingMessage]); 
          markMessagesAsRead(selectedContactRef.current.id, currentUser);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `sender_id=eq.${currentUser}` }, (payload) => {
        const updatedMsg = payload.new as Message; 
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, is_read: updatedMsg.is_read } : m));
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // --- FONCTIONS ---
  const markMessagesAsRead = async (contactId: string, userId: string) => { 
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', contactId).eq('receiver_id', userId).eq('is_read', false); 
  };

  const fetchConversations = async (userId: string) => {
    const { data, error } = await supabase.from('miwas').select(`sender:profiles!miwas_sender_id_fkey(id, first_name, last_name, avatar, isOnline), receiver:profiles!miwas_receiver_id_fkey(id, first_name, last_name, avatar, isOnline)`).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).eq('status', 'accepted');
    if (error) console.error('Erreur conversations:', error); 
    else if (data) {
      const contactsList = data.map((miwa: any) => { const isSender = miwa.sender.id === userId; return isSender ? miwa.receiver : miwa.sender; });
      setConversations(contactsList); 
      if (contactsList.length > 0 && !selectedContact) setSelectedContact(contactsList[0]);
    }
  };

  const fetchMessages = async (contactId: string, userId: string) => {
    const { data, error } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`).order('created_at', { ascending: true });
    if (error) console.error('Erreur messages:', error); 
    else setMessages(data || []);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (newMessage.trim() === '' || !selectedContact || !currentUser) return;
    const messageContent = newMessage.trim();
    const { data, error } = await supabase.from('messages').insert({ sender_id: currentUser, receiver_id: selectedContact.id, content: messageContent }).select().single();
    if (error) toast.error("Erreur envoi"); 
    else if (data) { setMessages(prev => [...prev, data]); setNewMessage(''); }
  };

  return {
    activeTab, setActiveTab,
    conversations, selectedContact, setSelectedContact,
    loading, messages, newMessage, setNewMessage,
    currentUser, handleSend
  };
}
// src/hooks/useLocal.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export interface Author { first_name: string; last_name: string; avatar: string; }

export interface LocalEvent {
  id: string; user_id: string; title: string; date: string; fullDate: string; rawDate: string;
  location: string; fullLocation: string; participants_count: number; max_participants: number;
  category: string; description: string; gradient: string; themeColor: string; image_url: string | null; price: string; author: Author;
}

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Discussion': return { gradient: "linear-gradient(135deg, #FDF2F8 0%, #F5F3FF 100%)", themeColor: "#A855F7" };
    case 'Sport': case 'Randonnée': return { gradient: "linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)", themeColor: "#059669" };
    case 'Jeux': return { gradient: "linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)", themeColor: "#D97706" };
    case 'Technologie': return { gradient: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)", themeColor: "#2563EB" };
    case 'Café': default: return { gradient: "linear-gradient(135deg, #FFF1F2 0%, #FDF2F8 100%)", themeColor: "#E11D48" };
  }
};

export default function useLocal() {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRsvpd, setIsRsvpd] = useState(false);
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { setCurrentUserId(user.id); const { data } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', user.id).single(); if (data) setCurrentUser(data as Author); }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('local_events').select('*, author:profiles!user_id(first_name, last_name, avatar)').order('date', { ascending: true });
    if (error) { console.error('Erreur fetch events:', error); } 
    else if (data) {
      const formatted = data.map((evt: any) => {
        const style = getCategoryStyle(evt.category);
        const dateObj = new Date(evt.date);
        return { id: evt.id, user_id: evt.user_id, title: evt.title, description: evt.description, date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), rawDate: dateObj.toISOString().slice(0, 16), location: evt.location, fullLocation: evt.full_location || evt.location, participants_count: evt.participants_count || 0, max_participants: evt.max_participants, category: evt.category, gradient: evt.gradient || style.gradient, themeColor: evt.theme_color || style.themeColor, image_url: evt.image_url || null, price: evt.price || 'Gratuit', author: evt.author } as LocalEvent;
      });
      setEvents(formatted);
    }
    setLoading(false);
  };

  const checkRsvpStatus = async (eventId: string) => {
    if (!currentUserId) return;
    const { data, error } = await supabase.from('rsvps').select('id').eq('event_id', eventId).eq('user_id', currentUserId).single();
    if (!error && data) setIsRsvpd(true); else setIsRsvpd(false);
  };

  const handleRsvp = async () => {
    if (!selectedEvent || !currentUserId) return; setIsRsvpLoading(true);
    if (isRsvpd) { 
      const { error } = await supabase.from('rsvps').delete().eq('event_id', selectedEvent.id).eq('user_id', currentUserId); 
      if (!error) { await supabase.from('local_events').update({ participants_count: selectedEvent.participants_count - 1 }).eq('id', selectedEvent.id); setSelectedEvent({ ...selectedEvent, participants_count: selectedEvent.participants_count - 1 }); setIsRsvpd(false); } 
      else toast.error("Erreur d'annulation"); 
    } else { 
      const { error } = await supabase.from('rsvps').insert({ event_id: selectedEvent.id, user_id: currentUserId }); 
      if (!error) { await supabase.from('local_events').update({ participants_count: selectedEvent.participants_count + 1 }).eq('id', selectedEvent.id); setSelectedEvent({ ...selectedEvent, participants_count: selectedEvent.participants_count + 1 }); setIsRsvpd(true); } 
      else { toast.error("Erreur de participation"); console.error(error); } 
    }
    setIsRsvpLoading(false);
  };

  useEffect(() => { fetchEvents(); fetchCurrentUser(); }, []);

  return {
    events, setEvents, selectedEvent, setSelectedEvent, loading, currentUser, currentUserId,
    isRsvpd, isRsvpLoading, fetchEvents, checkRsvpStatus, handleRsvp
  };
}
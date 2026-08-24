import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// --- TYPES & HELPERS ---
export interface Profile {
  id: string; first_name: string; last_name: string; username: string;
  age: number | null; bio: string | null; avatar: string; passions: string[];
  search_types: string[]; isOnline: boolean; mutualConnections: number;
  mutualList: { name: string; avatar: string }[]; sharedMitribes: string[];
  city: string | null; country: string | null; nationality: string | null; languages: string[];
}

export const tagColors = [
  'tag-purple', 'tag-orange', 'tag-blue', 'tag-green', 
  'tag-pink', 'tag-yellow', 'tag-red', 'tag-cyan', 
  'tag-indigo', 'tag-teal', 'tag-fuchsia', 'tag-lime', 
  'tag-amber', 'tag-emerald', 'tag-sky', 'tag-rose', 
  'tag-slate', 'tag-zinc', 'tag-brown', 'tag-gold'
];

const calculateAge = (dateString: string) => {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// --- HOOK ---
export default function useDiscover() {
  // 🌟 PLUS DE USEAUTH : On cherche l'utilisateur localement
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);

  // States UI
  const [activeTab, setActiveTab] = useState('Recommandations');
  const [showProfile, setShowProfile] = useState(false);
  const [miwaStatus, setMiwaStatus] = useState<'idle' | 'sending' | 'sent' | 'accepted'>('idle');
  const [inviteTab, setInviteTab] = useState('Reçues');
  
  // States Data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMutuals, setShowMutuals] = useState(false);
  const [direction, setDirection] = useState(0);
  const [swipeAction, setSwipeAction] = useState<string | null>(null);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);

  const currentProfile = profiles.length > 0 ? profiles[currentIndex] : null;

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setMyProfile(data);
      } else {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchProfiles();
      fetchInvitations();
    }
  }, [currentUserId]);

  const addProfileBackToDeck = async (profileId: string) => {
    if (!currentUserId) return;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
    if (error || !data) return;

    const myMitribes = myProfile?.mitribes || [];
    const profileMitribes = data.mitribes || [];
    const sharedMitribes = profileMitribes.filter((m: string) => myMitribes.includes(m));

    const { data: mutuals } = await supabase.rpc('get_mutual_connections', { target_user_id: data.id });

    const profileToAdd: Profile = {
      ...data, passions: data.passions || [], search_types: data.search_types || [], isOnline: data.isOnline || false,
      mutualConnections: mutuals?.length || 0, mutualList: mutuals?.map((m: any) => ({ name: `${m.first_name} ${m.last_name}`, avatar: m.avatar })) || [],
      sharedMitribes, age: data.birth_date ? calculateAge(data.birth_date) : null
    };

    setProfiles(prev => [profileToAdd, ...prev]);
    setCurrentIndex(0); 
  };

  const handleAcceptMiwa = async (miwaId: string) => {
    const { error } = await supabase.from('miwas').update({ status: 'accepted' }).eq('id', miwaId);
    if (error) { toast.error("Erreur lors de l'acceptation"); } 
    else { toast.success('Miwa acceptée ! 🎉'); setReceivedInvites(prev => prev.filter(inv => inv.id !== miwaId)); }
  };

  const handleCancelMiwa = async (miwaId: string, receiverId: string) => {
    const { error } = await supabase.from('miwas').delete().eq('id', miwaId);
    if (error) { toast.error("Erreur lors de l'annulation"); } 
    else { toast.success('Miwa annulée, profil de retour dans les recommandations !'); setSentInvites(prev => prev.filter(inv => inv.id !== miwaId)); addProfileBackToDeck(receiverId); }
  };

  const handleDeclineReceivedMiwa = async (miwaId: string, senderId: string) => {
    const { error } = await supabase.from('miwas').delete().eq('id', miwaId);
    if (error) { toast.error("Erreur lors du refus"); } 
    else { toast.success('Miwa refusée'); setReceivedInvites(prev => prev.filter(inv => inv.id !== miwaId)); addProfileBackToDeck(senderId); }
  };

  const fetchProfiles = async () => {
    if (!currentUserId) { setLoading(false); return; }
    setLoading(true);

    const myMitribes = myProfile?.mitribes || [];

    const { data: sentMiwas } = await supabase.from('miwas').select('receiver_id').eq('sender_id', currentUserId);
    const { data: receivedMiwas } = await supabase.from('miwas').select('sender_id').eq('receiver_id', currentUserId);

    const excludedIds = new Set<string>();
    excludedIds.add(currentUserId);
    sentMiwas?.forEach(m => excludedIds.add(m.receiver_id));
    receivedMiwas?.forEach(m => excludedIds.add(m.sender_id));

    const excludedArray = Array.from(excludedIds);
    let query = supabase.from('profiles').select('*');
    if (excludedArray.length > 0) query = query.not('id', 'in', `(${excludedArray.join(',')})`);
    
    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Erreur fetch profils:', error);
    } else if (data) {
      const formattedData = data.map(p => {
        const profileMitribes = p.mitribes || [];
        const sharedMitribes = profileMitribes.filter((m: string) => myMitribes.includes(m));
        return { ...p, passions: p.passions || [], search_types: p.search_types || [], isOnline: p.isOnline || false, mutualConnections: 0, mutualList: [], sharedMitribes, age: p.birth_date ? calculateAge(p.birth_date) : null };
      }) as Profile[];

      const enrichedProfiles = await Promise.all(formattedData.map(async (p) => {
        const { data: mutuals } = await supabase.rpc('get_mutual_connections', { target_user_id: p.id });
        return { ...p, mutualConnections: mutuals?.length || 0, mutualList: mutuals?.map((m: any) => ({ name: `${m.first_name} ${m.last_name}`, avatar: m.avatar })) || [] };
      }));

      setProfiles(enrichedProfiles);
      setCurrentIndex(0); 
    }
    setLoading(false);
  };

  const fetchInvitations = async () => {
    if (!currentUserId) return;
    const { data: received } = await supabase.from('miwas').select('*, sender:profiles!miwas_sender_id_fkey(first_name, last_name, avatar)').eq('receiver_id', currentUserId).eq('status', 'pending');
    if (received) setReceivedInvites(received);
    const { data: sent } = await supabase.from('miwas').select('*, receiver:profiles!miwas_receiver_id_fkey(first_name, last_name, avatar)').eq('sender_id', currentUserId);
    if (sent) setSentInvites(sent);
  };

  const handleSendMiwa = async () => {
    if (miwaStatus === 'idle' && currentProfile) {
      setMiwaStatus('sending'); 
      setSwipeAction('MIWA ENVOYÉE ✅');
      if (!currentUserId) { alert("Tu dois être connecté"); setMiwaStatus('idle'); setSwipeAction(null); return; }

      const { data: newMiwa, error } = await supabase.from('miwas').insert({ sender_id: currentUserId, receiver_id: currentProfile.id, status: 'pending' }).select().single();

      if (error) {
        if (error.code === '23505') { toast('Miwa déjà envoyée', { icon: 'ℹ️' }); }
        else { console.error("Erreur:", error); setSwipeAction('ERREUR ❌'); setMiwaStatus('idle'); return; }
      }
      
      setMiwaStatus('sent');
      const swipedProfileId = currentProfile.id;

      if (newMiwa) {
        const optimisticInvite = { ...newMiwa, receiver: { first_name: currentProfile.first_name, last_name: currentProfile.last_name, avatar: currentProfile.avatar } };
        setSentInvites(prev => [...prev, optimisticInvite]);
      }

      setTimeout(() => {
        setDirection(1); setSwipeAction(null); 
        setTimeout(() => { 
          setProfiles(prev => prev.filter(p => p.id !== swipedProfileId));
          setMiwaStatus('idle'); 
          setShowMutuals(false); 
        }, 300);
      }, 1000);
    }
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    setDirection(-1); setSwipeAction('PASSÉ ❌'); 
    const skippedId = currentProfile.id;
    setTimeout(() => {
      setProfiles(prev => prev.filter(p => p.id !== skippedId));
      setSwipeAction(null);
      setMiwaStatus('idle');
      setShowMutuals(false);
    }, 1000);
  };

  const handleSwipeRight = () => { handleSendMiwa(); };

  return {
    loading, activeTab, setActiveTab, showProfile, setShowProfile,
    miwaStatus, inviteTab, setInviteTab, myProfile, currentUserId, profiles,
    currentProfile, showMutuals, setShowMutuals, direction, swipeAction,
    receivedInvites, sentInvites, handleAcceptMiwa, handleCancelMiwa,
    handleDeclineReceivedMiwa, handleSendMiwa, handleSkip, handleSwipeRight
  };
}
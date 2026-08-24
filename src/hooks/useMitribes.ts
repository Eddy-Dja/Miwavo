import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adapte le chemin
import toast from 'react-hot-toast';

// --- TYPES & HELPERS ---
export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface Mitr { id: string; name: string; avatar_url: string; description: string; tags: string[]; city: string; type: string; theme_color: string; gradient: string; member_count: number; user_role?: 'idle' | 'member' | 'pending' | 'admin'; }
export interface Author { first_name: string; last_name: string; avatar: string; }
export interface Comment { id: string; content: string; created_at: string; author: Author; }
export interface TribePost { id: string; created_at: string; content: string; type: string; community: string | null; flames_count: number; is_flammed: boolean; mitr_id: string | null; user_id?: string; author: Author | null; comments: Comment[]; }

// --- HOOK ---
export default function useMitribes() {
  // Data States
  const [mitribes, setMitribes] = useState<Mitr[]>([]);
  const [selectedMitr, setSelectedMitr] = useState<Mitr | null>(null);
  const [TribePosts, setTribePosts] = useState<TribePost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // User States
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Refs
  const selectedMitrRef = useRef<Mitr | null>(null);

  // Tribe Form States
  const [isMitrModalOpen, setIsMitrModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newMitrName, setNewMitrName] = useState('');
  const [newMitrDesc, setNewMitrDesc] = useState('');
  const [newMitrType, setNewMitrType] = useState('public');
  const [newMitrCity, setNewMitrCity] = useState('');
  const [newMitrTags, setNewMitrTags] = useState('');
  const [newMitrThemeColor, setNewMitrThemeColor] = useState('#7C3AED');

  // Post / Mivibe Form States
  const [newMitrMsg, setNewMitrMsg] = useState('');
  const [isMivibeModalOpen, setIsMivibeModalOpen] = useState(false);
  const [newMivibeContent, setNewMivibeContent] = useState('');
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');

  // Comments States
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // --- EFFECTS ---
  useEffect(() => { selectedMitrRef.current = selectedMitr; }, [selectedMitr]);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { 
        setCurrentUser(user.id); 
        const { data: profile } = await supabase.from('profiles').select('avatar').eq('id', user.id).single(); 
        if (profile) setCurrentUserAvatar(profile.avatar); 
        await fetchMitribes(user.id); 
      }
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (selectedMitr && (selectedMitr.user_role === 'member' || selectedMitr.user_role === 'admin')) fetchTribePosts(selectedMitr.id);
    else setTribePosts([]);
  }, [selectedMitr]);

  useEffect(() => {
    if (!selectedMitr || (selectedMitr.user_role !== 'member' && selectedMitr.user_role !== 'admin')) return;
    fetchTribePosts(selectedMitr.id);
    
    const channel = supabase.channel(`realtime-tribe-${selectedMitr.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mivibes', filter: `mitr_id=eq.${selectedMitr.id}` }, async (payload) => {
      const newPost = payload.new as any; 
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', newPost.user_id).single();
      const formattedPost: TribePost = { ...newPost, author: profile, is_flammed: false, flames_count: 0, comments: [] };
      setTribePosts(prev => { if (prev.some(m => m.id === formattedPost.id)) return prev; return [...prev, formattedPost]; });
    }).subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [selectedMitr]);

  // --- FETCH FUNCTIONS ---
  const fetchMitribes = async (userId: string) => {
    const { data: mitrData, error } = await supabase.from('mitribes').select('*').limit(100);
    if (error) { console.error(error); return; }
    const { data: memberData } = await supabase.from('mitr_members').select('mitr_id, role').eq('user_id', userId);
    const formatted = mitrData.map(mitr => ({ ...mitr, user_role: memberData?.find(m => m.mitr_id === mitr.id)?.role || 'idle', member_count: Math.floor(Math.random() * 500) + 50 }));
    setMitribes(formatted);
  };

  const fetchTribePosts = async (mitrId: string) => {
    const { data: postsData, error } = await supabase.from('mivibes').select('*, author:profiles!user_id(first_name, last_name, avatar)').eq('mitr_id', mitrId).order('created_at', { ascending: true });
    if (error) console.error("ERREUR:", error);
    else if (postsData) {
      const postIds = postsData.map(p => p.id);
      const { data: myFlames } = await supabase.from('flames').select('mivibe_id').eq('user_id', currentUser!).in('mivibe_id', postIds);
      const flammedIds = new Set(myFlames?.map(f => f.mivibe_id));
      const { data: commentsData } = await supabase.from('comments').select('*, author:profiles!user_id(first_name, last_name, avatar)').in('mivibe_id', postIds).order('created_at', { ascending: true });
      const formatted = postsData.map(p => ({ ...p, is_flammed: flammedIds.has(p.id), flames_count: p.flammes_count || 0, comments: commentsData?.filter(c => c.mivibe_id === p.id).map((c: any) => ({ id: c.id, content: c.content, created_at: c.created_at, author: c.author })) || [] }));
      setTribePosts(formatted);
    }
  };

  // --- HANDLERS ---
  const openCreateModal = () => { setIsEditMode(false); setNewMitrName(''); setNewMitrDesc(''); setNewMitrType('public'); setNewMitrCity(''); setNewMitrTags(''); setNewMitrThemeColor('#7C3AED'); setIsMitrModalOpen(true); };
  const openEditModal = () => { if (!selectedMitr) return; setIsEditMode(true); setNewMitrName(selectedMitr.name); setNewMitrDesc(selectedMitr.description); setNewMitrType(selectedMitr.type); setNewMitrCity(selectedMitr.city || ''); setNewMitrTags(selectedMitr.tags?.join(', ') || ''); setNewMitrThemeColor(selectedMitr.theme_color); setIsMitrModalOpen(true); };

  const handleCreateMitr = async () => {
    if (!newMitrName.trim() || !newMitrDesc.trim() || !currentUser) { toast.error("Le nom et la description sont obligatoires"); return; }
    const tagsArray = newMitrTags.split(',').map(t => t.trim()).filter(t => t !== '');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newMitrName)}&backgroundColor=${newMitrThemeColor.replace('#', '')}`;
    const gradient = `linear-gradient(135deg, ${hexToRgba(newMitrThemeColor, 0.1)} 0%, ${hexToRgba(newMitrThemeColor, 0.05)} 100%)`;
    const { data, error } = await supabase.from('mitribes').insert({ name: newMitrName.trim(), description: newMitrDesc.trim(), type: newMitrType, theme_color: newMitrThemeColor, city: newMitrCity.trim() || null, tags: tagsArray, avatar_url: avatarUrl, gradient }).select().single();
    if (error) { toast.error("Erreur création"); } else if (data) {
      await supabase.from('mitr_members').insert({ user_id: currentUser, mitr_id: data.id, role: 'admin' });
      const newMitr: Mitr = { ...data, user_role: 'admin', member_count: 1 }; setMitribes(prev => [newMitr, ...prev]); toast.success("Tribu créée ! 🎉"); setIsMitrModalOpen(false); setSelectedMitr(newMitr);
    }
  };

  const handleEditMitr = async () => {
    if (!newMitrName.trim() || !newMitrDesc.trim() || !currentUser || !selectedMitr) return;
    const tagsArray = newMitrTags.split(',').map(t => t.trim()).filter(t => t !== '');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newMitrName)}&backgroundColor=${newMitrThemeColor.replace('#', '')}`;
    const gradient = `linear-gradient(135deg, ${hexToRgba(newMitrThemeColor, 0.1)} 0%, ${hexToRgba(newMitrThemeColor, 0.05)} 100%)`;
    const { data, error } = await supabase.from('mitribes').update({ name: newMitrName.trim(), description: newMitrDesc.trim(), type: newMitrType, theme_color: newMitrThemeColor, city: newMitrCity.trim() || null, tags: tagsArray, avatar_url: avatarUrl, gradient }).eq('id', selectedMitr.id).select().single();
    if (error) toast.error("Erreur maj"); else if (data) {
      const updatedMitr: Mitr = { ...data, user_role: 'admin', member_count: selectedMitr.member_count }; setMitribes(prev => prev.map(m => m.id === updatedMitr.id ? updatedMitr : m)); setSelectedMitr(updatedMitr); toast.success("Tribu maj ! 🎨"); setIsMitrModalOpen(false);
    }
  };

  const handleMitrModalSubmit = () => { isEditMode ? handleEditMitr() : handleCreateMitr(); };
  
  const openEditPostModal = (msg: TribePost) => { setEditingPostId(msg.id); setEditPostContent(msg.content); setIsEditPostModalOpen(true); };
  
  const handleEditPost = async () => {
    if (!editPostContent.trim() || !editingPostId || !selectedMitr) return; setTribePosts(prev => prev.map(m => m.id === editingPostId ? { ...m, content: editPostContent.trim() } : m)); setIsEditPostModalOpen(false);
    const { error } = await supabase.from('mivibes').update({ content: editPostContent.trim() }).eq('id', editingPostId);
    if (error) { toast.error("Erreur modification"); fetchTribePosts(selectedMitr.id); } else toast.success("Post modifié ✏️");
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!selectedMitr) return; setTribePosts(prev => prev.filter(m => m.id !== postId)); const { error } = await supabase.from('mivibes').delete().eq('id', postId);
    if (error) { toast.error("Erreur suppression"); fetchTribePosts(selectedMitr.id); } else toast.success("Post supprimé 🗑️");
  };

  const handleSendMitrMsg = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newMitrMsg.trim() || !currentUser || !selectedMitr) return; const messageContent = newMitrMsg.trim(); setNewMitrMsg(''); 
    const { data: myProfile } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', currentUser).single();
    const optimisticId = `temp-${Date.now()}`; const optimisticMsg: TribePost = { id: optimisticId, created_at: new Date().toISOString(), content: messageContent, type: 'text', mitr_id: selectedMitr.id, community: selectedMitr.name, flames_count: 0, is_flammed: false, user_id: currentUser, author: myProfile || null, comments: [] };
    setTribePosts(prev => [...prev, optimisticMsg]);
    const { data, error } = await supabase.from('mivibes').insert({ user_id: currentUser, content: messageContent, type: 'text', mitr_id: selectedMitr.id, community: selectedMitr.name }).select('*, author:profiles!user_id(first_name, last_name, avatar)').single();
    if (error) { toast.error(`Erreur : ${error.message}`); setTribePosts(prev => prev.filter(m => m.id !== optimisticId)); } 
    else if (data) { setTribePosts(prev => { const filtered = prev.filter(m => m.id !== optimisticId && m.id !== data.id); return [...filtered, { ...data, is_flammed: false, flames_count: 0, comments: [] }]; }); }
  };

  const handleSendMivibe = async () => {
    if (!newMivibeContent.trim() || !currentUser || !selectedMitr) return; const content = newMivibeContent.trim(); setNewMivibeContent(''); setIsMivibeModalOpen(false);
    const { data: myProfile } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', currentUser).single();
    const optimisticId = `temp-mivibe-${Date.now()}`; const optimisticMsg: TribePost = { id: optimisticId, created_at: new Date().toISOString(), content: content, type: 'announcement', mitr_id: selectedMitr.id, community: selectedMitr.name, flames_count: 0, is_flammed: false, user_id: currentUser, author: myProfile || null, comments: [] };
    setTribePosts(prev => [...prev, optimisticMsg]);
    const { data, error } = await supabase.from('mivibes').insert({ user_id: currentUser, content: content, type: 'announcement', mitr_id: selectedMitr.id, community: selectedMitr.name }).select('*, author:profiles!user_id(first_name, last_name, avatar)').single();
    if (error) { toast.error(`Erreur : ${error.message}`); setTribePosts(prev => prev.filter(m => m.id !== optimisticId)); } 
    else if (data) { setTribePosts(prev => { const filtered = prev.filter(m => m.id !== optimisticId && m.id !== data.id); return [...filtered, { ...data, is_flammed: false, flames_count: 0, comments: [] }]; }); }
  };

  const handleFlammeTribePost = async (postId: string, currentCount: number, isFlammed: boolean) => {
    if (!currentUser) return; const newCount = isFlammed ? currentCount - 1 : currentCount + 1; setTribePosts(prev => prev.map(m => m.id === postId ? { ...m, is_flammed: !isFlammed, flames_count: newCount } : m));
    if (isFlammed) { await supabase.from('flames').delete().eq('mivibe_id', postId).eq('user_id', currentUser); } else { await supabase.from('flames').insert({ mivibe_id: postId, user_id: currentUser }); }
    await supabase.from('mivibes').update({ flammes_count: newCount }).eq('id', postId);
  };

  const toggleComments = (mivibeId: string) => setOpenComments(prev => ({ ...prev, [mivibeId]: !prev[mivibeId] }));
  
  const handleAddComment = async (mivibeId: string) => {
    const text = commentText[mivibeId]?.trim(); if (!text || !currentUser) return; const { error } = await supabase.from('comments').insert({ mivibe_id: mivibeId, user_id: currentUser, content: text });
    if (error) toast.error("Erreur commentaire"); else { if (selectedMitr) await fetchTribePosts(selectedMitr.id); setCommentText(prev => ({ ...prev, [mivibeId]: '' })); }
  };

  const handleJoinLeave = async (id: string, type: string, currentRole: string | undefined) => {
    if (!currentUser) return; const role = currentRole || 'idle';
    if (role === 'member' || role === 'pending') { await supabase.from('mitr_members').delete().eq('user_id', currentUser).eq('mitr_id', id); toast.success(role === 'member' ? 'Tu as quitté la tribu' : 'Demande annulée'); } 
    else { const roleToInsert = type === 'public' ? 'member' : 'pending'; const { error } = await supabase.from('mitr_members').insert({ user_id: currentUser, mitr_id: id, role: roleToInsert }); if (error) toast.error("Erreur"); else toast.success(type === 'public' ? 'Bienvenue ! 🎉' : 'Demande envoyée ! ⏳'); }
    await fetchMitribes(currentUser);
    if (selectedMitr && selectedMitr.id === id) { if (role === 'idle') setSelectedMitr(prev => prev ? { ...prev, user_role: type === 'public' ? 'member' : 'pending' } : null); else setSelectedMitr(prev => prev ? { ...prev, user_role: 'idle' } : null); }
  };

  return {
    loading, mitribes, selectedMitr, setSelectedMitr, TribePosts, currentUser, currentUserAvatar,
    isMitrModalOpen, setIsMitrModalOpen, isEditMode, newMitrName, setNewMitrName, newMitrDesc, setNewMitrDesc, newMitrType, setNewMitrType, newMitrCity, setNewMitrCity, newMitrTags, setNewMitrTags, newMitrThemeColor, setNewMitrThemeColor, handleMitrModalSubmit, openCreateModal, openEditModal,
    isMivibeModalOpen, setIsMivibeModalOpen, newMivibeContent, setNewMivibeContent, handleSendMivibe,
    newMitrMsg, setNewMitrMsg, handleSendMitrMsg,
    isEditPostModalOpen, setIsEditPostModalOpen, editPostContent, setEditPostContent, handleEditPost, openEditPostModal, handleDeletePost,
    openComments, commentText, setCommentText, toggleComments, handleAddComment,
    handleFlammeTribePost, handleJoinLeave
  };
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Author { first_name: string; last_name: string; avatar: string; }
interface Tribe { id: string; name: string; avatar_url: string; theme_color: string; }
interface Comment { id: string; content: string; created_at: string; author: Author; user_id: string; }
interface Mivibe { id: string; created_at: string; content: string; type: string; community: string | null; author: Author; tribe: Tribe | null; flammes_count: number; is_flammed: boolean; user_id: string; comments: Comment[]; }

export default function useMivibes(currentUserId: string | null) {
  const [mivibes, setMivibes] = useState<Mivibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTribeIds, setMyTribeIds] = useState<string[] | null>(null); 
  const [myFriendIds, setMyFriendIds] = useState<string[] | null>(null); // 🌟 NOUVEAU : Liste des IDs d'amis
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // 1. RÉCUPÉRER LES TRIBUS ET LES AMIS DE L'UTILISATEUR
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserContext = async () => {
      // On lance les deux requêtes en parallèle pour plus de rapidité
      const [tribesRes, miwasRes] = await Promise.all([
        // A) Récupérer les IDs des tribus
        supabase.from('mitr_members').select('mitr_id').eq('user_id', currentUserId),
        // B) Récupérer les IDs des amis (Miwas acceptées)
        supabase.from('miwas')
          .select('sender_id, receiver_id')
          .eq('status', 'accepted')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      ]);

      // Traitement des tribus
      if (!tribesRes.error && tribesRes.data) {
        setMyTribeIds(tribesRes.data.map(m => m.mitr_id));
      } else {
        setMyTribeIds([]);
      }

      // Traitement des amis
      if (!miwasRes.error && miwasRes.data) {
        const friendIds = miwasRes.data.map(m => 
          m.sender_id === currentUserId ? m.receiver_id : m.sender_id
        );
        // 🌟 IMPORTANT : On ajoute son propre ID pour voir ses propres Mivibes globaux dans le fil
        const allVisibleIds = [...new Set([...friendIds, currentUserId])];
        setMyFriendIds(allVisibleIds);
      } else {
        setMyFriendIds([currentUserId]); // Au minimum, on voit ses propres posts
      }
    };

    fetchUserContext();
  }, [currentUserId]);

  // 2. FETCH INITIAL AVEC FILTRE DE VISIBILITÉ STRICT
  useEffect(() => {
    // Attendre que les deux listes soient chargées
    if (!currentUserId || myTribeIds === null || myFriendIds === null) return; 

    const fetchMivibes = async () => {
      setLoading(true);

      const orConditions = [];

      // Condition A : Mivibes globaux (sans tribu) ET écrits par mes amis ou moi-même
      if (myFriendIds.length > 0) {
        const friendIdsString = myFriendIds.map(id => `"${id}"`).join(',');
        orConditions.push(`and(mitr_id.is.null,user_id.in.(${friendIdsString}))`);
      }

      // Condition B : Annonces officielles (type = 'announcement') DES TRIBUS dont je suis membre
      if (myTribeIds.length > 0) {
        const tribeIdsString = myTribeIds.map(id => `"${id}"`).join(',');
        orConditions.push(`and(type.eq.announcement,mitr_id.in.(${tribeIdsString}))`);
      }

      // Si l'utilisateur n'a ni amis ni tribus, on ne charge rien du tout
      if (orConditions.length === 0) {
        setMivibes([]);
        setLoading(false);
        return;
      }

      // Requête combinée avec le OR
      let query = supabase
        .from('mivibes')
        .select('*, author:profiles!user_id(first_name, last_name, avatar), tribe:mitribes!mitr_id(id, name, avatar_url, theme_color)')
        .or(orConditions.join(','))
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Erreur fetch mivibes:", error);
      } else if (data) {
        const safeData = data.map(m => ({
          ...m,
          comments: m.comments || [],
          author: m.author || { first_name: 'Inconnu', last_name: '', avatar: '' }
        }));
        setMivibes(safeData as Mivibe[]);
      }
      setLoading(false);
    };

    fetchMivibes();
  }, [currentUserId, myTribeIds, myFriendIds]); 

  // 3. REALTIME AVEC FILTRE DE VISIBILITÉ STRICT
  useEffect(() => {
    if (!currentUserId || myFriendIds === null) return;

    const channel = supabase
      .channel('mivibes-global-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mivibes' },
        async (payload) => {
          const newMivibe = payload.new;

          // 🌟 VÉRIFICATION DE LA VISIBILITÉ EN TEMPS RÉEL
          let isVisible = false;

          // Cas 1 : C'est un post global (sans tribu) -> Je ne le vois que si l'auteur est mon ami ou moi-même
          if (!newMivibe.mitr_id) {
            if (myFriendIds && myFriendIds.includes(newMivibe.user_id)) {
              isVisible = true;
            }
          } 
          // Cas 2 : C'est un post de tribu -> Je ne le vois QUE si c'est une annonce ET que je suis dans la tribu
          else {
            if (newMivibe.type === 'announcement' && myTribeIds && myTribeIds.includes(newMivibe.mitr_id)) {
              isVisible = true;
            }
          }

          // Si le post ne respecte pas les conditions, on l'ignore
          if (!isVisible) return;

          // Si c'est visible, on va chercher les détails
          const { data: fullMivibe, error } = await supabase
            .from('mivibes')
            .select('*, author:profiles!user_id(first_name, last_name, avatar), tribe:mitribes!mitr_id(id, name, avatar_url, theme_color)')
            .eq('id', newMivibe.id)
            .single();

          if (error || !fullMivibe) return;

          const formattedMivibe = {
            ...fullMivibe,
            comments: fullMivibe.comments || [],
            author: fullMivibe.author || { first_name: 'Inconnu', last_name: '', avatar: '' }
          };

          setMivibes(prev => {
            const exists = prev.some(m => m.id === fullMivibe.id);
            if (exists) return prev;

            if (fullMivibe.user_id === currentUserId) {
              const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === fullMivibe.content);
              if (tempIndex !== -1) {
                const updated = [...prev];
                updated[tempIndex] = formattedMivibe as Mivibe;
                return updated;
              }
            }

            return [formattedMivibe as Mivibe, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, myTribeIds, myFriendIds]); 

  // 🌟 FONCTION POUR POSTER DANS LE FIL GÉNÉRAL
  const handlePostMivibe = async (content: string) => {
    if (!content.trim() || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const { data: myProfile } = await supabase.from('profiles').select('first_name, last_name, avatar').eq('id', currentUserId).single();
    
    const optimisticMivibe: Mivibe = {
      id: tempId,
      created_at: new Date().toISOString(),
      content: content.trim(),
      type: 'text',
      community: null,
      author: myProfile || { first_name: '', last_name: '', avatar: '' },
      tribe: null,
      flammes_count: 0,
      is_flammed: false,
      user_id: currentUserId,
      comments: []
    };

    setMivibes(prev => [optimisticMivibe, ...prev]);

    const { data, error } = await supabase
      .from('mivibes')
      .insert({ 
        user_id: currentUserId, 
        content: content.trim(), 
        type: 'text', 
        mitr_id: null 
      })
      .select('*, author:profiles!user_id(first_name, last_name, avatar), tribe:mitribes!mitr_id(id, name, avatar_url, theme_color)')
      .single();

    if (error) {
      toast.error("Erreur lors de la publication");
      setMivibes(prev => prev.filter(m => m.id !== tempId)); 
    } else if (data) {
      const formattedData = { ...data, comments: data.comments || [], author: data.author || optimisticMivibe.author };
      setMivibes(prev => prev.map(m => m.id === tempId ? formattedData as Mivibe : m));
    }
  };

  // --- FONCTIONS EXISTANTES ---
  const toggleComments = (mivibeId: string) => {
    setOpenComments(prev => ({ ...prev, [mivibeId]: !prev[mivibeId] }));
  };

  const handleFlamme = async (mivibeId: string, isFlammed: boolean) => {
    setMivibes(prev => prev.map(m => m.id === mivibeId ? { ...m, is_flammed: !isFlammed, flammes_count: isFlammed ? m.flammes_count - 1 : m.flammes_count + 1 } : m));
    const { error } = isFlammed 
      ? await supabase.from('flames').delete().match({ user_id: currentUserId, mivibe_id: mivibeId })
      : await supabase.from('flames').insert({ user_id: currentUserId, mivibe_id: mivibeId });
    if (error) toast.error("Erreur Flammes");
  };

  const handleAddComment = async (mivibeId: string) => {
    const content = commentText[mivibeId]?.trim();
    if (!content || !currentUserId) return;
    const { data, error } = await supabase.from('comments').insert({ content, user_id: currentUserId, mivibe_id: mivibeId }).select('*, author:profiles!user_id(first_name, last_name, avatar)').single();
    if (!error && data) {
      setMivibes(prev => prev.map(m => m.id === mivibeId ? { ...m, comments: [...(m.comments || []), data] } : m));
      setCommentText(prev => ({ ...prev, [mivibeId]: '' }));
    } else {
      toast.error("Erreur commentaire");
    }
  };

  const handleDeleteComment = async (mivibeId: string, commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setMivibes(prev => prev.map(m => m.id === mivibeId ? { ...m, comments: (m.comments || []).filter(c => c.id !== commentId) } : m));
    }
  };
  
  return { 
    mivibes, 
    setMivibes, 
    loading, 
    openComments, 
    commentText, 
    setCommentText,
    handleFlamme, 
    toggleComments, 
    handleAddComment, 
    handleDeleteComment,
    handlePostMivibe
  };
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const searchTypes = [
  { id: 1, label: "Amitié", emoji: "🤝" },
  { id: 2, label: "Rencontre", emoji: "❤️" },
  { id: 3, label: "Réseau Pro", emoji: "💼" },
  { id: 4, label: "Passion commune", emoji: "🔥" }
];

export interface ProfileData {
  id: string; 
  first_name: string;
  last_name: string;
  username: string;
  bio: string | null;
  avatar: string;
  passions: string[];
  search_types: string[];
  gender: string | null;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  nationality: string | null;
  languages: string[];
  search_radius: number | null;
}

export default function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassions, setEditPassions] = useState<string[]>([]);
  const [editSearchTypes, setEditSearchTypes] = useState<number[]>([]);
  const [editGender, setEditGender] = useState<'male' | 'female' | null>(null);
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editLanguages, setEditLanguages] = useState<string[]>([]);
  const [editSearchRadius, setEditSearchRadius] = useState(50);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      console.error('Erreur fetch profil:', error);
    } else if (data) {
      setProfile(data as ProfileData);
      setEditFirstName(data.first_name || ''); setEditLastName(data.last_name || '');
      setEditBio(data.bio || ''); setEditPassions(data.passions || []);
      setEditGender(data.gender || null); setEditBirthDate(data.birth_date || '');
      setEditCity(data.city || ''); setEditCountry(data.country || '');
      setEditNationality(data.nationality || ''); setEditLanguages(data.languages || []);
      setEditSearchRadius(data.search_radius || 50);

      const currentSearchIds = searchTypes.filter(st => (data.search_types || []).includes(st.label)).map(st => st.id);
      setEditSearchTypes(currentSearchIds);
    }
    setLoading(false);
  };

  const toggleEditPassion = (passion: string) => { 
    setEditPassions(prev => {
      if (prev.includes(passion)) return prev.filter(p => p !== passion);
      if (prev.length >= 10) { toast.error("Maximum 10 passions !"); return prev; }
      return [...prev, passion];
    }); 
  };

  const toggleEditLanguage = (lang: string) => { 
    setEditLanguages(prev => {
      if (prev.includes(lang)) return prev.filter(l => l !== lang);
      if (prev.length >= 5) { 
        toast.error("Maximum 5 langues !");
        return prev;
      }
      return [...prev, lang];
    }); 
  };

  const toggleEditSearchType = (id: number) => { 
    setEditSearchTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]); 
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image doit faire moins de 2MB"); return; }

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    toast.loading("Upload en cours...", { id: 'avatar-upload' });

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) { toast.error("Erreur lors de l'upload"); toast.dismiss('avatar-upload'); return; }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newAvatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.from('profiles').update({ avatar: newAvatarUrl }).eq('id', profile.id);
    if (updateError) { toast.error("Erreur lors de la mise à jour"); toast.dismiss('avatar-upload'); } 
    else { toast.success("Photo mise à jour ! 📸", { id: 'avatar-upload' }); await fetchProfile(); }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    const searchTypeLabels = editSearchTypes.map(id => searchTypes.find(t => t.id === id)?.label || "");

    const updates = {
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      bio: editBio.trim(),
      passions: editPassions,
      search_types: searchTypeLabels,
      gender: editGender,
      birth_date: editBirthDate || null,
      city: editCity.trim() || null,
      country: editCountry.trim() || null,
      nationality: editNationality.trim() || null,
      languages: editLanguages,
      search_radius: editSearchRadius,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);

    if (error) {
      console.error("ERREUR SUPABASE:", error);
      toast.error(`Erreur : ${error.message}`);
    } else {
      toast.success("Profil mis à jour ! 🎉");
      await fetchProfile();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

   // 🌟 NOUVELLE FONCTION DE DÉCONNEXION INCASSABLE
  const handleLogout = async () => { 
    try {
      await supabase.auth.signOut(); 
    } catch (error) {
      console.error("Erreur signOut:", error);
    } finally {
      // Peu importe si signOut réussit ou plante, on redirige TOUJOURS
      window.location.href = '/'; 
    }
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return {
    profile, isEditing, setIsEditing, loading, isSaving, 
    editFirstName, setEditFirstName, editLastName, setEditLastName,
    editBio, setEditBio, editPassions, toggleEditPassion, 
    editSearchTypes, toggleEditSearchType, editGender, setEditGender,
    editBirthDate, setEditBirthDate, editCity, setEditCity, 
    editCountry, setEditCountry, editNationality, setEditNationality,
    editLanguages, toggleEditLanguage, editSearchRadius, setEditSearchRadius, 
    handleAvatarUpload, handleSave, handleLogout, calculateAge
  };
}
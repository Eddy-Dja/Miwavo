import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const searchTypes = [
  { id: 1, label: "Amitié", emoji: "🤝" },
  { id: 2, label: "Rencontre", emoji: "❤️" },
  { id: 3, label: "Réseau Pro", emoji: "💼" },
  { id: 4, label: "Passion commune", emoji: "🔥" }
];

export default function useOnboarding({ user, setProfile }: { user: any, setProfile: React.Dispatch<React.SetStateAction<any | null>> }) {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [selectedPassions, setSelectedPassions] = useState<string[]>([]);
  const [selectedSearchTypes, setSelectedSearchTypes] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  const isStep1Valid = firstName.trim() !== '' && lastName.trim() !== '' && isUsernameValid && gender !== null && usernameStatus === 'available';

  useEffect(() => {
    if (!isUsernameValid) { setUsernameStatus('idle'); return; }
    const delayDebounce = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const { data, error } = await supabase.from('profiles').select('username').eq('username', username);
        if (error) throw error;
        setUsernameStatus(data.length > 0 ? 'taken' : 'available');
      } catch (err) { setUsernameStatus('available'); }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username, isUsernameValid]);

  const togglePassion = (passion: string) => { setSelectedPassions(prev => prev.includes(passion) ? prev.filter(p => p !== passion) : prev.length >= 10 ? prev : [...prev, passion]); };
  const toggleSearchType = (id: number) => { setSelectedSearchTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]); };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { toast.error("L'image doit faire moins de 2MB"); return; }
      setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      if (!user) { toast.error("Session expirée."); return; }

      const searchTypeLabels = selectedSearchTypes.map(id => searchTypes.find(t => t.id === id)?.label || "");
      const genderFolder = gender === 'female' ? 'female' : 'male'; 
      const maxAvatars = gender === 'female' ? 8 : 12;
      const randomAvatarNumber = Math.floor(Math.random() * maxAvatars) + 1;
      let finalAvatarUrl = `https://qlpdndfwpwoisdwajdpy.supabase.co/storage/v1/object/public/avatars/defaults/${genderFolder}/${randomAvatarNumber}.jpg`;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { cacheControl: '3600', upsert: true });
        if (uploadError) { toast.error("Erreur upload"); setIsSaving(false); return; }
        else {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (urlData) finalAvatarUrl = urlData.publicUrl;
        }
      }

      const profileData = {
        id: user.id, first_name: firstName.trim(), last_name: lastName.trim(),
        username, gender, avatar: finalAvatarUrl, passions: selectedPassions,
        search_types: searchTypeLabels, updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) {
        if (error.code === '23505') { toast.error("Ce pseudo est déjà pris."); setStep(1); setUsernameStatus('taken'); }
        else { toast.error("Erreur BDD: " + error.message); }
        setIsSaving(false); return;
      }

      setProfile(profileData as any); 
      toast.success('Bienvenue sur Miwavo ! 🎉', { duration: 3000 });
      navigate('/discover', { replace: true });
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
      setIsSaving(false);
    }
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    window.location.href = '/'; 
  };

  return {
    step, setStep, firstName, setFirstName, lastName, setLastName, 
    username, handleUsernameChange, gender, setGender, 
    selectedPassions, togglePassion, selectedSearchTypes, toggleSearchType,
    isSaving, avatarPreview, handleFileChange, usernameStatus, isStep1Valid, handleFinish,
    handleLogout
  };
}
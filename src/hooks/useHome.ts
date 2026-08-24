import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext'; 

export default function useHome() {
  const { logout } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        // --- MODE CONNEXION ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // --- MODE INSCRIPTION ---
        
        // 1. Validations locales
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        if (password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }

        // 2. Vérification de l'âge
        if (birthDate) {
          const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
          if (age < 13) {
            throw new Error("Tu dois avoir au moins 13 ans pour utiliser Miwavo.");
          }
        }

        // 3. Inscription Supabase Auth
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              birth_date: birthDate // On sauvegarde la date de naissance
            }
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error("Cet email est déjà utilisé.");
          }
          throw error;
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return {
    isLogin, setIsLogin,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    birthDate, setBirthDate,
    loading, errorMessage,
    handleSubmit, handleSignOut
  };
}
import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement sécurisées
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification au lancement de l'app
console.log("Supabase Init:", supabaseUrl ? "URL OK" : "❌ URL MANQUANTE", supabaseAnonKey ? "KEY OK" : "❌ KEY MANQUANTE");

// Sécurité : empêcher l'app de crasher si les variables manquent
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Les variables d'environnement Supabase sont manquantes. Vérifie ton fichier .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
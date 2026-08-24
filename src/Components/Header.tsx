import React, { useContext } from "react"; // 🌟 AJOUT : useContext
import { FiSun, FiMoon } from "react-icons/fi"; // 🌟 AJOUT : Icônes
import { ThemeContext } from "../context/ThemeContext"; // 🌟 AJOUT : Context

export default function Header({
  onNavigate,
  current,
}: {
  onNavigate: (r: "home" | "login") => void;
  current: string;
}) {
  // 🌟 AJOUT : Récupération du Dark Mode
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Miwavo" className="h-10" />
        <span className="text-xl font-bold text-purple-600">miwavo</span>
      </div>

      <nav className="flex items-center gap-6">
        <button
          onClick={() => onNavigate("home")}
          className={`text-sm ${current === "home" ? "text-purple-600 font-semibold" : "text-gray-700"}`}
        >
          Accueil
        </button>
        <button
          onClick={() => onNavigate("login")}
          className={`text-sm ${current === "login" ? "text-purple-600 font-semibold" : "text-gray-700"}`}
        >
          Se connecter
        </button>

        {/* 🌟 NOUVEAU : BOUTON DARK MODE SUR LA PAGE DE CONNEXION */}
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle-btn"
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </nav>
    </header>
  );
}
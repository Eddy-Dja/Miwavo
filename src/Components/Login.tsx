import { FaGoogle, FaXTwitter } from "react-icons/fa6";

export default function Login() {
  return (
    <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-gray-200">
      
      {/* Onglets */}
      <div className="flex gap-6 mb-6 text-sm font-medium">
        <button className="text-[#6A00F4] border-b-2 border-[#6A00F4] pb-1">Connexion</button>
        <button className="text-gray-500">Créer un compte</button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Bon retour ! 👋</h2>
      <p className="text-gray-600 mb-6">Connecte-toi pour retrouver ta tribu</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Email ou nom d’utilisateur</label>
          <input
            type="text"
            placeholder="sofia@exemple.com"
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            className="w-full mt-1 p-3 border rounded-lg"
          />
          <p className="text-right text-sm text-[#6A00F4] mt-1 cursor-pointer">
            Mot de passe oublié ?
          </p>
        </div>

        <button className="w-full bg-gradient-to-r from-[#6A00F4] to-[#FF7A00] text-white p-3 rounded-lg font-semibold">
          Se connecter →
        </button>

        <div className="text-center text-gray-500">ou</div>

        <button className="w-full border p-3 rounded-lg flex items-center justify-center gap-3">
          <FaGoogle /> Continuer avec Google
        </button>

        <button className="w-full border p-3 rounded-lg flex items-center justify-center gap-3">
          <FaXTwitter /> Continuer avec X / Twitter
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Pas encore de compte ? <span className="text-[#6A00F4] cursor-pointer">Inscris-toi</span>
        </p>
      </div>

      <div className="flex justify-center gap-4 text-xs text-gray-400 mt-8">
        <button>Confidentialité</button>
        <button>Conditions</button>
        <button>Aide</button>
      </div>
    </div>
  );
}

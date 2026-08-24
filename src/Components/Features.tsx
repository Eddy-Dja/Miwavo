import { 
  FaSearch, 
  FaComments, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaRobot 
} from "react-icons/fa";

export default function Features() {
  const items = [
    { icon: <FaSearch className="text-[#6A00F4] text-xl" />, title: "Discover & Miwas", desc: "Découvre des profils compatibles et envoie des invitations chaleureuses." },
    { icon: <FaComments className="text-[#6A00F4] text-xl" />, title: "Mivos", desc: "Discussions privées et partage authentique avec tes connexions." },
    { icon: <FaUsers className="text-[#6A00F4] text-xl" />, title: "Communities", desc: "Rejoins des tribus autour de tes passions : sport, musique, voyage..." },
    { icon: <FaMapMarkerAlt className="text-[#6A00F4] text-xl" />, title: "Local", desc: "Événements et personnes près de chez toi, selon tes intérêts." },
    { icon: <FaRobot className="text-[#6A00F4] text-xl" />, title: "IA & Premium", desc: "Suggestions intelligentes, score de compatibilité et profils ultra-ciblés." },
  ];

  return (
    <div className="mt-10 space-y-6">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 items-start">
          {item.icon}
          <div>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

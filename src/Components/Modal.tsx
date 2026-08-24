// src/components/Modal.tsx
import { FiX } from 'react-icons/fi';
import './Modal.css'; // On mettra le CSS de la modale ici

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  themeColor?: string; // Pour le bouton dynamique
}

export default function Modal({ isOpen, onClose, title, children, themeColor }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Le style dynamique est injecté SEULEMENT ici, sur la boîte principale */}
      <div 
        className="modal-content-box" 
        style={{ '--theme-color': themeColor || '#7C3AED' } as React.CSSProperties} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn"><FiX /></button>
        </div>
        
        {/* C'est ici que le contenu spécifique de chaque page apparaîtra */}
        {children}
        
      </div>
    </div>
  );
}
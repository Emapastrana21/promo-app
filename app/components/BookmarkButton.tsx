'use client'

import { useState, useTransition } from "react"
import { toggleFavorite } from "../actions"
import toast from "react-hot-toast"

interface BookmarkProps {
  id: string
  initialIsSaved: boolean
}

export default function BookmarkButton({ id, initialIsSaved }: BookmarkProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navegar si está dentro de un link
    e.stopPropagation();

    // Optimistic UI (Cambia visualmente YA)
    const newState = !isSaved;
    setIsSaved(newState);

    if (newState) {
        toast.success("Guardado en favoritos", { icon: '🔖', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } else {
        toast("Eliminado de favoritos", { icon: '🗑️' });
    }

    startTransition(async () => {
        await toggleFavorite(id);
    });
  };

  return (
    <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`p-2 rounded-full transition-all active:scale-90 shadow-sm border ${
            isSaved 
            ? 'bg-yellow-100 text-yellow-600 border-yellow-200' 
            : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600'
        }`}
        title={isSaved ? "Quitar de guardados" : "Guardar oferta"}
    >
        {isSaved ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
        )}
    </button>
  )
}
'use client'

import { useState, useEffect } from "react"
import toast from "react-hot-toast" // Importamos la magia

export default function ShareBar({ title, id }: { title: string, id: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setUrl(`${window.location.origin}/oferta/${id}`);
    }
  }, [id]);

  const mensajeWhatsapp = `¡Mirá esta oferta! 🔥\n${title}\n👉 ${url}`;
  const linkWhatsapp = `https://wa.me/?text=${encodeURIComponent(mensajeWhatsapp)}`;

  const copiarLink = () => {
    navigator.clipboard.writeText(url);
    // LANZAMOS LA NOTIFICACIÓN
    toast.success("¡Link copiado al portapapeles!", {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
        icon: '🔗',
    });
  };

  return (
    <div className="flex gap-2 mt-4 w-full">
        {/* BOTÓN WHATSAPP */}
        <a 
            href={linkWhatsapp} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-200"
        >
            <span className="text-xl">📲</span>
            Compartir
        </a>

        {/* BOTÓN COPIAR LINK */}
        <button 
            onClick={copiarLink}
            className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200 hover:bg-gray-50 active:scale-95"
        >
            <span>🔗</span>
            Copiar Link
        </button>
    </div>
  )
}
'use client'

import { votar } from "../actions"
import { useState, useTransition } from "react"

export default function VoteButton({ id, votos }: { id: string, votos: number }) {
  const [count, setCount] = useState(votos);
  const [isPending, startTransition] = useTransition();
  const [voted, setVoted] = useState(false); // Para marcarlo como votado

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault(); // Para que no abra el link de la tarjeta si está dentro de uno
    e.stopPropagation();

    if (voted) return; // Evita doble voto simple (en el futuro lo haremos con base de datos)

    // Actualización Optimista (Visualmente cambia YA)
    setCount(count + 1);
    setVoted(true);

    // Llamada al servidor en segundo plano
    startTransition(async () => {
        await votar(id);
    });
  };

  return (
    <button 
        onClick={handleVote}
        disabled={isPending || voted}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
            voted 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-white text-gray-500 border-gray-200 hover:scale-105 hover:bg-gray-50'
        }`}
    >
        <span className={`text-sm ${voted ? 'scale-125' : ''} transition-transform`}>
            {voted ? '👏' : '👍'}
        </span>
        <span>{count}</span>
    </button>
  )
}
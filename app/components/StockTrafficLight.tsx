'use client'

import { useState, useTransition } from "react"
import { reportarStock } from "../actions"
import toast from "react-hot-toast"

interface StockProps {
  offerId: string
  initialUserReport: string | null // 'YES' | 'NO' | null
  yesCount: number
  noCount: number
}

export default function StockTrafficLight({ offerId, initialUserReport, yesCount, noCount }: StockProps) {
  const [userVote, setUserVote] = useState(initialUserReport);
  const [isPending, startTransition] = useTransition();

  // Contadores visuales (para que cambie el número al instante)
  const [optimisticYes, setOptimisticYes] = useState(yesCount);
  const [optimisticNo, setOptimisticNo] = useState(noCount);

  const handleVote = (status: 'YES' | 'NO') => {
    if (userVote === status) return; // Si ya votó lo mismo, no hacemos nada

    // Actualizamos visualmente YA (Optimistic UI)
    const anterior = userVote;
    setUserVote(status);
    
    if (status === 'YES') {
        setOptimisticYes(prev => prev + 1);
        if (anterior === 'NO') setOptimisticNo(prev => prev - 1);
        toast.success("¡Gracias! Confirmaste que hay stock ✅", { icon: '📦' });
    } else {
        setOptimisticNo(prev => prev + 1);
        if (anterior === 'YES') setOptimisticYes(prev => prev - 1);
        toast("Reportaste que NO hay stock ❌", { icon: '🥀' });
    }

    // Llamamos al servidor en segundo plano
    startTransition(async () => {
        await reportarStock(offerId, status);
    });
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-6 shadow-inner">
        <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl">🚦</span>
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">
                Reporte de Stock
            </h3>
        </div>
        
        <div className="flex gap-3">
            {/* BOTÓN SÍ HAY (VERDE) */}
            <button
                onClick={() => handleVote('YES')}
                disabled={isPending}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    userVote === 'YES' 
                    ? 'bg-green-100 border-green-500 text-green-700 shadow-md transform scale-105' 
                    : 'bg-white border-gray-200 text-gray-400 hover:border-green-300 hover:bg-green-50'
                }`}
            >
                <span className="text-2xl mb-1">✅</span>
                <span className="font-black text-2xl">{optimisticYes}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Hay Stock</span>
            </button>

            {/* BOTÓN NO HAY (ROJO) */}
            <button
                onClick={() => handleVote('NO')}
                disabled={isPending}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    userVote === 'NO' 
                    ? 'bg-red-100 border-red-500 text-red-700 shadow-md transform scale-105' 
                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:bg-red-50'
                }`}
            >
                <span className="text-2xl mb-1">🚫</span>
                <span className="font-black text-2xl">{optimisticNo}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Agotado</span>
            </button>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
            {userVote 
                ? "¡Gracias por colaborar con la comunidad!" 
                : "¿Estás en el local? ¡Ayudanos a confirmar!"}
        </p>
    </div>
  )
}
'use client'

import { useState } from "react"
import { denunciarOferta } from "../actions"
import toast from "react-hot-toast"

export default function ReportButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReport = async (reason: string) => {
    setIsLoading(true);
    const res = await denunciarOferta(id, reason);
    setIsLoading(false);
    setIsOpen(false);

    if (res?.error) {
        toast.error("Ya enviaste un reporte.");
    } else {
        toast.success("Denuncia enviada. Gracias. 🛡️");
    }
  };

  return (
    <div className="relative inline-block">
        {/* BOTÓN BIEN VISIBLE (ROJO) */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-colors border border-red-200"
        >
            🚩 Denunciar Oferta
        </button>

        {/* MENÚ DESPLEGABLE */}
        {isOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 animate-fadeIn">
                <p className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Motivo:</p>
                <div className="flex flex-col gap-1">
                    <button onClick={() => handleReport('scam')} disabled={isLoading} className="text-left text-xs p-3 hover:bg-red-50 text-red-600 rounded-lg font-bold">
                        ⚠️ Es una estafa / Virus
                    </button>
                    <button onClick={() => handleReport('fake')} disabled={isLoading} className="text-left text-xs p-3 hover:bg-gray-100 text-gray-700 rounded-lg">
                        🤡 Precio falso
                    </button>
                    <button onClick={() => handleReport('stock')} disabled={isLoading} className="text-left text-xs p-3 hover:bg-gray-100 text-gray-700 rounded-lg">
                        📦 Nunca hubo stock
                    </button>
                </div>
            </div>
        )}
        
        {/* Fondo transparente para cerrar clic afuera */}
        {isOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        )}
    </div>
  )
}
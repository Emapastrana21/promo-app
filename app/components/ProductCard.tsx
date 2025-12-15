"use client";

import { useState } from "react";
import { toggleFavorite } from "../actions"; 
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProductCard({ offer, currentUserId }: { offer: any, currentUserId?: string }) {
  // 👇 CORREGIDO: Agregamos <number> para que TypeScript no se queje en 'prev'
  const [likesCount, setLikesCount] = useState<number>(offer.votes_count || 0);

  const isLikedInitial = offer.favoritedBy?.some((f: any) => f.userId === currentUserId);
  const [isLiked, setIsLiked] = useState(isLikedInitial);

  // Determinar si es oferta HOT (+10 votos)
  const isHot = likesCount >= 10;
  
  // Determinar si es Online o Física
  const isOnline = offer.link && offer.link.startsWith("http");

  async function handleLike() {
    if (!currentUserId) {
        toast.error("Iniciá sesión para guardar favoritos ❤️");
        return;
    }
    
    // Actualizamos visualmente YA (sin esperar al servidor)
    const nuevoEstado = !isLiked;
    setIsLiked(nuevoEstado);
    
    // 👇 Ahora 'prev' ya sabe que es un número
    setLikesCount(prev => nuevoEstado ? prev + 1 : prev - 1);
    
    // Llamamos al servidor en segundo plano
    await toggleFavorite(offer.id);
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col overflow-hidden relative">
        
        {/* 1. IMAGEN Y BADGES */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Link href={`/oferta/${offer.id}`} className="block w-full h-full">
                {offer.image_url ? (
                    <img 
                        src={offer.image_url} 
                        alt={offer.title} 
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                )}
            </Link>

            {/* Badges Flotantes */}
            <div className="absolute top-2 left-2 flex gap-1 z-10">
                {isHot && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                        🔥 HOT
                    </span>
                )}
                {isOnline ? (
                    <span className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        💻 ONLINE
                    </span>
                ) : (
                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        🏪 LOCAL
                    </span>
                )}
            </div>

            {/* Botón de Like Flotante */}
            <button 
                onClick={(e) => { e.preventDefault(); handleLike(); }}
                className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg group-hover:opacity-100 z-20"
            >
                <span className={`text-lg block transition-transform ${isLiked ? "scale-110" : "scale-100"}`}>
                    {isLiked ? "❤️" : "🤍"}
                </span>
            </button>
        </div>

        {/* 2. CONTENIDO */}
        <div className="p-4 flex flex-col flex-1">
            {/* Tienda y Categoría */}
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span className="font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider text-[10px]">
                    {offer.stores?.name || "Tienda"}
                </span>
                <span>{offer.categories?.name}</span>
            </div>

            {/* Título */}
            <Link href={`/oferta/${offer.id}`} className="block mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-purple-500 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {offer.title}
                </h3>
            </Link>

            {/* Precio */}
            <div className="mt-auto pt-2 flex items-end justify-between border-t border-gray-100 dark:border-gray-700">
                <div>
                    {Number(offer.original_price) > 0 && (
                        <span className="text-xs text-gray-400 line-through block">
                            ${Number(offer.original_price).toLocaleString("es-AR")}
                        </span>
                    )}
                    <div className="text-xl font-black text-green-600 dark:text-green-400">
                        ${Number(offer.price).toLocaleString("es-AR")}
                    </div>
                </div>
                
                {/* Botón Ver (Solo aparece al pasar el mouse en Desktop) */}
                <Link 
                    href={offer.link || `/oferta/${offer.id}`}
                    target={offer.link ? "_blank" : "_self"}
                    className="bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                >
                    VER ↗
                </Link>
            </div>
        </div>

        {/* 3. FOOTER (Usuario) */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                {offer.users?.image ? (
                    <img src={offer.users.image} alt="User" className="w-5 h-5 rounded-full" />
                ) : (
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">👤</span>
                )}
                <span className="truncate max-w-[80px]">{offer.users?.name?.split(' ')[0] || "Anónimo"}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 font-bold">
                <span>🔥 {likesCount}</span>
            </div>
        </div>
    </div>
  );
}
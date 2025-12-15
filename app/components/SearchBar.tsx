'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Inicializamos con lo que ya haya en la URL (para que no se borre al refrescar)
  const [term, setTerm] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault() // Evita que la página recargue completa
    
    // Creamos la nueva URL
    const params = new URLSearchParams(searchParams.toString())
    
    if (term) {
      params.set("q", term) // ?q=loqueescribiste
    } else {
      params.delete("q") // Si borró todo, quitamos el filtro
    }
    
    // Navegamos a la nueva URL
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-lg mx-auto relative group">
        <input 
            type="text" 
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="🔍 Buscá 'Coca Cola', 'Zapatillas'..." 
            className="w-full p-4 pl-6 rounded-full border border-gray-200 shadow-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all text-gray-700 placeholder-gray-400 bg-white"
        />
        <button 
            type="submit"
            className="absolute right-2 top-2 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-md active:scale-95"
        >
            Buscar
        </button>
    </form>
  )
}
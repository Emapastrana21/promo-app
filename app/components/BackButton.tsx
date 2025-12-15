'use client'

import { useRouter } from "next/navigation"

export default function BackButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()} 
      className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
      title="Volver atrás"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  )
}
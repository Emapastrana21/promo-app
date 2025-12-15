"use client";

import { useState } from "react";
import { registrarUsuario } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    
    const res = await registrarUsuario(formData);
    
    setIsSubmitting(false);

    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success("¡Cuenta creada! Ahora iniciá sesión.");
        router.push("/api/auth/signin"); // Redirigir al login
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Crear Cuenta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Sumate a la comunidad de ofertas</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
            
            {/* NOMBRE */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input 
                    name="name" 
                    type="text" 
                    placeholder="Ej: Juan Perez"
                    required
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* EMAIL */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input 
                    name="email" 
                    type="email" 
                    placeholder="juan@email.com"
                    required
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* PASSWORD */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                <input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
                {isSubmitting ? "Creando..." : "Registrarme 🚀"}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link href="/api/auth/signin" className="text-purple-600 font-bold hover:underline">
                Iniciar Sesión
            </Link>
        </div>

      </div>
    </div>
  );
}
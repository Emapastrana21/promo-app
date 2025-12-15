"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Login con Email y Contraseña
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Datos incorrectos ❌");
    } else {
      toast.success("¡Bienvenido! 👋");
      router.push("/"); // Ir al inicio
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        
        <div className="text-center mb-8">
            <span className="text-4xl mb-2 block">🔥</span>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Iniciar Sesión</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">¡Hola de nuevo! Te extrañamos.</p>
        </div>

        {/* BOTÓN GOOGLE */}
        <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all mb-6"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Entrar con Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">O con tu email</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* FORMULARIO EMAIL */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input name="email" type="email" placeholder="vos@email.com" required className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                <input name="password" type="password" placeholder="••••••••" required className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? "Entrando..." : "Ingresar 🚀"}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-purple-600 font-bold hover:underline">
                Crear cuenta gratis
            </Link>
        </div>

      </div>
    </div>
  );
}
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../lib/db";
import { enviarAlertaMasiva } from "../actions";

export default async function AdminDashboard() {
  const session = await auth();
  const ADMIN_EMAIL = "emapastri@gmail.com";

  if (session?.user?.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // 1. OBTENEMOS DATOS REALES DE LA BASE DE DATOS
  const usersCount = await prisma.user.count();
  // Si todavía no tenés tabla de ofertas, dejá esto en 0 o descomentalo cuando exista
  // const offersCount = await prisma.offer.count(); 
  const offersCount = await prisma.offers.count(); 

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 pb-24 transition-colors">
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER CON BOTÓN DE SALIR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              👮‍♂️ Panel de Control
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Bienvenido, Comandante. Aquí tenés el control total.</p>
          </div>
          <Link 
            href="/configuracion" 
            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm"
          >
            ← Volver a Configuración
          </Link>
        </div>

        {/* 📊 SECCIÓN 1: ESTADÍSTICAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card Usuarios */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">👥</div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Usuarios Totales</div>
            <div className="text-4xl font-black text-gray-900 dark:text-white">{usersCount}</div>
            <div className="mt-4">
                <Link href="/admin/usuarios" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Gestionar Usuarios →</Link>
            </div>
          </div>

          {/* Card Ofertas */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏷️</div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Ofertas Publicadas</div>
            <div className="text-4xl font-black text-gray-900 dark:text-white">{offersCount}</div>
            <div className="mt-4">
                <Link href="/admin/ofertas" className="text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline">Moderar Ofertas →</Link>
            </div>
          </div>
        </div>

        {/* 🚀 SECCIÓN 2: TU FORMULARIO DE ALERTAS (Ahora integrado) */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 shadow-xl border border-gray-700 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-red-500/20 text-red-400 p-2 rounded-lg text-2xl">📢</span>
                    <div>
                        <h2 className="text-xl font-bold">Enviar Alerta Masiva</h2>
                        <p className="text-gray-400 text-sm">Cuidado: Esto le llega a todos los usuarios registrados.</p>
                    </div>
                </div>

                {/* Tu código original del formulario va acá */}
                <form 
                    action={async (formData) => {
                        "use server";
                        const mensaje = formData.get("mensaje") as string;
                        const url = formData.get("url") as string;
                        await enviarAlertaMasiva(mensaje, url);
                    }}
                    className="flex flex-col md:flex-row gap-4 items-end"
                >
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Mensaje</label>
                        <input 
                            name="mensaje" 
                            type="text"
                            placeholder="Ej: ¡Bug de precio en Smart TV!"
                            className="w-full bg-gray-950/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
                            required
                        />
                    </div>

                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Link (Opcional)</label>
                        <input 
                            name="url" 
                            type="text"
                            placeholder="/oferta/..."
                            defaultValue="/"
                            className="w-full bg-gray-950/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        🚀 Enviar
                    </button>
                </form>
            </div>
            
            {/* Decoración de fondo */}
            <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 rotate-12">📢</div>
        </div>

      </div>
    </div>
  );
}
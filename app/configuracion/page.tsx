import { auth, signOut } from "@/auth";
import Link from "next/link";
import SubscribeButton from "../components/SubscribeButton";
import UserBadge from "../components/UserBadge";
import BackButton from "../components/BackButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { prisma } from "../lib/db";
import { actualizarPerfil } from "../actions";

const ZONAS = [
    "CABA - Capital Federal",
    "GBA Norte",
    "GBA Sur",
    "GBA Oeste",
    "La Plata",
    "Costa Atlántica",
    "Córdoba",
    "Santa Fe / Rosario",
    "Mendoza",
    "Resto del País"
];

export default async function ConfiguracionPage() {
  const session = await auth();

  let usuario = null;
  if (session?.user?.email) {
      usuario = await prisma.user.findUnique({ where: { email: session.user.email } });
  }
  const puntos = usuario?.points || 0;
  const zonaActual = usuario?.location || "";

  return (
    <main className="min-h-screen p-6 pb-24 transition-colors duration-300">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Configuración</h1>
      </div>

      {session?.user ? (
          <div className="space-y-6 animate-fadeIn">

              {/* TARJETA DE PERFIL - RESTAURADA */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
                  {session.user.image ? (
                      <img src={session.user.image} className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700" alt="Perfil" />
                  ) : (
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {session.user.name?.[0]}
                      </div>
                  )}
                  <div>
                      <h2 className="font-bold text-lg text-gray-900 dark:text-white">{session.user.name}</h2>
                      <div className="flex items-center gap-2">
                        <UserBadge points={puntos} />
                        <span className="text-xs text-gray-400 font-medium">{puntos} pts</span>
                      </div>
                  </div>
              </div>

              {/* SECCIÓN: MI ZONA - RESTAURADA */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-5 transition-colors">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      📍 Mi Zona
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Seleccioná tu zona para ver ofertas cerca.</p>

                  <form action={actualizarPerfil} className="flex gap-2">
                      <div className="relative flex-1">
                          <select
                              name="location"
                              defaultValue={zonaActual}
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 appearance-none transition-colors"
                          >
                              <option value="" disabled>Seleccionar zona...</option>
                              {ZONAS.map(z => (
                                  <option key={z} value={z}>{z}</option>
                              ))}
                          </select>
                      </div>
                      <button type="submit" className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                          Guardar
                      </button>
                  </form>
                  {zonaActual && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold">✅ Zona actual: {zonaActual}</p>
                  )}
              </div>

              {/* SECCIÓN: PREFERENCIAS - RESTAURADA */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">

                  {/* ALERTAS */}
                  <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">🔔 Alertas</span>
                      <SubscribeButton />
                  </div>

                  {/* MODO OSCURO */}
                  <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">🌙 Modo Oscuro</span>
                      <ThemeSwitch />
                  </div>

                  {/* LINK AL PERFIL PÚBLICO */}
                  <Link href="/perfil" className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">👤 Ver mi Perfil Público</span>
                      <span className="text-gray-400">→</span>
                  </Link>

                  {/* ADMIN PANEL */}
                  {session.user.email === "emapastri@gmail.com" && (
                      <Link href="/admin" className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="font-bold text-purple-600 flex items-center gap-2">👮‍♂️ Panel de Admin</span>
                          <span className="text-purple-400">→</span>
                      </Link>
                  )}
              </div>

              {/* CERRAR SESIÓN - RESTAURADO */}
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                  <button className="w-full bg-white dark:bg-transparent border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
                      Cerrar Sesión
                  </button>
              </form>

              <div className="text-center text-xs text-gray-400 mt-8">
                  PromoApp v1.2 • Configuración
              </div>

          </div>
      ) : (
          <div className="text-center py-20">
              <div className="text-6xl mb-4">🔐</div>
              <p className="mb-6 text-gray-500 dark:text-gray-400">Inicia sesión para ver tus ajustes y nivel.</p>
              <Link href="/api/auth/signin" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform inline-block">
                  Ingresar
              </Link>
          </div>
      )}
    </main>
  );
}
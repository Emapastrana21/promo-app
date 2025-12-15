import { prisma } from "@/app/lib/db";
import { auth, signOut } from "@/auth"; 
import { redirect } from "next/navigation";
import Link from "next/link";
import UserBadge from "@/app/components/UserBadge"; 
import BackButton from "@/app/components/BackButton";
import ProductCard from "@/app/components/ProductCard"; 

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // 1. Buscamos usuario con todos sus datos "Crudos"
  const usuarioRaw = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        favorites: {
            include: {
                offer: {
                    include: { stores: true, categories: true, users: true, favoritedBy: true }
                }
            },
            orderBy: { createdAt: "desc" }
        }, 
        offers: {
            include: { stores: true, categories: true, users: true, favoritedBy: true },
            orderBy: { created_at: "desc" }
        }
      }
  });

  if (!usuarioRaw) return <div>Usuario no encontrado</div>;

  // 2. 🪄 TRANSFORMACIÓN MÁGICA (Arregla el error de Decimal)
  // Convertimos las ofertas del usuario
  const misOfertas = usuarioRaw.offers.map(oferta => ({
      ...oferta,
      price: oferta.price.toNumber(),
      original_price: oferta.original_price ? oferta.original_price.toNumber() : 0,
  }));

  // Convertimos los favoritos (que tienen la oferta anidada)
  const misFavoritos = usuarioRaw.favorites.map(fav => ({
      ...fav,
      offer: {
          ...fav.offer,
          price: fav.offer.price.toNumber(),
          original_price: fav.offer.original_price ? fav.offer.original_price.toNumber() : 0,
      }
  }));

  const totalOfertas = misOfertas.length;
  const totalPuntos = usuarioRaw.points || 0; 
  const totalGuardados = misFavoritos.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-black p-4 md:p-8 pb-24 transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BackButton />
                <h1 className="text-xl font-black text-gray-800 dark:text-white">Mi Perfil</h1>
            </div>
            
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <button className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors">
                    Cerrar Sesión 🚪
                </button>
            </form>
        </div>

        {/* HEADER PERFIL */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8 justify-between transition-colors relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                <div className="relative group">
                    {session.user.image ? (
                        <img src={session.user.image} alt="Perfil" className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-600 shadow-2xl object-cover" />
                    ) : (
                        <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-white dark:border-gray-600 shadow-2xl">
                            {session.user.name?.[0] || "U"}
                        </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-sm" title="Online"></div>
                </div>
                
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-2 justify-center md:justify-start tracking-tight">
                        {session.user.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">{session.user.email}</p>
                    <UserBadge points={totalPuntos} />
                </div>
            </div>

            <div className="flex gap-4 z-10">
                <div className="bg-white/60 dark:bg-gray-700/60 p-5 rounded-2xl border border-white/50 dark:border-gray-600 text-center min-w-[110px] shadow-sm hover:scale-105 transition-transform">
                    <span className="block text-3xl font-black text-gray-900 dark:text-white">{totalOfertas}</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Aportes</span>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 p-5 rounded-2xl border border-white/50 dark:border-gray-600 text-center min-w-[110px] shadow-sm hover:scale-105 transition-transform">
                    <span className="block text-3xl font-black text-purple-600 dark:text-purple-400">{totalPuntos}</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Puntos</span>
                </div>
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid lg:grid-cols-1 gap-12">
            
            {/* SECCIÓN 1: MIS PUBLICACIONES */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        📤 Mis Aportes <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-1 px-2 rounded-full">{totalOfertas}</span>
                    </h2>
                    <Link href="/subir" className="text-purple-600 font-bold hover:underline text-sm">
                        + Nueva Oferta
                    </Link>
                </div>

                {misOfertas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {misOfertas.map((oferta) => (
                            <ProductCard 
                                key={oferta.id} 
                                offer={oferta} 
                                currentUserId={session.user?.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="text-5xl mb-3 grayscale opacity-50">👻</div>
                        <h3 className="font-bold text-gray-600 dark:text-gray-300 text-lg">Tu historial está vacío</h3>
                        <p className="text-gray-500 text-sm mb-6">¡Animate a subir tu primera oferta y ganá puntos!</p>
                        <Link href="/subir" className="bg-black dark:bg-white dark:text-black text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                            Subir Oferta 🚀
                        </Link>
                    </div>
                )}
            </section>

            {/* SECCIÓN 2: GUARDADOS */}
            <section>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    🔖 Guardados <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-1 px-2 rounded-full">{totalGuardados}</span>
                </h2>

                {misFavoritos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {misFavoritos.map((fav) => (
                            <ProductCard 
                                key={fav.offerId} 
                                offer={fav.offer} 
                                currentUserId={session.user?.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 bg-white/40 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center text-gray-500 dark:text-gray-400">
                        No tenés favoritos guardados todavía. Buscá el corazón ❤️ en las ofertas.
                    </div>
                )}
            </section>

        </div>
      </div>
    </main>
  );
}
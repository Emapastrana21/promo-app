import { prisma } from "./lib/db";
import Link from "next/link";
import { auth } from "@/auth"; 
import { signOut } from "@/auth"; 
import SearchBar from "./components/SearchBar";
import SubscribeButton from "./components/SubscribeButton";
import ProductCard from "./components/ProductCard"; // 👈 Tu nueva tarjeta

export const dynamic = "force-dynamic"; 

const CATEGORIAS_RAPIDAS = [
    { name: "Almacén", emoji: "🥫" },
    { name: "Bebidas", emoji: "🥤" },
    { name: "Farmacia", emoji: "💊" },
    { name: "Indumentaria", emoji: "👕" },
    { name: "Electrónica", emoji: "🔌" },
    { name: "Hogar", emoji: "🏠" },
    { name: "Varios", emoji: "📦" },
];

const BANCOS_POPULARES = [
    { name: "Cuenta DNI", color: "bg-green-100 text-green-700 border-green-200" },
    { name: "Mercado Pago", color: "bg-blue-100 text-blue-600 border-blue-200" },
    { name: "Banco Galicia", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { name: "Banco Santander", color: "bg-red-100 text-red-700 border-red-200" },
    { name: "MODO", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { name: "BBVA", color: "bg-blue-50 text-blue-800 border-blue-200" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string; payment?: string }> }) {
  const session = await auth();
  const { q, category, sort, payment } = await searchParams;

  const where: any = {};
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (category) where.categories = { name: category };
  if (payment) {
      where.paymentMethods = { some: { name: payment } };
  }

  let orderBy: any = { created_at: "desc" }; 
  if (sort === "popular") orderBy = { votes_count: "desc" }; 

  // 1. Buscamos los datos "Crudos" (Raw) de la base de datos
  const ofertasRaw = await prisma.offers.findMany({
    where,
    orderBy,
    include: { 
        categories: true, 
        stores: true, 
        users: true, 
        paymentMethods: true,
        favoritedBy: true 
    },
  });

  // 2. TRANSFORMACIÓN MÁGICA 🪄
  // Convertimos los "Decimal" de Prisma a números normales de JavaScript
  // para que Next.js no tire error al pasarlos al componente cliente.
  const ofertas = ofertasRaw.map((oferta) => ({
      ...oferta,
      price: oferta.price.toNumber(),
      original_price: oferta.original_price ? oferta.original_price.toNumber() : 0,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-black transition-colors duration-300 pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <Link href="/" className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:opacity-80">
                    Promo<span className="text-purple-600">App</span>
                </Link>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:block">
                    <SubscribeButton />
                </div>
                {session?.user ? (
                    <div className="flex items-center gap-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-full pl-1 pr-4 py-1 border border-gray-200 dark:border-gray-700">
                        <Link href="/perfil" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                            {session.user.image ? (
                                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {session.user.name?.[0] || "U"}
                                </div>
                            )}
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden md:block">
                                {session.user.name}
                            </span>
                        </Link>
                        <form action={async () => { "use server"; await signOut(); }}>
                            <button className="text-xs text-red-500 hover:text-red-700 font-bold ml-2">Salir</button>
                        </form>
                    </div>
                ) : (
                    <Link href="/api/auth/signin" className="text-sm font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg">
                        Iniciar Sesión
                    </Link>
                )}
            </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="md:hidden mb-6 flex justify-center">
            <SubscribeButton />
        </div>

        {/* TITULOS Y FILTROS */}
        <div className="text-center mb-8 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tight">
                Encontrá las mejores <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Ofertas de la Comunidad</span>
            </h2>
            <SearchBar />
            
            {/* FILTRO TIPO */}
            <div className="flex flex-wrap justify-center gap-2">
                 <Link href="/" className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!sort && !payment && !category ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'}`}>
                    🏠 Todo
                 </Link>
                 <Link href="/?sort=popular" className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sort === 'popular' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'}`}>
                    🔥 Populares
                 </Link>
            </div>

            {/* FILTRO BANCOS */}
            <div className="flex flex-wrap justify-center gap-2">
                {BANCOS_POPULARES.map((banco) => (
                    <Link 
                        key={banco.name} 
                        href={`/?payment=${banco.name}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}`} 
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            payment === banco.name 
                            ? 'ring-2 ring-offset-1 ring-gray-400 opacity-100 ' + banco.color 
                            : 'bg-white text-gray-500 border-gray-200 opacity-70 hover:opacity-100 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                    >
                        {banco.name}
                    </Link>
                ))}
            </div>

            {/* FILTRO CATEGORÍAS */}
            <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIAS_RAPIDAS.map((cat) => (
                    <Link key={cat.name} href={`/?category=${cat.name}${sort ? `&sort=${sort}` : ''}${payment ? `&payment=${payment}` : ''}`} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${category === cat.name ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:border-purple-500'}`}>
                        <span>{cat.emoji}</span> {cat.name}
                    </Link>
                ))}
            </div>
            
            {(category || sort || payment) && (
                <Link href="/" className="inline-block px-3 py-1.5 text-xs text-red-500 font-bold hover:underline">
                    ✕ Limpiar Filtros
                </Link>
            )}
        </div>

        {/* LISTA DE OFERTAS (GRILLA) */}
        {ofertas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                {ofertas.map((oferta) => (
                    <ProductCard 
                        key={oferta.id} 
                        offer={oferta} 
                        currentUserId={session?.user?.id}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 opacity-50">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No encontramos ofertas</h3>
                <Link href="/" className="mt-4 inline-block text-purple-600 dark:text-purple-400 font-bold hover:underline">Ver todas</Link>
            </div>
        )}
      </div>
    </main>
  );
}
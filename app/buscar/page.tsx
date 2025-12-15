import { prisma } from "../lib/db";
import SearchBar from "../components/SearchBar";
import BackButton from "../components/BackButton";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function BuscarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const session = await auth();

  const where: any = {};
  if (q) {
      where.title = { contains: q, mode: 'insensitive' };
  }

  const ofertas = await prisma.offers.findMany({
    where,
    orderBy: q ? { created_at: "desc" } : { votes_count: "desc" },
    take: 20,
    include: { stores: true, users: true }
  });

  return (
    // AGREGADO: dark:bg-gray-900 y transition-colors
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-24 transition-colors duration-300">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2 transition-colors">
            <div className="flex items-center gap-2">
                <BackButton />
                {/* AGREGADO: dark:text-white */}
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Explorar</h1>
            </div>
            <SearchBar />
        </div>

        {/* LISTA DE RESULTADOS */}
        <div className="space-y-4">
            {ofertas.length > 0 ? (
                ofertas.map((oferta) => (
                    <Link key={oferta.id} href={`/oferta/${oferta.id}`} className="block">
                        {/* AGREGADO: dark:bg-gray-800 dark:border-gray-700 */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 hover:shadow-md transition-all">
                            
                            {/* FOTO */}
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                {oferta.image_url ? (
                                    <img src={oferta.image_url} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                ) : (
                                    <span className="text-2xl">📷</span>
                                )}
                            </div>
                            
                            {/* INFO */}
                            <div className="flex-1">
                                {/* AGREGADO: dark:text-gray-100 */}
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{oferta.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{oferta.stores?.name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-green-600 dark:text-green-400">${Number(oferta.price).toLocaleString("es-AR")}</span>
                                    <div className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        🔥 {oferta.votes_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p>No encontramos nada con "{q}"</p>
                </div>
            )}
        </div>
    </main>
  )
}
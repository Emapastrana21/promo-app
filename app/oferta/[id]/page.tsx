import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";
import VoteButton from "@/app/components/VoteButton";
import ShareBar from "@/app/components/ShareBar";
import StockTrafficLight from "@/app/components/StockTrafficLight"; 
import ReportButton from "@/app/components/ReportButton";
import BackButton from "@/app/components/BackButton"; 
import { comentarOferta, alternarStock, borrarOferta } from "@/app/actions"; 
import { redirect } from "next/navigation";
import Link from "next/link";
import UserBadge from "@/app/components/UserBadge";

export default async function DetalleOferta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const oferta = await prisma.offers.findUnique({
    where: { id },
    include: { 
        stores: true, 
        users: true, 
        categories: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        stockReports: true, 
        paymentMethods: true 
    }
  });

  if (!oferta) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium dark:bg-gray-900 dark:text-gray-400">Oferta no encontrada 😢</div>;

  const ADMINS = ["emapastri@gmail.com"];
  const esDueño = session?.user?.email === oferta.users?.email;
  const esAdmin = session?.user?.email && ADMINS.includes(session.user.email);
  const puedeEditar = esDueño || esAdmin; 

  const estaAgotada = oferta.status === 'expired';
  const tieneUbicacion = oferta.latitude && oferta.longitude;
  const linkMapa = `https://www.google.com/maps/search/?api=1&query=${oferta.latitude},${oferta.longitude}`;

  const yesCount = oferta.stockReports.filter(r => r.status === 'YES').length;
  const noCount = oferta.stockReports.filter(r => r.status === 'NO').length;
  
  let miReporte: string | null = null;
  if (session?.user?.email) {
      const yo = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (yo) {
          const reporte = oferta.stockReports.find(r => r.userId === yo.id);
          if (reporte) miReporte = reporte.status;
      }
  }

  const banco = oferta.paymentMethods?.[0]?.name;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-black p-4 md:p-8 flex flex-col items-center gap-6 pb-24 transition-colors duration-300">
      
      {/* TARJETA PRINCIPAL */}
      <div className="relative w-full max-w-3xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 shadow-2xl rounded-3xl overflow-hidden animate-fadeIn transition-colors">
        
        {/* BOTÓN VOLVER FLOTANTE */}
        <div className="absolute top-4 left-4 z-30 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md p-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600">
            <BackButton />
        </div>

        {/* FOTO */}
        {oferta.image_url ? (
          <div className="w-full h-96 bg-gray-100 dark:bg-gray-900 relative group overflow-hidden flex items-center justify-center">
            <img 
                src={oferta.image_url} 
                alt={oferta.title} 
                className={`w-full h-full object-contain p-4 transition-transform duration-700 ${estaAgotada ? 'grayscale opacity-60' : 'group-hover:scale-110'}`}
            />
            {estaAgotada && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                    <span className="bg-red-600 text-white font-black text-3xl md:text-5xl uppercase px-8 py-4 rounded-2xl transform -rotate-12 shadow-2xl border-4 border-white">
                        🚫 Agotado
                    </span>
                </div>
            )}
            {!estaAgotada && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                    <span className="bg-black/70 backdrop-blur-md text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider shadow-lg border border-white/20">
                        {oferta.categories?.name || "Oferta"}
                    </span>
                    {banco && (
                        <span className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider shadow-lg border border-white/20">
                            💳 {banco}
                        </span>
                    )}
                </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold">Sin Imagen</div>
        )}

        <div className="p-8 md:p-10 relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
             <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2 ${estaAgotada ? 'text-gray-400 dark:text-gray-600 line-through decoration-red-500 decoration-4' : 'text-gray-900 dark:text-white'}`}>
                    {oferta.title}
                </h1>
                
                {estaAgotada && <p className="text-red-500 font-bold text-lg mb-2">⛔ Esta oferta ya finalizó.</p>}

                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg">
                        🛒 {oferta.stores?.name || "Tienda desconocida"}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <div className="flex items-center gap-2">
                        <span>Subido por {oferta.users?.name?.split(' ')[0]}</span>
                        <UserBadge points={oferta.users?.points || 0} />
                    </div>
                </div>
             </div>
             
             <div className={`flex flex-row md:flex-col items-center md:items-end gap-3 p-4 rounded-2xl border shadow-sm ${estaAgotada ? 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700' : 'bg-green-50/80 border-green-100 dark:bg-green-900/20 dark:border-green-800'}`}>
                <p className={`text-5xl font-black tracking-tighter drop-shadow-sm ${estaAgotada ? 'text-gray-400 dark:text-gray-600' : 'text-green-600 dark:text-green-400'}`}>
                    ${Number(oferta.price).toLocaleString('es-AR')}
                </p>
                <VoteButton id={oferta.id} votos={oferta.votes_count || 0} />
             </div>
          </div>

          {!estaAgotada && (
              <StockTrafficLight 
                  offerId={oferta.id} 
                  yesCount={yesCount} 
                  noCount={noCount} 
                  initialUserReport={miReporte} 
              />
          )}

          <hr className="border-gray-200/60 dark:border-gray-700 my-8" />

          {/* BOTONES DE ACCIÓN */}
          <div className="grid gap-4">
            {!estaAgotada ? (
                <>
                    {oferta.link && (
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[2px] shadow-lg transition-all hover:shadow-purple-500/30 hover:-translate-y-1">
                            <div className="bg-white dark:bg-gray-800 rounded-[14px] p-5 h-full flex items-center justify-between group-hover:bg-opacity-95 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-2xl">🌐</div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Disponible Online</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ir a la web oficial</p>
                                    </div>
                                </div>
                                <a href={oferta.link} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2">
                                    Comprar Ahora ↗
                                </a>
                            </div>
                        </div>
                    )}

                    {!oferta.link && tieneUbicacion && (
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-[2px] shadow-lg transition-all hover:shadow-blue-500/30 hover:-translate-y-1">
                            <div className="bg-white dark:bg-gray-800 rounded-[14px] p-5 h-full flex items-center justify-between group-hover:bg-opacity-95 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-2xl">📍</div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Ubicación Confirmada</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ver mapa del local</p>
                                    </div>
                                </div>
                                <a href={linkMapa} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2">
                                    Ver Mapa 🗺️
                                </a>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center">
                    <span className="text-4xl block mb-2">🔒</span>
                    <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Oferta Finalizada</h3>
                    <p className="text-gray-400 dark:text-gray-600 text-sm">Ya no se puede acceder a esta promoción.</p>
                </div>
            )}
            
            <ShareBar title={oferta.title} id={oferta.id} />
          </div>

          {/* ZONA DE GESTIÓN */}
          {puedeEditar && (
             <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 opacity-90 hover:opacity-100 transition-opacity">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {esAdmin ? "Zona de Administración 👮‍♂️" : "Zona de Dueño"}
                </p>
                <div className="flex flex-col gap-3">
                    <form action={alternarStock} className="w-full">
                        <input type="hidden" name="id" value={oferta.id} />
                        <input type="hidden" name="nuevoEstado" value={estaAgotada ? 'active' : 'expired'} />
                        <button type="submit" className={`w-full font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border-2 ${estaAgotada ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}>
                            {estaAgotada ? "✅ Marcar Disponible" : "🚫 Marcar Agotado"}
                        </button>
                    </form>
                    <div className="flex gap-3">
                        <Link href={`/editar/${oferta.id}`} className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                            ✏️ Editar
                        </Link>
                        <form action={borrarOferta} className="flex-1">
                            <input type="hidden" name="id" value={oferta.id} />
                            <button type="submit" className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                                🗑️ Borrar
                            </button>
                        </form>
                    </div>
                </div>
             </div>
          )}

          <div className="mt-8 flex justify-end items-center pt-6 border-t border-gray-100 dark:border-gray-700">
            <ReportButton id={oferta.id} />
          </div>

        </div>
      </div>

      {/* COMENTARIOS */}
      <div className="w-full max-w-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700 shadow-xl rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                💬 Comentarios <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({oferta.comments.length})</span>
            </h3>
            {session?.user ? (
                <form action={comentarOferta} className="mb-8 flex gap-3 items-start">
                    {session.user.image ? (
                        <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-600 shadow-sm">
                            {session.user.name?.[0]}
                        </div>
                    )}
                    <div className="flex-1">
                        <input type="hidden" name="offerId" value={oferta.id} />
                        <textarea name="text" rows={2} placeholder="Preguntá por stock, opiná..." className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-gray-800 dark:text-white text-sm bg-white dark:bg-gray-700" required />
                        <div className="flex justify-end mt-2">
                            <button type="submit" className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">Comentar</button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-8 flex items-center justify-between border border-blue-100 dark:border-blue-900/50">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Iniciá sesión para comentar.</p>
                    <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">Ingresar</Link>
                </div>
            )}
            <div className="space-y-4">
                {oferta.comments.length > 0 ? (
                    oferta.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 animate-fadeIn">
                             {comment.user.image ? (
                                <img src={comment.user.image} alt="User" className="w-8 h-8 rounded-full mt-1 opacity-90" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                                    {comment.user.name?.[0]}
                                </div>
                            )}
                            <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-600 flex-1 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.user.name}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 opacity-50 dark:opacity-40">
                        <span className="text-2xl block mb-2">🦗</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sé el primero en comentar.</p>
                    </div>
                )}
            </div>
      </div>
    </main>
  );
}
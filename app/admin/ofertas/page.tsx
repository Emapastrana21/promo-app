import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../lib/db";
import { revalidatePath } from "next/cache"; 

export default async function AdminOfertas() {
  const session = await auth();
  const ADMIN_EMAIL = "emapastri@gmail.com";

  if (session?.user?.email !== ADMIN_EMAIL) redirect("/");

  // 🗑️ ACCIÓN PARA ELIMINAR
  async function eliminarOferta(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    
    await prisma.offers.delete({
      where: { id },
    });

    revalidatePath("/admin/ofertas");
  }

  // 🔍 BUSCAR OFERTAS (Corregido con los nombres reales de tu BD)
  const ofertas = await prisma.offers.findMany({
    orderBy: { created_at: 'desc' }, // 👈 Corregido: usa guion bajo
    include: { users: true }         // 👈 Corregido: se llama 'users', no 'author'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 pb-24 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/admin" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-110 transition-transform">
                ⬅️
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Moderación de Ofertas</h1>
              <p className="text-gray-500 text-sm">Publicaciones activas: {ofertas.length}</p>
            </div>
        </div>

        {/* Tabla de Ofertas */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Producto</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Precio</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Publicado por</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {ofertas.map((offer) => (
                            <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-5">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {offer.title}
                                    </div>
                                    {/* 👇 Mostramos el Link porque Description no existe */}
                                    <div className="text-xs text-blue-500 truncate max-w-[200px]">
                                        {offer.link || "Sin link"}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg text-sm font-bold">
                                        {/* 👇 Agregamos toString() porque 'Decimal' a veces da error en React */}
                                        ${offer.price.toString()} 
                                    </span>
                                </td>
                                <td className="p-5 text-sm text-gray-500 dark:text-gray-400">
                                    {/* 👇 Corregido: offer.users.name */}
                                    {offer.users?.name || "Anónimo"}
                                </td>
                                <td className="p-5 text-right">
                                    <form action={eliminarOferta}>
                                        <input type="hidden" name="id" value={offer.id} />
                                        <button 
                                            type="submit" 
                                            className="text-red-500 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        >
                                            ELIMINAR 🗑️
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {ofertas.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                    No hay ofertas publicadas todavía. 🤷‍♂️
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
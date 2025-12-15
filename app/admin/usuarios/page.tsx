import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../lib/db";
import { revalidatePath } from "next/cache"; // 👈 Para recargar la lista al banear

export default async function AdminUsuarios() {
  const session = await auth();
  const ADMIN_EMAIL = "emapastri@gmail.com";

  if (session?.user?.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // 🚫 ACCIÓN DE BANEAR (Server Action)
  async function banearUsuario(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    
    // Seguridad extra: No permitir borrar al Admin Supremo
    const usuarioObjetivo = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (usuarioObjetivo?.email === ADMIN_EMAIL) {
        return; // No hacer nada si intentan borrarte a vos
    }

    // Borramos al usuario (y por cascada se borran sus ofertas)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Recargamos la pantalla
    revalidatePath("/admin/usuarios");
  }

  // Buscamos todos los usuarios (sin ordenar para que no falle si falta createdAt)
  const usuarios = await prisma.user.findMany();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 pb-24 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/admin" 
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-110 transition-transform"
            >
                ⬅️
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Lista de Usuarios</h1>
              <p className="text-gray-500 text-sm">Total registrados: {usuarios.length}</p>
            </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Usuario</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Email</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Rol</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        {u.image ? (
                                            <img src={u.image} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                {u.name ? u.name[0].toUpperCase() : "?"}
                                            </div>
                                        )}
                                        <span className="font-bold text-gray-700 dark:text-gray-200">
                                          {u.name || "Sin Nombre"}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-5 text-sm text-gray-500 dark:text-gray-400">
                                  {u.email}
                                </td>
                                <td className="p-5">
                                    {u.email === ADMIN_EMAIL ? (
                                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
                                        👑 ADMIN
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                                        USUARIO
                                      </span>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    {/* Botón de Banear conectado a la acción */}
                                    {u.email !== ADMIN_EMAIL && (
                                        <form action={banearUsuario}>
                                            <input type="hidden" name="userId" value={u.id} />
                                            <button 
                                                type="submit"
                                                className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            >
                                                BANEAR 🚫
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {usuarios.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                    No hay usuarios.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
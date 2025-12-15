import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditForm from "@/app/components/EditForm";

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  // 1. BUSCAR LA OFERTA (CORREGIDO)
  const oferta = await prisma.offers.findUnique({
    where: { id },
    include: { stores: true, categories: true, users: true }
  });

  // 2. SEGURIDAD
  if (!oferta) redirect("/");
  
  const ADMINS = ["emapastri@gmail.com"];
  const userEmail = session?.user?.email; // Capturamos el email una sola vez
  
  const esDueño = oferta.users?.email === userEmail;
  const esAdmin = userEmail && ADMINS.includes(userEmail);

  // Si no es dueño Y no es admin -> AFUERA
  if (!esDueño && !esAdmin) {
      redirect("/"); 
  }

  // 3. Preparar datos simples para el formulario
  const datosOferta = {
    id: oferta.id,
    title: oferta.title,
    price: Number(oferta.price),
    link: oferta.link,
    store: oferta.stores?.name || "",
    category: oferta.categories?.name || "Varios"
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/50">
        
        <div className="text-center mb-8">
            <span className="text-4xl mb-2 block">✏️</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Editar Oferta</h1>
            <p className="text-gray-500 text-sm mt-2">Corrigí lo que necesites</p>
        </div>

        {/* Renderizamos el Formulario Cliente */}
        <EditForm oferta={datosOferta} />
        
      </div>
    </main>
  );
}
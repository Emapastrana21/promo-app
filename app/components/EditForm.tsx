'use client'

import { actualizarOferta } from "../actions"
import { useState } from "react"
import toast from "react-hot-toast"; // Importamos la magia de las notificaciones

// Definimos qué datos necesita recibir este formulario
interface EditFormProps {
  oferta: {
    id: string;
    title: string;
    price: number;
    link: string | null;
    store: string;
    category: string;
  }
}

export default function EditForm({ oferta }: EditFormProps) {
  // Inicializamos los estados con los DATOS VIEJOS
  const [tipoTienda, setTipoTienda] = useState<'fisica' | 'online'>(oferta.link ? 'online' : 'fisica');

  return (
    <form 
        action={async (formData) => {
            // 1. Mostrar "Cargando..."
            const toastId = toast.loading("Guardando cambios...", {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
            
            try {
                // 2. Llamar al servidor
                await actualizarOferta(formData);
                // 3. Éxito (aunque la redirección ocurra rápido, esto da feedback)
                toast.success("¡Oferta actualizada!", { id: toastId });
            } catch (error) {
                // 4. Error
                toast.error("Ocurrió un error al guardar", { id: toastId });
                console.error(error);
            }
        }} 
        className="space-y-6"
    >
      {/* ID OCULTO (Importante para saber qué actualizamos) */}
      <input type="hidden" name="id" value={oferta.id} />

      {/* TABS (Físico vs Online) */}
      <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200">
          <button type="button" onClick={() => setTipoTienda('fisica')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoTienda === 'fisica' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🏪 Tienda Física</button>
          <button type="button" onClick={() => setTipoTienda('online')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoTienda === 'online' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>💻 Online</button>
      </div>

      {/* SI ES ONLINE: Link */}
      {tipoTienda === 'online' && (
          <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-100 animate-fadeIn">
              <label className="block text-xs text-purple-800 font-bold uppercase tracking-wider mb-2">Link del producto</label>
              <input 
                  name="link" 
                  type="url" 
                  defaultValue={oferta.link || ""}
                  placeholder="https://..." 
                  className="w-full p-3 bg-white text-gray-900 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 outline-none text-sm font-medium"
              />
          </div>
      )}

      {/* DATOS COMUNES */}
      <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Producto</label>
            <input 
                name="title" 
                type="text" 
                defaultValue={oferta.title}
                required 
                className="w-full p-4 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 outline-none font-medium"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Precio</label>
                <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                    <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        defaultValue={oferta.price}
                        required 
                        className="w-full p-4 pl-8 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none font-black text-lg"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Tienda</label>
                <input 
                    name="store" 
                    type="text" 
                    defaultValue={oferta.store}
                    required 
                    className="w-full p-4 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 outline-none font-medium"
                />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Categoría</label>
            <div className="relative">
                <select 
                    name="category" 
                    defaultValue={oferta.category}
                    className="w-full p-4 bg-white text-gray-900 border border-gray-200 rounded-xl outline-none cursor-pointer appearance-none font-medium focus:ring-4 focus:ring-gray-100"
                >
                    <option value="Almacén">🥫 Almacén</option>
                    <option value="Bebidas">🥤 Bebidas</option>
                    <option value="Frescos">🥩 Carne / Verdura</option>
                    <option value="Limpieza">🧹 Limpieza</option>
                    <option value="Perfumería">🧼 Perfumería / Higiene</option>
                    <option value="Farmacia">💊 Farmacia</option>
                    <option value="Indumentaria">👕 Indumentaria / Ropa</option>
                    <option value="Electrónica">🔌 Electrónica / Tecno</option>
                    <option value="Hogar">🏠 Hogar y Deco</option>
                    <option value="Herramientas">🛠️ Herramientas</option>
                    <option value="Mascotas">🐶 Mascotas</option>
                    <option value="Juguetes">🧸 Juguetes</option>
                    <option value="Varios">📦 Varios / Otros</option>
                </select>
            </div>
          </div>
      </div>

      <div className="flex gap-3">
        <a href={`/oferta/${oferta.id}`} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl text-center hover:bg-gray-200 transition-colors">
            Cancelar
        </a>
        <button type="submit" className="flex-[2] bg-black hover:bg-gray-900 text-white font-black py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transform active:scale-95 transition-all text-lg">
            💾 Guardar Cambios
        </button>
      </div>
    </form>
  )
}
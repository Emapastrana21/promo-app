"use client";

import { crearOferta, obtenerDatosDelLink } from "../actions"
import { useState } from "react"
import toast from "react-hot-toast"
import BackButton from "../components/BackButton"

// 👇 AGREGUÉ BANCO MACRO Y MÁS OPCIONES
const BANCOS = [
    "Efectivo", "Mercado Pago", "Cuenta DNI", "MODO", 
    "Banco Galicia", "Banco Santander", "BBVA", "Banco Nación", 
    "Banco Macro", "ICBC", "HSBC", "Banco Ciudad",
    "Naranja X", "Personal Pay", "Ualá", "Tarjeta Shopping"
];

export default function SubirOferta() {
  const [tipoTienda, setTipoTienda] = useState<'fisica' | 'online'>('fisica');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [scrapedData, setScrapedData] = useState<{title?: string, image?: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ESTADO PARA SELECCIONAR MÚLTIPLES BANCOS
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const togglePayment = (banco: string) => {
    if (selectedPayments.includes(banco)) {
        setSelectedPayments(prev => prev.filter(p => p !== banco));
    } else {
        setSelectedPayments(prev => [...prev, banco]);
    }
  };

  const handleLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      if (url.length > 10 && url.includes('http')) {
          setIsLoadingLink(true);
          const data = await obtenerDatosDelLink(url);
          setIsLoadingLink(false);
          if (data && !data.error) {
              setScrapedData({ title: data.title, image: data.image });
              if(data.image) setPreviewImage(data.image);
              toast.success("¡Datos encontrados!", { icon: '🤖' });
          }
      }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setScrapedData(prev => prev ? ({ ...prev, image: undefined }) : null); 
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 pb-24 transition-colors">
      
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/50 dark:border-gray-700 animate-fadeIn">
        
        <div className="text-center mb-8 relative">
            <div className="absolute left-0 top-1">
                <BackButton />
            </div>
            <span className="text-4xl mb-2 block">🔥</span>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Subir Oferta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Compartí el dato con la comunidad</p>
        </div>

        <form 
            action={async (formData) => {
                if (selectedPayments.length === 0) {
                    toast.error("Seleccioná al menos un medio de pago");
                    return;
                }
                setIsSubmitting(true);
                const toastId = toast.loading("Subiendo oferta...");
                try {
                    await crearOferta(formData);
                    toast.success("¡Oferta publicada!", { id: toastId });
                } catch (error) {
                    console.error(error);
                    setIsSubmitting(false);
                    toast.error("Error al subir", { id: toastId });
                }
            }} 
            className="space-y-6"
        >
          {/* TABS */}
          <div className="flex bg-gray-100/50 dark:bg-gray-700/50 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
              <button type="button" onClick={() => setTipoTienda('fisica')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoTienda === 'fisica' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>🏪 Tienda Física</button>
              <button type="button" onClick={() => setTipoTienda('online')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoTienda === 'online' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>💻 Online</button>
          </div>

          {/* LINK */}
          {tipoTienda === 'online' && (
              <div className="bg-purple-50/80 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 animate-fadeIn relative">
                  <label className="block text-xs text-purple-800 dark:text-purple-300 font-bold uppercase tracking-wider mb-2">Link del producto</label>
                  <div className="relative">
                      <input name="link" type="url" onChange={handleLinkChange} placeholder="https://..." className="w-full p-3 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none text-sm font-medium"/>
                      {isLoadingLink && <div className="absolute right-3 top-3 text-xs animate-spin">⏳</div>}
                  </div>
              </div>
          )}

          {/* FOTO */}
          <div className="group relative h-48 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-purple-300 transition-all overflow-hidden">
             {previewImage ? (
                 <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
             ) : (
                 <>
                    <span className="text-4xl mb-2 opacity-50 group-hover:scale-110 transition-transform">📷</span>
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500">Tocá para subir foto</span>
                 </>
             )}
             <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
             {scrapedData?.image && <input type="hidden" name="imageLink" value={scrapedData.image} />}
          </div>

          {/* TÍTULO Y PRECIO */}
          <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">Producto</label>
                <input name="title" type="text" defaultValue={scrapedData?.title || ""} placeholder="Ej: Coca Cola 2.25L - 3x$1400" required className="w-full p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-600 outline-none font-medium"/>
                {/* Nota para el usuario sobre la descripción */}
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Tip: Si es una promo "3x2" o "2da al 50%", ponelo en el título.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">Precio</label>
                    <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 font-bold">$</span>
                        <input name="price" type="number" step="0.01" placeholder="0.00" required className="w-full p-4 pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900 outline-none font-black text-lg"/>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">Tienda</label>
                    <input name="store" type="text" placeholder="Ej: Coto" required className="w-full p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-600 outline-none font-medium"/>
                </div>
              </div>

              {/* 👇 SELECTOR MÚLTIPLE DE BANCOS (CHIPS) */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">
                    Medios de Pago ({selectedPayments.length})
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {BANCOS.map(banco => (
                        <button
                            key={banco}
                            type="button"
                            onClick={() => togglePayment(banco)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                selectedPayments.includes(banco)
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105'
                                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                        >
                            {selectedPayments.includes(banco) && "✓ "}
                            {banco}
                        </button>
                    ))}
                </div>
                {/* Inputs ocultos para enviar al servidor */}
                {selectedPayments.map(p => (
                    <input key={p} type="hidden" name="payments" value={p} />
                ))}
              </div>

              {/* CATEGORÍA */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">Categoría</label>
                <div className="relative">
                    <select name="category" className="w-full p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl outline-none cursor-pointer appearance-none font-medium focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-600">
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
                        <option value="Varios">📦 Varios / Otros</option>
                    </select>
                </div>
              </div>
          </div>

          <div className="flex gap-3 pt-4">
            <a href="/" className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-xl text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Cancelar
            </a>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200 text-white font-black py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transform active:scale-95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? 'Subiendo...' : '🚀 Publicar Oferta'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
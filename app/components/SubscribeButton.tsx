'use client'

import { useState, useEffect } from "react"
import { suscribirseNotificaciones } from "../actions"
import toast from "react-hot-toast"

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function SubscribeButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // 1. Verificamos si el navegador soporta notificaciones
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        });
        
        // Chequeamos si ya estaba suscripto
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            setIsSubscribed(true);
        }
    } catch (error) {
        console.error("Error registrando SW:", error);
    }
  }

  const handleSubscribe = async () => {
    if (!PUBLIC_KEY) {
        toast.error("Falta configuración de notificaciones");
        return;
    }

    const toastId = toast.loading("Activando alertas...");

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // 2. Pedimos permiso y nos suscribimos
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
        });

        // 3. Guardamos en la base de datos
        // Convertimos a JSON puro para enviarlo al servidor
        const subJSON = JSON.parse(JSON.stringify(subscription));
        await suscribirseNotificaciones(subJSON);

        setIsSubscribed(true);
        toast.success("¡Alertas activadas! 🔔", { id: toastId });

    } catch (error) {
        console.error(error);
        toast.error("No se pudo activar. Revisá los permisos.", { id: toastId });
    }
  };

  if (!isSupported) return null; // Si es iPhone viejo o navegador raro, no mostramos nada

  return (
    <button
        onClick={handleSubscribe}
        disabled={isSubscribed}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
            isSubscribed 
            ? 'bg-gray-100 text-gray-400 cursor-default' 
            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 shadow-lg shadow-orange-200'
        }`}
    >
        <span>{isSubscribed ? '🔕' : '🔔'}</span>
        {isSubscribed ? 'Alertas Activadas' : 'Activar Alertas'}
    </button>
  )
}

// --- FUNCIÓN DE UTILIDAD (Convierte la clave para que el navegador la entienda) ---
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
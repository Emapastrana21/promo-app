export default function UserBadge({ points }: { points: number }) {
  // Rango por defecto (Novato)
  let rango = { name: "Novato", icon: "🌱", color: "bg-gray-100 text-gray-600 border-gray-200" };

  // Nuevas reglas:
  if (points >= 1500) {
      rango = { name: "Leyenda", icon: "👑", color: "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm" };
  } else if (points >= 500) {
      rango = { name: "Cazador", icon: "🔥", color: "bg-orange-100 text-orange-700 border-orange-200" };
  } 
  // Podrías agregar un intermedio si querés, tipo "Aprendiz" a los 100
  else if (points >= 100) {
      rango = { name: "Aprendiz", icon: "🧢", color: "bg-blue-50 text-blue-700 border-blue-200" };
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${rango.color}`}>
        <span>{rango.icon}</span> {rango.name}
    </span>
  );
}
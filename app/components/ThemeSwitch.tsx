"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  // 👇 AQUÍ ESTÁ EL TRUCO: 'resolvedTheme' nos dice si se VE oscuro realmente
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-7 bg-gray-200 rounded-full" />;
  }

  // Usamos resolvedTheme para saber el estado real visual
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    // Si se ve oscuro -> pasamos a claro. Si se ve claro -> pasamos a oscuro.
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? "bg-purple-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "🌞"}
      </span>
    </button>
  );
}
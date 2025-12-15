import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "./components/BottomNav"; 
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromoApp",
  description: "Ofertas de la comunidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* 👇 ACÁ ESTÁ EL ARREGLO: dark:bg-gray-950 pinta el fondo de negro */}
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="top-center" />
          <div className="pb-20 md:pb-0">
              {children}
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
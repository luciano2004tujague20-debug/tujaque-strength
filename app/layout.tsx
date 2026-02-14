import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Tujaque Strength | Elite Powerlifting Coaching",
  description:
    "Programacion profesional de Powerlifting. Sentadilla, Banca y Peso Muerto con progresion real para hombres que entrenan en serio.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

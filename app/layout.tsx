import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tujaque Strength | Programación de Fuerza & Hipertrofia",
  description: "Programación de fuerza e hipertrofia 100% individual. Análisis de video, gestión de cargas y seguimiento real para elevar tus marcas en SBD.",
  keywords: ["powerlifting", "hipertrofia", "fuerza", "coach", "online", "entrenamiento", "argentina", "biomecanica"],
  openGraph: {
    title: "Tujaque Strength | Elite Coaching",
    description: "Dejá de adivinar en el gimnasio. Accedé a una planificación profesional basada en biomecánica.",
    url: "https://tujaque-strength.vercel.app/",
    siteName: "Tujaque Strength",
    images: [
      {
        url: "/hero.png", // Usamos tu imagen de hero como portada
        width: 1200,
        height: 630,
        alt: "Tujaque Strength Hero Image",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">
        <div className="bg-noise" />
        {children}
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import "./globals.css";

// 🔥 NUEVO: Color de la barra de estado y bloqueo de zoom (Nivel App Nativa)
export const viewport: Viewport = {
  themeColor: "#F8F9FA", // El mismo gris ultra-claro de tu Dashboard
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Esto evita que el usuario haga zoom al tocar rápido
  userScalable: false, // Bloquea el pellizco para acercar (como una app real)
};

export const metadata: Metadata = {
  title: "Tujague Strength | Programación de Fuerza & Hipertrofia",
  description: "Programación de fuerza e hipertrofia 100% individual. Análisis de video, gestión de cargas y seguimiento real para elevar tus marcas en SBD.",
  keywords: ["powerlifting", "hipertrofia", "fuerza", "coach", "online", "entrenamiento", "argentina", "biomecanica"],
  
  // 🔥 NUEVO: El DNI de tu Aplicación (PWA)
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default", // "default" le dice a iOS que ponga letras oscuras sobre fondo claro
    title: "Tujague",
  },
  formatDetection: {
    telephone: false,
  },

  // Tu SEO original (¡Intacto!)
  openGraph: {
    title: "Tujague Strength | Elite Coaching",
    description: "Dejá de adivinar en el gimnasio. Accedé a una planificación profesional basada en biomecánica.",
    url: "https://tujague-strength.vercel.app/",
    siteName: "Tujague Strength",
    images: [
      {
        url: "/hero.png", // Usamos tu imagen de hero como portada
        width: 1200,
        height: 630,
        alt: "Tujague Strength Hero Image",
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
      <body className="antialiased bg-[#F8F9FA]"> {/* Fondo inyectado directo al body */}
        <div className="bg-noise" />
        {children}
      </body>
    </html>
  );
}
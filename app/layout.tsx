import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tujaque Strength | Elite Coaching",
  description: "Sistema de entrenamiento profesional de fuerza",
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

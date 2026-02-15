"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function AnimatedBackground() {
  const [init, setInit] = useState(false);

  // Inicialización del motor de partículas para Tujaque Strength
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return <div className="absolute inset-0 bg-[#09090b] -z-10" />;

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 -z-10"
      // Usamos "as any" para que TypeScript no marque error si hay conflicto de versiones
      options={{
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
          },
          modes: {
            grab: {
              distance: 200,
              links: { opacity: 0.5 },
            },
          },
        },
        particles: {
          color: { value: "#10b981" },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            outModes: { default: "out" },
          },
          number: {
            density: { enable: true, area: 800 },
            value: 70,
          },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 2 } },
        },
        detectRetina: true,
      } as any}
    />
  );
}

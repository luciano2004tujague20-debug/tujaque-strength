import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Zinc 950 profundo
        foreground: "#fafafa", // Zinc 50 casi blanco
        primary: {
          DEFAULT: "#10b981", // Emerald 500
          foreground: "#022c22", // Emerald 950
        },
        muted: {
          DEFAULT: "#18181b", // Zinc 900
          foreground: "#a1a1aa", // Zinc 400
        },
        card: {
          DEFAULT: "rgba(24, 24, 27, 0.6)", // Zinc 900 con transparencia
          foreground: "#fafafa",
        },
        border: "rgba(63, 63, 70, 0.4)", // Zinc 700 con transparencia
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
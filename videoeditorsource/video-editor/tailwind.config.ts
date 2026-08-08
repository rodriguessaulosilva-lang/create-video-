import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark palette
        base: {
          DEFAULT: "#050508",
          soft: "#0b0b12",
          card: "#101018",
          border: "#1c1c28",
        },
        gold: {
          DEFAULT: "#FFB800",
          soft: "#ffcb45",
          dim: "#8a6400",
        },
      },
      fontFamily: {
        sora: ["Sora", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(255, 184, 0, 0.35)",
        card: "0 8px 40px -12px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #FFB800 0%, #ffcb45 50%, #ff9d00 100%)",
        "glass":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

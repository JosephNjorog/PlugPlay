import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "avax-red": "#E84142",
        "arena-purple": "#7C3AED",
        "arena-gold": "#F59E0B",
        "arena-cyan": "#06B6D4",
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(232,65,66,0.35)",
        "glow-gold": "0 0 20px rgba(245,158,11,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

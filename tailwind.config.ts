import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0A",
          secondary: "#141414",
          tertiary: "#1E1E1E",
        },
        border: {
          DEFAULT: "#2A2A2A",
          light: "#383838",
        },
        accent: {
          gold: "#D4A017",
          "gold-dim": "#B8860B",
        },
        green: {
          trade: "#00C853",
        },
        red: {
          trade: "#FF4466",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

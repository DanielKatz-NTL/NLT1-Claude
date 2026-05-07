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
          primary: "#0D0E14",
          secondary: "#161B2E",
          tertiary: "#1A2035",
        },
        border: {
          DEFAULT: "#1E2640",
          light: "#2A3354",
        },
        accent: {
          teal: "#00E5CC",
          purple: "#7B61FF",
        },
        green: {
          trade: "#00FF88",
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

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais da KL
        primary: {
          DEFAULT: "#c8d22c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#242424",
          foreground: "#ffffff",
        },
        dark: "#141414",
        background: "#141414",
        foreground: "#ffffff",

        card: {
          DEFAULT: "#1f1f1f",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#1f1f1f",
          foreground: "#ffffff",
        },

        muted: {
          DEFAULT: "#2a2a2a",
          foreground: "#bbbbbb",
        },
        accent: {
          DEFAULT: "#3a3a3a",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },

        border: "#2e2e2e",
        input: "#1f1f1f",
        ring: "#55D462",

        chart: {
          "1": "#55D462",
          "2": "#7ED957",
          "3": "#a0e76b",
          "4": "#c3f480",
          "5": "#e5ffa4",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

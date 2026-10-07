import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        church: {
          50: "#f4f6fb",
          100: "#e5ebf5",
          200: "#cdd8ec",
          300: "#a6bde0",
          400: "#799dcf",
          500: "#577fc0",
          600: "#4265a7",
          700: "#375289",
          800: "#1C2541",
          900: "#0B132B",
          950: "#060A17",
        },
        royal: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#581c87",
          900: "#3b0764",
          950: "#22033c",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-work-sans)", "sans-serif"],
        serif: ["var(--font-raleway)", "Georgia", "serif"],
        accent: ["var(--font-raleway)", "sans-serif"],
        mono: ["var(--font-roboto)", "monospace"],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(11, 19, 43, 0.08), 0 8px 10px -6px rgba(11, 19, 43, 0.04)',
        'premium': '0 20px 40px -15px rgba(11, 19, 43, 0.15), 0 0 0 1px rgba(217, 119, 6, 0.15)',
        'goldGlow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;

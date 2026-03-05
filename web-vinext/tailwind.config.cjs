/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f8ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        morning: {
          light: "#e0f2fe",
          border: "#7dd3fc",
          text: "#0284c7",
        },
        forenoon: {
          light: "#fef3c7",
          border: "#fcd34d",
          text: "#b45309",
        },
        noon: {
          light: "#dcfce7",
          border: "#86efac",
          text: "#15803d",
        },
        afternoon: {
          light: "#ffedd5",
          border: "#fdba74",
          text: "#c2410c",
        },
        evening: {
          light: "#f3e8ff",
          border: "#d8b4fe",
          text: "#7e22ce",
        },
      },
      boxShadow: {
        soft: "0 4px 14px 0 rgba(0, 0, 0, 0.05)",
        hover: "0 6px 20px rgba(0, 0, 0, 0.1)",
        card: "0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#0ea5e9",
          "primary-content": "#ffffff",
          secondary: "#f59e0b",
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",
          "accent-content": "#ffffff",
          neutral: "#3d4451",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",
          info: "#3abff8",
          success: "#22c55e",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      {
        dark: {
          primary: "#0ea5e9",
          "primary-content": "#ffffff",
          secondary: "#f59e0b",
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",
          "accent-content": "#ffffff",
          neutral: "#3d4451",
          "neutral-content": "#ffffff",
          "base-100": "#1f2937",
          "base-200": "#111827",
          "base-300": "#0f172a",
          "base-content": "#f3f4f6",
          info: "#3abff8",
          success: "#22c55e",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },
};

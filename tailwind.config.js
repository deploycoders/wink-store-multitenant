/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        honey: "var(--honey)",
        "honey-light": "var(--honey-light)",
        "honey-dark": "var(--honey-dark)",
        ink: "var(--ink)",
        paper: "var(--paper)",
      },
    },
  },
  plugins: [],
};
//

// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#D4862B",         // Warm Amber
        "primary-dark": "#b8711e",
        secondary: "#2C4A2E",       // Forest Green
        "secondary-light": "#3a5f3c",
        accent: "#E8C4A0",          // Blush
        cream: "#FDF6EC",           // Warm Cream
        "text-main": "#1a2e1c",     // Dark Forest
      },
    },
  },
  plugins: [],
};

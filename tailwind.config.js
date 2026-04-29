/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FBF7F0",
          100: "#F5EFE6",
          200: "#EBE3D4",
          300: "#DFD4BF",
        },
        wine: {
          DEFAULT: "#7C2030",
          600: "#8A2436",
          700: "#6B1B28",
          800: "#541420",
        },
        ink: {
          DEFAULT: "#1A1715",
          soft: "#2B2623",
          muted: "#6E6661",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        phone:
          "0 40px 60px -20px rgba(26,23,21,0.35), 0 20px 30px -10px rgba(26,23,21,0.25)",
        card: "0 1px 2px rgba(26,23,21,0.06), 0 4px 12px rgba(26,23,21,0.06)",
      },
      borderRadius: {
        phone: "2.75rem",
      },
    },
  },
  plugins: [],
};

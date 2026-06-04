/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D0F14",
        surface: "#14171F",
        card: "#1A1E28",
        border: "#252A38",
        accent: "#00E5A0",
        red: "#FF4D6A",
        yellow: "#FFB547",
        muted: "#5A6075",
        soft: "#8892AA",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
}

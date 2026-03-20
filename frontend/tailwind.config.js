/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
      playfair: ['"Playfair Display"', 'serif'],
      bodoni: ['"Bodoni Moda"', 'serif'],
      cinzel: ['Cinzel', 'serif'],
      poppins: ["Poppins", "sans-serif"],
    },
  },
  plugins: [],
}}
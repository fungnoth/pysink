/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
      extend: {
          fontFamily: {
              'sans': [ '"M PLUS 1p"', 'sans-serif'],
              'sans-en': [ '"Gruppo"', 'sans-serif'],
          }
      }
  },
  plugins: [],
}

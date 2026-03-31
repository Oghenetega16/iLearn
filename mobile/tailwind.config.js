/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#091413',    // Deepest Green/Black
          primary: '#285A48', // Forest Green
          secondary: '#408A71', // Muted Teal
          light: '#B0E4CC',   // Mint Green
          background: '#FAFAFA' // Standard off-white background
        }
      },
      fontFamily: {
        manrope: ['Manrope_400Regular'],
        'manrope-semi': ['Manrope_600SemiBold'],
        'manrope-bold': ['Manrope_700Bold'],
        kumbh: ['KumbhSans_400Regular'],
        'kumbh-bold': ['KumbhSans_700Bold'],
      }
    },
  },
  plugins: [],
}
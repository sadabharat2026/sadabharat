/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4AF37',
          pink: '#054425', // Forest green mapped to brand-pink to safely override old brand styles globally
          beige: '#F1F8E9', // Light green background (sage-cream)
          cream: '#F4F8F5', // Soft green-white cream
          dark: '#0D5C34', // Forest green text/theme
          light: '#FFFFFF', // Clean white background for main page
          sage: '#E8F5E9',  // Sage accent green
          accent: '#0D5C34', // Deep green accent
        },
        admin: {
          dark: '#0A3A20', // Green theme, slightly different from vendor
          light: '#F5F9F6', // Light greenish background
          accent: '#125A35', // Green accent
          gold: '#D4AF37'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-red-500',
    'ring-blue-500',
    'ring-green-500',
    'ring-purple-500',
    'ring-orange-500',
    'ring-pink-500',
    'ring-red-500',
    'text-blue-500',
    'text-green-500',
    'text-purple-500',
    'text-orange-500',
    'text-pink-500',
    'text-red-500',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#f0fdf4',
        background: '#f8fafc',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
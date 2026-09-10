/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phronesis: {
          50: '#fcf8f2',
          100: '#f7eee0',
          200: '#eedac1',
          300: '#e2c19a',
          400: '#d4a16f',
          500: '#c58145',
          600: '#ad6636',
          700: '#8a4b2c',
          800: '#6f3c27',
          900: '#5b3223',
        },
        navy: {
          850: '#141d2e',
          900: '#0d1523',
          950: '#080d17',
        }
      }
    },
  },
  plugins: [],
}

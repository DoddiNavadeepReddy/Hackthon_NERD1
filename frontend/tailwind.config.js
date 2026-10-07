/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pearl: '#F6F5F1',
        peach: '#FAE7D5',
        aqua: {
          100: '#E7F7F2',
          200: '#D3E8E2',
          300: '#C9EEE4',
          400: '#A9D2C7',
        },
        charcoal: '#2A2B2E',
        warmgray: '#6B6D70',
        nsl: {
          normal: '#7C7F86',
          dos: '#E03434',
          probe: '#E9A02A',
          r2l: '#8B45E8',
          u2r: '#F2761C',
        },
        borderSubtle: '#EDEEEA',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

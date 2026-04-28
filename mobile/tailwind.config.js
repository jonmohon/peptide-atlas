/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Match the web app's design tokens (src/app/globals.css)
        background: '#0a0a0a',
        foreground: '#fafafa',
        'text-secondary': '#a3a3a3',
        'text-muted': '#737373',
        'neon-cyan': '#06b6d4',
        'neon-green': '#10b981',
        'neon-orange': '#f97316',
        'neon-pink': '#ec4899',
        'neon-purple': '#a855f7',
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Menlo'],
      },
    },
  },
  plugins: [],
};

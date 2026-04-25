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
        vibaura: {
          primary: 'var(--vibaura-primary)',
          'primary-light': 'var(--vibaura-primary-light)',
          'primary-hover': 'var(--vibaura-primary-hover)',
          surface: 'var(--vibaura-surface)',
          tint: 'rgba(99, 103, 255, 0.05)',
          'bg-muted': '#E4E4E9',
          'view-bg': 'var(--vibaura-view-bg)',
          border: '#C9BEFF',
          'action-bar': 'var(--vibaura-action-bar)',
        },
        text: {
          primary: '#2d3748',
          secondary: '#4a5568',
          muted: '#718096',
        }
      },
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
      },
      screens: {
        'mobile': { 'max': '768px' },
        'desktop': { 'min': '769px' },
      }
    },
  },
  plugins: [],
}

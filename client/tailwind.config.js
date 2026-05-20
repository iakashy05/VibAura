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
          tint: 'var(--vibaura-tint)',
          'bg-muted': 'var(--vibaura-bg-muted)',
          'view-bg': 'var(--vibaura-view-bg)',
          border: 'var(--vibaura-border)',
          'action-bar': 'var(--vibaura-action-bar)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
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

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
          primary: '#6367FF',
          'primary-light': '#C9BEFF',
          'primary-hover': '#8494FF',
          surface: '#ffffff',
          tint: 'rgba(99, 103, 255, 0.05)',
          'bg-muted': '#F1F2FF',
          'view-bg': '#F1F2FF',
          border: '#C9BEFF',
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
        'mobile': {'max': '768px'},
        'desktop': {'min': '769px'},
      }
    },
  },
  plugins: [],
}

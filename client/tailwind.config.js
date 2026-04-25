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
          surface: '#E8E8EC',
          tint: 'rgba(99, 103, 255, 0.05)',
          'bg-muted': '#E4E4E9',
          'view-bg': '#E4E4E9',
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

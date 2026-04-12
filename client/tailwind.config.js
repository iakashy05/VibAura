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
          pink: '#d53f8c',
          'pink-light': '#fed7e2',
          'pink-hover': '#fbb6ce',
          surface: '#ffffff',
          'bg-pink': '#fff5f2',
          'bg-muted': '#fff8f5',
          'view-bg': '#FFF1F3',
          border: '#fed7d7',
          'dark-bg': '#1a202c',
          'dark-surface': '#1a202c',
          'dark-sidebar': '#171923',
          'dark-border': '#23262c',
          'dark-muted': '#2d3748',
          'accent-blue': '#63b3ed',
        },
        text: {
          primary: '#2d3748',
          secondary: '#4a5568',
          muted: '#718096',
          'primary-dark': '#f7fafc',
          'secondary-dark': '#a0aec0',
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

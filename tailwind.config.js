/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
          DEFAULT: '#667eea',
          dark: '#5568d3',
          light: '#7c91f5',
        },
        secondary: {
          500: '#764ba2',
          600: '#5e3a82',
          700: '#4e2f6b',
          DEFAULT: '#764ba2',
          dark: '#5e3a82',
          light: '#8d5dba',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'primary': '0 10px 30px -5px rgba(102, 126, 234, 0.3)',
        'secondary': '0 10px 30px -5px rgba(118, 75, 162, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
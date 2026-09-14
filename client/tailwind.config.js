/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        oxford: {
          950: '#0b0f19', // Deepest midnight background
          900: '#0f172a', // Main slate oxford midnight background
          800: '#1e293b', // Card background
          700: '#334155', // Borders/Muted accents
          600: '#475569',
          500: '#64748b',
        },
        primary: {
          DEFAULT: '#3b82f6', // Oxford Blue accent
          hover: '#2563eb',
          focus: '#1d4ed8',
          light: '#60a5fa',
        },
        accent: {
          purple: '#818cf8', // Glass highlight Indigo
          emerald: '#10b981', // Analytics Emerald
          rose: '#f43f5e'     // Delete / Warning highlight
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(59, 130, 246, 0.15)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      }
    },
  },
  plugins: [],
}

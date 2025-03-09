module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Montserrat', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        background: {
          DEFAULT: '#09090b',
          lighter: '#0f0f13',
        },
        amber: {
          DEFAULT: '#b85a00',
          hover: '#a04d00',
          light: '#e57200',
          dark: '#8f4600',
          50: '#fff8eb',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        foreground: {
          DEFAULT: '#FFFFFF',
          muted: '#6B7280',
        },
      },
      boxShadow: {
        'neumorphic': '5px 5px 15px rgba(0,0,0,0.2), -5px -5px 15px rgba(30,30,35,0.2)',
        'neumorphic-hover': '8px 8px 20px rgba(0,0,0,0.3), -8px -8px 20px rgba(30,30,35,0.3)',
        'neumorphic-pressed': '2px 2px 5px rgba(0,0,0,0.3), -2px -2px 5px rgba(30,30,35,0.3)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
} 
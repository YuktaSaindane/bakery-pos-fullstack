/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Ensure these utility classes are always generated
    'rounded-lg',
    'bg-pink-50',
    'bg-red-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
    'text-red-600',
    'text-green-600',
    'text-blue-600',
    'text-purple-600',
    'hover:bg-red-200',
    'hover:bg-green-200',
    'hover:bg-blue-200',
    'hover:bg-purple-200',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7F55B1',
          50: '#F8F5FF',
          100: '#F0E9FF',
          200: '#DDD4FF',
          300: '#C9BEFF',
          400: '#B6A8FF',
          500: '#7F55B1',
          600: '#6B4696',
          700: '#58377A',
          800: '#45285F',
          900: '#321A44'
        },
        secondary: {
          DEFAULT: '#9B7EBD',
          50: '#FAF8FF',
          100: '#F4F0FF',
          200: '#E9E0FF',
          300: '#DDD1FF',
          400: '#C7B2FF',
          500: '#9B7EBD',
          600: '#8468A1',
          700: '#6D5285',
          800: '#563D68',
          900: '#3F294C'
        },
        accent: {
          DEFAULT: '#F49BAB',
          50: '#FFF5F7',
          100: '#FFEBEF',
          200: '#FFD7DF',
          300: '#FFC3CF',
          400: '#FFAFBF',
          500: '#F49BAB',
          600: '#F18799',
          700: '#EE7387',
          800: '#EB5F75',
          900: '#E84B63'
        },
        light: {
          DEFAULT: '#FFE1E0',
          50: '#FFFFFF',
          100: '#FFFEFE',
          200: '#FFF8F8',
          300: '#FFF2F1',
          400: '#FFECEB',
          500: '#FFE1E0',
          600: '#FFD6D4',
          700: '#FFCBC8',
          800: '#FFC0BC',
          900: '#FFB5B0'
        },
        // Add standard colors including pink
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D'
        },
        green: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D'
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A'
        },
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6B21A8',
          900: '#581C87'
        },
        pink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7F55B1, #9B7EBD)',
        'gradient-secondary': 'linear-gradient(135deg, #9B7EBD, #F49BAB)',
        'gradient-accent': 'linear-gradient(135deg, #F49BAB, #FFE1E0)',
        'gradient-main': 'linear-gradient(135deg, #FFE1E0 0%, #F49BAB 30%, #9B7EBD 70%, #7F55B1 100%)'
      },
      boxShadow: {
        'elegant': '0 20px 40px rgba(127, 85, 177, 0.15)',
        'elegant-lg': '0 25px 50px rgba(127, 85, 177, 0.25)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}; 
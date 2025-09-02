import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          bg: '#0D1116',
          text: '#ffffff',
        }
      },
      fontSize: {
        'h1': ['24px', '32px'],
        'body': ['14px', '20px'],
        'small': ['12px', '16px'],
        'large': ['16px', '24px'],
      }
    },
  },
  plugins: [],
} satisfies Config

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0e2148',
          700: '#16315f',
          50: '#eef1f7',
        },
        gold: {
          DEFAULT: '#c9a24b',
          soft: '#e8d8ad',
          50: '#faf6ec',
        },
        ink: '#1a2236',
        line: '#e4e7ee',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

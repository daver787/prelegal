import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        brand: {
          yellow: '#ecad0a',
          blue: '#209dd7',
          purple: '#753991',
          navy: '#032147',
          gray: '#888888',
        },
      },
    },
  },
  plugins: [],
};

export default config;

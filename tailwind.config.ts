import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      height: {
        screen: 'var(--100vh)',
      },
      maxHeight: {
        'screen-85': 'calc(var(--100vh) - 85px)',
      },
      boxShadow: {
        'medium-top': '0px -2px 4px 0px rgba(0, 0, 0, 0.05)',
        'medium-bottom': '0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'open-sans': 'var(--font-open-sans)',
      },
      colors: {
        yellow: {
          50: '#F1EEE8',
          100: '#FFEBA0',
          500: '#EDE92A',
        },
        black: {
          50: '#f0f0f0',
          100: 'rgba(19, 28, 22, 0.20)',
          200: 'rgba(19, 28, 22, 0.40)',
          250: 'rgba(19, 28, 22, 0.50)',
          300: 'rgba(19, 28, 22, 0.60)',
          400: '#08080A',
          500: '#131C16',
        },
        grey: {
          100: '#ededed',
        },
        red: {
          100: '#FA4A0C',
        },
        blue: {
          400: '#1677ff',
          500: '#0958d9',
        },
        green: {
          100: '#CAE0AB',
        },
      },
    },
  },
  plugins: [],
};
export default config;

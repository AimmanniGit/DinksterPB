/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dinkster: {
          green: '#1D9E75',
          greenMid: '#5DCAA5',
          greenLight: '#E8F7F1',
          greenDark: '#0A5C43',
          amber: '#EF9F27',
          amberLight: '#FEF3E2',
          danger: '#E24B4A',
          blue: '#3B82F6',
          ink: '#111111',
          surface: '#F8F7F3',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

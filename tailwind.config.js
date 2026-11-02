/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ak: {
          'pale-grey': '#CBD8DC',
          'icy-blue': '#DCE8EB',
          'ivory': '#F7F5EF',
          'charcoal': '#17191B',
          'burgundy': '#7A1735',
          'gold': '#D1AE70',
          // Tonal variations for subtle depth
          'pale-light': '#E7EFF1',
          'charcoal-muted': '#2E3236',
          'charcoal-light': '#5A6065',
          'ivory-border': 'rgba(247, 245, 239, 0.75)',
          'ivory-soft': '#FAF8F3',
          'burgundy-hover': '#911D40',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-clash)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'frame': '0 25px 60px -15px rgba(23, 25, 27, 0.08), 0 0 0 1px rgba(247, 245, 239, 0.9) inset',
        'float': '0 20px 40px -10px rgba(23, 25, 27, 0.12), 0 4px 12px -2px rgba(23, 25, 27, 0.04)',
        'pill': '0 4px 14px 0 rgba(23, 25, 27, 0.08)',
        'pill-hover': '0 8px 24px 0 rgba(23, 25, 27, 0.14)',
        'glow-gold': '0 0 25px -5px rgba(209, 174, 112, 0.4)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-reverse': 'floatReverse 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1.5deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};

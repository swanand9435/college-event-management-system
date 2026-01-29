/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-black': '#0a0a0f',
        'darker': '#050508',
        'neon-cyan': '#00f5ff',
        'electric-purple': '#bf00ff',
        'aurora-blue': '#0066ff',
        'aurora-glow': '#00aaff',
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8), 0 0 60px rgba(191, 0, 255, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'aurora': 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 25%, #0a1a3e 50%, #0a0a0f 100%)',
      },
    },
  },
  plugins: [],
}

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
        ink: {
          DEFAULT: '#1a1410',
          soft: '#3a2f28',
          mute: '#6b5d52',
        },
        paper: {
          DEFAULT: '#f4ece0',
          warm: '#eee1ca',
          deep: '#e6d4b5',
        },
        vermilion: {
          DEFAULT: '#b91c1c',
          deep: '#7f1d1d',
          bright: '#dc2626',
          seal: '#a91e1e',
        },
        gold: {
          DEFAULT: '#b8860b',
          soft: '#c9a868',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Songti SC"', 'STSong', 'serif'],
        body: ['"Source Han Serif SC"', '"Noto Serif SC"', 'serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        latin: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.25em',
        widest2: '0.4em',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.25 0 0 0 0 0.16 0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      animation: {
        'reveal': 'reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'seal-in': 'sealIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'underline': 'underline 1.2s ease-out 0.4s both',
        'pulse-soft': 'pulseSoft 3.2s ease-in-out infinite',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sealIn: {
          '0%': { opacity: '0', transform: 'rotate(-18deg) scale(0.4)' },
          '60%': { opacity: '1', transform: 'rotate(-6deg) scale(1.08)' },
          '100%': { opacity: '0.94', transform: 'rotate(-8deg) scale(1)' },
        },
        underline: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

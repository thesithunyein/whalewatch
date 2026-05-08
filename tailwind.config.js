/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        whale: {
          bg: '#0a0d14',
          surface: '#111520',
          card: '#161b28',
          border: '#1e2535',
          muted: '#252d3d',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          green: '#10b981',
          'green-dim': '#064e3b',
          red: '#ef4444',
          'red-dim': '#7f1d1d',
          yellow: '#f59e0b',
          'yellow-dim': '#78350f',
          purple: '#8b5cf6',
          'purple-dim': '#4c1d95',
          cyan: '#06b6d4',
          orange: '#f97316',
          'orange-dim': '#7c2d12',
          text: '#e2e8f0',
          'text-muted': '#64748b',
          'text-dim': '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-once': 'ping 1s cubic-bezier(0, 0, 0.2, 1) 1',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

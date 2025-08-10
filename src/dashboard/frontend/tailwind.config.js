/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'health': {
          'healthy': '#10b981',
          'degraded': '#f59e0b', 
          'unhealthy': '#ef4444',
          'critical': '#dc2626'
        },
        'status': {
          'running': '#10b981',
          'idle': '#6b7280',
          'failed': '#ef4444',
          'blocked': '#f59e0b',
          'recovering': '#3b82f6'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class'
}
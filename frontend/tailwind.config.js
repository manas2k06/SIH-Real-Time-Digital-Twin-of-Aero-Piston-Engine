/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aero: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38abf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          navy: '#0f172a',
          slate: '#1e293b',
        },
        ops: {
          bg: '#f8fafc',
          surface1: '#ffffff',
          surface2: '#f1f5f9',
          surfaceInset: '#e2e8f0',
          border: '#cbd5e1',
          subtle: '#e2e8f0',
          focus: '#94a3b8',
          cyan: '#0284c7',
          blue: '#2563eb',
          amber: '#d97706',
          red: '#dc2626',
          green: '#059669',
          slate: '#334155',
          muted: '#64748b',
          dim: '#94a3b8',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      }
    },
  },
  plugins: [],
}


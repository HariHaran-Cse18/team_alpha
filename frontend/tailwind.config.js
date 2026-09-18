/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medora: {
          dark: "#080c14",
          card: "rgba(15, 23, 42, 0.75)",
          border: "rgba(30, 41, 59, 0.8)",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          blue: "#3b82f6",
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}

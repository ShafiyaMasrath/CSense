/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        healthy: '#10b981', // green-500
        attention: '#f59e0b', // yellow-500
        risk: '#ef4444', // red-500
      }
    },
  },
  plugins: [],
}

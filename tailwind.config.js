/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./electron/windows/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        rio: {
          primary: '#329BFA',    // Sky Blue
          secondary: '#E8F4FF',  // Light Blue
          accent: '#1769AA',     // Deep Blue
          navy: '#0A2540',       // Dark Navy text
          soft: '#F4F9FF',       // Very light blue background
          card: '#FFFFFF',
          border: '#D8E8F8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      boxShadow: {
        'rio-soft': '0 4px 20px -2px rgba(50, 155, 250, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'rio-hover': '0 10px 25px -3px rgba(50, 155, 250, 0.22), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        'rio-floating': '0 20px 40px -8px rgba(10, 37, 64, 0.25)',
      },
      borderRadius: {
        'rio': '1.25rem',
      }
    },
  },
  plugins: [],
}

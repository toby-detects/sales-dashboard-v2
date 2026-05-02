/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#FF6B35',
          light: '#FF9A6C',
          bg: '#FFF3EE',
          dark: '#CC4A18',
          darker: '#BF5020'
        },
        blue: {
          accent: '#4A90E2',
          bg: '#EEF5FF',
          text: '#185FA5',
          light: '#E6F1FB'
        }
      }
    }
  },
  plugins: []
}

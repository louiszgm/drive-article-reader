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
        sepia: {
          50: '#fdfbf7',
          100: '#f7f1e5',
          200: '#eddcc1',
          300: '#e3c69c',
          700: '#73522f',
          800: '#5c4125',
          900: '#3d2b19',
        },
        eyegreen: {
          50: '#f4f9f4',
          100: '#e6f2e6',
          200: '#cce5cb',
          300: '#a3d0a2',
          700: '#2b5f2a',
          800: '#234d22',
          900: '#173316',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'Cambria', '"Times New Roman"', 'STSong', 'SimSun', 'serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
        kai: ['"Kaiti SC"', 'STKaiti', '"KaiTi"', 'KaiTi_GB2312', 'serif'],
      },
      screens: {
        'xs': '480px',
      }
    },
  },
  plugins: [],
}

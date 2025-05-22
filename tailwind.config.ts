/** @type {import('tailwindcss').Config} */
import "tailwindcss-animate"
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
plugins: [("tailwindcss-animate")]
}
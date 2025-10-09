/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    "./*.html",
    "./src/views/**/*.{html,ejs}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{html,js}"
  ],
  safelist: [
    'h-12', 'h-28', 'sm:h-16', 'sm:h-28', 'md:h-20', 'w-auto',
    'mx-auto', 'max-w-[150px]', 'max-w-[120px]', 'w-full', 'object-contain'
  ],
  theme: { 
    extend: {
      height: {
        // custom midpoint size: use class `h-7-5` for 7.5rem
        '7-5': '7.5rem'
      }
    }
  },
  plugins: [],
}


// tailwind.config.js
module.exports = {
  dark: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Ensure your paths are correct
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),  // Add DaisyUI plugin here
  ],
}

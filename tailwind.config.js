/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F99603",
        secondary: "#E7DBCB",
        disabled: "#7C7973",
        darkPrimary: "#262326",
        background: "#221B1B",
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "unprotected-geo": "url('@/assets/bgs/SteelBlueGeoBG_1920.png')",
        "protected-geo": "url('@/assets/bgs/LightModeGeoBG.svg')",
      },
      colors: {
        // Primary
        "primary-100": "#527a8c",
        "primary-200": "#466979",
        "primary-300": "#355166",
        "primary-400": "#283d4c",
        "primary-500": "#1e2e39",
        // Secondary
        "secondary-100": "#A7CEDE",
        "secondary-200": "#9BBECB",
        "secondary-300": "#89a7b3",
        "secondary-400": "#6595a8",
        "secondary-500": "#527e90",
        // Plain light
        "plain-light-100": "#F9FAFB",
        "plain-light-200": "#eeeeee",
        "plain-light-300": "#dddddd",
        "plain-light-400": "#cccccc",
        "plain-light-500": "#bbbbbb",
        // Plain dark
        "plain-dark-100": "#585d65",
        "plain-dark-200": "#424956",
        "plain-dark-300": "#393e4a",
        "plain-dark-400": "#202936",
        "plain-dark-500": "#11171e",
        // Other
        "warning-red-light": "#f02849",
        "warning-red-dark": "#DC3F59",
        "open-icon-red": "#c83737",
        "progress-icon-orange": "#ff7f2a",
        "testing-icon-teal": "#008080",
        "closed-icon-green": "#217844",
      },
    },
    screens: {
      tablet: "640px",
      laptop: "1024px",
      desktop: "1280px",
      // Custom
      homePageBP: "1000px",
    },
    transitionProperty: {
      width: "width",
      right: "right",
    },
  },
  plugins: [],
  darkMode: "class",
};

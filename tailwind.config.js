/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary, 0, 0, 0))", // Default: black
        "primary-foreground": "hsl(var(--primary-foreground, 255, 255, 255))", // Default: white
        secondary: "hsl(var(--secondary, 120, 120, 120))", // Default: gray
        "secondary-foreground":
          "hsl(var(--secondary-foreground, 255, 255, 255))", // Default: white
        background: "hsl(var(--background, 255, 255, 255))", // Default: white
        foreground: "hsl(var(--foreground, 0, 0, 0))", // Default: black
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

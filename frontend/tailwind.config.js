
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f4f6f7",
          100: "#e6eaec",
          200: "#c7d0d4",
          400: "#5c7278",
          600: "#2b3f45",
          800: "#16262b",
          900: "#0e1a1e",
        },
        teal: {
          50: "#eefaf8",
          100: "#d3f1ec",
          500: "#0e8f7f",
          600: "#0b7266",
          700: "#095a51",
        },
        amber: {
          100: "#fdecc8",
          500: "#d98c1f",
          600: "#b8720f",
        },
        rose: {
          100: "#fbe4e4",
          500: "#c94c4c",
          600: "#a83c3c",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(14, 26, 30, 0.06), 0 1px 1px rgba(14, 26, 30, 0.04)",
      },
    },
  },
  plugins: [],
};

module.exports = {
  content: ["./frontend/index.html", "./frontend/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#122033",
          blue: "#0A4D8C",
          red: "#D71920",
          sky: "#EAF4FF",
          mist: "#F6F8FB"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

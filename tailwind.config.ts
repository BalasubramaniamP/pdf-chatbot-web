import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F2",
        surface: "#FFFFFF",
        ink: "#1C1B1A",
        muted: "#6B6660",
        line: "#E3DFD8",
        teal: {
          DEFAULT: "#0F5C56",
          soft: "#E4EEEC",
          dark: "#0B4640",
        },
        rust: "#A3402F",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        paper: "0 1px 2px rgba(28,27,26,0.04), 0 8px 24px rgba(28,27,26,0.06)",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;

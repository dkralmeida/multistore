import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(222.2, 47.4%, 11.2%)",
          primary: "hsl(221, 83%, 53%)",
          accent: "hsl(267, 97%, 64%)",
        }
      }
    },
  },
  plugins: [],
};
export default config;

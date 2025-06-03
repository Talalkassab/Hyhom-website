import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'hyhom-primary': '#2a577e',
        'hyhom-secondary': '#6fbeb8',
        'hyhom-dark': '#1a3a52',
        'hyhom-light': '#e8f4f2',
      },
      fontFamily: {
        'english': ['Poppins', 'sans-serif'],
        'arabic': ['Noto Sans Arabic', 'Tajawal', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwindcss-dir')(),
  ],
};
export default config;

import type { Config } from "tailwindcss";

// Colour tokens follow the Investor365 Learn prototype (jade / gold / coral / sky).
// Values live as CSS variables in globals.css so dark mode is a variable swap.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        page: token("page"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        jade: { DEFAULT: token("jade"), deep: token("jade-deep"), soft: token("jade-soft") },
        gold: { DEFAULT: token("gold"), deep: token("gold-deep"), soft: token("gold-soft") },
        coral: { DEFAULT: token("coral"), deep: token("coral-deep"), soft: token("coral-soft") },
        sky: { DEFAULT: token("sky"), deep: token("sky-deep"), soft: token("sky-soft") },
        violet: { DEFAULT: token("violet"), deep: token("violet-deep"), soft: token("violet-soft") },
        locked: { DEFAULT: token("locked"), deep: token("locked-deep") },
      },
      fontFamily: {
        display: ["var(--font-display)", "Nunito", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

// Colour tokens live as CSS variables in globals.css; light is the default and
// <html data-theme="dark"> swaps them, so every class works in both themes.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        page: token("page"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        muted: token("muted"),
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        "on-accent": token("on-accent"),
        primary: { DEFAULT: token("primary"), ink: token("on-primary") },
        hero: { DEFAULT: token("hero"), line: token("hero-line"), ink: token("hero-ink"), muted: token("hero-muted"), accent: token("hero-accent") },
        jade: { DEFAULT: token("jade"), deep: token("jade-deep"), soft: token("jade-soft") },
        gold: { DEFAULT: token("gold"), deep: token("gold-deep"), soft: token("gold-soft") },
        coral: { DEFAULT: token("coral"), deep: token("coral-deep"), soft: token("coral-soft") },
        sky: { DEFAULT: token("sky"), deep: token("sky-deep"), soft: token("sky-soft") },
        violet: { DEFAULT: token("violet"), deep: token("violet-deep"), soft: token("violet-soft") },
        locked: { DEFAULT: token("locked"), deep: token("locked-deep") },
      },
      fontFamily: {
        display: ["var(--font-display)", "Manrope", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "1rem" },
      // A calmer weight scale: the old 800s read as "game"; Manrope 700 is bold enough.
      fontWeight: { extrabold: "700" },
    },
  },
  plugins: [],
};

export default config;

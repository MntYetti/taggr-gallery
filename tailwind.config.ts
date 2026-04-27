import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px color-mix(in srgb, var(--color-accent) 34%, transparent), 0 22px 80px color-mix(in srgb, var(--color-shadow) 34%, transparent)",
      },
    },
  },
  plugins: [],
} satisfies Config;

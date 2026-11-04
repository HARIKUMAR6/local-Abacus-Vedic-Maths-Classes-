/** Tailwind config — SutraBead Academy
 *  - Preflight is disabled so the existing design system (assets/css/styles.css) stays intact.
 *  - The built-in .container is disabled; the site already defines its own .container.
 *  - Colours map to CSS custom properties, so Light/Dark themes are tuned in one place (styles.css).
 */
module.exports = {
  content: ["./src/**/*.{html,js}", "./assets/js/**/*.js"],
  darkMode: ["selector", '[data-theme="dark"]'],
  corePlugins: { preflight: false, container: false },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        ink2: "var(--ink-2)",
        muted: "var(--muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "on-brand": "var(--on-brand)",
        "brand-soft": "var(--brand-soft)",
        "brand-soft-ink": "var(--brand-soft-ink)",
        saffron: "var(--saffron)",
        "saffron-soft": "var(--saffron-soft)",
        "saffron-ink": "var(--saffron-ink)",
        teal: "var(--teal)",
        "teal-soft": "var(--teal-soft)",
        coral: "var(--coral)",
        "coral-soft": "var(--coral-soft)",
        band: "var(--band)",
        "band-ink": "var(--band-ink)",
        "band-muted": "var(--band-muted)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Segoe UI"', "system-ui", "sans-serif"],
        body: ["Figtree", '"Segoe UI"', "system-ui", "sans-serif"],
      },
      borderRadius: { "4xl": "26px" },
      boxShadow: { soft: "var(--shadow)", lift: "var(--shadow-lg)" },
    },
  },
};

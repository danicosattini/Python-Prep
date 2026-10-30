/** Colores = variables CSS "R G B" definidas en index.css (modo claro y oscuro). */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./InstagramDashboardSimulator.jsx"],
  theme: {
    extend: {
      colors: Object.fromEntries(
        ["bg", "surface", "surface2", "line", "fg", "muted", "accent", "accent2", "accent3", "good", "warn", "bad", "p1", "p2", "p3"].map((n) => [n, token(n)])
      ),
      opacity: { 12: "0.12" },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Newsreader"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
};

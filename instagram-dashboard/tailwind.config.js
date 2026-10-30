/** Colores = variables CSS "R G B" definidas en index.css (modo claro y oscuro). */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./InstagramDashboardSimulator.jsx"],
  theme: {
    extend: {
      colors: Object.fromEntries(
        ["bg", "surface", "surface2", "line", "fg", "muted", "accent", "accent2", "accent3", "good", "warn", "bad"].map((n) => [n, token(n)])
      ),
      opacity: { 12: "0.12" },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
};

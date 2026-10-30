// Genera un único HTML autocontenido (React + lucide + CSS compilados en línea).
// Uso: node build.mjs <carpeta con node_modules de esbuild, tailwindcss, react, react-dom y lucide-react>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const deps = path.resolve(process.argv[2] || ".");
const here = path.dirname(new URL(import.meta.url).pathname);
const bin = (n) => path.join(deps, "node_modules", ".bin", n);

const entry = path.join(deps, "entry.jsx");
writeFileSync(entry, `import React from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify(path.join(here, "InstagramDashboardSimulator.jsx"))};
createRoot(document.getElementById("root")).render(<App />);
`);
const js = execFileSync(bin("esbuild"), [entry, "--bundle", "--minify", "--format=iife", "--jsx=automatic",
  "--define:process.env.NODE_ENV=\"production\"", "--target=es2020"],
  { cwd: deps, maxBuffer: 64 << 20, env: { ...process.env, NODE_PATH: path.join(deps, "node_modules") } }).toString();
const css = execFileSync(bin("tailwindcss"), ["-c", path.join(here, "tailwind.config.js"), "-i", path.join(here, "index.css"), "--minify"],
  { cwd: here, maxBuffer: 64 << 20 }).toString();

const html = `<title>Reelscope</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>${css}</style>
<div id="root"></div>
<script>${js.replace(/<\/script/gi, "<\\/script")}</script>
`;
writeFileSync(path.join(here, "reelscope.html"), html);
console.log(`reelscope.html: ${(html.length / 1024).toFixed(0)} KB`);

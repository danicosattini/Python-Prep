# Reelscope · Simulador de Dashboard de Instagram

SPA en React + Tailwind CSS + lucide-react que analiza publicaciones (Reels, carruseles y fotos) y explica qué funciona, qué no y cómo mejorarlo.

- `InstagramDashboardSimulator.jsx`: la app completa en un solo componente (`export default App`).
- `tailwind.config.js` + `index.css`: tokens de color (modo claro/oscuro) que usa el componente.
- `reelscope.html`: versión compilada y autocontenida; se abre directo en el navegador.
- `build.mjs`: regenera `reelscope.html`.

## Usarlo en un proyecto React (Vite)

```bash
npm i lucide-react && npm i -D tailwindcss@3 postcss autoprefixer
```
Copiá `tailwind.config.js` (ajustá `content`) e importá `index.css` en tu `main.jsx`, luego renderizá `<App />`.

## Regenerar el HTML

```bash
mkdir deps && cd deps && npm init -y && npm i esbuild tailwindcss@3 react@18 react-dom@18 lucide-react && cd ..
node build.mjs deps
```

## Cómo analiza

Todo el análisis sale de `analyzePost()`: cinco señales (gancho, retención, alcance nuevo, interacción, conversión) con umbrales rojo/verde, un puntaje ponderado y reglas que detectan errores (gancho débil, sin CTA, poco contraste, audio fuera de tendencia, ritmo lento, etc.). Cada error trae su plan de acción. Los enlaces importados generan métricas simuladas y deterministas: no hay conexión real con Instagram.

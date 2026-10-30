# Reelscope Autoridad · Simulador de captación para talleres de escritura

SPA en React + Tailwind CSS + lucide-react que analiza el contenido de una socióloga, investigadora y escritora para medir si construye **autoridad** y atrae **futuros alumnos** de talleres y mentorías editoriales.

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

- **Pilares:** Autoridad y Teoría (meta 40%), Detrás de Escena / Proceso (35%), Comunidad y Reflexión (25%).
- **Índices de conversión:** Autoridad = (guardados + compartidos) / alcance; Intención de compra = comentarios de valor cada 1.000 cuentas; Conexión humana = mensajes directos cada 1.000 cuentas. En la cuenta se usa la mediana por publicación para que un post viral no infle el diagnóstico.
- **Diagnósticos:** Falta de Puente Comercial, Exceso Académico / Jerga, Falta de Vulnerabilidad, además de comentarios superficiales, reflexiones sin pregunta, gancho débil, alcance cautivo y portada poco legible. Cada uno trae su plan de acción.
- Los enlaces importados generan métricas simuladas y deterministas: no hay conexión real con Instagram.

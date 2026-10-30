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

Dos objetivos con peso distinto: **Captación** (60%, objetivo principal: alumnos para talleres y mentorías) y **Crecimiento** (40%: que te descubran, te sigan, compartan y comenten). Cada problema detectado indica a cuál de los dos afecta.

- **Crecimiento (posts publicados):** alcance a no seguidores, retención o lectura, compartidos cada 1.000 cuentas y seguidores nuevos cada 1.000 cuentas.
- **Crecimiento (antes de publicar):** gancho con curiosidad, ritmo visual (cortes de plano detectados comparando fotogramas), movimiento en los primeros 3 s, brillo, si es compartible (lista o pedido de enviarlo), si da una razón para seguirte (serie, próxima entrega) y palabras de búsqueda.

- **Pilares:** Autoridad y Teoría (meta 40%), Detrás de Escena / Proceso (35%), Comunidad y Reflexión (25%).
- **Índices de conversión:** Autoridad = (guardados + compartidos) / alcance; Intención de compra = comentarios de valor cada 1.000 cuentas; Conexión humana = mensajes directos cada 1.000 cuentas. En la cuenta se usa la mediana por publicación para que un post viral no infle el diagnóstico.
- **Diagnósticos:** Falta de Puente Comercial, Exceso Académico / Jerga, Falta de Vulnerabilidad, además de comentarios superficiales, reflexiones sin pregunta, gancho débil, alcance cautivo y portada poco legible. Cada uno trae su plan de acción.
- Los 5 posts de ejemplo tienen métricas simuladas: no hay conexión con Instagram.

## Revisión antes de publicar

Es la forma de cargar contenido propio: arrastrá una imagen, un video o un `.txt` a la zona superior (o usá "Subir post/video" / "Pegar texto"). No se importan enlaces de Instagram. El texto o guion se evalúa con los mismos criterios: gancho, jerga (con glosario y reescritura automática de términos), puente comercial, vulnerabilidad y pregunta abierta. Del archivo visual se miden en el navegador la duración, la proporción y el contraste. Del audio del video se mide la señal (silencio inicial, pausas largas, volumen, saturación); para analizar lo que se dice se cargan los subtítulos `.srt`/`.vtt` de CapCut o Edits (gancho de los primeros 3 s, palabras por minuto, momento del llamado a la acción) o se pega el guion. La voz no se transcribe dentro de la página. Nada se sube a ningún servidor.


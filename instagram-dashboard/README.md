# Reelscope Autoridad · Revisión previa de posts para cuentas de escritura y formación

SPA en React + Tailwind CSS + lucide-react. Subís un video, un carrusel, una imagen o un texto **antes de publicarlo** y recibís una devolución según criterios de buenas prácticas del nicho (escritura, literatura y formación), con dos objetivos: atraer alumnos para talleres y mentorías (60%) y crecer (40%).

- **Revisar** (inicio): subir el borrador, ver el análisis y guardarlo en *Mis revisiones* (solo en el navegador). Con 3 o más revisiones muestra los errores que se repiten y el reparto de pilares.
- **Criterios**: objetivos, pilares y mezcla recomendada, lista de control, especificaciones por formato y valores de referencia para después de publicar (no oficiales).
- **Ejemplos**: 5 casos ficticios, con métricas inventadas, para aprender a leer el análisis. No corresponden a ningún perfil real.

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

Es la forma de cargar contenido propio: arrastrá una imagen, un video, todas las diapositivas de un carrusel (se ordenan por nombre y se pueden reordenar) o un `.txt` a la zona superior (o usá "Subir post/video" / "Pegar texto"). No se importan enlaces de Instagram. El texto o guion se evalúa con los mismos criterios: gancho, jerga (con glosario y reescritura automática de términos), puente comercial, vulnerabilidad y pregunta abierta. Del archivo visual se miden en el navegador la duración, la proporción y el contraste. Del audio del video se mide la señal (silencio inicial, pausas largas, volumen, saturación); para analizar lo que se dice se cargan los subtítulos `.srt`/`.vtt` de CapCut o Edits (gancho de los primeros 3 s, palabras por minuto, momento del llamado a la acción) o se pega el guion. La voz no se transcribe dentro de la página. Nada se sube a ningún servidor.

## Lectura de imágenes con Claude

Dentro de claude.ai, la página usa la capacidad `sample` con imágenes (`capabilities: {sample: {images: true}}`): manda las diapositivas del carrusel, la imagen o 4–6 fotogramas del video a Claude, que transcribe el texto de cada imagen y evalúa portada, presencia de la autora, proceso visible, texto en pantalla y diseño. Ese texto alimenta el análisis (gancho, jerga, puente comercial, etc.) sin pegarlo a mano. Usa la cuenta de Claude de quien mira la página y pide permiso la primera vez. Fuera de claude.ai la función no está disponible y se puede pegar el texto manualmente.

## Cambios a medida

Después del análisis, Claude recibe el contenido real del post (texto de cada diapositiva, subtítulos con segundos, texto en pantalla, descripción y datos medidos del video) y la lista de problemas, y escribe para cada uno el cambio concreto: dónde se cambia, qué dice hoy, el texto exacto para poner (o la instrucción de edición con segundos), dos alternativas y una descripción completa reescrita. No inventa datos personales: los deja entre corchetes para completar. Con imágenes o video se genera sola una vez; con texto, con un botón. Si el texto cambia, avisa que las propuestas quedaron desactualizadas.


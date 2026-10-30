/**
 * Reelscope · Autoridad — Simulador de captación para talleres y mentorías de escritura
 * -----------------------------------------------------------------------------------
 * SPA de un solo archivo: React + Tailwind CSS + lucide-react.
 *
 * Pregunta de negocio que responde la app: ¿el contenido actual construye
 * autoridad y atrae a futuros alumnos de talleres y mentorías editoriales?
 *
 * Arquitectura:
 *   1. Utilidades y formato
 *   2. Datos: pilares de contenido, publicaciones de ejemplo y generador de importadas
 *   3. Motor de análisis: índices de conversión, semáforo, diagnóstico y plan de acción
 *   4. Diagnóstico estratégico de la cuenta (mezcla de pilares, puente comercial, jerga)
 *   4b. Revisión antes de publicar: analiza un archivo subido (texto, imagen o video)
 *   5. Componentes visuales
 *   6. Vistas: Resumen, Contenido, Análisis profundo, Revisión antes de publicar
 *   7. App
 *
 * Todo es simulado: no hay conexión con Instagram. El análisis sí se calcula
 * con reglas sobre las métricas de cada publicación.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck, Briefcase, ChevronRight, CircleCheck,
  CircleX, Clapperboard, Clock, Copy, Check, Eye, Feather, Filter, GalleryHorizontalEnd, GraduationCap,
  Heart, HeartHandshake, Image as ImageIcon, Languages, LayoutDashboard, LayoutGrid, Lightbulb,
  Mail, MessageCircle, MessageSquareQuote, MessagesSquare, MoonStar, PenLine, Search,
  Send, Sparkles, SunMedium, Target, TrendingUp, TriangleAlert, UserPlus, Users, X, Zap,
  Upload, FileText, FileVideo, FileImage, ClipboardPaste, AudioLines, Captions, Scissors,
} from "lucide-react";

/* ============================================================
 * 1. Utilidades
 * ============================================================ */
const nfInt = new Intl.NumberFormat("es-AR");
const nfCompact = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 });
const fmt = (n) => nfCompact.format(n);
const full = (n) => nfInt.format(Math.round(n));
const pct = (n, d = 1) => `${n.toFixed(d).replace(".", ",")}%`;
const dec = (n, d = 1) => n.toFixed(d).replace(".", ",");
const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));
const dateFmt = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
const cx = (...c) => c.filter(Boolean).join(" ");

const ACCOUNT = {
  handle: "@tu.cuaderno",
  name: "Socióloga · Investigadora · Escritora",
  followers: 6840,
  offer: "talleres de escritura y mentorías editoriales",
};

/* ============================================================
 * 2. Datos
 * ============================================================ */
const TYPE_META = {
  reel: { label: "Reel", plural: "Reels", icon: Clapperboard },
  carousel: { label: "Carrusel", plural: "Carruseles", icon: GalleryHorizontalEnd },
  photo: { label: "Foto/Texto", plural: "Fotos/Texto", icon: ImageIcon },
};

/**
 * Pilares de contenido. `target` es la mezcla recomendada para una cuenta que
 * vende formación: la autoridad atrae, el proceso genera confianza y la
 * comunidad sostiene la conversación.
 */
const PILLARS = {
  autoridad: {
    label: "Autoridad y Teoría",
    short: "Autoridad",
    desc: "Análisis de autores, sociología de la literatura, herramientas técnicas.",
    role: "Demuestra que sabés enseñar.",
    icon: GraduationCap,
    target: 40,
    color: "bg-p1", text: "text-p1", soft: "bg-p1/12",
    palette: ["#1b2a41", "#324a5f"], ink: "#f3ead8",
    hookAlt: "Hay un truco que usan todas las novelas que no podés dejar de leer. Te lo muestro en 3 ejemplos.",
    bridgeCTA: "Si querés aplicar esto a tu propia novela, seguime: en noviembre abro la lista de espera del taller.",
  },
  proceso: {
    label: "Detrás de Escena / Proceso",
    short: "Proceso",
    desc: "Avances de tu novela, tu rutina como investigadora y escritora.",
    role: "Genera confianza: la gente compra mentorías a personas.",
    icon: PenLine,
    target: 35,
    color: "bg-p2", text: "text-p2", soft: "bg-p2/12",
    palette: ["#6b2d1f", "#b5653a"], ink: "#fff1e0",
    hookAlt: "Borré 40 páginas de mi novela la semana pasada. Te cuento por qué fue la mejor decisión.",
    bridgeCTA: "Si estás trabada con tu novela, escribime “CAPÍTULO” por mensaje y te cuento cómo trabajo en las mentorías.",
  },
  comunidad: {
    label: "Comunidad y Reflexión",
    short: "Comunidad",
    desc: "Preguntas abiertas, debates sobre lecturas, reflexiones profundas.",
    role: "Sostiene la conversación y te muestra qué le duele a tu audiencia.",
    icon: MessagesSquare,
    target: 25,
    color: "bg-p3", text: "text-p3", soft: "bg-p3/12",
    palette: ["#2f3e36", "#58705f"], ink: "#eef3e8",
    hookAlt: "¿Se puede enseñar a escribir? Mi respuesta después de 10 años investigando cómo escriben los escritores.",
    bridgeCTA: "Contame en comentarios qué te frena hoy: con eso armo el programa del próximo taller.",
  },
};
const PILLAR_KEYS = Object.keys(PILLARS);

/**
 * Publicaciones de ejemplo (validación previa al lanzamiento).
 * comments.value = comentarios que preguntan, debaten o cuentan algo propio.
 * dmInquiries = mensajes directos que preguntan por talleres o mentorías.
 * jargon = 0–100, densidad de vocabulario académico.
 */
const SEED_POSTS = [
  {
    id: "s1", type: "carousel", pillar: "autoridad", date: "2026-10-24", hour: 12, slides: 8,
    title: "Análisis sociológico de cómo Gabriel García Márquez construía sus personajes",
    caption: "García Márquez no inventaba personajes: los observaba. En este carrusel desarmo su método en 6 pasos, desde la sociología de la literatura…",
    cover: { palette: ["#1b2a41", "#324a5f"], ink: "#f3ead8", kicker: "Autoridad · Análisis", headline: "Cómo construía personajes García Márquez" },
    slideRetention: [100, 81, 74, 70, 66, 63, 61, 58],
    metrics: { reach: 9400, impressions: 13100, nonFollowerPct: 48, likes: 610, saves: 742, shares: 188, comments: { total: 64, value: 41 }, dms: 22, dmInquiries: 3, follows: 96, profileVisits: 520 },
    attrs: { commercialBridge: false, jargon: 35, vulnerability: false, openQuestion: true },
    verdict: "Excelente autoridad, listo para captar alumnos. Lo guardan como material de estudio; solo falta decirles que vos enseñás esto.",
    sampleComments: [
      { text: "Lo guardo para releerlo con mi manuscrito al lado. ¿Hacés esto con Rulfo?", value: true },
      { text: "¿Dónde puedo estudiar esto con vos?", value: true },
      { text: "Qué análisis tan claro 👏", value: false },
    ],
    copy: { bridgeCTA: "Si querés construir tus personajes así, seguime para no perderte mis próximos talleres. Abro la lista de espera en noviembre." },
  },
  {
    id: "s2", type: "reel", pillar: "proceso", date: "2026-10-20", hour: 20, duration: 41,
    title: "3 bloqueos que sufrí terminando el capítulo 12 de mi novela y cómo los superé",
    caption: "Tres semanas sin poder cerrar el capítulo 12. Te cuento los 3 bloqueos y qué hice con cada uno…",
    cover: { palette: ["#6b2d1f", "#b5653a"], ink: "#fff1e0", kicker: "Proceso · Mi novela", headline: "Capítulo 12: 3 bloqueos" },
    retention: [[0, 100], [1, 90], [3, 78], [6, 70], [10, 63], [15, 58], [20, 54], [30, 48], [41, 44]],
    metrics: { reach: 7200, impressions: 9100, nonFollowerPct: 38, likes: 690, saves: 140, shares: 96, comments: { total: 118, value: 74 }, dms: 61, dmInquiries: 9, follows: 58, profileVisits: 470 },
    attrs: { commercialBridge: false, jargon: 12, vulnerability: true, openQuestion: true, hookText: "Estuve tres semanas sin poder cerrar el capítulo 12." },
    verdict: "Empatía pura con futuros mentorados. Se reconocen en tus bloqueos y te escriben: es la antesala de una mentoría.",
    sampleComments: [
      { text: "El segundo bloqueo me está pasando ahora mismo. ¿Acompañás procesos de escritura?", value: true },
      { text: "Gracias por mostrar que a vos también te cuesta. ¿Cuánto tardaste en total?", value: true },
      { text: "❤️❤️❤️", value: false },
    ],
    copy: { bridgeCTA: "Si estás trabada en tu novela, escribime “CAPÍTULO” por mensaje y te cuento cómo trabajo en las mentorías." },
  },
  {
    id: "s3", type: "photo", pillar: "comunidad", date: "2026-10-15", hour: 9,
    title: "Una cita de Marguerite Duras sobre la soledad del escritor + mi reflexión",
    caption: "“La soledad de la escritura es una soledad sin la cual el escrito no se produce.” Duras lo dijo mejor que nadie. Mi reflexión…",
    cover: { palette: ["#2f3e36", "#58705f"], ink: "#eef3e8", kicker: "Comunidad · Duras", headline: "La soledad del escritor" },
    metrics: { reach: 3900, impressions: 4600, nonFollowerPct: 17, likes: 410, saves: 58, shares: 21, comments: { total: 52, value: 9 }, dms: 6, dmInquiries: 0, follows: 8, profileVisits: 90 },
    attrs: { commercialBridge: false, jargon: 30, vulnerability: false, openQuestion: false, readMorePct: 34 },
    verdict: "Rendimiento medio. Gusta, pero no conversa: la reflexión cierra el tema en lugar de abrirlo.",
    sampleComments: [
      { text: "Hermoso 🤍", value: false },
      { text: "Amo a Duras", value: false },
      { text: "A mí la soledad me paraliza, no me ayuda a escribir", value: true },
    ],
    copy: {
      openQuestion: "¿La soledad te ayuda a escribir o te frena? Contame en qué momento del día escribís y si lo hacés sola.",
      vulnerabilityIdea: "Sacá una foto de tu escritorio a la hora en que escribís y contá qué te pasa con la soledad en tu propia novela.",
    },
  },
  {
    id: "s4", type: "carousel", pillar: "autoridad", date: "2026-10-09", hour: 13, slides: 10,
    title: "La estructura en 3 actos explicada con ejemplos de novelas clásicas",
    caption: "Planteamiento, nudo y desenlace con ejemplos de Austen, Dostoievski y Borges. Guardalo para cuando planifiques tu novela…",
    cover: { palette: ["#14213d", "#2b4c7e"], ink: "#fca311", kicker: "Herramienta", headline: "La estructura en 3 actos" },
    slideRetention: [100, 86, 80, 77, 74, 72, 70, 68, 66, 64],
    metrics: { reach: 24800, impressions: 36200, nonFollowerPct: 71, likes: 1890, saves: 2480, shares: 910, comments: { total: 236, value: 171 }, dms: 84, dmInquiries: 23, follows: 412, profileVisits: 2210 },
    attrs: { commercialBridge: true, jargon: 18, vulnerability: false, openQuestion: true },
    verdict: "Imán de futuros talleristas. Herramienta práctica, ejemplos conocidos y un puente claro hacia tu taller.",
    sampleComments: [
      { text: "¿El taller va a trabajar estructura así, con nuestras propias novelas?", value: true },
      { text: "Mi novela no tiene segundo acto claro, ¿cómo lo detecto?", value: true },
      { text: "Guardadísimo 📌", value: false },
    ],
    copy: {},
  },
  {
    id: "s5", type: "reel", pillar: "autoridad", date: "2026-10-02", hour: 22, duration: 74,
    title: "Explicación densa sobre la sociología del lenguaje en la literatura",
    caption: "La sociolingüística bourdieusiana permite pensar el campo literario como un mercado lingüístico donde el habitus del autor…",
    cover: { palette: ["#3a3a40", "#55555e"], ink: "#6d6d78", kicker: "Teoría", headline: "Sociología del lenguaje literario" },
    retention: [[0, 100], [1, 62], [3, 34], [6, 24], [10, 18], [20, 12], [40, 8], [60, 6], [74, 5]],
    metrics: { reach: 2100, impressions: 2300, nonFollowerPct: 14, likes: 64, saves: 22, shares: 4, comments: { total: 7, value: 3 }, dms: 1, dmInquiries: 0, follows: 1, profileVisits: 25 },
    attrs: { commercialBridge: false, jargon: 90, vulnerability: false, openQuestion: false, hookText: "La sociolingüística bourdieusiana permite pensar el campo literario…", coverLow: true },
    verdict: "Demasiado académico. El lenguaje técnico aleja al público general: hablás para colegas, no para futuros alumnos.",
    sampleComments: [
      { text: "No entendí mucho pero suena interesante", value: false },
      { text: "¿Qué es habitus?", value: true },
      { text: "👏", value: false },
    ],
    copy: {
      hookAlt: "¿Por qué tus personajes hablan todos igual? Porque escribís con tu forma de hablar, no con la de ellos.",
      jargonBefore: "El habitus lingüístico del autor determina su capital simbólico dentro del campo literario.",
      jargonAfter: "Tu forma de hablar viene de dónde creciste, y eso se filtra en todos tus personajes. Te muestro cómo darle a cada uno su propia voz.",
    },
  },
];

/* ============================================================
 * 3. Motor de análisis por publicación
 * ============================================================ */
function retAt(points, t) {
  for (let i = 1; i < points.length; i++) {
    const [t0, v0] = points[i - 1];
    const [t1, v1] = points[i];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  }
  return points[points.length - 1][1];
}
function scoreFrom(v, red, green) {
  if (v >= green) return clamp(75 + ((v - green) / green) * 50, 75, 100);
  if (v >= red) return 45 + ((v - red) / (green - red)) * 30;
  return clamp((v / red) * 45, 5, 45);
}
const statusOf = (score) => (score >= 72 ? "good" : score >= 50 ? "warn" : "bad");
const SEV_ORDER = { alta: 0, media: 1, baja: 2 };

/** Umbrales de los tres índices de conversión (rojo, verde). */
const KPI = {
  authority: { red: 1.5, green: 4, label: "Índice de Autoridad", sub: "Guardados + compartidos sobre alcance", unit: "%" },
  intent: { red: 1.5, green: 4, label: "Intención de Compra", sub: "Comentarios de valor cada 1.000 cuentas", unit: "‰" },
  connection: { red: 1, green: 3, label: "Conexión Humana", sub: "Mensajes directos cada 1.000 cuentas", unit: "‰" },
};

function computeIndices(post) {
  const m = post.metrics;
  return {
    authority: ((m.saves + m.shares) / m.reach) * 100,
    intent: (m.comments.value / m.reach) * 1000,
    connection: (m.dms / m.reach) * 1000,
    commentQuality: m.comments.total ? (m.comments.value / m.comments.total) * 100 : 0,
    er: ((m.likes + m.saves + m.shares + m.comments.total) / m.reach) * 100,
    interactions: m.likes + m.saves + m.shares + m.comments.total,
  };
}

function analyzePost(post) {
  const m = post.metrics;
  const a = post.attrs;
  const P = PILLARS[post.pillar];
  const copy = { ...P, ...(post.copy || {}) };
  const idx = computeIndices(post);

  // Retención según formato
  let ret3 = null, avgWatch = null, swipe = null, completion = null, retention;
  if (post.type === "reel") {
    ret3 = Math.round(retAt(post.retention, 3));
    let sum = 0;
    for (let t = 0; t <= post.duration; t++) sum += retAt(post.retention, t);
    avgWatch = sum / (post.duration + 1);
    retention = { label: "Retención", value: pct(avgWatch, 0), detail: "del video visto en promedio", score: scoreFrom(avgWatch, 30, 50), icon: Clock };
  } else if (post.type === "carousel") {
    swipe = post.slideRetention[1];
    completion = post.slideRetention[post.slideRetention.length - 1];
    retention = { label: "Lectura completa", value: pct(completion, 0), detail: "llega a la última diapositiva", score: scoreFrom(completion, 25, 45), icon: BookOpen };
  } else {
    retention = { label: "Lectura del texto", value: pct(a.readMorePct, 0), detail: "abrió el texto completo", score: scoreFrom(a.readMorePct, 25, 45), icon: BookOpen };
  }

  const signals = [
    { key: "authority", label: "Autoridad", value: pct(idx.authority), detail: "guardó o compartió", score: scoreFrom(idx.authority, KPI.authority.red, KPI.authority.green), icon: BookmarkCheck },
    { key: "intent", label: "Intención de compra", value: `${dec(idx.intent)} ‰`, detail: "comentarios de valor", score: scoreFrom(idx.intent, KPI.intent.red, KPI.intent.green), icon: MessageSquareQuote },
    { key: "connection", label: "Conexión humana", value: `${dec(idx.connection)} ‰`, detail: "mensajes directos", score: scoreFrom(idx.connection, KPI.connection.red, KPI.connection.green), icon: HeartHandshake },
    { key: "reach", label: "Alcance nuevo", value: pct(m.nonFollowerPct, 0), detail: "no te seguía", score: scoreFrom(m.nonFollowerPct, 20, 40), icon: Users },
    { key: "retention", ...retention },
  ];
  signals.forEach((s) => (s.status = statusOf(s.score)));
  const weights = { authority: 0.25, intent: 0.25, connection: 0.2, reach: 0.15, retention: 0.15 };
  const score = Math.round(signals.reduce((acc, s) => acc + s.score * weights[s.key], 0));
  const status = statusOf(score);
  const byKey = Object.fromEntries(signals.map((s) => [s.key, s]));

  // --- Diagnóstico orientado a venta de servicios
  const issues = [];
  const add = (o) => issues.push(o);

  if (!a.commercialBridge && post.pillar !== "comunidad") {
    const strong = byKey.authority.status === "good" || byKey.connection.status === "good";
    add({
      id: "bridge", sev: strong ? "alta" : "media", icon: Briefcase,
      title: "Falta de Puente Comercial",
      why: strong
        ? `El post funciona (${pct(idx.authority)} lo guardó o compartió, ${full(m.dms)} mensajes), pero en ningún momento le recordás al lector que vos enseñás esto. Es interés que se pierde.`
        : "El post no menciona en ningún momento que das talleres o mentorías. Quien lo ve no tiene forma de saber que puede aprender esto con vos.",
      fix: {
        title: "Recordale al lector que vos enseñás esto",
        lead: "El post es brillante en teoría, pero no le recordaste al lector que tú enseñas esto.",
        steps: [
          post.pillar === "proceso" ? "En el cierre, conectá tu bloqueo con el de quien mira y ofrecé conversar por mensaje." : "En la última diapositiva o los últimos segundos, decí en una frase que esto es parte de lo que enseñás.",
          "Usá una sola acción concreta: seguirte, escribirte una palabra clave por DM o anotarse en la lista de espera.",
          "Repetí el CTA en la primera línea del texto del post.",
        ],
        example: copy.bridgeCTA,
      },
    });
  }
  if (a.jargon >= 60) {
    add({
      id: "jargon", sev: a.jargon >= 80 ? "alta" : "media", icon: Languages,
      title: "Exceso Académico / Jerga",
      why: `Densidad de vocabulario técnico: ${a.jargon}/100.${a.hookText ? ` Arrancás con “${a.hookText}”.` : ""} Solo ${post.type === "reel" ? `el ${ret3}% sigue mirando al segundo 3` : `el ${pct(m.nonFollowerPct, 0)} del alcance es gente nueva`}.`,
      fix: {
        title: "Traducí el concepto sociológico a lenguaje de escritor",
        lead: "Estás hablando como investigadora para otros investigadores. Traduce el concepto sociológico a un lenguaje accesible para un escritor aficionado.",
        steps: [
          "Empezá por el problema que el escritor ya tiene (“mis personajes hablan todos igual”), no por el concepto.",
          "Nombrá el concepto una sola vez, después de explicarlo con un ejemplo.",
          "Un concepto por pieza. Si necesitás tres, son tres posts.",
        ],
        before: copy.jargonBefore,
        after: copy.jargonAfter,
      },
    });
  }
  if (!a.vulnerability && post.pillar === "autoridad" && byKey.connection.status !== "good") {
    add({
      id: "vulnerability", sev: "media", icon: Feather,
      title: "Falta de Vulnerabilidad",
      why: `Mucha teoría y nada de vos: ${dec(idx.connection)} mensajes por cada mil cuentas. La autoridad sin cercanía genera respeto, pero no confianza para contratar una mentoría.`,
      fix: {
        title: "Mostrá cómo usás esto en tu propia novela",
        lead: "Muestras mucha teoría pero poco de tu novela. La gente compra mentorías a personas, no a enciclopedias. Muestra más tu pantalla escribiendo.",
        steps: [
          "Sumá una diapositiva o un plano con tu manuscrito aplicando la herramienta.",
          "Contá un error propio que esta teoría te ayudó a corregir.",
          "Mostrá tu pantalla o tu cuaderno escribiendo, aunque sea 3 segundos.",
        ],
        example: copy.vulnerabilityIdea,
      },
    });
  }
  if (post.type === "reel" && ret3 < 50 && a.jargon < 60) {
    add({
      id: "hook", sev: ret3 < 40 ? "alta" : "media", icon: Zap,
      title: "Gancho inicial débil",
      why: `Solo el ${ret3}% sigue mirando en el segundo 3.`,
      fix: {
        title: "Abrí con el problema del escritor, no con el tema",
        steps: ["Primera frase: una situación que tu alumno ideal vive hoy.", "Texto en pantalla con esa misma frase.", "Prometé qué se va a llevar en menos de 10 palabras."],
        example: copy.hookAlt,
      },
    });
  }
  if (idx.commentQuality < 35 && m.comments.total >= 10) {
    add({
      id: "shallow", sev: "media", icon: MessageCircle,
      title: "Comentarios superficiales",
      why: `Solo ${m.comments.value} de ${m.comments.total} comentarios (${pct(idx.commentQuality, 0)}) preguntan o debaten. El resto son emojis o elogios: gusta, pero no revela necesidades que puedas resolver con un taller.`,
      fix: {
        title: "Cerrá con una pregunta que obligue a contar algo propio",
        steps: ["Evitá preguntas de sí o no.", "Pedí una experiencia concreta: “¿en qué capítulo te trabaste?”.", "Respondé los primeros comentarios con otra pregunta para abrir conversación."],
        example: copy.openQuestion,
      },
    });
  }
  if (!a.openQuestion && post.pillar === "comunidad") {
    add({
      id: "question", sev: "media", icon: MessagesSquare,
      title: "Reflexión que cierra el tema",
      why: "Es un post de comunidad que no invita a responder: la reflexión queda completa y no hay lugar para la voz del lector.",
      fix: {
        title: "Terminá la reflexión con una pregunta abierta",
        steps: ["Dejá la reflexión incompleta a propósito: planteá la tensión y pedí su postura.", "Ofrecé dos opciones en conflicto para que elijan y argumenten."],
        example: copy.openQuestion,
      },
    });
  }
  if (m.nonFollowerPct < 20) {
    add({
      id: "captive", sev: "baja", icon: Users,
      title: "Alcance cautivo",
      why: `El ${100 - m.nonFollowerPct}% del alcance son tus seguidores. Para llenar un taller necesitás que te descubran personas nuevas.`,
      fix: {
        title: "Escribí para quien busca, no solo para quien ya te sigue",
        steps: ["Usá palabras que un escritor buscaría (“cómo escribir una novela”, “bloqueo creativo”) en la primera línea y en el texto en pantalla.", "Convertí la idea en carrusel o Reel: las fotos sueltas rara vez llegan a no seguidores."],
      },
    });
  }
  if (a.coverLow) {
    add({
      id: "cover", sev: "baja", icon: ImageIcon,
      title: "Portada poco legible",
      why: "El texto de la portada tiene poco contraste con el fondo; en la grilla no se lee.",
      fix: { title: "Portada con contraste y una promesa concreta", steps: ["Máximo 6 palabras.", "Texto claro sobre fondo oscuro o al revés.", "Prometé un resultado para el escritor, no un tema académico."] },
    });
  }
  issues.sort((x, y) => SEV_ORDER[x.sev] - SEV_ORDER[y.sev]);

  // --- Lo que funcionó
  const strengths = [];
  if (byKey.authority.status === "good") strengths.push(`Autoridad alta: el ${pct(idx.authority)} lo guardó o compartió. Lo usan como material de estudio.`);
  if (byKey.intent.status === "good") strengths.push(`Intención de compra: ${m.comments.value} comentarios hacen preguntas o debaten (${pct(idx.commentQuality, 0)} del total).`);
  if (byKey.connection.status === "good") strengths.push(`Conexión humana: ${full(m.dms)} mensajes directos, ${m.dmInquiries} preguntando por talleres o mentorías.`);
  if (a.vulnerability) strengths.push("Mostrás tu proceso real: la gente se identifica con vos, no solo con el tema.");
  if (a.commercialBridge) strengths.push("Tiene puente comercial: el lector sabe que puede aprender esto con vos.");
  if (m.nonFollowerPct >= 40) strengths.push(`Te descubre gente nueva: el ${m.nonFollowerPct}% no te seguía.`);
  if (a.jargon < 30) strengths.push("Lenguaje accesible para un escritor aficionado.");

  // --- Plan de acción
  const impactOf = { alta: "Alto", media: "Medio", baja: "Bajo" };
  let plan = issues.map((i) => ({ ...i.fix, impact: impactOf[i.sev], from: i.title, icon: i.icon }));
  if (!issues.length) {
    plan = [
      {
        title: "Convertilo en un imán de la lista de espera",
        steps: ["Ofrecé una versión ampliada (plantilla o guía en PDF) a cambio del correo electrónico.", "Fijá este post en tu perfil."],
        example: "Comentá “ESTRUCTURA” y te mando la plantilla para aplicar los 3 actos a tu novela.",
        impact: "Alto", from: "Formato ganador", icon: Sparkles,
      },
      {
        title: "Hacé una serie con la misma estructura",
        steps: ["Repetí el formato con otras herramientas: punto de vista, ritmo, diálogo.", "Cerrá cada entrega con el mismo puente comercial."],
        impact: "Alto", from: "Formato ganador", icon: Sparkles,
      },
      {
        title: "Sumá tu manuscrito al ejemplo",
        steps: ["En la próxima versión, agregá una diapositiva aplicando la herramienta a tu propia novela."],
        impact: "Medio", from: "Más conexión", icon: Feather,
      },
    ];
  }

  return { score, status, signals, issues, strengths, plan, ret3, avgWatch, swipe, completion, ...idx };
}

/* ============================================================
 * 4. Diagnóstico estratégico de la cuenta
 * ============================================================ */
function analyzeAccount(posts, analyses) {
  const sum = (list, f) => list.reduce((acc, p) => acc + f(p), 0);
  const reach = sum(posts, (p) => p.metrics.reach);
  // Mediana por publicación: describe el post típico y no se deja arrastrar por un solo post viral.
  const median = (vals) => {
    const v = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(v.length / 2);
    return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  };
  const kpis = Object.fromEntries(["authority", "intent", "connection"].map((k) => [k, median(posts.map((p) => analyses[p.id][k]))]));
  const kpisWeighted = {
    authority: (sum(posts, (p) => p.metrics.saves + p.metrics.shares) / reach) * 100,
    intent: (sum(posts, (p) => p.metrics.comments.value) / reach) * 1000,
    connection: (sum(posts, (p) => p.metrics.dms) / reach) * 1000,
  };
  const kpiStatus = Object.fromEntries(Object.entries(kpis).map(([k, v]) => [k, statusOf(scoreFrom(v, KPI[k].red, KPI[k].green))]));
  const readiness = Math.round(
    (scoreFrom(kpis.authority, KPI.authority.red, KPI.authority.green) * 0.35 +
      scoreFrom(kpis.intent, KPI.intent.red, KPI.intent.green) * 0.35 +
      scoreFrom(kpis.connection, KPI.connection.red, KPI.connection.green) * 0.3)
  );

  const pillars = PILLAR_KEYS.map((k) => {
    const list = posts.filter((p) => p.pillar === k);
    const r = sum(list, (p) => p.metrics.reach) || 1;
    return {
      key: k,
      count: list.length,
      share: posts.length ? (list.length / posts.length) * 100 : 0,
      authority: list.length ? (sum(list, (p) => p.metrics.saves + p.metrics.shares) / r) * 100 : 0,
      intent: list.length ? (sum(list, (p) => p.metrics.comments.value) / r) * 1000 : 0,
      connection: list.length ? (sum(list, (p) => p.metrics.dms) / r) * 1000 : 0,
      dms: sum(list, (p) => p.metrics.dms),
      inquiries: sum(list, (p) => p.metrics.dmInquiries),
    };
  });

  const funnel = [
    { label: "Cuentas alcanzadas", value: reach, icon: Eye },
    { label: "Visitas al perfil", value: sum(posts, (p) => p.metrics.profileVisits), icon: UserPlus },
    { label: "Seguidores nuevos", value: sum(posts, (p) => p.metrics.follows), icon: Users },
    { label: "Mensajes directos", value: sum(posts, (p) => p.metrics.dms), icon: Mail },
    { label: "Consultas por talleres", value: sum(posts, (p) => p.metrics.dmInquiries), icon: GraduationCap },
  ];

  // Hallazgos de cuenta
  const findings = [];
  const proceso = pillars.find((p) => p.key === "proceso");
  const totalDms = sum(posts, (p) => p.metrics.dms) || 1;
  if (proceso.share < 30) {
    findings.push({
      id: "vulnerability", sev: "alta", icon: Feather, title: "Falta de Vulnerabilidad",
      why: `Solo ${proceso.count} de ${posts.length} publicaciones muestran tu novela o tu proceso (${pct(proceso.share, 0)}), y ${proceso.count === 1 ? "esa generó" : "esas generaron"} el ${pct((proceso.dms / totalDms) * 100, 0)} de todos tus mensajes directos.`,
      fix: "Muestras mucha teoría pero poco de tu novela. La gente compra mentorías a personas, no a enciclopedias. Muestra más tu pantalla escribiendo: llevá el pilar Proceso al 35% (1 de cada 3 publicaciones).",
    });
  }
  const authorityPosts = posts.filter((p) => p.pillar === "autoridad");
  const noBridge = authorityPosts.filter((p) => !p.attrs.commercialBridge);
  if (authorityPosts.length && noBridge.length / authorityPosts.length >= 0.5) {
    const lostSaves = sum(noBridge, (p) => p.metrics.saves);
    findings.push({
      id: "bridge", sev: "alta", icon: Briefcase, title: "Falta de Puente Comercial",
      why: `${noBridge.length} de ${authorityPosts.length} posts de autoridad no mencionan que das talleres. Suman ${full(lostSaves)} guardados de gente que valora lo que enseñás y no sabe que puede estudiarlo con vos.`,
      fix: "Agregá a todo post de Autoridad una frase final del tipo: “Si querés estructurar tu historia así, seguime para no perderte mis próximos talleres”.",
    });
  }
  const jargonPosts = posts.filter((p) => p.attrs.jargon >= 60);
  if (jargonPosts.length) {
    const avgJ = sum(jargonPosts, (p) => p.metrics.reach) / jargonPosts.length;
    const others = posts.filter((p) => p.attrs.jargon < 60);
    const avgO = others.length ? sum(others, (p) => p.metrics.reach) / others.length : avgJ;
    findings.push({
      id: "jargon", sev: "media", icon: Languages, title: "Exceso Académico / Jerga",
      why: `${jargonPosts.length} ${jargonPosts.length === 1 ? "publicación usa" : "publicaciones usan"} lenguaje muy técnico y alcanzan en promedio ${fmt(avgJ)} cuentas, contra ${fmt(avgO)} del resto.`,
      fix: "Estás hablando como investigadora para otros investigadores. Tu diferencial es la mirada sociológica, pero tu cliente es un escritor aficionado: explicá con su problema, no con tu marco teórico.",
    });
  }
  const bestIntent = [...pillars].filter((p) => p.count).sort((a, b) => b.intent - a.intent)[0];
  const bestConn = [...pillars].filter((p) => p.count).sort((a, b) => b.connection - a.connection)[0];
  const bestAuth = [...pillars].filter((p) => p.count).sort((a, b) => b.authority - a.authority)[0];

  const issueMap = {};
  posts.forEach((p) =>
    analyses[p.id].issues.forEach((i) => {
      issueMap[i.id] = issueMap[i.id] || { ...i, count: 0 };
      issueMap[i.id].count++;
    })
  );
  const recurring = Object.values(issueMap).sort((a, b) => b.count - a.count || SEV_ORDER[a.sev] - SEV_ORDER[b.sev]).slice(0, 5);
  const ranked = [...posts].sort((a, b) => analyses[b.id].score - analyses[a.id].score);

  return { reach, kpis, kpisWeighted, kpiStatus, readiness, pillars, funnel, findings, bestIntent, bestConn, bestAuth, recurring, ranked };
}

/* ============================================================
 * 4b. Revisión antes de publicar
 * ------------------------------------------------------------
 * Antes de publicar no hay métricas: se evalúa el texto (o guion)
 * con los mismos criterios de captación, y el archivo visual con
 * comprobaciones de formato que el navegador puede medir
 * (duración, proporción y contraste).
 * ============================================================ */
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const countHits = (nt, list) => list.filter((k) => nt.includes(k)).length;

/** Términos académicos y su traducción a lenguaje de escritor (los más largos primero). */
const JARGON = [
  ["habitus linguistico", "tu forma de hablar"],
  ["capital simbolico", "prestigio"],
  ["capital cultural", "lo que leíste y aprendiste en tu entorno"],
  ["campo literario", "el mundo de los libros"],
  ["mercado linguistico", "la forma en que se valora cómo habla cada uno"],
  ["en tanto que", "como"],
  ["sociolinguistic", "sobre cómo hablamos según de dónde venimos"],
  ["habitus", "las costumbres que traés de tu entorno"],
  ["intertextualidad", "el diálogo entre libros"],
  ["heteroglosia", "las distintas formas de hablar dentro de una novela"],
  ["polifonia", "varias voces dentro del relato"],
  ["dialogismo", "el diálogo entre voces"],
  ["subjetividad", "la mirada de cada persona"],
  ["alteridad", "el otro"],
  ["hegemoni", "dominante"],
  ["episteme", "la forma de pensar de una época"],
  ["epistemolog", "sobre cómo sabemos lo que sabemos"],
  ["ontolog", "sobre lo que algo es"],
  ["hermeneutic", "interpretación"],
  ["semiotic", "sobre los signos"],
  ["discursiv", "del modo de contar"],
  ["dispositivo", "mecanismo"],
  ["paradigma", "modelo"],
  ["performativ", "que hace lo que dice"],
  ["deconstrucc", "desarmar una idea"],
  ["significante", "la palabra"],
  ["doxa", "lo que todos dan por sentado"],
  ["praxis", "la práctica"],
  ["problematiz", "cuestionar"],
];
const ACCENT_CLASS = { a: "[aá]", e: "[eé]", i: "[ií]", o: "[oó]", u: "[uúü]", n: "[nñ]" };
const termRe = (t) => new RegExp(`(?<!\\p{L})${t.split("").map((c) => ACCENT_CLASS[c] || c).join("")}\\p{L}*`, "giu");

const BRIDGE_WORDS = ["taller", "mentoria", "lista de espera", "inscrib", "inscripc", "cupos", "acompanamiento", "curso", "escribime", "escribeme", "mandame un mensaje", "por dm", "por mensaje", "link en bio", "enlace en bio", "seguime para", "sigueme para", "proxima edicion"];
const PROCESS_WORDS = ["mi novela", "mi manuscrito", "mi libro", "capitulo", "me costo", "bloqueo", "me bloque", "borre", "reescrib", "mi escritorio", "mi rutina", "estoy escribiendo", "borrador", "confieso", "me paso", "me equivoque", "mi proceso", "mientras escribo", "cuando escribo"];
const COMMUNITY_WORDS = ["contame", "cuentame", "comenta", "y vos", "y tu", "que opinas", "que piensas", "te pasa", "les pasa", "debate", "pienso que", "creo que", "reflexion", "cita"];
const AUTHORITY_WORDS = ["analisis", "herramienta", "estructura", "tecnica", "narrador", "personaje", "trama", "punto de vista", "sociolog", "metodo", "como construi", "como escribia", "ejemplo", "garcia marquez", "borges", "cortazar", "austen", "dostoievski", "rulfo", "woolf", "pizarnik", "duras"];
const SEARCH_WORDS = ["escribir", "escritura", "escritor", "novela", "cuento", "personaje", "taller", "libro", "bloqueo", "editorial", "manuscrito"];
const WEAK_OPENERS = ["hola", "buenas", "buen dia", "hoy les", "hoy te traigo", "en este video", "en este post", "bienvenid", "como estan"];
const QUESTION_ALT = {
  autoridad: "¿Lo aplicarías en tu novela? Contame en qué personaje estás trabajando.",
  proceso: "¿A vos también te pasó? Contame en qué capítulo te trabaste.",
  comunidad: "¿Estás de acuerdo o lo ves distinto? Contame tu experiencia en comentarios.",
};

/** Desvío estándar de la luminancia (0–255): mide si la imagen tiene contraste suficiente. */
function lumaContrast(source, w, h) {
  const c = document.createElement("canvas");
  c.width = 48;
  c.height = Math.max(1, Math.round((48 * h) / w));
  const ctx = c.getContext("2d");
  ctx.drawImage(source, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let s1 = 0, s2 = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    s1 += y;
    s2 += y * y;
    n++;
  }
  const mean = s1 / n;
  return Math.sqrt(Math.max(0, s2 / n - mean * mean));
}

/** Lee subtítulos .srt o .vtt (los que exportan CapCut o Edits) como [{start, end, text}]. */
function parseSubtitles(raw) {
  const toSec = (t) => {
    const p = t.trim().replace(",", ".").split(":").map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  };
  const cues = [];
  raw.replace(/\r/g, "").split(/\n\s*\n/).forEach((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) return;
    const [a, b] = lines[i].split("-->");
    const text = lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").trim();
    if (text) cues.push({ start: toSec(a), end: toSec(b.trim().split(/\s+/)[0]), text });
  });
  return cues;
}

/**
 * Analiza la pista de audio del video en el navegador (sin transcribir):
 * energía cada 50 ms, inicio del sonido, pausas largas, nivel y saturación.
 */
async function analyzeAudio(file) {
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const audio = await new Ctx(1, 1, 44100).decodeAudioData(await file.arrayBuffer());
  const n = audio.length;
  const chans = Array.from({ length: audio.numberOfChannels }, (_, i) => audio.getChannelData(i));
  const fd = 0.05;
  const win = Math.round(audio.sampleRate * fd);
  const frames = [];
  let peak = 0, clipped = 0;
  for (let i = 0; i < n; i += win) {
    const end = Math.min(n, i + win);
    let sum = 0;
    for (let j = i; j < end; j++) {
      let v = 0;
      for (const c of chans) v += c[j];
      v /= chans.length;
      sum += v * v;
      const abs = Math.abs(v);
      if (abs > peak) peak = abs;
      if (abs >= 0.99) clipped++;
    }
    frames.push(10 * Math.log10(sum / (end - i) + 1e-12));
  }
  const peakDb = 20 * Math.log10(peak + 1e-12);
  const sorted = [...frames].sort((a, b) => a - b);
  const threshold = Math.max(sorted[Math.floor(sorted.length * 0.95)] - 25, -50);
  const active = frames.map((d) => d > threshold);
  const first = active.indexOf(true);
  const last = active.lastIndexOf(true);
  const pauses = [];
  let run = 0, runStart = 0;
  for (let i = Math.max(first, 0); first >= 0 && i <= last; i++) {
    if (!active[i]) {
      if (!run) runStart = i;
      run++;
    } else {
      if (run * fd >= 1.2) pauses.push({ start: runStart * fd, length: run * fd });
      run = 0;
    }
  }
  const activeDb = frames.filter((_, i) => active[i]);
  const first3 = active.slice(0, Math.round(3 / fd));
  const bins = Math.min(160, frames.length);
  const per = frames.length / bins;
  const energy = Array.from({ length: bins }, (_, b) => {
    const from = Math.floor(b * per);
    return Math.max(...frames.slice(from, Math.max(from + 1, Math.floor((b + 1) * per))));
  });
  return {
    duration: audio.duration,
    hasAudio: peakDb > -50,
    startSilence: first < 0 ? audio.duration : first * fd,
    pauses,
    level: activeDb.length ? activeDb.reduce((a, b) => a + b, 0) / activeDb.length : -90,
    clippedPct: (clipped / n) * 100,
    hookActive: (first3.filter(Boolean).length / Math.max(1, first3.length)) * 100,
    energy,
    threshold,
  };
}

function analyzeDraft({ kind, text: rawText, pillar: pillarChoice, media, audio, cues }) {
  const text = rawText.trim();
  const nt = norm(text);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
  const firstSentence = sentences[0] || "";
  // Con subtítulos, el gancho es lo que se dice en los primeros 3 segundos
  const spokenHook = cues?.length ? cues.filter((c) => c.start < 3).map((c) => c.text).join(" ").trim() : "";
  const hookSentence = spokenHook || firstSentence;
  const avgLen = sentences.length ? words / sentences.length : 0;

  // Jerga: cada término se cuenta una vez por aparición, sin solapar los compuestos
  let work = text;
  const found = [];
  JARGON.forEach(([t, plain]) => {
    const m = work.match(termRe(t));
    if (m) {
      found.push({ term: m[0].toLowerCase(), plain, count: m.length });
      work = work.replace(termRe(t), " ");
    }
  });
  const jHits = found.reduce((acc, f) => acc + f.count, 0);
  const jargon = words ? Math.round(clamp((jHits / words) * 2500 + Math.max(0, avgLen - 22) * 2.5)) : 0;
  const hasBridge = BRIDGE_WORDS.some((k) => nt.includes(k));
  const processHits = countHits(nt, PROCESS_WORDS);
  const vulnerability = processHits > 0;
  const tail = nt.slice(Math.floor(nt.length * 0.6));
  const openQuestion = tail.includes("?") || COMMUNITY_WORDS.slice(0, 8).some((k) => tail.includes(k));
  const pillarScores = {
    autoridad: countHits(nt, AUTHORITY_WORDS) + jHits * 0.5,
    proceso: processHits * 1.5,
    comunidad: countHits(nt, COMMUNITY_WORDS) + (nt.match(/\?/g) || []).length * 0.5,
  };
  const detected = PILLAR_KEYS.reduce((best, k) => (pillarScores[k] > pillarScores[best] ? k : best), "autoridad");
  const pillar = pillarChoice === "auto" ? detected : pillarChoice;
  const P = PILLARS[pillar];
  const nfs = norm(hookSentence);
  const weakOpener = WEAK_OPENERS.some((k) => nfs.startsWith(k));
  const hookWords = hookSentence.split(/\s+/).filter(Boolean).length;
  const hookJargon = JARGON.some(([t]) => termRe(t).test(hookSentence));
  const searchHits = countHits(nt, SEARCH_WORDS);

  // --- Semáforo previo: 5 criterios
  const pts = { good: 90, warn: 60, bad: 25 };
  const hookStatus = weakOpener || hookJargon ? "bad" : hookWords > 20 ? "warn" : "good";
  const signals = [
    { key: "hook", label: "Gancho", value: `${hookWords} palabras`, detail: spokenHook ? "dichas en los primeros 3 s" : "en la primera frase", status: hookStatus, icon: Zap },
    { key: "jargon", label: "Lenguaje accesible", value: `${jargon}/100`, detail: "densidad de jerga", status: jargon < 30 ? "good" : jargon < 60 ? "warn" : "bad", icon: Languages },
    {
      key: "bridge", label: "Puente comercial", value: pillar === "comunidad" && !hasBridge ? "Opcional" : hasBridge ? "Sí" : "No",
      detail: "menciona tus talleres", status: hasBridge || pillar === "comunidad" ? "good" : pillar === "autoridad" ? "bad" : "warn", icon: Briefcase,
    },
    { key: "vuln", label: "Vulnerabilidad", value: vulnerability ? "Sí" : "No", detail: "aparece tu novela o tu proceso", status: vulnerability ? "good" : pillar === "proceso" ? "bad" : "warn", icon: Feather },
    { key: "talk", label: "Conversación", value: openQuestion ? "Sí" : "No", detail: "invita a responder", status: openQuestion ? "good" : pillar === "comunidad" ? "bad" : "warn", icon: MessagesSquare },
  ];
  const weights = { hook: 0.25, jargon: 0.2, bridge: 0.2, vuln: 0.15, talk: 0.2 };
  const score = Math.round(signals.reduce((acc, x) => acc + pts[x.status] * weights[x.key], 0));

  // --- Diagnóstico
  const issues = [];
  if (!hasBridge && pillar !== "comunidad") {
    issues.push({
      id: "bridge", sev: pillar === "autoridad" ? "alta" : "media", icon: Briefcase, title: "Falta de Puente Comercial",
      why: "El texto no menciona en ningún momento que das talleres o mentorías. Quien lo lea no va a saber que puede aprender esto con vos.",
      fix: {
        title: "Recordale al lector que vos enseñás esto",
        lead: "El post es brillante en teoría, pero no le recordaste al lector que tú enseñas esto.",
        steps: [
          pillar === "proceso" ? "En el cierre, conectá tu bloqueo con el de quien mira y ofrecé conversar por mensaje." : "En la última diapositiva o los últimos segundos, decí en una frase que esto es parte de lo que enseñás.",
          "Usá una sola acción concreta: seguirte, escribirte una palabra clave por DM o anotarse en la lista de espera.",
          "Repetí el CTA en la primera línea del texto del post.",
        ],
        example: P.bridgeCTA,
      },
    });
  }
  if (jargon >= 60) {
    const sample = sentences.find((x) => JARGON.some(([t]) => termRe(t).test(x))) || firstSentence;
    let plainSample = sample;
    found.forEach((f) => {
      const entry = JARGON.find(([t]) => termRe(t).test(f.term));
      if (entry) plainSample = plainSample.replace(termRe(entry[0]), f.plain);
    });
    issues.push({
      id: "jargon", sev: jargon >= 80 ? "alta" : "media", icon: Languages, title: "Exceso Académico / Jerga",
      why: `Densidad de vocabulario técnico: ${jargon}/100. Términos detectados: ${found.map((f) => f.term).join(", ")}.${avgLen > 22 ? ` Tus oraciones tienen ${Math.round(avgLen)} palabras en promedio.` : ""}`,
      fix: {
        title: "Traducí el concepto sociológico a lenguaje de escritor",
        lead: "Estás hablando como investigadora para otros investigadores. Traduce el concepto sociológico a un lenguaje accesible para un escritor aficionado.",
        steps: [
          "Empezá por el problema que el escritor ya tiene (“mis personajes hablan todos igual”), no por el concepto.",
          "Nombrá el concepto una sola vez, después de explicarlo con un ejemplo.",
          "La versión “después” es un reemplazo automático de términos: tomala como punto de partida y ajustá la redacción.",
        ],
        before: sample,
        after: plainSample,
        glossary: found,
      },
    });
  }
  if (hookStatus !== "good") {
    issues.push({
      id: "hook", sev: hookStatus === "bad" ? "alta" : "media", icon: Zap, title: "Gancho inicial débil",
      why: `${spokenHook ? "En los primeros 3 segundos decís" : "Tu primera frase es"} “${hookSentence.length > 140 ? `${hookSentence.slice(0, 140)}…` : hookSentence}”. ${weakOpener ? "Empieza con un saludo: en los primeros 3 segundos la gente decide si se queda." : hookJargon ? "Empieza con un concepto académico: quien no lo conoce, se va." : `Tiene ${hookWords} palabras: es demasiado larga para leerse de un vistazo.`}`,
      fix: {
        title: "Abrí con el problema del escritor, no con el tema",
        steps: ["Primera frase: una situación que tu alumno ideal vive hoy.", "Texto en pantalla con esa misma frase.", "Prometé qué se va a llevar en menos de 10 palabras."],
        example: P.hookAlt,
      },
    });
  }
  if (!vulnerability && pillar === "autoridad") {
    issues.push({
      id: "vulnerability", sev: "media", icon: Feather, title: "Falta de Vulnerabilidad",
      why: "El texto explica teoría, pero no aparece tu novela ni tu proceso. La autoridad sin cercanía genera respeto, pero no confianza para contratar una mentoría.",
      fix: {
        title: "Mostrá cómo usás esto en tu propia novela",
        lead: "Muestras mucha teoría pero poco de tu novela. La gente compra mentorías a personas, no a enciclopedias. Muestra más tu pantalla escribiendo.",
        steps: [
          "Sumá una diapositiva o un plano con tu manuscrito aplicando la herramienta.",
          "Contá un error propio que esta teoría te ayudó a corregir.",
          "Mostrá tu pantalla o tu cuaderno escribiendo, aunque sea 3 segundos.",
        ],
        example: "Así lo apliqué en el capítulo 12 de mi novela: antes mi protagonista hablaba igual que yo.",
      },
    });
  }
  if (!openQuestion) {
    issues.push(pillar === "comunidad"
      ? {
          id: "question", sev: "media", icon: MessagesSquare, title: "Reflexión que cierra el tema",
          why: "Es un post de comunidad que no invita a responder: la reflexión queda completa y no hay lugar para la voz del lector.",
          fix: {
            title: "Terminá la reflexión con una pregunta abierta",
            steps: ["Dejá la reflexión incompleta a propósito: planteá la tensión y pedí su postura.", "Ofrecé dos opciones en conflicto para que elijan y argumenten."],
            example: QUESTION_ALT[pillar],
          },
        }
      : {
          id: "shallow", sev: "baja", icon: MessageCircle, title: "Sin invitación a conversar",
          why: "El texto no termina con una pregunta. Sin pregunta vas a recibir emojis y elogios, no comentarios que revelen qué necesita tu futuro alumno.",
          fix: {
            title: "Cerrá con una pregunta que obligue a contar algo propio",
            steps: ["Evitá preguntas de sí o no.", "Pedí una experiencia concreta: “¿en qué capítulo te trabaste?”."],
            example: QUESTION_ALT[pillar],
          },
        });
  }
  if (searchHits === 0) {
    issues.push({
      id: "captive", sev: "baja", icon: Users, title: "Pocas palabras de búsqueda",
      why: "El texto no usa ninguna palabra que un escritor buscaría (escribir, novela, personaje, taller…). Va a llegar casi solo a quienes ya te siguen.",
      fix: {
        title: "Escribí para quien busca, no solo para quien ya te sigue",
        steps: ["Usá palabras que un escritor buscaría (“cómo escribir una novela”, “bloqueo creativo”) en la primera línea y en el texto en pantalla."],
      },
    });
  }

  // --- Comprobaciones del archivo visual
  const facts = [];
  if (media?.width) {
    const ratio = media.height / media.width;
    facts.push(`${media.width}×${media.height} px`);
    if (kind === "video") {
      facts.push(`${Math.round(media.duration)} s`);
      if (media.duration > 60) {
        issues.push({
          id: "length", sev: media.duration > 90 ? "media" : "baja", icon: Clock, title: "Video largo",
          why: `Dura ${Math.round(media.duration)} segundos. Con un tema denso, la mayoría se va antes de llegar al cierre, que es donde está tu llamado a la acción.`,
          fix: { title: "Recortá a menos de 60 segundos", steps: ["Quedate con una sola idea por video.", "Mové el llamado a la acción antes del segundo 40.", "Lo que sobre, convertilo en una segunda parte."] },
        });
      }
      if (ratio < 1.6) {
        issues.push({
          id: "ratio", sev: "baja", icon: FileVideo, title: "El video no es vertical",
          why: `La proporción es ${media.width}:${media.height}. En Reels se va a ver con bandas o recortado.`,
          fix: { title: "Exportá en 9:16 (1080 × 1920)", steps: ["Reencuadrá en vertical y dejá el texto en el centro de la imagen."] },
        });
      }
    } else if (ratio < 1) {
      issues.push({
        id: "ratio", sev: "baja", icon: FileImage, title: "Imagen horizontal",
        why: "En la grilla del perfil se recorta y en el feed ocupa menos pantalla.",
        fix: { title: "Usá formato vertical 4:5 (1080 × 1350)", steps: ["Reencuadrá la imagen y dejá el texto en el centro."] },
      });
    }
    if (media.contrast != null && media.contrast < 40) {
      issues.push({
        id: "cover", sev: kind === "image" ? "media" : "baja", icon: ImageIcon, title: "Portada poco legible",
        why: `${kind === "video" ? "El primer fotograma" : "La imagen"} tiene poco contraste (${Math.round(media.contrast)}/255): en la grilla no se va a leer.`,
        fix: { title: "Portada con contraste y una promesa concreta", steps: ["Máximo 6 palabras.", "Texto claro sobre fondo oscuro o al revés.", "Prometé un resultado para el escritor, no un tema académico."] },
      });
    }
  }
  // --- Audio del video (señal) y subtítulos (lo que se dice)
  if (audio) {
    facts.push(audio.hasAudio ? `sonido desde ${dec(audio.startSilence)} s` : "sin sonido");
    if (!audio.hasAudio) {
      issues.push({
        id: "noaudio", sev: "media", icon: AudioLines, title: "Video sin sonido",
        why: "La pista de audio está en silencio. Sin voz ni música, el Reel pierde a quien mira con sonido y no suma audios en tendencia.",
        fix: { title: "Sumá voz o un audio en tendencia", steps: ["Grabá una voz en off contando el proceso.", "Si preferís no hablar, usá un audio en tendencia al 10–15% y texto en pantalla."] },
      });
    } else {
      if (audio.startSilence > 0.7) {
        issues.push({
          id: "silence", sev: audio.startSilence > 1.5 ? "alta" : "media", icon: AudioLines, title: "Silencio al inicio",
          why: `El sonido empieza en el segundo ${dec(audio.startSilence)}. Los primeros 3 segundos deciden si la gente se queda, y estás usando ${pct(Math.min(100, (audio.startSilence / 3) * 100), 0)} de ese tiempo en silencio.`,
          fix: { title: "Arrancá hablando en el primer fotograma", steps: ["Recortá el silencio inicial en el editor.", "Si querés una pausa dramática, mostrá el gancho como texto en pantalla mientras tanto."] },
        });
      }
      const longest = audio.pauses.reduce((m, x) => (x.length > m.length ? x : m), { length: 0, start: 0 });
      if (audio.pauses.length >= 2 || longest.length >= 2) {
        issues.push({
          id: "pauses", sev: "media", icon: Scissors, title: "Pausas largas en la voz",
          why: `Hay ${audio.pauses.length} ${audio.pauses.length === 1 ? "pausa" : "pausas"} de más de 1,2 s; la más larga dura ${dec(longest.length)} s y empieza en el segundo ${dec(longest.start)}. En esos huecos la gente pasa al siguiente video.`,
          fix: { title: "Cortá los silencios con jump cuts", steps: ["Eliminá respiraciones, muletillas y pausas de más de medio segundo.", "Si la pausa es intencional, cubrila con un cambio de plano o texto en pantalla."] },
        });
      }
      if (audio.level < -32) {
        issues.push({
          id: "volume", sev: "baja", icon: AudioLines, title: "Volumen bajo",
          why: `La voz está en ${Math.round(audio.level)} dB de nivel medio: en el celular se va a escuchar baja comparada con otros Reels.`,
          fix: { title: "Normalizá el audio", steps: ["En CapCut o Edits, usá “Normalizar volumen” o subí la voz hasta que los picos queden cerca de −1 dB.", "Si hay música de fondo, dejala bastante por debajo de la voz."] },
        });
      }
      if (audio.clippedPct > 0.05) {
        issues.push({
          id: "clipping", sev: "baja", icon: AudioLines, title: "Audio saturado",
          why: "Hay picos que llegan al máximo y se distorsionan: la voz va a sonar rota en algunos momentos.",
          fix: { title: "Bajá la ganancia o regrabá más lejos del micrófono", steps: ["Bajá el volumen de la pista hasta que no haya picos al máximo.", "En la próxima grabación, alejá el micrófono un palmo de la boca."] },
        });
      }
    }
  }
  if (cues?.length) {
    const total = cues[cues.length - 1].end;
    const spokenWords = cues.reduce((a, c) => a + c.text.split(/\s+/).filter(Boolean).length, 0);
    const spokenSecs = cues.reduce((a, c) => a + Math.max(0, c.end - c.start), 0);
    const wpm = spokenSecs ? (spokenWords / spokenSecs) * 60 : 0;
    facts.push(`${Math.round(wpm)} palabras/min`);
    if (wpm > 190) {
      issues.push({
        id: "fast", sev: "baja", icon: AudioLines, title: "Hablás muy rápido",
        why: `Vas a ${Math.round(wpm)} palabras por minuto. Con conceptos teóricos, a esa velocidad el oyente no llega a procesar la idea.`,
        fix: { title: "Bajá a unas 150 palabras por minuto", steps: ["Recortá el guion antes que acelerar.", "Dejá medio segundo después de cada idea clave, con texto en pantalla."] },
      });
    }
    const ctaCue = cues.find((c) => BRIDGE_WORDS.some((k) => norm(c.text).includes(k)));
    if (ctaCue && total > 20 && ctaCue.start > total * 0.85) {
      issues.push({
        id: "latecta", sev: "baja", icon: Briefcase, title: "El llamado a la acción llega tarde",
        why: `Mencionás tus talleres en el segundo ${Math.round(ctaCue.start)} de ${Math.round(total)}: para entonces gran parte de la audiencia ya se fue.`,
        fix: { title: "Adelantá el llamado a la acción", steps: ["Decilo una vez a mitad del video y repetilo al final.", "Escribilo también en la primera línea del texto del post."] },
      });
    }
  }
  issues.sort((x, y) => SEV_ORDER[x.sev] - SEV_ORDER[y.sev]);

  const strengths = [];
  if (hookStatus === "good") strengths.push(`Gancho directo: ${spokenHook ? "lo que decís en los primeros 3 segundos" : "la primera frase"} tiene ${hookWords} palabras y no arranca con saludos.`);
  if (audio?.hasAudio && audio.startSilence <= 0.4) strengths.push(`Arrancás con sonido desde el segundo ${dec(audio.startSilence)}.`);
  if (audio?.hasAudio && !audio.pauses.length) strengths.push("Ritmo de voz continuo, sin pausas largas.");
  if (jargon < 30) strengths.push("Lenguaje accesible para un escritor aficionado.");
  if (hasBridge) strengths.push("Tiene puente comercial: el lector sabe que puede aprender esto con vos.");
  if (vulnerability) strengths.push("Mostrás tu proceso real: la gente se identifica con vos, no solo con el tema.");
  if (openQuestion) strengths.push("Termina invitando a responder: vas a recibir comentarios de valor.");

  const impactOf = { alta: "Alto", media: "Medio", baja: "Bajo" };
  let plan = issues.map((i) => ({ ...i.fix, impact: impactOf[i.sev], from: i.title, icon: i.icon }));
  if (!issues.length) {
    plan = [{
      title: "Publicalo y conversá en la primera hora",
      steps: ["Publicalo en el horario de mayor actividad de tu audiencia.", "Respondé los primeros comentarios con otra pregunta para abrir conversación.", "Si alguien pregunta por talleres, seguí la charla por mensaje directo."],
      impact: "Alto", from: "Borrador listo", icon: Sparkles,
    }];
  }
  // Un problema de prioridad alta o media impide el "listo para publicar"
  const status = issues.some((i) => i.sev !== "baja") && score >= 72 ? "warn" : statusOf(score);
  return { words, pillar, detected, score, status, signals, issues, strengths, plan, facts };
}

/* ============================================================
 * 5. Componentes visuales
 * ============================================================ */
const STATUS = {
  good: { label: "Funciona", long: "Funciona excelente", text: "text-good", dot: "bg-good", soft: "bg-good/12", border: "border-good/40", stroke: "rgb(var(--good))" },
  warn: { label: "Medio", long: "Rendimiento medio", text: "text-warn", dot: "bg-warn", soft: "bg-warn/12", border: "border-warn/40", stroke: "rgb(var(--warn))" },
  bad: { label: "No funciona", long: "No funciona", text: "text-bad", dot: "bg-bad", soft: "bg-bad/12", border: "border-bad/40", stroke: "rgb(var(--bad))" },
};
const SEV_STYLE = { alta: "bg-bad/12 text-bad", media: "bg-warn/12 text-warn", baja: "bg-fg/5 text-muted" };

function StatusPill({ status, long = false }) {
  const s = STATUS[status];
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.soft, s.text)}>
      <span className={cx("h-2 w-2 rounded-full", s.dot)} />
      {long ? s.long : s.label}
    </span>
  );
}
function PillarTag({ pillar, short = true }) {
  const P = PILLARS[pillar];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", P.soft, P.text)}>
      <P.icon className="h-3 w-3" /> {short ? P.short : P.label}
    </span>
  );
}

function ScoreRing({ score, status, size = 64, stroke = 6, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke={STATUS[status].stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display font-bold tabular-nums" style={{ fontSize: size * 0.3 }}>{score}</span>
        {label && <span className="mt-1 text-[10px] text-muted">{label}</span>}
      </div>
    </div>
  );
}

/** Portada simulada. Las de bajo contraste se ven mal a propósito. */
function Cover({ post, analysis, showMeta = true, className = "" }) {
  const [c1, c2] = post.cover.palette;
  const P = PILLARS[post.pillar];
  const TypeIcon = TYPE_META[post.type].icon;
  return (
    <div className={cx("relative overflow-hidden", className)} style={{ background: `linear-gradient(160deg, ${c1}, ${c2})`, containerType: "inline-size" }}>
      <P.icon className="absolute -bottom-[8%] -right-[8%] h-[58%] w-[58%] opacity-[0.12]" style={{ color: post.cover.ink }} strokeWidth={1.1} />
      <div className="absolute inset-0 flex flex-col justify-center p-[9%]" style={{ color: post.cover.ink }}>
        <span className="font-mono uppercase tracking-[0.14em] opacity-80" style={{ fontSize: "4.8cqw" }}>{post.cover.kicker}</span>
        <span className="mt-[4%] font-serif font-medium italic leading-[1.02] [text-wrap:balance]" style={{ fontSize: "11cqw" }}>{post.cover.headline}</span>
      </div>
      {post.type === "carousel" && (
        <div className="absolute bottom-[5%] left-1/2 flex -translate-x-1/2 gap-[1.6cqw]">
          {Array.from({ length: Math.min(post.slides, 10) }).map((_, i) => (
            <span key={i} className="rounded-full" style={{ width: "1.8cqw", height: "1.8cqw", background: post.cover.ink, opacity: i === 0 ? 0.95 : 0.35 }} />
          ))}
        </div>
      )}
      {showMeta && (
        <>
          <span className="absolute right-[5%] top-[5%] text-white drop-shadow"><TypeIcon style={{ width: "9cqw", height: "9cqw" }} /></span>
          {analysis && <span className={cx("absolute left-[5%] top-[5%] rounded-full ring-2 ring-white/80", STATUS[analysis.status].dot)} style={{ width: "5cqw", height: "5cqw" }} />}
        </>
      )}
    </div>
  );
}

function Card({ className = "", children }) {
  return <section className={cx("rounded-2xl border border-line bg-surface", className)}>{children}</section>;
}
function SectionTitle({ icon: Icon, children, aside }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight">
        {Icon && <Icon className="h-4 w-4 text-accent" />} {children}
      </h3>
      {aside}
    </div>
  );
}

function RetentionChart({ post, analysis }) {
  const W = 640, H = 220, pl = 40, pr = 16, pt = 22, pb = 30;
  const d = post.duration;
  const x = (t) => pl + (t / d) * (W - pl - pr);
  const y = (v) => pt + (1 - v / 100) * (H - pt - pb);
  const samples = [];
  for (let t = 0; t <= d; t += 0.5) samples.push([t, retAt(post.retention, t)]);
  const line = samples.map(([t, v], i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(d)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 3, ...[0.33, 0.66].map((f) => Math.round(d * f)), d];
  const s3 = analysis.ret3 >= 60 ? "good" : analysis.ret3 >= 45 ? "warn" : "bad";
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[460px]" role="img" aria-label="Curva de retención de audiencia">
        <defs>
          <linearGradient id={`ret-${post.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" style={{ stopColor: "rgb(var(--accent))", stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--accent))", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} className="stroke-line" strokeDasharray={v ? "3 4" : ""} />
            <text x={pl - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">{v}%</text>
          </g>
        ))}
        {ticks.map((t) => <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">{t}s</text>)}
        <path d={area} fill={`url(#ret-${post.id})`} />
        <path d={line} fill="none" strokeWidth="2.5" className="stroke-accent" strokeLinejoin="round" />
        <line x1={x(3)} x2={x(3)} y1={pt} y2={H - pb} strokeDasharray="4 4" className="stroke-fg/40" />
        <circle cx={x(3)} cy={y(analysis.ret3)} r="5" fill={STATUS[s3].stroke} className="stroke-surface" strokeWidth="2" />
        <text x={x(3) + 9} y={pt + 2} className="fill-fg text-[12px] font-semibold">Segundo 3 · {analysis.ret3}%</text>
        <circle cx={x(d)} cy={y(retAt(post.retention, d))} r="4" className="fill-accent" />
      </svg>
    </div>
  );
}

function SlideChart({ post }) {
  const sr = post.slideRetention;
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {sr.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="font-mono text-[11px] tabular-nums text-muted">{v}%</span>
            <div className={cx("w-full rounded-t-md", i === 0 ? "bg-fg/20" : "bg-accent/80")} style={{ height: `${v}%` }} title={`Diapositiva ${i + 1}: ${v}%`} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {sr.map((_, i) => <span key={i} className="flex-1 text-center font-mono text-[11px] text-muted">D{i + 1}</span>)}
      </div>
    </div>
  );
}

/** Calidad de comentarios: de valor vs. superficiales, con ejemplos. */
function CommentQuality({ post, analysis }) {
  const { total, value } = post.metrics.comments;
  const shallow = total - value;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-3xl font-bold tabular-nums">{pct(analysis.commentQuality, 0)}</span>
        <span className="text-right text-xs text-muted">de los {full(total)} comentarios<br />preguntan, debaten o cuentan algo propio</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface2">
        <div className="h-full bg-accent" style={{ width: `${analysis.commentQuality}%` }} />
        <div className="h-full bg-fg/20" style={{ width: `${100 - analysis.commentQuality}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />De valor {full(value)}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-fg/20" />Superficiales {full(shallow)}</span>
      </div>
      <ul className="space-y-2">
        {post.sampleComments.map((c) => (
          <li key={c.text} className="flex items-start gap-2.5 rounded-xl bg-surface2 p-3 text-sm">
            <MessageCircle className={cx("mt-0.5 h-4 w-4 shrink-0", c.value ? "text-accent" : "text-muted")} />
            <span className="min-w-0 flex-1">{c.text}</span>
            <span className={cx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", c.value ? "bg-accent/12 text-accent" : "bg-fg/5 text-muted")}>
              {c.value ? "Valor" : "Superficial"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InteractionsChart({ post }) {
  const m = post.metrics;
  const rows = [
    { label: "Guardados", value: m.saves, icon: Bookmark, kpi: "Autoridad" },
    { label: "Compartidos", value: m.shares, icon: Send, kpi: "Autoridad" },
    { label: "Comentarios de valor", value: m.comments.value, icon: MessageSquareQuote, kpi: "Intención" },
    { label: "Mensajes directos", value: m.dms, icon: Mail, kpi: "Conexión" },
    { label: "Me gusta", value: m.likes, icon: Heart },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3.5">
      {rows.map(({ label, value, icon: Icon, kpi }) => (
        <div key={label} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[170px_1fr_auto] sm:items-center">
          <span className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-muted" />{label}</span>
          <span className="text-right font-mono tabular-nums sm:order-last sm:w-28">
            {full(value)} <span className="text-[11px] text-muted">{pct((value / m.reach) * 100, 2)}</span>
          </span>
          <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface2 sm:col-span-1">
            <div className={cx("h-full rounded-full", kpi ? "brand-grad" : "bg-fg/30")} style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs leading-relaxed text-muted">
        Barras en color: interacciones que alimentan tus índices de conversión. Los me gusta muestran agrado, no intención de aprender con vos.
        {m.dmInquiries > 0 && ` ${m.dmInquiries} de los mensajes preguntan directamente por talleres o mentorías.`}
      </p>
    </div>
  );
}

function Lights({ status, size = "sm" }) {
  const s = size === "lg" ? "h-5 w-5" : "h-3 w-3";
  return (
    <div className={cx("flex flex-col items-center gap-1 rounded-full bg-fg/[0.07] p-1.5", size === "lg" && "gap-1.5 p-2")} aria-label={STATUS[status].long}>
      {["bad", "warn", "good"].map((k) => (
        <span key={k} className={cx("rounded-full", s, k === status ? cx(STATUS[k].dot, "glow") : "bg-fg/10")} style={k === status ? { "--glow": STATUS[k].stroke } : undefined} />
      ))}
    </div>
  );
}

function TrafficLightPanel({ analysis }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className={cx("col-span-2 flex items-center gap-4 rounded-2xl border p-4 sm:col-span-1", STATUS[analysis.status].border, STATUS[analysis.status].soft)}>
        <Lights status={analysis.status} size="lg" />
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Potencial de captación</div>
          <div className={cx("font-display text-lg font-bold leading-tight", STATUS[analysis.status].text)}>{STATUS[analysis.status].long}</div>
          <div className="font-mono text-xs text-muted">Puntaje {analysis.score}/100</div>
        </div>
      </div>
      {analysis.signals.map((s) => (
        <div key={s.key} className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
          <Lights status={s.status} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted"><s.icon className="h-3.5 w-3.5 shrink-0" />{s.label}</div>
            <div className={cx("font-mono text-lg font-semibold tabular-nums", STATUS[s.status].text)}>{s.value}</div>
            <div className="text-[11px] leading-snug text-muted">{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * 6. Vistas
 * ============================================================ */
function KpiCard({ k, value, weighted, status, icon: Icon, explain }) {
  const meta = KPI[k];
  const max = meta.green * 2;
  const pos = (v) => `${clamp((v / max) * 100)}%`;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-[15px] font-bold leading-tight">{meta.label}</div>
          <div className="mt-0.5 text-xs text-muted">{meta.sub} · post típico (mediana)</div>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2"><Icon className="h-4 w-4" /></span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="font-display text-[38px] font-bold leading-none tracking-tight tabular-nums">
          {meta.unit === "%" ? pct(value) : <>{dec(value)}<span className="ml-1 text-xl text-muted">‰</span></>}
        </div>
        <StatusPill status={status} />
      </div>
      <div className="relative h-2 rounded-full bg-surface2">
        <div className={cx("absolute inset-y-0 left-0 rounded-full", STATUS[status].dot)} style={{ width: pos(value) }} />
        <span className="absolute -top-1 h-4 w-px bg-fg/40" style={{ left: pos(meta.red) }} />
        <span className="absolute -top-1 h-4 w-px bg-fg/40" style={{ left: pos(meta.green) }} />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-muted">
        <span>débil &lt; {dec(meta.red)}</span><span>sólido ≥ {dec(meta.green)}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted">{explain}</p>
      <p className="border-t border-line pt-2 font-mono text-[11px] text-muted">
        Total ponderado por alcance: {meta.unit === "%" ? pct(weighted) : `${dec(weighted)} ‰`}
        {weighted > value * 1.5 ? " · un post muy viral infla el total" : ""}
      </p>
    </Card>
  );
}

function PostRow({ post, analysis, onOpen }) {
  return (
    <button onClick={() => onOpen(post.id)} className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface2">
      <Cover post={post} showMeta={false} className="aspect-[4/5] w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-semibold leading-snug">{post.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted"><PillarTag pillar={post.pillar} /> {TYPE_META[post.type].label} · {analysis.score} pts</div>
      </div>
      <StatusPill status={analysis.status} />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </button>
  );
}

function DashboardView({ posts, analyses, onOpen, goContent }) {
  const acc = useMemo(() => analyzeAccount(posts, analyses), [posts, analyses]);
  const rStatus = statusOf(acc.readiness);
  const readinessText = {
    good: "Tu contenido ya construye autoridad y genera conversaciones de venta. Es buen momento para abrir la lista de espera.",
    warn: "Tenés autoridad, pero todavía no la convertís en clientes. Corregí los hallazgos de abajo antes de lanzar.",
    bad: "Todavía no hay señales suficientes de demanda. Validá con más contenido de proceso y comunidad antes de lanzar.",
  }[rStatus];
  const top = acc.ranked.slice(0, 2);
  const bottom = acc.ranked.slice(-2).reverse();
  const funnelMax = acc.funnel[0].value;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{ACCOUNT.handle} · {full(ACCOUNT.followers)} seguidores</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">¿Tu contenido atrae alumnos?</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Validación de audiencia para {ACCOUNT.offer}. {posts.length} publicaciones analizadas.</p>
        </div>
        <button onClick={goContent} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface2">
          Ver publicaciones <ArrowUpRight className="h-4 w-4" />
        </button>
      </header>

      <Card className={cx("flex flex-col gap-5 p-5 sm:flex-row sm:items-center", STATUS[rStatus].soft)}>
        <ScoreRing score={acc.readiness} status={rStatus} size={96} stroke={8} label="de 100" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Preparación para lanzar talleres</p>
          <p className={cx("mt-1 font-display text-xl font-bold", STATUS[rStatus].text)}>{STATUS[rStatus].long}</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed">{readinessText}</p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-4 text-center sm:grid-cols-1 sm:gap-2 sm:text-left">
          {[
            ["Más autoridad", acc.bestAuth],
            ["Más intención", acc.bestIntent],
            ["Más conexión", acc.bestConn],
          ].map(([l, p]) => (
            <div key={l} className="text-xs">
              <span className="text-muted">{l}: </span>
              <span className={cx("font-semibold", PILLARS[p.key].text)}>{PILLARS[p.key].short}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KpiCard k="authority" value={acc.kpis.authority} weighted={acc.kpisWeighted.authority} status={acc.kpiStatus.authority} icon={BookmarkCheck}
          explain="Cuánta gente guardó o compartió tus análisis y herramientas. Es la señal de que te ven como alguien de quien aprender." />
        <KpiCard k="intent" value={acc.kpis.intent} weighted={acc.kpisWeighted.intent} status={acc.kpiStatus.intent} icon={MessageSquareQuote}
          explain="Comentarios que preguntan, debaten o cuentan su propio problema de escritura. Los emojis no cuentan." />
        <KpiCard k="connection" value={acc.kpis.connection} weighted={acc.kpisWeighted.connection} status={acc.kpiStatus.connection} icon={HeartHandshake}
          explain="Mensajes directos por cada mil cuentas. Es interés real en vos y tu proceso: de acá salen las mentorías." />
      </div>

      <Card className="p-5">
        <SectionTitle icon={Target} aside={<span className="text-xs text-muted">Hallazgos sobre el conjunto de la cuenta</span>}>Diagnóstico estratégico</SectionTitle>
        {acc.findings.length ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {acc.findings.map((f) => (
              <div key={f.id} className="flex flex-col gap-2 rounded-2xl border border-line p-4">
                <div className="flex items-center gap-2">
                  <span className={cx("grid h-8 w-8 place-items-center rounded-full", SEV_STYLE[f.sev])}><f.icon className="h-4 w-4" /></span>
                  <span className="font-semibold">{f.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted">{f.why}</p>
                <p className="mt-auto rounded-xl bg-surface2 p-3 text-sm leading-relaxed"><span className="font-semibold">Qué hacer: </span>{f.fix}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No hay problemas estructurales en la cuenta. Seguí con la mezcla actual de pilares.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <SectionTitle icon={LayoutGrid} aside={<span className="text-xs text-muted">Actual vs. recomendado</span>}>Mezcla de pilares</SectionTitle>
          <div className="space-y-5">
            {acc.pillars.map((p) => {
              const P = PILLARS[p.key];
              const diff = p.share - P.target;
              return (
                <div key={p.key}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-semibold"><P.icon className={cx("h-4 w-4", P.text)} />{P.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {p.count} posts · {pct(p.share, 0)} <span className={Math.abs(diff) > 10 ? "text-warn" : ""}>(meta {P.target}%)</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-surface2">
                    <div className={cx("h-full rounded-full", P.color)} style={{ width: `${p.share}%` }} />
                    <span className="absolute -top-1 h-[18px] w-0.5 rounded bg-fg" style={{ left: `${P.target}%` }} title={`Meta ${P.target}%`} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px] tabular-nums text-muted">
                    <span>Autoridad {p.count ? pct(p.authority) : "—"}</span>
                    <span>Intención {p.count ? `${dec(p.intent)} ‰` : "—"}</span>
                    <span>Conexión {p.count ? `${dec(p.connection)} ‰` : "—"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{P.role}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle icon={Filter}>Embudo de captación</SectionTitle>
          <ol className="space-y-2.5">
            {acc.funnel.map((f, i) => {
              const prev = i ? acc.funnel[i - 1].value : null;
              return (
                <li key={f.label}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2"><f.icon className="h-4 w-4 text-muted" />{f.label}</span>
                    <span className="font-mono tabular-nums">{full(f.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface2">
                    <div className={cx("h-full rounded-full", i === acc.funnel.length - 1 ? "brand-grad" : "bg-fg/35")} style={{ width: `${Math.max(1.5, Math.sqrt(f.value / funnelMax) * 100)}%` }} />
                  </div>
                  {prev ? <div className="mt-0.5 text-right font-mono text-[10px] text-muted">{pct((f.value / prev) * 100, 1)} del paso anterior</div> : null}
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-muted">Barras en escala de raíz cuadrada para que se vean las etapas finales. Las consultas son mensajes que preguntan por talleres o mentorías.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle icon={CircleCheck}>Lo que atrae alumnos</SectionTitle>
          <div className="-mx-2 space-y-1">{top.map((p) => <PostRow key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} />)}</div>
        </Card>
        <Card className="p-5">
          <SectionTitle icon={CircleX}>Lo que no convierte</SectionTitle>
          <div className="-mx-2 space-y-1">{bottom.map((p) => <PostRow key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} />)}</div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle icon={TriangleAlert} aside={<span className="text-xs text-muted">en {posts.length} publicaciones</span>}>Errores que más se repiten</SectionTitle>
        <ul className="divide-y divide-line">
          {acc.recurring.map((i) => (
            <li key={i.id} className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 py-3 sm:grid-cols-[auto_1fr_200px] sm:items-center">
              <span className={cx("grid h-8 w-8 place-items-center rounded-full", SEV_STYLE[i.sev])}><i.icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{i.title}</div>
                <div className="text-xs text-muted">{i.fix.title}</div>
              </div>
              <div className="col-start-2 flex items-center gap-3 sm:col-start-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface2">
                  <div className="h-full rounded-full bg-fg/45" style={{ width: `${(i.count / posts.length) * 100}%` }} />
                </div>
                <span className="w-14 text-right font-mono text-xs tabular-nums text-muted">{i.count} de {posts.length}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function PostCard({ post, analysis, onOpen }) {
  return (
    <button onClick={() => onOpen(post.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-fg/5 focus-visible:-translate-y-0.5">
      <div className="relative">
        <Cover post={post} analysis={analysis} className="aspect-[4/5] w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1.5"><Bookmark className="h-4 w-4" fill="currentColor" />{fmt(post.metrics.saves)} guardados</span>
          <span className="flex items-center gap-1.5"><MessageSquareQuote className="h-4 w-4" />{fmt(post.metrics.comments.value)} comentarios de valor</span>
          <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{fmt(post.metrics.dms)} mensajes</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PillarTag pillar={post.pillar} />
          <span className="font-mono text-[11px] text-muted">{dateFmt(post.date)}</span>
        </div>
        <div className="line-clamp-3 text-sm font-semibold leading-snug">{post.title}</div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <StatusPill status={analysis.status} />
          <span className="font-mono text-xs tabular-nums text-muted">{analysis.score}/100</span>
        </div>
      </div>
    </button>
  );
}

function ContentView({ posts, analyses, onOpen, onUpload }) {
  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState("all");
  const [format, setFormat] = useState("all");
  const [sort, setSort] = useState("recent");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter((p) =>
      (pillar === "all" || p.pillar === pillar) &&
      (format === "all" || p.type === format) &&
      (!q || `${p.title} ${p.caption} ${PILLARS[p.pillar].label}`.toLowerCase().includes(q))
    );
    const sorters = {
      recent: (a, b) => b.date.localeCompare(a.date),
      best: (a, b) => analyses[b.id].score - analyses[a.id].score,
      worst: (a, b) => analyses[a.id].score - analyses[b.id].score,
    };
    return list.sort(sorters[sort]);
  }, [posts, analyses, query, pillar, format, sort]);

  const counts = useMemo(() => {
    const c = { all: posts.length };
    posts.forEach((p) => (c[p.pillar] = (c[p.pillar] || 0) + 1));
    return c;
  }, [posts]);

  const chips = [{ key: "all", label: "Todos" }, ...PILLAR_KEYS.map((k) => ({ key: k, label: PILLARS[k].label, icon: PILLARS[k].icon }))];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Catálogo por pilares</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Tus publicaciones</h1>
          <p className="mt-1 text-sm text-muted">Tocá cualquier publicación para ver si construye autoridad y atrae alumnos.</p>
        </div>
        <button onClick={onUpload} className="brand-grad inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
          <Upload className="h-4 w-4" /> Subir post/video
        </button>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1" htmlFor="search-posts">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input id="search-posts" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por autor, tema o palabra…"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-muted focus:border-accent" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface2" aria-label="Limpiar búsqueda">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <div className="flex gap-2">
            <select id="format-posts" value={format} onChange={(e) => setFormat(e.target.value)} aria-label="Formato"
              className="flex-1 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium outline-none focus:border-accent sm:flex-none">
              <option value="all">Todos los formatos</option>
              {Object.entries(TYPE_META).map(([k, t]) => <option key={k} value={k}>{t.plural}</option>)}
            </select>
            <select id="sort-posts" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar"
              className="flex-1 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium outline-none focus:border-accent sm:flex-none">
              <option value="recent">Más recientes</option>
              <option value="best">Mayor potencial</option>
              <option value="worst">Menor potencial</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por pilar de contenido">
          {chips.map((c) => (
            <button key={c.key} role="tab" aria-selected={pillar === c.key} onClick={() => setPillar(c.key)}
              className={cx("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                pillar === c.key ? "border-fg bg-fg text-bg" : "border-line bg-surface text-muted hover:text-fg")}>
              {c.icon && <c.icon className="h-3.5 w-3.5" />}
              {c.label} <span className="font-mono text-[11px] opacity-70">{counts[c.key] || 0}</span>
            </button>
          ))}
        </div>
        {pillar !== "all" && <p className="text-xs text-muted">{PILLARS[pillar].desc} {PILLARS[pillar].role}</p>}
      </div>

      {visible.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => <PostCard key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} />)}
        </div>
      ) : (
        <Card className="grid place-items-center gap-2 px-6 py-16 text-center">
          <Search className="h-6 w-6 text-muted" />
          <p className="font-semibold">Ninguna publicación coincide con esos filtros.</p>
          <p className="text-sm text-muted">Probá con otra palabra, otro pilar o “Todos los formatos”.</p>
        </Card>
      )}
    </div>
  );
}

/** Plan de acción con botón de copiar (posts publicados y borradores). */
function PlanSection({ title, plan, heading, intro }) {
  const [copied, setCopied] = useState(false);
  const copyPlan = () => {
    const text = [
      `Plan de acción — ${title}`,
      ...plan.map((p, i) =>
        [
          `${i + 1}. ${p.title} (impacto ${p.impact.toLowerCase()})`,
          p.lead && `   ${p.lead}`,
          ...p.steps.map((s) => `   - ${s}`),
          p.example && `   Ejemplo: "${p.example}"`,
          p.after && `   Antes: "${p.before}"\n   Después: "${p.after}"`,
        ].filter(Boolean).join("\n")
      ),
    ].join("\n\n");
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }, () => {});
    } catch (e) {
      /* portapapeles no disponible */
    }
  };

  return (
    <section>
      <SectionTitle icon={Lightbulb} aside={
        <button onClick={copyPlan} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:bg-surface2">
          {copied ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copiado" : "Copiar plan"}
        </button>
      }>{heading}</SectionTitle>
      <p className="mb-4 text-sm text-muted">{intro}</p>
      <ol className="space-y-3">
        {plan.map((p, idx) => (
          <li key={p.title} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start gap-4">
              <span className="brand-grad grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white">{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold leading-snug">{p.title}</h4>
                  <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", p.impact === "Alto" ? "bg-accent/12 text-accent" : "bg-fg/5 text-muted")}>Impacto {p.impact.toLowerCase()}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">Corrige: {p.from}</p>
                {p.lead && <p className="mt-3 text-sm leading-relaxed">{p.lead}</p>}
                <ul className="mt-3 space-y-1.5">
                  {p.steps.map((s) => (
                    <li key={s} className="flex gap-2 text-sm leading-relaxed"><ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" /> {s}</li>
                  ))}
                </ul>
                {p.after && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                    <div className="rounded-xl bg-bad/[0.07] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-bad">Antes · para investigadores</div>
                      <p className="mt-1 font-serif text-[15px] italic leading-snug">“{p.before}”</p>
                    </div>
                    <ArrowRight className="mx-auto h-4 w-4 rotate-90 self-center text-muted sm:rotate-0" />
                    <div className="rounded-xl bg-good/10 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-good">Después · para escritores</div>
                      <p className="mt-1 font-serif text-[15px] italic leading-snug">“{p.after}”</p>
                    </div>
                  </div>
                )}
                {p.glossary?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Glosario de traducción</div>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.glossary.map((g) => (
                        <li key={g.term} className="rounded-full bg-surface2 px-2.5 py-1 text-xs"><span className="font-semibold">{g.term}</span> → {g.plain}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.example && (
                  <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-accent/[0.06] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-accent">Ejemplo listo para usar</div>
                    <p className="mt-1 font-serif text-[16px] italic leading-snug">“{p.example}”</p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AnalysisPanel({ post, analysis, onClose }) {
  const panelRef = useRef(null);
  useEffect(() => panelRef.current?.focus(), [post.id]);

  const verdict = post.verdict || {
    good: "Construye autoridad y genera conversación con futuros alumnos. Replicá el formato.",
    warn: `Tiene señales de interés, pero ${analysis.issues.length} ${analysis.issues.length === 1 ? "problema impide" : "problemas impiden"} que se convierta en clientes.`,
    bad: "No está atrayendo alumnos. Empezá por los problemas de impacto alto.",
  }[analysis.status];
  const TypeIcon = TYPE_META[post.type].icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
      <div className="anim-fade absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="anim-slide relative h-full w-full max-w-[920px] overflow-y-auto bg-bg outline-none">
        <div className="panel-head sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
          <div className="gutter flex items-center gap-4 py-3">
            <Cover post={post} showMeta={false} className="aspect-[4/5] w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <TypeIcon className="h-3.5 w-3.5" /> {TYPE_META[post.type].label} · {PILLARS[post.pillar].label} · {dateFmt(post.date)}
              </div>
              <h2 id="analysis-title" className="truncate font-display text-lg font-bold">{post.title}</h2>
            </div>
            <ScoreRing score={analysis.score} status={analysis.status} size={52} stroke={5} />
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-surface2" aria-label="Cerrar análisis"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="gutter space-y-8 pb-16 pt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
            <Cover post={post} analysis={analysis} className="mx-auto aspect-[4/5] w-full max-w-[260px] rounded-2xl md:max-w-none" />
            <div className="min-w-0 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Diagnóstico de la consultora</p>
                <p className="mt-2 font-serif text-xl italic leading-snug">{verdict}</p>
              </div>
              <p className="rounded-xl bg-surface2 p-3 text-sm leading-relaxed text-muted">“{post.caption}”</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { l: "Alcance", v: fmt(post.metrics.reach), i: Eye },
                  { l: "Guardados", v: fmt(post.metrics.saves), i: Bookmark },
                  { l: "Mensajes", v: full(post.metrics.dms), i: Mail },
                  { l: "Consultas por talleres", v: full(post.metrics.dmInquiries), i: GraduationCap },
                ].map(({ l, v, i: Icon }) => (
                  <div key={l} className="rounded-xl border border-line p-3">
                    <Icon className="h-4 w-4 text-muted" />
                    <div className="mt-1.5 font-mono text-lg font-semibold tabular-nums">{v}</div>
                    <div className="text-[11px] leading-tight text-muted">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section>
            <SectionTitle icon={Target}>Semáforo de rendimiento</SectionTitle>
            <TrafficLightPanel analysis={analysis} />
          </section>

          <section className="space-y-4">
            <SectionTitle icon={TrendingUp}>Métricas detalladas</SectionTitle>
            {post.type === "reel" && (
              <Card className="p-5">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">Retención de audiencia</h4>
                  <span className="font-mono text-xs text-muted">promedio visto {pct(analysis.avgWatch, 0)} · {post.duration} s</span>
                </div>
                <RetentionChart post={post} analysis={analysis} />
              </Card>
            )}
            {post.type === "carousel" && (
              <Card className="p-5">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">Lectura por diapositiva</h4>
                  <span className="font-mono text-xs text-muted">% de cuentas que llega a cada una</span>
                </div>
                <SlideChart post={post} />
              </Card>
            )}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h4 className="mb-4 text-sm font-semibold">Calidad de comentarios</h4>
                <CommentQuality post={post} analysis={analysis} />
              </Card>
              <Card className="p-5">
                <h4 className="mb-4 text-sm font-semibold">Interacciones que convierten</h4>
                <InteractionsChart post={post} />
              </Card>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <SectionTitle icon={TriangleAlert} aside={<span className="text-xs text-muted">{analysis.issues.length} detectados</span>}>Por qué no convierte</SectionTitle>
              {analysis.issues.length ? (
                <ul className="space-y-3">
                  {analysis.issues.map((i) => (
                    <li key={i.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", SEV_STYLE[i.sev])}><i.icon className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{i.title}</span>
                          <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", SEV_STYLE[i.sev])}>{i.sev}</span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{i.why}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">No encontramos frenos a la conversión en esta publicación.</p>
              )}
            </div>
            <div className="lg:col-span-2">
              <SectionTitle icon={CircleCheck}>Qué funcionó</SectionTitle>
              {analysis.strengths.length ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((s) => (
                    <li key={s} className="flex gap-2.5 rounded-xl bg-good/10 p-3 text-sm leading-relaxed">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" /> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-surface2 p-3 text-sm text-muted">Ninguna señal de conversión supera la referencia.</p>
              )}
            </div>
          </section>

          <PlanSection title={post.title} plan={analysis.plan} heading="Plan de acción: cómo convertirlo en alumnos" intro="Ordenado por prioridad comercial. Empezá por lo de impacto alto." />
        </div>
      </div>
    </div>
  );
}

/** Energía del audio en el tiempo, con el segundo 3 y las pausas marcadas. */
function AudioCard({ audio }) {
  if (audio === "loading") {
    return <Card className="flex items-center gap-3 p-5 text-sm text-muted"><AudioLines className="h-4 w-4 animate-pulse text-accent" /> Analizando el audio del video…</Card>;
  }
  if (!audio || audio.error) {
    return (
      <Card className="flex items-start gap-3 p-5 text-sm text-muted">
        <AudioLines className="mt-0.5 h-4 w-4 shrink-0" />
        No se pudo leer el audio: el video no tiene pista de sonido o el navegador no reconoce su formato (pasa con algunos .mov de iPhone). Exportalo como .mp4 y volvé a subirlo.
      </Card>
    );
  }
  const W = 640, H = 120, pl = 8, pr = 8, pt = 18, pb = 22;
  const x = (t) => pl + (t / audio.duration) * (W - pl - pr);
  const bw = (W - pl - pr) / audio.energy.length;
  const y = (db) => pt + (1 - clamp((db + 60) / 60, 0, 1)) * (H - pt - pb);
  const ticks = [0, 3, ...[0.5].map((f) => Math.round(audio.duration * f)), Math.floor(audio.duration)].filter((t, i, arr) => arr.indexOf(t) === i);
  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold"><AudioLines className="h-4 w-4 text-accent" /> Audio del video</h4>
        <span className="font-mono text-xs text-muted">ámbar: silencio inicial · rojo: pausas de más de 1,2 s</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[460px]" role="img" aria-label="Energía del audio a lo largo del video">
          {audio.pauses.map((p) => <rect key={p.start} x={x(p.start)} y={pt} width={Math.max(2, x(p.start + p.length) - x(p.start))} height={H - pt - pb} className="fill-bad/15" />)}
          {audio.startSilence > 0.05 && <rect x={x(0)} y={pt} width={x(Math.min(audio.startSilence, audio.duration)) - x(0)} height={H - pt - pb} className="fill-warn/15" />}
          {audio.energy.map((db, i) => (
            <rect key={i} x={pl + i * bw + 0.5} y={y(db)} width={Math.max(1, bw - 1)} height={H - pb - y(db)} rx="1" className={db > audio.threshold ? "fill-accent" : "fill-fg/20"} />
          ))}
          <line x1={x(3)} x2={x(3)} y1={pt - 4} y2={H - pb} strokeDasharray="4 4" className="stroke-fg/50" />
          <text x={x(3) + 6} y={pt - 6} className="fill-fg text-[11px] font-semibold">Segundo 3</text>
          {ticks.map((t) => <text key={t} x={x(t)} y={H - 6} textAnchor="middle" className="fill-muted font-mono text-[10px]">{t}s</text>)}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: "El sonido empieza en", v: audio.hasAudio ? `${dec(audio.startSilence)} s` : "—" },
          { l: "Sonido en los primeros 3 s", v: pct(audio.hookActive, 0) },
          { l: "Pausas largas", v: audio.pauses.length },
          { l: "Nivel medio de la voz", v: audio.hasAudio ? `${Math.round(audio.level)} dB` : "—" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl bg-surface2 p-3">
            <div className="font-mono text-lg font-semibold tabular-nums">{m.v}</div>
            <div className="text-[11px] leading-tight text-muted">{m.l}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Zona de arrastrar y soltar para revisar un post antes de publicarlo. */
function UploadZone({ onFile, onPick, onPaste }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cx("mb-6 flex flex-col gap-3 rounded-2xl border-2 border-dashed p-4 transition sm:flex-row sm:items-center", over ? "border-accent bg-accent/[0.06]" : "border-line bg-surface")}
    >
      <span className="brand-grad grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"><Upload className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{over ? "Soltalo para analizarlo" : "Revisá un post antes de publicarlo"}</p>
        <p className="text-xs leading-relaxed text-muted">Arrastrá acá un video, una imagen, los subtítulos (.srt) o un .txt con el texto. Analizo texto, audio y formato con los mismos criterios y te muestro qué corregir.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={onPick} className="brand-grad inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:flex-none">
          <Upload className="h-4 w-4" /> Subir post/video
        </button>
        <button onClick={onPaste} className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-3.5 py-2 text-sm font-semibold transition hover:bg-surface2 sm:flex-none">
          <ClipboardPaste className="h-4 w-4" /> Pegar texto
        </button>
      </div>
    </div>
  );
}

const DRAFT_KIND = {
  text: { label: "Texto", icon: FileText },
  image: { label: "Imagen", icon: FileImage },
  video: { label: "Video", icon: FileVideo },
};

/** Revisión antes de publicar: carga el archivo, mide lo que puede y muestra el plan de acción. */
function DraftPanel({ draft, onClose }) {
  const [text, setText] = useState(draft.text || "");
  const [pillar, setPillar] = useState("auto");
  const [media, setMedia] = useState(null);
  const [audio, setAudio] = useState(draft.kind === "video" ? "loading" : null);
  const [cues, setCues] = useState(draft.cues || null);
  const subsRef = useRef(null);
  const panelRef = useRef(null);

  // Audio: se decodifica la pista del video en el navegador
  useEffect(() => {
    if (draft.kind !== "video" || !draft.file) return;
    let cancelled = false;
    analyzeAudio(draft.file).then((a) => !cancelled && setAudio(a), () => !cancelled && setAudio({ error: true }));
    return () => { cancelled = true; };
  }, [draft]);

  const loadSubtitles = async (file) => {
    const parsed = parseSubtitles(await file.text());
    if (!parsed.length) return;
    setCues(parsed);
    const spoken = parsed.map((c) => c.text).join(" ");
    setText((t) => (t.trim() ? `${spoken}\n\n${t}` : spoken));
  };
  useEffect(() => panelRef.current?.focus(), []);

  // Medir el archivo visual en el navegador: dimensiones, duración y contraste
  useEffect(() => {
    if (!draft.url) return;
    let cancelled = false;
    if (draft.kind === "image") {
      const img = new Image();
      img.onload = () => {
        let contrast = null;
        try { contrast = lumaContrast(img, img.naturalWidth, img.naturalHeight); } catch (e) { /* imagen no legible */ }
        if (!cancelled) setMedia({ width: img.naturalWidth, height: img.naturalHeight, contrast });
      };
      img.src = draft.url;
    } else if (draft.kind === "video") {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      v.onloadedmetadata = () => {
        if (cancelled) return;
        setMedia({ width: v.videoWidth, height: v.videoHeight, duration: v.duration, contrast: null });
        v.currentTime = Math.min(0.5, v.duration / 2);
      };
      v.onseeked = () => {
        let contrast = null;
        try { contrast = lumaContrast(v, v.videoWidth, v.videoHeight); } catch (e) { /* fotograma no legible */ }
        if (!cancelled) setMedia((m) => ({ ...m, contrast }));
      };
      v.src = draft.url;
    }
    return () => { cancelled = true; };
  }, [draft]);

  const audioReady = audio && audio !== "loading" && !audio.error ? audio : null;
  const analysis = useMemo(() => analyzeDraft({ kind: draft.kind, text, pillar, media, audio: audioReady, cues }), [draft.kind, text, pillar, media, audioReady, cues]);
  const Kind = DRAFT_KIND[draft.kind];
  const hasText = analysis.words > 0;
  const verdict = {
    good: "Listo para publicar. Cumple los criterios de autoridad y captación.",
    warn: "Casi listo. Corregí lo de impacto alto antes de publicarlo.",
    bad: "Todavía no. Tal como está, este borrador no va a atraer alumnos.",
  }[analysis.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="draft-title">
      <div className="anim-fade absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="anim-slide relative h-full w-full max-w-[920px] overflow-y-auto bg-bg outline-none">
        <div className="panel-head sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
          <div className="gutter flex items-center gap-4 py-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface2"><Kind.icon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">Revisión antes de publicar · {Kind.label}</div>
              <h2 id="draft-title" className="truncate font-display text-lg font-bold">{draft.name}</h2>
            </div>
            {hasText && <ScoreRing score={analysis.score} status={analysis.status} size={52} stroke={5} />}
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-surface2" aria-label="Cerrar revisión"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="gutter space-y-8 pb-16 pt-6">
          <div className={cx("grid grid-cols-1 gap-5", draft.url && "md:grid-cols-[220px_1fr]")}>
            {draft.kind === "image" && <img src={draft.url} alt="Vista previa del post" className="mx-auto max-h-[340px] w-full max-w-[260px] rounded-2xl object-cover md:max-w-none" />}
            {draft.kind === "video" && <video src={draft.url} controls muted playsInline className="mx-auto max-h-[380px] w-full max-w-[260px] rounded-2xl bg-black md:max-w-none" />}
            <div className="min-w-0 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Diagnóstico de la consultora</p>
                <p className="mt-2 font-serif text-xl italic leading-snug">
                  {hasText ? verdict : draft.kind === "text" ? "Pegá o escribí el texto del post para analizarlo." : "Pegá el texto del post o el guion del video para analizarlo."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-surface2 px-2.5 py-1">{analysis.words} palabras</span>
                {analysis.facts.map((f) => <span key={f} className="rounded-full bg-surface2 px-2.5 py-1 font-mono">{f}</span>)}
                {hasText && <PillarTag pillar={analysis.pillar} short={false} />}
              </div>
              <div>
                <label htmlFor="draft-text" className="mb-1.5 block text-xs font-semibold text-muted">
                  {draft.kind === "text" ? "Texto del post" : "Texto del post o guion del video"}
                </label>
                <textarea
                  id="draft-text" value={text} onChange={(e) => setText(e.target.value)} rows={7}
                  placeholder={draft.kind === "video" ? "Pegá acá lo que decís en el video y el texto que va a acompañar al Reel…" : "Pegá acá el texto que vas a publicar…"}
                  className="w-full resize-y rounded-xl border border-line bg-surface p-3 text-sm leading-relaxed outline-none transition placeholder:text-muted focus:border-accent"
                />
                <p className="mt-1.5 text-xs text-muted">
                  {draft.kind === "video"
                    ? "El audio se analiza solo (silencios, pausas, volumen). Para analizar lo que decís, cargá los subtítulos que exporta CapCut o Edits, o pegá el guion."
                    : "El análisis se actualiza mientras escribís."}
                </p>
                {draft.kind === "video" && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button onClick={() => subsRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold transition hover:bg-surface2">
                      <Captions className="h-3.5 w-3.5" /> {cues ? "Cambiar subtítulos" : "Cargar subtítulos (.srt / .vtt)"}
                    </button>
                    {cues && <span className="text-xs text-muted">{cues.length} líneas cargadas: el gancho se mide con lo que decís en los primeros 3 s.</span>}
                    <input ref={subsRef} id="draft-subs" type="file" accept=".srt,.vtt,text/vtt" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) loadSubtitles(f); e.target.value = ""; }} />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="draft-pillar" className="mb-1.5 block text-xs font-semibold text-muted">Pilar de contenido</label>
                <select id="draft-pillar" value={pillar} onChange={(e) => setPillar(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent">
                  <option value="auto">Detectar automáticamente ({PILLARS[analysis.detected].label})</option>
                  {PILLAR_KEYS.map((k) => <option key={k} value={k}>{PILLARS[k].label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {draft.kind === "video" && <AudioCard audio={audio} />}

          {hasText && (
            <>
              <section>
                <SectionTitle icon={Target}>Semáforo antes de publicar</SectionTitle>
                <TrafficLightPanel analysis={analysis} />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <SectionTitle icon={TriangleAlert} aside={<span className="text-xs text-muted">{analysis.issues.length} detectados</span>}>Qué corregir</SectionTitle>
                  {analysis.issues.length ? (
                    <ul className="space-y-3">
                      {analysis.issues.map((i) => (
                        <li key={i.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                          <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", SEV_STYLE[i.sev])}><i.icon className="h-4 w-4" /></span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">{i.title}</span>
                              <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", SEV_STYLE[i.sev])}>{i.sev}</span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-muted">{i.why}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">No encontramos frenos a la conversión en este borrador.</p>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <SectionTitle icon={CircleCheck}>Qué está bien</SectionTitle>
                  {analysis.strengths.length ? (
                    <ul className="space-y-2">
                      {analysis.strengths.map((x) => (
                        <li key={x} className="flex gap-2.5 rounded-xl bg-good/10 p-3 text-sm leading-relaxed">
                          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" /> {x}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl bg-surface2 p-3 text-sm text-muted">Ningún criterio está resuelto todavía. Empezá por el plan de acción.</p>
                  )}
                </div>
              </section>

              <PlanSection title={draft.name} plan={analysis.plan} heading="Plan de acción antes de publicar" intro="Ordenado por prioridad comercial. Corregí, pegá la nueva versión arriba y el análisis se actualiza." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 7. App
 * ============================================================ */
function useTheme() {
  const media = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const read = () => document.documentElement.dataset.theme || (media?.matches ? "dark" : "light");
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const sync = () => setTheme(read());
    media?.addEventListener?.("change", sync);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      media?.removeEventListener?.("change", sync);
      mo.disconnect();
    };
  }, []);
  const toggle = () => {
    document.documentElement.dataset.theme = theme === "dark" ? "light" : "dark";
  };
  return [theme, toggle];
}

const NAV = [
  { key: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { key: "content", label: "Contenido", icon: LayoutGrid },
];

function Brand({ compact }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cx("brand-grad grid shrink-0 place-items-center rounded-[11px] text-white", compact ? "h-8 w-8" : "h-9 w-9")}><Feather className="h-[18px] w-[18px]" strokeWidth={2.2} /></span>
      <span className={cx("font-display font-extrabold tracking-tight", compact ? "text-lg" : "text-xl max-xl:hidden")}>
        Reelscope<span className="font-serif font-medium italic text-accent"> autoridad</span>
      </span>
    </div>
  );
}

export default function App() {
  const posts = SEED_POSTS;
  const analyses = useMemo(() => Object.fromEntries(posts.map((p) => [p.id, analyzePost(p)])), [posts]);
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [draft, setDraft] = useState(null);
  const fileRef = useRef(null);
  const [theme, toggleTheme] = useTheme();
  const selected = selectedId ? posts.find((p) => p.id === selectedId) : null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (draft) closeDraft();
      else setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);
  useEffect(() => {
    document.body.style.overflow = selected || draft ? "hidden" : "";
  }, [selected, draft]);

  const closeDraft = () => {
    if (draft?.url) URL.revokeObjectURL(draft.url);
    setDraft(null);
  };
  const handleFile = async (file) => {
    const type = file.type || "";
    if (draft?.url) URL.revokeObjectURL(draft.url);
    if (type.startsWith("image/")) setDraft({ kind: "image", name: file.name, url: URL.createObjectURL(file), text: "" });
    else if (type.startsWith("video/") || /\.(mov|mp4|m4v|webm)$/i.test(file.name)) setDraft({ kind: "video", name: file.name, url: URL.createObjectURL(file), file, text: "" });
    else if (/\.(srt|vtt)$/i.test(file.name)) {
      const cues = parseSubtitles(await file.text());
      setDraft({ kind: "text", name: file.name, text: cues.map((c) => c.text).join(" "), cues });
    }
    else if (type.startsWith("text/") || /\.(txt|md)$/i.test(file.name)) setDraft({ kind: "text", name: file.name, text: await file.text() });
    else setToast("Ese formato no se puede analizar. Subí un video, una imagen, subtítulos (.srt) o un archivo .txt.");
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-full bg-bg font-body text-fg antialiased">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-bg px-3 py-6 md:flex xl:w-[260px] xl:px-4"
        style={{ paddingTop: "max(24px, env(safe-area-inset-top, 0px))", paddingLeft: "max(12px, env(safe-area-inset-left, 0px))" }}>
        <div className="px-2"><Brand /></div>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setView(key)} title={label}
              className={cx("flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] transition hover:bg-surface2", view === key ? "font-bold" : "text-fg/80")}>
              <Icon className="h-6 w-6 shrink-0" strokeWidth={view === key ? 2.5 : 1.8} />
              <span className="max-xl:hidden">{label}</span>
            </button>
          ))}
          <button onClick={() => fileRef.current?.click()} title="Subir post/video" className="flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] text-fg/80 transition hover:bg-surface2">
            <Upload className="h-6 w-6 shrink-0" strokeWidth={1.8} />
            <span className="max-xl:hidden">Subir post/video</span>
          </button>
        </nav>
        <div className="mt-8 hidden space-y-2 px-3 xl:block">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pilares</p>
          {PILLAR_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs text-muted"><span className={cx("h-2 w-2 rounded-full", PILLARS[k].color)} />{PILLARS[k].label}</div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <button onClick={toggleTheme} title="Cambiar tema" className="flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] text-fg/80 transition hover:bg-surface2">
            {theme === "dark" ? <SunMedium className="h-6 w-6 shrink-0" strokeWidth={1.8} /> : <MoonStar className="h-6 w-6 shrink-0" strokeWidth={1.8} />}
            <span className="max-xl:hidden">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
          </button>
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="brand-grad grid h-9 w-9 shrink-0 place-items-center rounded-full p-[2px]">
              <span className="grid h-full w-full place-items-center rounded-full bg-bg"><BookOpen className="h-4 w-4" /></span>
            </span>
            <div className="min-w-0 max-xl:hidden">
              <div className="truncate text-sm font-semibold">{ACCOUNT.handle}</div>
              <div className="truncate text-xs text-muted">{ACCOUNT.name}</div>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky-safe gutter sticky z-30 flex items-center justify-between border-b border-line bg-bg/90 py-3 backdrop-blur md:hidden">
        <Brand compact />
        <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface2" aria-label="Cambiar tema">
          {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
      </header>

      <main className="gutter pb-28 pt-6 md:ml-[76px] md:pb-12 md:pt-10 xl:ml-[260px]">
        <div className="mx-auto max-w-6xl">
          <UploadZone onFile={handleFile} onPick={() => fileRef.current?.click()} onPaste={() => setDraft({ kind: "text", name: "Texto pegado", text: "" })} />
          {view === "dashboard"
            ? <DashboardView posts={posts} analyses={analyses} onOpen={setSelectedId} goContent={() => setView("content")} />
            : <ContentView posts={posts} analyses={analyses} onOpen={setSelectedId} onUpload={() => fileRef.current?.click()} />}
          <p className="mt-10 text-center text-xs text-muted">Simulador con datos de ejemplo. No está afiliado a Instagram ni a Meta.</p>
        </div>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-bg/95 pt-2 backdrop-blur md:hidden">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)} className={cx("flex flex-col items-center gap-0.5 px-4 text-[11px]", view === key ? "font-bold text-fg" : "text-muted")}>
            <Icon className="h-6 w-6" strokeWidth={view === key ? 2.5 : 1.8} />{label}
          </button>
        ))}
        <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-0.5 px-4 text-[11px] text-muted">
          <span className="brand-grad grid h-6 w-6 place-items-center rounded-md text-white"><Upload className="h-4 w-4" strokeWidth={2.5} /></span>Subir
        </button>
      </nav>

      {selected && <AnalysisPanel post={selected} analysis={analyses[selected.id]} onClose={() => setSelectedId(null)} />}
      {draft && <DraftPanel key={draft.url || draft.name + draft.text.length} draft={draft} onClose={closeDraft} />}
      <input
        ref={fileRef} id="draft-file" type="file" accept="image/*,video/*,.mov,.txt,.md,.srt,.vtt,text/plain" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
      {toast && (
        <div className="anim-pop fixed bottom-24 left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-bg shadow-xl md:bottom-8" role="status">
          <CircleCheck className="h-4 w-4 shrink-0" /> <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}

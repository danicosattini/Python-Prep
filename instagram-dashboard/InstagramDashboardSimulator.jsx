/**
 * Reelscope — Simulador de Dashboard de Instagram
 * ------------------------------------------------
 * SPA de un solo archivo: React + Tailwind CSS + lucide-react.
 *
 * Arquitectura:
 *   1. Utilidades y formato
 *   2. Datos: nichos, publicaciones de ejemplo y generador de publicaciones importadas
 *   3. Motor de análisis: semáforo, diagnóstico y plan de acción derivados de las métricas
 *   4. Componentes visuales (portadas, gráficos, semáforo)
 *   5. Vistas: Resumen, Contenido, Análisis profundo, Importar
 *   6. App (estado global)
 *
 * Todo es simulado: no hay conexión con Instagram. El análisis sí es real sobre
 * los datos simulados: cada diagnóstico sale de reglas aplicadas a las métricas.
 *
 * Tailwind espera estos colores como variables CSS en formato "R G B"
 * (ver tailwind.config.js e index.css en esta misma carpeta).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, Bookmark, Briefcase, Captions, ChefHat, ChevronRight, CircleCheck, CircleX,
  Clapperboard, Clock, Contrast, Copy, Check, Dumbbell, Eye, GalleryHorizontalEnd, Hash, Heart,
  Image as ImageIcon, LayoutDashboard, LayoutGrid, Lightbulb, Link2, Loader2, Megaphone, MessageCircle,
  MoonStar, Music2, Plane, Play, Plus, Scissors, Search, Send, Shirt, Sparkles, SunMedium, Target,
  TrendingUp, TriangleAlert, Type, UserPlus, Users, Wallet, X, Zap,
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
const dateFmt = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
const cx = (...c) => c.filter(Boolean).join(" ");

/** Hash determinista de texto -> entero (para que un enlace dé siempre el mismo resultado). */
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
/** PRNG pequeño y determinista. */
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCOUNT = { handle: "@tu.marca", name: "Tu cuenta (demo)", followers: 12480 };

/* ============================================================
 * 2. Datos
 * ============================================================ */
const TYPE_META = {
  reel: { label: "Reel", plural: "Reels", icon: Clapperboard },
  carousel: { label: "Carrusel", plural: "Carruseles", icon: GalleryHorizontalEnd },
  photo: { label: "Foto", plural: "Fotos", icon: ImageIcon },
};

/** Plantillas por nicho: se usan para las publicaciones importadas y como copia de respaldo. */
const NICHES = {
  Fitness: {
    icon: Dumbbell,
    palette: ["#1d2b22", "#3f6b4f"], ink: "#d9f99d", lowInk: "#4d7a5d",
    keyword: "rutina en casa",
    titles: ["Rutina de piernas sin pesas", "Qué como en un día de entrenamiento", "3 errores en la sentadilla", "Cardio vs. pesas para bajar grasa"],
    hookAlt: "Si hacés sentadillas así, le estás cargando la rodilla y no el glúteo.",
    coverAlt: "TU SENTADILLA ESTÁ MAL",
    ctaAlt: "Guardalo para tu próximo día de piernas y mandáselo a quien entrena con vos.",
  },
  Emprendimiento: {
    icon: Briefcase,
    palette: ["#14141a", "#34343f"], ink: "#ffd84d", lowInk: "#4a4a57",
    keyword: "emprender desde cero",
    titles: ["Cómo conseguí mis primeros 10 clientes", "Precio vs. valor: cómo cobrar más", "Lo que nadie te dice de emprender", "Mi stack de herramientas gratis"],
    hookAlt: "Conseguí mis primeros 10 clientes sin pagar publicidad. Así lo hice:",
    coverAlt: "10 CLIENTES, $0 EN ADS",
    ctaAlt: "Guardalo para cuando armes tu oferta y comentá 'CLIENTES' si querés la plantilla.",
  },
  Cocina: {
    icon: ChefHat,
    palette: ["#f4d35e", "#ee964b"], ink: "#1b1b1b", lowInk: "#f7dca0",
    keyword: "receta fácil",
    titles: ["Almuerzo en 15 minutos", "Pan casero sin amasar", "Meal prep para toda la semana", "Salsa que salva cualquier pasta"],
    hookAlt: "Esta salsa tarda 5 minutos y hace que cualquier pasta parezca de restaurante.",
    coverAlt: "5 MIN. 3 INGREDIENTES.",
    ctaAlt: "Guardala para la cena de hoy y mandásela a quien siempre cocina fideos con manteca.",
  },
  Finanzas: {
    icon: Wallet,
    palette: ["#12263a", "#2f6690"], ink: "#f1faee", lowInk: "#3e6f94",
    keyword: "ahorrar dinero",
    titles: ["La regla 50/30/20 explicada", "Cómo dejé de llegar a fin de mes", "Inversiones para empezar con poco", "Gastos hormiga que no ves"],
    hookAlt: "Revisé mis gastos de 3 meses y encontré un 18% que se iba en cosas que ni recordaba.",
    coverAlt: "EL 18% QUE PIERDES",
    ctaAlt: "Guardalo y hacé el ejercicio este domingo. Comentá 'PLANILLA' y te la paso.",
  },
  Moda: {
    icon: Shirt,
    palette: ["#e8dcd0", "#b89f8a"], ink: "#2b1d14", lowInk: "#efe6dc",
    keyword: "outfits de otoño",
    titles: ["5 outfits con 10 prendas", "Cómo combinar colores neutros", "Básicos que valen la pena", "Errores al elegir jeans"],
    hookAlt: "Con estas 10 prendas armé 5 outfits distintos para toda la semana.",
    coverAlt: "10 PRENDAS = 5 LOOKS",
    ctaAlt: "Guardalo para cuando no sepas qué ponerte y etiquetá a tu amiga más indecisa.",
  },
  Viajes: {
    icon: Plane,
    palette: ["#0b3954", "#087e8b"], ink: "#fefae0", lowInk: "#2a8a96",
    keyword: "viajar barato",
    titles: ["Mendoza en 3 días con poco presupuesto", "Cómo encuentro vuelos baratos", "Lo que no llevaría nunca más", "Itinerario perfecto de fin de semana"],
    hookAlt: "Recorrí Mendoza 3 días gastando menos que una cena en Buenos Aires.",
    coverAlt: "3 DÍAS, POCO PRESUPUESTO",
    ctaAlt: "Guardalo para tu próximo finde largo y mandáselo a quien viaja con vos.",
  },
};

/**
 * Publicaciones de ejemplo. Los números son verosímiles para una cuenta de ~12 mil
 * seguidores; están pensados para cubrir los tres colores del semáforo.
 * retention: puntos [segundo, % de espectadores que sigue mirando].
 * slideRetention: % de cuentas que llega a cada diapositiva.
 */
const SEED_POSTS = [
  {
    id: "p1", type: "reel", niche: "Fitness", date: "2026-10-27", hour: 16, duration: 34,
    title: "Rutina de abdomen en 10 minutos",
    caption: "Rutina rápida 💪 #fitness #abs #gym #workout #fit #motivation …",
    cover: { palette: ["#2b2f36", "#5b6470"], ink: "#aab2bd", kicker: "Rutina", headline: "Abdomen 10 min" },
    retention: [[0, 100], [1, 71], [3, 38], [6, 29], [10, 24], [15, 20], [20, 17], [25, 15], [30, 13], [34, 11]],
    metrics: { reach: 4820, impressions: 5630, nonFollowerPct: 18, likes: 168, comments: 9, saves: 41, shares: 6, follows: 7, profileVisits: 58 },
    attrs: { hasCTA: false, coverContrast: "media", audio: "original", avgShot: 3.8, subtitles: false, captionWords: 9, hashtags: 24, hookText: "Hola chicos, hoy les traigo una rutina…" },
    copy: {
      hookAlt: "Si hacés crunches para marcar abdomen, estás entrenando el músculo que menos se ve.",
      coverAlt: "ABDOMEN SIN CRUNCHES",
      ctaAlt: "Guardalo y hacelo hoy antes de cenar. Comentá 'RUTINA' y te paso la versión de 20 minutos.",
    },
  },
  {
    id: "p2", type: "carousel", niche: "Emprendimiento", date: "2026-10-22", hour: 12, slides: 9,
    title: "7 errores que me costaron mi primer negocio",
    caption: "Cerré mi primer emprendimiento a los 14 meses. Estos son los 7 errores que no repetiría, con lo que haría distinto hoy…",
    cover: { palette: ["#111111", "#2a2a2a"], ink: "#ffd84d", kicker: "Lo que aprendí", headline: "7 errores que me fundieron" },
    slideRetention: [100, 78, 71, 66, 62, 59, 57, 55, 52],
    metrics: { reach: 21400, impressions: 28900, nonFollowerPct: 61, likes: 1380, comments: 142, saves: 1190, shares: 486, follows: 214, profileVisits: 1630 },
    attrs: { hasCTA: true, coverContrast: "alta", audio: null, captionWords: 140, hashtags: 5, hookOnSlide1: true },
    copy: { hookAlt: NICHES.Emprendimiento.hookAlt, coverAlt: NICHES.Emprendimiento.coverAlt, ctaAlt: NICHES.Emprendimiento.ctaAlt },
  },
  {
    id: "p3", type: "reel", niche: "Cocina", date: "2026-10-19", hour: 19, duration: 28,
    title: "Pasta cremosa con 4 ingredientes en 12 minutos",
    caption: "Pasta cremosa sin crema 🍝 Solo 4 ingredientes y 12 minutos. Receta completa abajo 👇 …",
    cover: { palette: ["#f4d35e", "#ee964b"], ink: "#1b1b1b", kicker: "Sin crema", headline: "4 ingredientes, 12 min" },
    retention: [[0, 100], [1, 92], [3, 81], [6, 74], [10, 69], [15, 64], [20, 60], [25, 57], [28, 55]],
    metrics: { reach: 58200, impressions: 81500, nonFollowerPct: 78, likes: 4210, comments: 318, saves: 3870, shares: 1940, follows: 612, profileVisits: 3900 },
    attrs: { hasCTA: true, coverContrast: "alta", audio: "tendencia", avgShot: 1.4, subtitles: true, captionWords: 85, hashtags: 6, hookText: "Esta pasta no lleva crema y es la más cremosa que vas a probar." },
    copy: { hookAlt: NICHES.Cocina.hookAlt, coverAlt: NICHES.Cocina.coverAlt, ctaAlt: NICHES.Cocina.ctaAlt },
  },
  {
    id: "p4", type: "photo", niche: "Fitness", date: "2026-10-14", hour: 2,
    title: "Antes y después: 12 semanas",
    caption: "12 semanas 🔥 #fitness #transformation #gym #fitfam #healthy …",
    cover: { palette: ["#d9d4cc", "#c8c1b6"], ink: "#e6e1d9", kicker: "Progreso", headline: "12 semanas" },
    metrics: { reach: 3100, impressions: 3420, nonFollowerPct: 12, likes: 121, comments: 14, saves: 8, shares: 2, follows: 3, profileVisits: 40 },
    attrs: { hasCTA: false, coverContrast: "baja", audio: null, captionWords: 6, hashtags: 28 },
    copy: {
      hookAlt: "Mismo cuerpo, 12 semanas de diferencia. Lo que cambió no fue el gimnasio.",
      coverAlt: "-6 KG SIN DIETA EXTREMA",
      ctaAlt: "Si querés el plan semana por semana, comentá 'PLAN' y te lo mando.",
    },
  },
  {
    id: "p5", type: "carousel", niche: "Finanzas", date: "2026-10-09", hour: 13, slides: 10,
    title: "Cómo armar tu fondo de emergencia",
    caption: "Fondo de emergencia: qué es, cuánto necesitás y dónde guardarlo. #finanzaspersonales #ahorro …",
    cover: { palette: ["#1d3557", "#457b9d"], ink: "#f1faee", kicker: "Finanzas personales", headline: "Fondo de emergencia" },
    slideRetention: [100, 52, 41, 33, 28, 24, 21, 19, 18, 17],
    metrics: { reach: 9800, impressions: 11900, nonFollowerPct: 34, likes: 420, comments: 38, saves: 310, shares: 64, follows: 41, profileVisits: 260 },
    attrs: { hasCTA: true, coverContrast: "media", audio: null, captionWords: 48, hashtags: 12, hookOnSlide1: false },
    copy: {
      hookAlt: "Si mañana te quedás sin ingresos, ¿cuántos meses aguantás? Calculalo en 3 pasos.",
      coverAlt: "¿CUÁNTOS MESES AGUANTÁS?",
      ctaAlt: NICHES.Finanzas.ctaAlt,
    },
  },
  {
    id: "p6", type: "photo", niche: "Cocina", date: "2026-10-04", hour: 10,
    title: "Mi desayuno de los domingos",
    caption: "Domingo de tostadas francesas con frutos rojos y un café bien cargado. ¿Dulce o salado los domingos?",
    cover: { palette: ["#f6e7d8", "#e8c39e"], ink: "#5a3a22", kicker: "Domingo", headline: "Tostadas francesas" },
    metrics: { reach: 6400, impressions: 7900, nonFollowerPct: 29, likes: 510, comments: 47, saves: 96, shares: 21, follows: 12, profileVisits: 110 },
    attrs: { hasCTA: false, coverContrast: "alta", audio: null, captionWords: 22, hashtags: 9 },
    copy: {
      hookAlt: "Las tostadas francesas que hago todos los domingos (el secreto es el pan de ayer).",
      coverAlt: "EL SECRETO: PAN DE AYER",
      ctaAlt: "Guardala para el domingo y contame: ¿dulce o salado?",
    },
  },
  {
    id: "p7", type: "reel", niche: "Emprendimiento", date: "2026-09-29", hour: 9, duration: 45,
    title: "Un día en mi vida como emprendedora",
    caption: "Un día normal en mi vida emprendiendo ☕️💻 #emprendedora #dayinmylife …",
    cover: { palette: ["#5f0f40", "#9a031e"], ink: "#fff4e6", kicker: "Day in my life", headline: "Un día emprendiendo" },
    retention: [[0, 100], [1, 84], [3, 66], [6, 52], [10, 40], [15, 31], [20, 26], [30, 20], [40, 16], [45, 14]],
    metrics: { reach: 14600, impressions: 17800, nonFollowerPct: 52, likes: 890, comments: 61, saves: 120, shares: 74, follows: 38, profileVisits: 420 },
    attrs: { hasCTA: false, coverContrast: "alta", audio: "original", avgShot: 2.9, subtitles: true, captionWords: 31, hashtags: 8, hookText: "5:30 de la mañana. Empieza el día." },
    copy: {
      hookAlt: "Facturo más trabajando 5 horas que cuando trabajaba 10. Mirá cómo organizo el día.",
      coverAlt: "5 HORAS, EL DOBLE",
      ctaAlt: "Seguime si querés ver cómo armo la semana el domingo (lo subo mañana).",
    },
  },
  {
    id: "p8", type: "reel", niche: "Finanzas", date: "2026-09-24", hour: 20, duration: 22,
    title: "3 apps para ahorrar sin pensar",
    caption: "3 apps que me ayudan a ahorrar en automático. La tercera me cambió la forma de ver mis gastos…",
    cover: { palette: ["#cfe8d5", "#b7dfc4"], ink: "#e3f2e7", kicker: "Ahorro", headline: "3 apps para ahorrar" },
    retention: [[0, 100], [1, 88], [3, 72], [6, 63], [10, 57], [15, 52], [22, 47]],
    metrics: { reach: 27300, impressions: 33100, nonFollowerPct: 66, likes: 1520, comments: 204, saves: 1680, shares: 710, follows: 166, profileVisits: 1240 },
    attrs: { hasCTA: true, coverContrast: "baja", audio: "tendencia", avgShot: 1.8, subtitles: true, captionWords: 60, hashtags: 4, hookText: "Ahorro sin darme cuenta gracias a estas 3 apps." },
    copy: { hookAlt: NICHES.Finanzas.hookAlt, coverAlt: "AHORRÁ SIN PENSAR", ctaAlt: NICHES.Finanzas.ctaAlt },
  },
];

const URL_RE = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]{5,})\/?(\?.*)?$/i;

/** Genera una publicación simulada y determinista a partir de un enlace. */
function generatePost(url, nicheChoice) {
  const match = url.match(URL_RE);
  const shortcode = match[4];
  const r = mulberry32(hashString(shortcode));
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const kind = match[3].toLowerCase();
  const type = kind === "p" ? (r() < 0.55 ? "carousel" : "photo") : "reel";
  const niche = nicheChoice === "auto" ? pick(Object.keys(NICHES)) : nicheChoice;
  const N = NICHES[niche];
  const q = r(); // calidad latente 0..1: mueve todas las métricas en la misma dirección

  const reach = Math.round((2500 + q * q * 55000) * (0.7 + r() * 0.6));
  const er = 2.5 + q * 13 + r() * 2;
  const inter = (reach * er) / 100;
  const saves = Math.round(inter * (0.12 + q * 0.25));
  const shares = Math.round(inter * (0.04 + q * 0.14));
  const comments = Math.round(inter * (0.03 + r() * 0.04));
  const likes = Math.max(0, Math.round(inter - saves - shares - comments));
  const now = new Date();
  const contrastRoll = r();
  const title = pick(N.titles);

  const post = {
    id: `imp-${shortcode}`,
    imported: true,
    url,
    type,
    niche,
    date: now.toISOString().slice(0, 10),
    hour: Math.floor(r() * 24),
    title,
    caption: `${title}. Todo lo que necesitás saber sobre ${N.keyword} …`,
    cover: { palette: N.palette, ink: N.ink, kicker: niche, headline: title },
    metrics: {
      reach,
      impressions: Math.round(reach * (1.08 + r() * 0.35)),
      nonFollowerPct: Math.round(clamp(10 + q * 68 * (0.75 + r() * 0.25), 5, 92)),
      likes, comments, saves, shares,
      follows: Math.round((reach * (0.3 + q * 9)) / 1000),
      profileVisits: Math.round((reach * (4 + q * 50)) / 1000),
    },
    attrs: {
      hasCTA: r() < 0.25 + q * 0.6,
      coverContrast: contrastRoll < 0.25 + (1 - q) * 0.2 ? "baja" : contrastRoll < 0.6 ? "media" : "alta",
      audio: type === "reel" ? (r() < 0.25 + q * 0.5 ? "tendencia" : "original") : null,
      avgShot: type === "reel" ? Math.round((1.2 + (1 - q) * 2.8 + r() * 0.6) * 10) / 10 : undefined,
      subtitles: r() < 0.35 + q * 0.5,
      captionWords: Math.round(5 + r() * 120 * (0.3 + q * 0.7)),
      hashtags: Math.round(r() < 0.4 ? 15 + r() * 15 : 3 + r() * 8),
      hookOnSlide1: r() < 0.3 + q * 0.6,
      hookText: null,
    },
    copy: { hookAlt: N.hookAlt, coverAlt: N.coverAlt, ctaAlt: N.ctaAlt },
  };
  if (post.attrs.coverContrast === "baja") post.cover.ink = N.lowInk;

  if (type === "reel") {
    const duration = Math.round(15 + r() * 45);
    const r3 = Math.round(clamp(30 + q * 58 + (r() - 0.5) * 12, 20, 92));
    const end = r3 * (0.22 + q * 0.5);
    const k = 0.06 + (1 - q) * 0.12;
    const pts = [[0, 100], [1, Math.round(r3 + (100 - r3) * 0.5)], [3, r3]];
    const marks = [6, 10, 15, 20, 30, 40, 50, 60].filter((t) => t < duration);
    const midDrop = r() < 0.4 ? pick(marks.slice(0, 3)) : null;
    let penalty = 0;
    for (const t of marks) {
      if (t === midDrop) penalty += 8 + r() * 6;
      pts.push([t, Math.round(Math.max(end - 4, end + (r3 - end) * Math.exp(-k * (t - 3)) - penalty))]);
    }
    pts.push([duration, Math.round(Math.max(3, end - penalty))]);
    post.duration = duration;
    post.retention = pts;
  }
  if (type === "carousel") {
    const slides = 5 + Math.floor(r() * 6);
    const s2 = clamp(32 + q * 50 + (r() - 0.5) * 10, 25, 90);
    const decay = 0.04 + (1 - q) * 0.12;
    post.slides = slides;
    post.slideRetention = Array.from({ length: slides }, (_, i) =>
      i === 0 ? 100 : Math.round(s2 * Math.pow(1 - decay, i - 1))
    );
  }
  return post;
}

/* ============================================================
 * 3. Motor de análisis
 * ============================================================ */

/** Interpolación lineal sobre la curva de retención. */
function retAt(points, t) {
  for (let i = 1; i < points.length; i++) {
    const [t0, v0] = points[i - 1];
    const [t1, v1] = points[i];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  }
  return points[points.length - 1][1];
}

/** Valor -> puntaje 0..100 con dos umbrales (rojo / verde). */
function scoreFrom(v, red, green) {
  if (v >= green) return clamp(75 + ((v - green) / green) * 50, 75, 100);
  if (v >= red) return 45 + ((v - red) / (green - red)) * 30;
  return clamp((v / red) * 45, 5, 45);
}
const statusOf = (score) => (score >= 72 ? "good" : score >= 50 ? "warn" : "bad");

const SEV_ORDER = { alta: 0, media: 1, baja: 2 };

function analyzePost(post) {
  const m = post.metrics;
  const a = post.attrs;
  const copy = post.copy || NICHES[post.niche];
  const keyword = NICHES[post.niche]?.keyword || post.niche.toLowerCase();
  const interactions = m.likes + m.comments + m.saves + m.shares;
  const er = (interactions / m.reach) * 100;
  const saveRate = (m.saves / m.reach) * 100;
  const shareRate = (m.shares / m.reach) * 100;
  const followPerK = (m.follows / m.reach) * 1000;
  const frequency = m.impressions / m.reach;

  // --- Métricas específicas por formato
  let ret3 = null, avgWatch = null, drop = null, swipe = null, completion = null, worstSlide = null;
  if (post.type === "reel") {
    ret3 = Math.round(retAt(post.retention, 3));
    let sum = 0;
    for (let t = 0; t <= post.duration; t++) sum += retAt(post.retention, t);
    avgWatch = sum / (post.duration + 1);
    // Mayor caída después del gancho (en puntos por tramo)
    for (let i = 1; i < post.retention.length; i++) {
      const [t0, v0] = post.retention[i - 1];
      const [t1, v1] = post.retention[i];
      if (t0 < 3) continue;
      const d = v0 - v1;
      if (!drop || d > drop.pts) drop = { from: t0, to: t1, pts: d };
    }
  }
  if (post.type === "carousel") {
    const sr = post.slideRetention;
    swipe = sr[1];
    completion = sr[sr.length - 1];
    for (let i = 2; i < sr.length; i++) {
      const d = sr[i - 1] - sr[i];
      if (!worstSlide || d > worstSlide.pts) worstSlide = { slide: i + 1, pts: d };
    }
  }

  // --- Semáforo: 5 señales
  const signals = [];
  if (post.type === "reel") {
    signals.push({ key: "hook", label: "Gancho (3 s)", value: pct(ret3, 0), detail: "siguen mirando al segundo 3", score: scoreFrom(ret3, 45, 65), icon: Zap });
    signals.push({ key: "ret", label: "Retención", value: pct(avgWatch, 0), detail: "del video visto en promedio", score: scoreFrom(avgWatch, 35, 55), icon: Clock });
  } else if (post.type === "carousel") {
    signals.push({ key: "hook", label: "Portada", value: pct(swipe, 0), detail: "desliza a la diapositiva 2", score: scoreFrom(swipe, 40, 60), icon: Zap });
    signals.push({ key: "ret", label: "Lectura completa", value: pct(completion, 0), detail: "llega a la última diapositiva", score: scoreFrom(completion, 25, 45), icon: Clock });
  } else {
    const visual = { alta: 85, media: 58, baja: 22 }[a.coverContrast];
    signals.push({ key: "hook", label: "Impacto visual", value: { alta: "Alto", media: "Medio", baja: "Bajo" }[a.coverContrast], detail: "contraste y legibilidad", score: visual, icon: Zap });
    signals.push({ key: "ret", label: "Valor guardable", value: pct(saveRate), detail: "del alcance lo guardó", score: scoreFrom(saveRate, 0.8, 2), icon: Bookmark });
  }
  signals.push({ key: "reach", label: "Alcance nuevo", value: pct(m.nonFollowerPct, 0), detail: "no te seguía", score: scoreFrom(m.nonFollowerPct, 25, 45), icon: Users });
  signals.push({ key: "er", label: "Interacción", value: pct(er), detail: "engagement sobre alcance", score: scoreFrom(er, 3, 6), icon: Heart });
  signals.push({ key: "conv", label: "Conversión", value: dec(followPerK), detail: "seguidores nuevos cada 1.000", score: scoreFrom(followPerK, 1.5, 4), icon: UserPlus });
  signals.forEach((s) => (s.status = statusOf(s.score)));

  const weights = { hook: 0.25, ret: 0.2, reach: 0.2, er: 0.2, conv: 0.15 };
  const score = Math.round(signals.reduce((acc, s) => acc + s.score * weights[s.key], 0));
  const status = statusOf(score);

  // --- Diagnóstico: reglas
  const issues = [];
  const add = (o) => issues.push(o);

  if (post.type === "reel" && ret3 < 60) {
    add({
      id: "hook", sev: ret3 < 45 ? "alta" : "media", icon: Zap,
      title: "Gancho inicial débil en los primeros 3 segundos",
      why: `Solo el ${ret3}% sigue mirando en el segundo 3: ${100 - ret3} de cada 100 personas se fueron antes de saber de qué trataba.${a.hookText ? ` El video arranca con “${a.hookText}”, que no promete nada concreto.` : ""}`,
      fix: {
        title: "Reescribí el gancho con la fórmula Resultado + Tiempo + Objeción",
        steps: [
          "Mostrá el resultado final en el primer fotograma, antes de cualquier saludo o presentación.",
          "Decí el beneficio y el tiempo en menos de 10 palabras.",
          "Escribí el gancho también como texto en pantalla: una parte grande de la audiencia mira sin sonido.",
        ],
        example: copy.hookAlt,
      },
    });
  }
  if (post.type === "reel" && a.avgShot > 2.5) {
    add({
      id: "pace", sev: "media", icon: Scissors,
      title: "Ritmo de edición lento",
      why: `Cada plano dura ${dec(a.avgShot)} s en promedio.${drop ? ` La curva pierde ${Math.round(drop.pts)} puntos entre el segundo ${drop.from} y el ${drop.to}.` : ""}`,
      fix: {
        title: "Probá un formato de corte rápido cada 1,5 segundos",
        steps: [
          "Eliminá silencios, respiraciones y muletillas con jump cuts.",
          "Alterná plano general, plano detalle y texto en pantalla cada 1 a 1,5 s.",
          drop ? `Meté un cambio de patrón (zoom, sonido, cambio de ángulo) justo antes del segundo ${drop.from}, donde empieza la caída.` : "Agregá un cambio de patrón (zoom, sonido, ángulo) cada 4 o 5 segundos.",
        ],
      },
    });
  } else if (post.type === "reel" && drop && drop.pts >= 12) {
    add({
      id: "middrop", sev: "media", icon: TrendingUp,
      title: "Caída fuerte a mitad del video",
      why: `Entre el segundo ${drop.from} y el ${drop.to} se pierden ${Math.round(drop.pts)} puntos de audiencia: el desarrollo no cumple lo que prometió el gancho.`,
      fix: {
        title: "Abrí un bucle antes de la caída",
        steps: [
          `En el segundo ${Math.max(3, drop.from - 1)}, anticipá algo que llega al final: “y lo tercero es lo que más me sirvió”.`,
          "Recortá cualquier explicación que no sea necesaria para entender el resultado.",
          "Cerrá con el resultado visual para que el bucle valga la espera.",
        ],
      },
    });
  }
  if (post.type === "reel" && a.audio !== "tendencia") {
    add({
      id: "audio", sev: "media", icon: Music2,
      title: "Audio no en tendencia",
      why: "Usaste solo audio original. Los audios en alza ayudan a que Instagram muestre el Reel a quienes ya interactúan con ese sonido.",
      fix: {
        title: "Montá un audio en tendencia debajo de tu voz",
        steps: [
          "En la biblioteca de audios de Reels, buscá los marcados como “en tendencia” (flecha hacia arriba) y con pocos usos todavía.",
          "Ponelo al 10–15% del volumen, debajo de la voz original.",
          "Sincronizá los cortes con los golpes del audio.",
        ],
      },
    });
  }
  if (post.type === "reel" && !a.subtitles) {
    add({
      id: "subs", sev: "media", icon: Captions,
      title: "Sin subtítulos en pantalla",
      why: "Quien mira sin sonido no entiende el video y lo pasa.",
      fix: {
        title: "Subtitulá en bloques cortos",
        steps: [
          "Usá los subtítulos automáticos de Edits o CapCut y corregí los errores.",
          "Mostrá de 3 a 5 palabras por bloque, resaltando la palabra clave.",
          "Ubicalos en el tercio central para que no los tape la interfaz.",
        ],
      },
    });
  }
  if (post.type === "carousel" && swipe < 55) {
    add({
      id: "slide1", sev: swipe < 40 ? "alta" : "media", icon: GalleryHorizontalEnd,
      title: "La portada no invita a deslizar",
      why: `Solo el ${Math.round(swipe)}% pasa a la diapositiva 2.${a.hookOnSlide1 ? "" : " La primera diapositiva es un título genérico que no promete nada."}`,
      fix: {
        title: "Convertí la diapositiva 1 en una promesa con número o pregunta",
        steps: [
          "Un titular de 4 a 7 palabras con un número concreto o una pregunta que incomode.",
          "Agregá una señal de continuidad: una flecha o “deslizá →” en el borde derecho.",
          "Que la diapositiva 2 empiece a responder enseguida, sin introducción.",
        ],
        example: copy.coverAlt,
      },
    });
  }
  if (post.type === "carousel" && completion < 30) {
    add({
      id: "slidedrop", sev: "media", icon: GalleryHorizontalEnd,
      title: "Abandono antes del final",
      why: `Solo el ${Math.round(completion)}% llega a la última diapositiva (son ${post.slides}).${worstSlide ? ` La mayor caída ocurre al pasar a la diapositiva ${worstSlide.slide}.` : ""}`,
      fix: {
        title: "Recortá a 6 o 7 diapositivas y cerrá cada una con un puente",
        steps: [
          "Una idea por diapositiva, con máximo 25 palabras.",
          "Terminá cada diapositiva con una frase que obligue a pasar a la siguiente.",
          "Dejá el dato más valioso para la anteúltima y el CTA para la última.",
        ],
      },
    });
  }
  if (a.coverContrast === "baja") {
    add({
      id: "contrast", sev: post.type === "photo" ? "alta" : "media", icon: Contrast,
      title: "Poco contraste visual",
      why: "El texto de la portada se confunde con el fondo. En el feed y en la grilla del perfil no se lee.",
      fix: {
        title: "Cambiá la portada por una con texto disruptivo",
        steps: [
          "Máximo 5 palabras, en tipografía gruesa.",
          "Contraste alto: texto claro sobre fondo oscuro o al revés (mínimo 4.5:1).",
          "Ubicá el texto en el centro de la imagen para que se lea también en el recorte cuadrado de la grilla.",
        ],
        example: copy.coverAlt,
      },
    });
  }
  if (!a.hasCTA) {
    add({
      id: "cta", sev: "alta", icon: Megaphone,
      title: "Llamado a la acción inexistente",
      why: `La publicación no le pide nada a quien la ve. Resultado: ${pct(saveRate)} de guardados y ${dec(followPerK)} seguidores nuevos por cada mil cuentas.`,
      fix: {
        title: "Cerrá con un único llamado a la acción, específico",
        steps: [
          "Elegí una sola acción según el objetivo: guardar (valor), enviar (alcance) o comentar (comunidad).",
          "Decilo en voz y escribilo en pantalla en los últimos 2 segundos, y repetilo en la primera línea del texto.",
          "Dá una razón concreta para hacerlo ahora.",
        ],
        example: copy.ctaAlt,
      },
    });
  }
  if (saveRate < 1) {
    add({
      id: "saves", sev: "media", icon: Bookmark,
      title: "Poco valor para guardar",
      why: `Solo el ${pct(saveRate)} del alcance lo guardó. Sin algo que consultar después, la gente mira y sigue.`,
      fix: {
        title: "Agregá un resumen que valga la pena guardar",
        steps: [
          "Cerrá con una lista, checklist o paso a paso en una sola pantalla.",
          "Usá números concretos (cantidades, tiempos, precios).",
          "Mencioná el momento de uso: “para tu próximo día de compras”.",
        ],
      },
    });
  }
  if (shareRate < 0.5) {
    add({
      id: "shares", sev: "baja", icon: Send,
      title: "Contenido poco compartible",
      why: `Se compartió ${full(m.shares)} veces (${pct(shareRate, 2)} del alcance). Los envíos por mensaje directo son una de las señales que más empujan la distribución a no seguidores.`,
      fix: {
        title: "Hacelo enviable",
        steps: [
          "Nombrá a alguien concreto: “mandáselo a quien siempre…”.",
          "Tomá una postura clara o sumá un dato que sorprenda.",
          "Hacelo identificable: una situación que la audiencia vive seguido.",
        ],
      },
    });
  }
  if (m.nonFollowerPct < 30) {
    add({
      id: "discovery", sev: "media", icon: Users,
      title: "No llega a nuevas audiencias",
      why: `El ${100 - m.nonFollowerPct}% del alcance son tus propios seguidores. La publicación no sale de tu comunidad.`,
      fix: {
        title: "Optimizá para descubrimiento",
        steps: [
          `Escribí la palabra clave (“${keyword}”) en la primera línea del texto y en el texto en pantalla.`,
          a.hashtags > 10 ? `Bajá de ${a.hashtags} a 3–5 hashtags específicos del nicho.` : "Usá 3–5 hashtags específicos del nicho, no genéricos.",
          post.type === "reel" ? "Publicalo primero como Reel de prueba para no seguidores y compará el resultado." : "Reconvertí el contenido a Reel o carrusel: suelen llegar más lejos que una foto suelta.",
        ],
      },
    });
  }
  if (a.hashtags > 15) {
    add({
      id: "hashtags", sev: "baja", icon: Hash,
      title: "Exceso de hashtags genéricos",
      why: `Tiene ${a.hashtags} hashtags. Etiquetas como #fitness o #motivation tienen millones de publicaciones y no ayudan a clasificar el contenido.`,
      fix: {
        title: "Quedate con 3 a 5 hashtags de nicho",
        steps: ["Uno de tema amplio, dos específicos y uno propio de tu marca.", "Eliminá los genéricos en inglés si tu audiencia habla español."],
      },
    });
  }
  if (a.captionWords < 15) {
    add({
      id: "caption", sev: "baja", icon: Type,
      title: "Texto sin contexto ni palabras clave",
      why: `El texto tiene ${a.captionWords} palabras. Instagram usa el texto para entender de qué trata la publicación y mostrarla en búsquedas.`,
      fix: {
        title: "Escribí un texto de 3 partes",
        steps: [
          "Primera línea: repetí el gancho o hacé una pregunta.",
          `Cuerpo: 2 o 3 frases que incluyan “${keyword}” y palabras que la gente buscaría.`,
          "Cierre: el llamado a la acción.",
        ],
      },
    });
  }
  const goodHour = (post.hour >= 11 && post.hour <= 14) || (post.hour >= 18 && post.hour <= 22);
  if (!goodHour) {
    add({
      id: "hour", sev: "baja", icon: Clock,
      title: "Horario de publicación fuera de pico",
      why: `Se publicó a las ${String(post.hour).padStart(2, "0")}:00 h, fuera de las franjas de mayor actividad habituales.`,
      fix: {
        title: "Publicá cuando tu audiencia está conectada",
        steps: [
          "Revisá en Estadísticas › Audiencia las horas de mayor actividad de tus seguidores.",
          "Probá 12–13 h y 19–21 h durante dos semanas y compará el alcance de la primera hora.",
        ],
      },
    });
  }
  issues.sort((x, y) => SEV_ORDER[x.sev] - SEV_ORDER[y.sev]);

  // --- Lo que funcionó
  const strengths = [];
  if (post.type === "reel" && ret3 >= 65) strengths.push(`Gancho fuerte: el ${ret3}% sigue mirando en el segundo 3.`);
  if (post.type === "reel" && avgWatch >= 55) strengths.push(`Se ve el ${pct(avgWatch, 0)} del video en promedio: el desarrollo sostiene la promesa.`);
  if (post.type === "reel" && a.avgShot <= 2) strengths.push(`Edición dinámica: un plano cada ${dec(a.avgShot)} s.`);
  if (post.type === "reel" && a.audio === "tendencia") strengths.push("Audio en tendencia, que suma distribución.");
  if (post.type === "carousel" && swipe >= 65) strengths.push(`Portada efectiva: el ${Math.round(swipe)}% desliza a la segunda diapositiva.`);
  if (post.type === "carousel" && completion >= 45) strengths.push(`El ${Math.round(completion)}% lee hasta el final.`);
  if (saveRate >= 3) strengths.push(`Muy guardable: el ${pct(saveRate)} del alcance lo guardó.`);
  if (shareRate >= 1.5) strengths.push(`Muy compartible: ${full(m.shares)} envíos (${pct(shareRate)} del alcance).`);
  if (m.nonFollowerPct >= 50) strengths.push(`Llega a gente nueva: el ${m.nonFollowerPct}% del alcance no te seguía.`);
  if (followPerK >= 4) strengths.push(`Convierte: ${dec(followPerK)} seguidores nuevos por cada mil cuentas alcanzadas.`);
  if (a.coverContrast === "alta" && post.type !== "carousel") strengths.push("Portada legible y con contraste alto.");

  // --- Plan de acción
  const impactOf = { alta: "Alto", media: "Medio", baja: "Bajo" };
  let plan = issues.map((i) => ({ ...i.fix, impact: impactOf[i.sev], from: i.title, icon: i.icon }));
  if (!plan.length) {
    plan = [
      {
        title: "Convertí este post en una serie",
        steps: ["Publicá 2 variaciones con el mismo formato y otro tema dentro del nicho en las próximas 2 semanas.", "Mantené el mismo tipo de gancho y la misma estructura de cierre."],
        impact: "Alto", from: "Formato ganador", icon: Sparkles,
      },
      {
        title: "Reutilizalo en otro formato",
        steps: [post.type === "reel" ? "Pasá los puntos clave a un carrusel de 6 diapositivas." : "Grabá un Reel de 20 segundos con los 3 puntos principales."],
        impact: "Medio", from: "Reutilización", icon: Sparkles,
      },
    ];
  }

  return {
    score, status, signals, issues, strengths, plan,
    er, saveRate, shareRate, followPerK, frequency, interactions,
    ret3, avgWatch, drop, swipe, completion, worstSlide,
  };
}

/* ============================================================
 * 4. Componentes visuales
 * ============================================================ */
const STATUS = {
  good: { label: "Funciona", long: "Funciona excelente", text: "text-good", dot: "bg-good", soft: "bg-good/12", border: "border-good/40", stroke: "rgb(var(--good))" },
  warn: { label: "Medio", long: "Rendimiento medio", text: "text-warn", dot: "bg-warn", soft: "bg-warn/12", border: "border-warn/40", stroke: "rgb(var(--warn))" },
  bad: { label: "No funciona", long: "No funciona", text: "text-bad", dot: "bg-bad", soft: "bg-bad/12", border: "border-bad/40", stroke: "rgb(var(--bad))" },
};
const SEV_STYLE = {
  alta: "bg-bad/12 text-bad",
  media: "bg-warn/12 text-warn",
  baja: "bg-fg/5 text-muted",
};

function StatusPill({ status, long = false, className = "" }) {
  const s = STATUS[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.soft, s.text, className)}>
      <span className={cx("h-2 w-2 rounded-full", s.dot)} />
      {long ? s.long : s.label}
    </span>
  );
}

function ScoreRing({ score, status, size = 64, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={STATUS[status].stroke} strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display font-bold tabular-nums" style={{ fontSize: size * 0.3 }}>{score}</span>
      </div>
    </div>
  );
}

/** Portada simulada de la publicación. La de bajo contraste se ve mal a propósito. */
function Cover({ post, analysis, showMeta = true, className = "" }) {
  const [c1, c2] = post.cover.palette;
  const NicheIcon = NICHES[post.niche]?.icon || Sparkles;
  const TypeIcon = TYPE_META[post.type].icon;
  return (
    <div
      className={cx("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, ${c1}, ${c2})`, containerType: "inline-size" }}
    >
      <NicheIcon className="absolute -bottom-[8%] -right-[8%] h-[62%] w-[62%] opacity-[0.13]" style={{ color: post.cover.ink }} strokeWidth={1.25} />
      <div className="absolute inset-0 flex flex-col justify-center p-[9%]" style={{ color: post.cover.ink }}>
        <span className="font-mono uppercase tracking-[0.14em] opacity-80" style={{ fontSize: "5.2cqw" }}>{post.cover.kicker}</span>
        <span className="mt-[3%] font-display font-extrabold leading-[0.95] [text-wrap:balance]" style={{ fontSize: "12cqw" }}>
          {post.cover.headline}
        </span>
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
          <span className="absolute right-[5%] top-[5%] text-white drop-shadow">
            <TypeIcon style={{ width: "9cqw", height: "9cqw" }} />
          </span>
          {post.type === "reel" && (
            <span className="absolute bottom-[5%] left-[6%] flex items-center gap-[1.5cqw] font-semibold text-white drop-shadow" style={{ fontSize: "6cqw" }}>
              <Play style={{ width: "6cqw", height: "6cqw" }} fill="currentColor" /> {fmt(post.metrics.impressions)}
            </span>
          )}
          {analysis && (
            <span className={cx("absolute left-[5%] top-[5%] rounded-full ring-2 ring-white/80", STATUS[analysis.status].dot)} style={{ width: "5cqw", height: "5cqw" }} />
          )}
        </>
      )}
    </div>
  );
}

function Card({ className = "", children, ...rest }) {
  return (
    <section className={cx("rounded-2xl border border-line bg-surface", className)} {...rest}>
      {children}
    </section>
  );
}
function SectionTitle({ icon: Icon, children, aside }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight">
        {Icon && <Icon className="h-4 w-4 text-accent" />} {children}
      </h3>
      {aside}
    </div>
  );
}

/** Curva de retención de un Reel. */
function RetentionChart({ post, analysis }) {
  const W = 640, H = 230, pl = 40, pr = 16, pt = 22, pb = 30;
  const d = post.duration;
  const x = (t) => pl + (t / d) * (W - pl - pr);
  const y = (v) => pt + (1 - v / 100) * (H - pt - pb);
  const samples = [];
  for (let t = 0; t <= d; t += 0.5) samples.push([t, retAt(post.retention, t)]);
  const line = samples.map(([t, v], i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(d)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 3, ...[0.25, 0.5, 0.75].map((f) => Math.round(d * f)).filter((t) => t > 5), d];
  const { drop, ret3 } = analysis;
  const status3 = ret3 >= 65 ? "good" : ret3 >= 45 ? "warn" : "bad";
  const dropMid = drop ? (drop.from + drop.to) / 2 : null;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[480px] w-full" role="img" aria-label="Curva de retención de audiencia">
        <defs>
          <linearGradient id={`ret-${post.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" style={{ stopColor: "rgb(var(--accent))", stopOpacity: 0.32 }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--accent))", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} className="stroke-line" strokeDasharray={v ? "3 4" : ""} />
            <text x={pl - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">{v}%</text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">{t}s</text>
        ))}
        {drop && drop.pts >= 6 && (
          <rect x={x(drop.from)} y={pt} width={x(drop.to) - x(drop.from)} height={H - pt - pb} className="fill-bad/10" />
        )}
        <path d={area} fill={`url(#ret-${post.id})`} />
        <path d={line} fill="none" strokeWidth="2.5" className="stroke-accent" strokeLinejoin="round" />
        <line x1={x(3)} x2={x(3)} y1={pt} y2={H - pb} strokeDasharray="4 4" className="stroke-fg/40" />
        <circle cx={x(3)} cy={y(ret3)} r="5" fill={STATUS[status3].stroke} className="stroke-surface" strokeWidth="2" />
        <text x={x(3) + 9} y={pt + 2} className="fill-fg text-[12px] font-semibold">Segundo 3 · {ret3}%</text>
        {drop && drop.pts >= 6 && (
          <text
            x={x(dropMid)} y={Math.min(H - pb - 8, y(retAt(post.retention, dropMid)) + 22)}
            textAnchor={x(dropMid) > W * 0.7 ? "end" : "middle"} className="fill-bad text-[11px] font-semibold"
          >
            Mayor caída: −{Math.round(drop.pts)} pts
          </text>
        )}
        <circle cx={x(d)} cy={y(retAt(post.retention, d))} r="4" className="fill-accent" />
      </svg>
    </div>
  );
}

/** Retención por diapositiva de un carrusel. */
function SlideChart({ post, analysis }) {
  const sr = post.slideRetention;
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2">
        {sr.map((v, i) => {
          const isWorst = analysis.worstSlide && analysis.worstSlide.slide === i + 1;
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[11px] tabular-nums text-muted">{v}%</span>
              <div
                className={cx("w-full rounded-t-md transition-all", isWorst ? "bg-bad/70" : i === 0 ? "bg-fg/20" : "bg-accent/80")}
                style={{ height: `${v}%` }}
                title={`Diapositiva ${i + 1}: ${v}%`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {sr.map((_, i) => (
          <span key={i} className="flex-1 text-center font-mono text-[11px] text-muted">D{i + 1}</span>
        ))}
      </div>
      {analysis.worstSlide && (
        <p className="mt-3 text-xs text-muted">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-bad/70" />
          Mayor abandono al pasar a la diapositiva {analysis.worstSlide.slide} (−{analysis.worstSlide.pts} pts).
        </p>
      )}
    </div>
  );
}

function ReachChart({ post, analysis }) {
  const m = post.metrics;
  const nonF = Math.round((m.reach * m.nonFollowerPct) / 100);
  const fol = m.reach - nonF;
  const max = m.impressions;
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium">Impresiones</span>
          <span className="font-mono tabular-nums">{full(m.impressions)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-fg/35" style={{ width: "100%" }} />
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium">Alcance (cuentas únicas)</span>
          <span className="font-mono tabular-nums">{full(m.reach)}</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-surface2">
          <div className="h-full bg-accent2" style={{ width: `${(fol / max) * 100}%` }} title="Seguidores" />
          <div className="h-full bg-accent" style={{ width: `${(nonF / max) * 100}%` }} title="No seguidores" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent2" />Seguidores {full(fol)}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />No seguidores {full(nonF)} ({m.nonFollowerPct}%)</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface2 p-3">
          <div className="font-mono text-lg font-semibold tabular-nums">{dec(analysis.frequency, 2)}</div>
          <div className="text-xs text-muted">impresiones por cuenta</div>
        </div>
        <div className="rounded-xl bg-surface2 p-3">
          <div className="font-mono text-lg font-semibold tabular-nums">{full(m.profileVisits)}</div>
          <div className="text-xs text-muted">visitas al perfil</div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        {analysis.frequency >= 1.3
          ? "La gente lo vuelve a ver o lo encuentra más de una vez: buena señal de relevancia."
          : "Casi nadie lo vio dos veces: la publicación se consume una vez y se olvida."}
      </p>
    </div>
  );
}

function InteractionsChart({ post }) {
  const m = post.metrics;
  const rows = [
    { label: "Me gusta", value: m.likes, icon: Heart },
    { label: "Guardados", value: m.saves, icon: Bookmark, weight: true },
    { label: "Compartidos", value: m.shares, icon: Send, weight: true },
    { label: "Comentarios", value: m.comments, icon: MessageCircle },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3.5">
      {rows.map(({ label, value, icon: Icon, weight }) => (
        <div key={label} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted" />
            {label}
            {weight && <span className="sr-only">(señal fuerte)</span>}
          </span>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface2">
            <div className={cx("h-full rounded-full", weight ? "ig-grad" : "bg-fg/40")} style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <span className="w-24 text-right font-mono tabular-nums">
            {full(value)} <span className="text-[11px] text-muted">{pct((value / m.reach) * 100)}</span>
          </span>
        </div>
      ))}
      <p className="pt-1 text-xs leading-relaxed text-muted">
        Los guardados y compartidos (barras en color) pesan más que los me gusta: indican que el contenido tiene valor o se recomienda.
        Porcentajes calculados sobre el alcance.
      </p>
    </div>
  );
}

/** Semáforo físico: tres luces, solo una encendida. */
function Lights({ status, size = "sm" }) {
  const s = size === "lg" ? "h-5 w-5" : "h-3 w-3";
  const order = ["bad", "warn", "good"];
  return (
    <div className={cx("flex flex-col items-center gap-1 rounded-full bg-fg/[0.07] p-1.5", size === "lg" && "gap-1.5 p-2")} aria-label={STATUS[status].long}>
      {order.map((k) => (
        <span key={k} className={cx("rounded-full transition", s, k === status ? cx(STATUS[k].dot, "glow") : "bg-fg/10")} style={k === status ? { "--glow": STATUS[k].stroke } : undefined} />
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
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Veredicto</div>
          <div className={cx("font-display text-lg font-bold leading-tight", STATUS[analysis.status].text)}>{STATUS[analysis.status].long}</div>
          <div className="font-mono text-xs text-muted">Puntaje {analysis.score}/100</div>
        </div>
      </div>
      {analysis.signals.map((s) => (
        <div key={s.key} className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
          <Lights status={s.status} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </div>
            <div className={cx("font-mono text-lg font-semibold tabular-nums", STATUS[s.status].text)}>{s.value}</div>
            <div className="text-[11px] leading-snug text-muted">{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * 5. Vistas
 * ============================================================ */
function Kpi({ label, value, sub, icon: Icon, children }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface2"><Icon className="h-4 w-4 text-fg" /></span>
      </div>
      <div className="font-display text-[34px] font-bold leading-none tracking-tight tabular-nums">{value}</div>
      <div className="text-xs leading-relaxed text-muted">{sub}</div>
      {children}
    </Card>
  );
}

function Sparkline({ values }) {
  if (values.length < 2) return null;
  const W = 220, H = 40;
  const max = Math.max(...values), min = Math.min(...values);
  const x = (i) => (i / (values.length - 1)) * (W - 8) + 4;
  const y = (v) => H - 6 - ((v - min) / (max - min || 1)) * (H - 12);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full" aria-hidden="true">
      <path d={`${d} L${x(values.length - 1)},${H} L${x(0)},${H} Z`} className="fill-accent/10" />
      <path d={d} fill="none" strokeWidth="2" className="stroke-accent" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="3.5" className="fill-accent" />
    </svg>
  );
}

function PostRow({ post, analysis, onOpen, metric }) {
  return (
    <button onClick={() => onOpen(post.id)} className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface2">
      <Cover post={post} showMeta={false} className="aspect-[4/5] w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{post.title}</div>
        <div className="text-xs text-muted">{TYPE_META[post.type].label} · {post.niche} · {metric}</div>
      </div>
      <StatusPill status={analysis.status} />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </button>
  );
}

function DashboardView({ posts, analyses, onOpen, goContent }) {
  const stats = useMemo(() => {
    const reach = posts.reduce((a, p) => a + p.metrics.reach, 0);
    const inter = posts.reduce((a, p) => a + analyses[p.id].interactions, 0);
    const follows = posts.reduce((a, p) => a + p.metrics.follows, 0);
    const nonF = posts.reduce((a, p) => a + (p.metrics.reach * p.metrics.nonFollowerPct) / 100, 0);
    const dates = posts.map((p) => new Date(`${p.date}T12:00:00`).getTime());
    const days = Math.max(7, Math.round((Math.max(...dates) - Math.min(...dates)) / 86400000) + 1);
    const perMonth = (follows / days) * 30;
    const byType = Object.keys(TYPE_META).map((t) => {
      const list = posts.filter((p) => p.type === t);
      const avg = list.length ? list.reduce((a, p) => a + analyses[p.id].score, 0) / list.length : 0;
      const er = list.length ? list.reduce((a, p) => a + analyses[p.id].er, 0) / list.length : 0;
      return { type: t, count: list.length, avg, er };
    });
    const counts = { good: 0, warn: 0, bad: 0 };
    posts.forEach((p) => counts[analyses[p.id].status]++);
    const issueMap = {};
    posts.forEach((p) =>
      analyses[p.id].issues.forEach((i) => {
        issueMap[i.id] = issueMap[i.id] || { ...i, count: 0, posts: [] };
        issueMap[i.id].count++;
        issueMap[i.id].posts.push(p.id);
      })
    );
    const recurring = Object.values(issueMap).sort((a, b) => b.count - a.count || SEV_ORDER[a.sev] - SEV_ORDER[b.sev]).slice(0, 5);
    const chrono = [...posts].sort((a, b) => a.date.localeCompare(b.date));
    const ranked = [...posts].sort((a, b) => analyses[b.id].score - analyses[a.id].score);
    return { reach, inter, er: (inter / reach) * 100, follows, nonFPct: (nonF / reach) * 100, perMonth, byType, counts, recurring, chrono, ranked };
  }, [posts, analyses]);

  const growthPct = (stats.perMonth / ACCOUNT.followers) * 100;
  const chartPosts = stats.chrono.slice(-14);
  const maxEr = Math.max(...chartPosts.map((p) => analyses[p.id].er), 1);
  const top = stats.ranked.slice(0, 3);
  const bottom = stats.ranked.slice(-3).reverse();
  const bestType = [...stats.byType].filter((t) => t.count).sort((a, b) => b.avg - a.avg)[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{ACCOUNT.handle} · {full(ACCOUNT.followers)} seguidores</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">Resumen de rendimiento</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            {stats.counts.good} de {posts.length} publicaciones funcionan bien. Los {TYPE_META[bestType.type].plural.toLowerCase()} son tu mejor formato
            (puntaje medio {Math.round(bestType.avg)}).
          </p>
        </div>
        <button onClick={goContent} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface2">
          Ver publicaciones <ArrowUpRight className="h-4 w-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Engagement rate total" value={pct(stats.er)} icon={Heart} sub={`${full(stats.inter)} interacciones sobre ${full(stats.reach)} cuentas alcanzadas.`}>
          <Sparkline values={stats.chrono.map((p) => analyses[p.id].er)} />
        </Kpi>
        <Kpi label="Crecimiento estimado" value={`+${pct(growthPct)}`} icon={TrendingUp} sub={`al mes, al ritmo actual. ${full(stats.follows)} seguidores nuevos atribuidos a estas publicaciones.`} />
        <Kpi label="Posts analizados" value={posts.length} icon={LayoutGrid} sub={stats.byType.map((t) => `${t.count} ${t.count === 1 ? TYPE_META[t.type].label.toLowerCase() : TYPE_META[t.type].plural.toLowerCase()}`).join(" · ")}>
          <div className="flex h-2 overflow-hidden rounded-full">
            {["good", "warn", "bad"].map((k) => (
              <div key={k} className={STATUS[k].dot} style={{ width: `${(stats.counts[k] / posts.length) * 100}%` }} />
            ))}
          </div>
        </Kpi>
        <Kpi label="Alcance a no seguidores" value={pct(stats.nonFPct, 0)} icon={Users} sub={`De ${fmt(stats.reach)} cuentas alcanzadas en total. Arriba del 45%, la mayoría llega por recomendación.`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle icon={Target} aside={<span className="text-xs text-muted">Tocá una barra para analizarla</span>}>Engagement por publicación</SectionTitle>
          <div className="flex h-52 items-end gap-2">
            {chartPosts.map((p) => {
              const a = analyses[p.id];
              return (
                <button key={p.id} onClick={() => onOpen(p.id)} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${p.title}: ${pct(a.er)}`}>
                  <span className="font-mono text-[11px] tabular-nums text-muted opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:opacity-100">{dec(a.er)}</span>
                  <div className={cx("w-full max-w-[44px] rounded-t-lg transition group-hover:opacity-80", STATUS[a.status].dot)} style={{ height: `${(a.er / maxEr) * 82}%` }} />
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2 border-t border-line pt-2">
            {chartPosts.map((p) => {
              const Icon = TYPE_META[p.type].icon;
              return (
                <div key={p.id} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-muted">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden font-mono text-[10px] sm:block">{dateFmt(p.date)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={LayoutGrid}>Rendimiento por formato</SectionTitle>
          <div className="space-y-4">
            {stats.byType.map((t) => {
              const Icon = TYPE_META[t.type].icon;
              const st = t.count ? statusOf(t.avg) : null;
              return (
                <div key={t.type}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-muted" />{TYPE_META[t.type].plural}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">{t.count ? `${Math.round(t.avg)} pts · ER ${pct(t.er)}` : "sin datos"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface2">
                    {st && <div className={cx("h-full rounded-full", STATUS[st].dot)} style={{ width: `${t.avg}%` }} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            {["good", "warn", "bad"].map((k) => (
              <div key={k}>
                <div className={cx("font-display text-2xl font-bold tabular-nums", STATUS[k].text)}>{stats.counts[k]}</div>
                <div className="text-[11px] text-muted">{STATUS[k].label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle icon={CircleCheck}>Lo que funciona</SectionTitle>
          <div className="-mx-2 space-y-1">
            {top.map((p) => <PostRow key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} metric={`${analyses[p.id].score} pts`} />)}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle icon={CircleX}>Lo que no funciona</SectionTitle>
          <div className="-mx-2 space-y-1">
            {bottom.map((p) => <PostRow key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} metric={`${analyses[p.id].score} pts`} />)}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle icon={TriangleAlert} aside={<span className="text-xs text-muted">en {posts.length} publicaciones</span>}>Errores que más se repiten</SectionTitle>
        <ul className="divide-y divide-line">
          {stats.recurring.map((i) => (
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
    <button
      onClick={() => onOpen(post.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-fg/5 focus-visible:-translate-y-0.5"
    >
      <div className="relative">
        <Cover post={post} analysis={analysis} className="aspect-[4/5] w-full" />
        <div className="absolute inset-0 flex items-center justify-center gap-5 bg-black/55 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1.5"><Heart className="h-5 w-5" fill="currentColor" />{fmt(post.metrics.likes)}</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="h-5 w-5" fill="currentColor" />{fmt(post.metrics.comments)}</span>
          <span className="flex items-center gap-1.5"><Bookmark className="h-5 w-5" fill="currentColor" />{fmt(post.metrics.saves)}</span>
        </div>
        {post.imported && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Importado</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          <span className="truncate">{post.niche} · {dateFmt(post.date)}</span>
          <span className="font-mono normal-case tracking-normal">ER {pct(analysis.er)}</span>
        </div>
        <div className="line-clamp-2 text-sm font-semibold leading-snug">{post.title}</div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <StatusPill status={analysis.status} />
          <span className="font-mono text-xs tabular-nums text-muted">{analysis.score}/100</span>
        </div>
      </div>
    </button>
  );
}

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "reel", label: "Reels" },
  { key: "carousel", label: "Carruseles" },
  { key: "photo", label: "Fotos" },
];

function ContentView({ posts, analyses, onOpen, onImport }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter(
      (p) =>
        (filter === "all" || p.type === filter) &&
        (!q || `${p.title} ${p.caption} ${p.niche}`.toLowerCase().includes(q))
    );
    const sorters = {
      recent: (a, b) => b.date.localeCompare(a.date),
      best: (a, b) => analyses[b.id].score - analyses[a.id].score,
      worst: (a, b) => analyses[a.id].score - analyses[b.id].score,
    };
    return list.sort(sorters[sort]);
  }, [posts, analyses, query, filter, sort]);

  const counts = useMemo(() => {
    const c = { all: posts.length };
    posts.forEach((p) => (c[p.type] = (c[p.type] || 0) + 1));
    return c;
  }, [posts]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Tus publicaciones</h1>
          <p className="mt-1 text-sm text-muted">Tocá cualquier publicación para ver su análisis profundo.</p>
        </div>
        <button onClick={onImport} className="ig-grad inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
          <Link2 className="h-4 w-4" /> Importar y analizar enlace
        </button>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1" htmlFor="search-posts">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="search-posts" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, texto o nicho…"
            className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-muted focus:border-accent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface2" aria-label="Limpiar búsqueda">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1" role="tablist" aria-label="Filtrar por tipo">
            {FILTERS.map((f) => (
              <button
                key={f.key} role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}
                className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium transition", filter === f.key ? "bg-fg text-bg" : "text-muted hover:text-fg")}
              >
                {f.label} <span className="ml-0.5 font-mono text-[11px] opacity-70">{counts[f.key] || 0}</span>
              </button>
            ))}
          </div>
          <select
            id="sort-posts" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar"
            className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium outline-none focus:border-accent"
          >
            <option value="recent">Más recientes</option>
            <option value="best">Mejor puntaje</option>
            <option value="worst">Peor puntaje</option>
          </select>
        </div>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => <PostCard key={p.id} post={p} analysis={analyses[p.id]} onOpen={onOpen} />)}
        </div>
      ) : (
        <Card className="grid place-items-center gap-2 px-6 py-16 text-center">
          <Search className="h-6 w-6 text-muted" />
          <p className="font-semibold">Ninguna publicación coincide con “{query}”.</p>
          <p className="text-sm text-muted">Probá con otra palabra o cambiá el filtro de tipo.</p>
        </Card>
      )}
    </div>
  );
}

function AnalysisPanel({ post, analysis, onClose }) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);
  useEffect(() => {
    panelRef.current?.focus();
  }, [post.id]);

  const copyPlan = () => {
    const text = [
      `Plan de acción — ${post.title}`,
      ...analysis.plan.map((p, i) => `${i + 1}. ${p.title} (impacto ${p.impact.toLowerCase()})\n${p.steps.map((s) => `   - ${s}`).join("\n")}${p.example ? `\n   Ejemplo: "${p.example}"` : ""}`),
    ].join("\n\n");
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    try {
      navigator.clipboard.writeText(text).then(done, () => {});
    } catch (e) {
      /* el portapapeles puede no estar disponible */
    }
  };

  const TypeIcon = TYPE_META[post.type].icon;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
      <div className="anim-fade absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="anim-slide relative h-full w-full max-w-[920px] overflow-y-auto bg-bg outline-none">
        <div className="panel-head sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
          <div className="gutter flex items-center gap-4 py-3">
            <Cover post={post} showMeta={false} className="aspect-[4/5] w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <TypeIcon className="h-3.5 w-3.5" /> {TYPE_META[post.type].label} · {post.niche} · {dateFmt(post.date)}
                {post.type === "reel" && ` · ${post.duration} s`}
                {post.type === "carousel" && ` · ${post.slides} diapositivas`}
              </div>
              <h2 id="analysis-title" className="truncate font-display text-lg font-bold">{post.title}</h2>
            </div>
            <ScoreRing score={analysis.score} status={analysis.status} size={52} stroke={5} />
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-surface2" aria-label="Cerrar análisis">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="gutter space-y-8 pb-16 pt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
            <Cover post={post} analysis={analysis} className="mx-auto aspect-[4/5] w-full max-w-[260px] rounded-2xl md:max-w-none" />
            <div className="min-w-0 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Análisis profundo</p>
                <p className="mt-2 text-[15px] leading-relaxed">
                  {analysis.status === "good" && "Esta publicación funciona. Lo importante es entender por qué para repetirlo."}
                  {analysis.status === "warn" && `Rinde a medias: tiene ${analysis.strengths.length ? "aciertos claros" : "potencial"}, pero ${analysis.issues.length} ${analysis.issues.length === 1 ? "problema frena" : "problemas frenan"} su distribución.`}
                  {analysis.status === "bad" && `No está funcionando. Detectamos ${analysis.issues.length} ${analysis.issues.length === 1 ? "causa" : "causas"}; empezá por las de impacto alto.`}
                </p>
              </div>
              <p className="rounded-xl bg-surface2 p-3 text-sm italic leading-relaxed text-muted">“{post.caption}”</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { l: "Alcance", v: fmt(post.metrics.reach), i: Eye },
                  { l: "Interacciones", v: fmt(analysis.interactions), i: Heart },
                  { l: "Guardados", v: fmt(post.metrics.saves), i: Bookmark },
                  { l: "Seguidores", v: `+${full(post.metrics.follows)}`, i: UserPlus },
                ].map(({ l, v, i: Icon }) => (
                  <div key={l} className="rounded-xl border border-line p-3">
                    <Icon className="h-4 w-4 text-muted" />
                    <div className="mt-1.5 font-mono text-lg font-semibold tabular-nums">{v}</div>
                    <div className="text-[11px] text-muted">{l}</div>
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
                  <span className="font-mono text-xs text-muted">promedio visto {pct(analysis.avgWatch, 0)} · {dec((analysis.avgWatch / 100) * post.duration)} s de {post.duration} s</span>
                </div>
                <RetentionChart post={post} analysis={analysis} />
              </Card>
            )}
            {post.type === "carousel" && (
              <Card className="p-5">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">Retención por diapositiva</h4>
                  <span className="font-mono text-xs text-muted">% de cuentas que llega a cada una</span>
                </div>
                <SlideChart post={post} analysis={analysis} />
              </Card>
            )}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h4 className="mb-4 text-sm font-semibold">Alcance vs. impresiones</h4>
                <ReachChart post={post} analysis={analysis} />
              </Card>
              <Card className="p-5">
                <h4 className="mb-4 text-sm font-semibold">Interacciones</h4>
                <InteractionsChart post={post} />
              </Card>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <SectionTitle icon={TriangleAlert} aside={<span className="text-xs text-muted">{analysis.issues.length} detectados</span>}>Por qué no funcionó</SectionTitle>
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
                <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">No encontramos fallas relevantes en esta publicación.</p>
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
                <p className="rounded-xl bg-surface2 p-3 text-sm text-muted">Ninguna métrica supera la referencia. Usá el plan de acción para la próxima versión.</p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle
              icon={Lightbulb}
              aside={
                <button onClick={copyPlan} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:bg-surface2">
                  {copied ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar plan"}
                </button>
              }
            >
              Plan de acción: cómo mejorarlo
            </SectionTitle>
            <p className="mb-4 text-sm text-muted">Ordenado por prioridad. Aplicá los pasos de impacto alto en la próxima versión antes de tocar el resto.</p>
            <ol className="space-y-3">
              {analysis.plan.map((p, idx) => (
                <li key={p.title} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-start gap-4">
                    <span className="ig-grad grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white">{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold leading-snug">{p.title}</h4>
                        <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", p.impact === "Alto" ? "bg-accent/12 text-accent" : "bg-fg/5 text-muted")}>
                          Impacto {p.impact.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">Corrige: {p.from}</p>
                      <ul className="mt-3 space-y-1.5">
                        {p.steps.map((s) => (
                          <li key={s} className="flex gap-2 text-sm leading-relaxed">
                            <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" /> {s}
                          </li>
                        ))}
                      </ul>
                      {p.example && (
                        <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-accent/[0.06] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-accent">Ejemplo listo para usar</div>
                          <p className="mt-1 font-display text-[15px] font-semibold leading-snug">“{p.example}”</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

const IMPORT_STEPS = [
  "Leyendo el enlace",
  "Descargando métricas de la publicación",
  "Calculando retención y alcance",
  "Detectando errores y armando el plan",
];
const SAMPLE_LINKS = [
  "https://www.instagram.com/reel/C9mKq2LxT4p/",
  "https://www.instagram.com/p/C7vRtA1sP9e/",
  "https://www.instagram.com/reel/DA3fGh7JkLm/",
];

function ImportModal({ onClose, onDone, existing }) {
  const [url, setUrl] = useState("");
  const [niche, setNiche] = useState("auto");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const inputRef = useRef(null);
  const pending = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && progress === null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress, onClose]);

  useEffect(() => {
    if (progress === null) return;
    if (progress >= 100) {
      const t = setTimeout(() => onDone(pending.current), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress((p) => Math.min(100, p + 1.5 + Math.random() * 3.5)), 55);
    return () => clearTimeout(t);
  }, [progress, onDone]);

  const submit = (e) => {
    e.preventDefault();
    const value = url.trim();
    if (!URL_RE.test(value)) {
      setError("Ese enlace no es de una publicación de Instagram. Pegá uno con este formato: instagram.com/reel/C9mKq2LxT4p/ o instagram.com/p/…");
      return;
    }
    const post = generatePost(value, niche);
    if (existing.some((p) => p.id === post.id)) {
      onDone(post, true);
      return;
    }
    pending.current = post;
    setError("");
    setProgress(0);
  };

  const loading = progress !== null;
  const stepIdx = loading ? Math.min(IMPORT_STEPS.length - 1, Math.floor(progress / (100 / IMPORT_STEPS.length))) : -1;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="anim-fade absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={loading ? undefined : onClose} />
      <form onSubmit={submit} className="anim-pop relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <span className="ig-grad mb-3 grid h-10 w-10 place-items-center rounded-xl text-white"><Link2 className="h-5 w-5" /></span>
            <h2 id="import-title" className="font-display text-xl font-bold">Analizar nueva publicación</h2>
            <p className="mt-1 text-sm text-muted">Pegá el enlace de un Reel, carrusel o foto.</p>
          </div>
          {!loading && (
            <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface2" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!loading ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="import-url" className="mb-1.5 block text-xs font-semibold text-muted">Enlace de Instagram</label>
              <input
                id="import-url" ref={inputRef} value={url} onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="https://www.instagram.com/reel/…" autoComplete="off" spellCheck="false"
                aria-invalid={!!error} aria-describedby={error ? "import-error" : undefined}
                className={cx("w-full rounded-xl border bg-bg px-3.5 py-2.5 font-mono text-sm outline-none transition placeholder:text-muted focus:border-accent", error ? "border-bad" : "border-line")}
              />
              {error && <p id="import-error" className="mt-1.5 text-xs leading-relaxed text-bad">{error}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                Probar con:
                {SAMPLE_LINKS.map((l) => (
                  <button key={l} type="button" onClick={() => { setUrl(l); setError(""); }} className="rounded-full bg-surface2 px-2 py-0.5 font-mono text-[11px] hover:text-fg">
                    {l.includes("/reel/") ? "reel" : "post"} {l.split("/").filter(Boolean).pop().slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="import-niche" className="mb-1.5 block text-xs font-semibold text-muted">Nicho</label>
              <select id="import-niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent">
                <option value="auto">Detectar automáticamente</option>
                {Object.keys(NICHES).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <p className="rounded-xl bg-surface2 p-3 text-xs leading-relaxed text-muted">
              Simulación: la app no se conecta a Instagram. Las métricas se generan a partir del enlace (el mismo enlace da siempre el mismo resultado) para que puedas probar el análisis.
            </p>
            <button type="submit" className="ig-grad flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110">
              <Sparkles className="h-4 w-4" /> Importar y analizar
            </button>
          </div>
        ) : (
          <div className="space-y-5" aria-live="polite">
            <div>
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="font-semibold">{progress >= 100 ? "Análisis listo" : "Analizando…"}</span>
                <span className="font-mono tabular-nums text-muted">{Math.floor(progress)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={Math.floor(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="ig-grad h-full rounded-full transition-[width] duration-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <ul className="space-y-2.5">
              {IMPORT_STEPS.map((s, i) => {
                const done = i < stepIdx || progress >= 100;
                const active = i === stepIdx && progress < 100;
                return (
                  <li key={s} className={cx("flex items-center gap-2.5 text-sm", !done && !active && "text-muted")}>
                    {done ? <CircleCheck className="h-4 w-4 text-good" /> : active ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="mx-1 h-2 w-2 rounded-full bg-line" />}
                    {s}
                  </li>
                );
              })}
            </ul>
            <p className="truncate font-mono text-xs text-muted">{url}</p>
          </div>
        )}
      </form>
    </div>
  );
}

/* ============================================================
 * 6. App
 * ============================================================ */
const STORAGE_KEY = "reelscope.imported.v1";
function loadImported() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveImported(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    /* almacenamiento no disponible: se pierde al recargar */
  }
}

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

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="ig-grad grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white">
        <TrendingUp className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight max-xl:hidden">Reelscope</span>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { key: "content", label: "Contenido", icon: LayoutGrid },
];

export default function App() {
  const [imported, setImported] = useState(loadImported);
  const posts = useMemo(() => [...imported, ...SEED_POSTS], [imported]);
  const analyses = useMemo(() => Object.fromEntries(posts.map((p) => [p.id, analyzePost(p)])), [posts]);
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, toggleTheme] = useTheme();

  const selected = selectedId ? posts.find((p) => p.id === selectedId) : null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (importOpen) return; // el modal de importación maneja su propio cierre
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [importOpen]);

  useEffect(() => {
    document.body.style.overflow = selected || importOpen ? "hidden" : "";
  }, [selected, importOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleImported = useCallback((post, duplicate) => {
    setImportOpen(false);
    if (!duplicate) {
      setImported((prev) => {
        const next = [post, ...prev];
        saveImported(next);
        return next;
      });
      setToast(`“${post.title}” se agregó al catálogo.`);
    } else {
      setToast("Ese enlace ya estaba analizado. Abrimos su análisis.");
    }
    setView("content");
    setSelectedId(post.id);
  }, []);

  return (
    <div className="min-h-full bg-bg font-body text-fg antialiased">
      {/* Barra lateral (tablet y escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-bg px-3 py-6 md:flex xl:w-[244px] xl:px-4" style={{ paddingTop: "max(24px, env(safe-area-inset-top, 0px))", paddingLeft: "max(12px, env(safe-area-inset-left, 0px))" }}>
        <div className="px-2"><Logo /></div>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key} onClick={() => setView(key)} title={label}
              className={cx("flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] transition hover:bg-surface2", view === key ? "font-bold" : "text-fg/80")}
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={view === key ? 2.5 : 1.8} />
              <span className="max-xl:hidden">{label}</span>
            </button>
          ))}
          <button onClick={() => setImportOpen(true)} title="Importar enlace" className="flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] text-fg/80 transition hover:bg-surface2">
            <Plus className="h-6 w-6 shrink-0 rounded-md border-2 border-current p-0.5" strokeWidth={2.5} />
            <span className="max-xl:hidden">Importar enlace</span>
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button onClick={toggleTheme} title="Cambiar tema" className="flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] text-fg/80 transition hover:bg-surface2">
            {theme === "dark" ? <SunMedium className="h-6 w-6 shrink-0" strokeWidth={1.8} /> : <MoonStar className="h-6 w-6 shrink-0" strokeWidth={1.8} />}
            <span className="max-xl:hidden">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
          </button>
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="ig-grad grid h-9 w-9 shrink-0 place-items-center rounded-full p-[2px]">
              <span className="grid h-full w-full place-items-center rounded-full bg-bg font-display text-xs font-bold">TM</span>
            </span>
            <div className="min-w-0 max-xl:hidden">
              <div className="truncate text-sm font-semibold">{ACCOUNT.handle}</div>
              <div className="text-xs text-muted">{ACCOUNT.name}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky-safe gutter sticky z-30 flex items-center justify-between border-b border-line bg-bg/90 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="ig-grad grid h-8 w-8 place-items-center rounded-[10px] text-white"><TrendingUp className="h-4 w-4" strokeWidth={2.5} /></span>
          <span className="font-display text-lg font-extrabold tracking-tight">Reelscope</span>
        </div>
        <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface2" aria-label="Cambiar tema">
          {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
      </header>

      <main className="gutter pb-28 pt-6 md:ml-[76px] md:pb-12 md:pt-10 xl:ml-[244px]">
        <div className="mx-auto max-w-6xl">
          {view === "dashboard" ? (
            <DashboardView posts={posts} analyses={analyses} onOpen={setSelectedId} goContent={() => setView("content")} />
          ) : (
            <ContentView posts={posts} analyses={analyses} onOpen={setSelectedId} onImport={() => setImportOpen(true)} />
          )}
          <p className="mt-10 text-center text-xs text-muted">Simulador con datos de ejemplo. No está afiliado a Instagram ni a Meta.</p>
        </div>
      </main>

      {/* Navegación inferior (móvil) */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-bg/95 pt-2 backdrop-blur md:hidden">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)} className={cx("flex flex-col items-center gap-0.5 px-4 text-[11px]", view === key ? "font-bold text-fg" : "text-muted")}>
            <Icon className="h-6 w-6" strokeWidth={view === key ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
        <button onClick={() => setImportOpen(true)} className="flex flex-col items-center gap-0.5 px-4 text-[11px] text-muted">
          <span className="ig-grad grid h-6 w-6 place-items-center rounded-md text-white"><Plus className="h-4 w-4" strokeWidth={3} /></span>
          Importar
        </button>
      </nav>

      {selected && <AnalysisPanel post={selected} analysis={analyses[selected.id]} onClose={() => setSelectedId(null)} />}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onDone={handleImported} existing={posts} />}

      {toast && (
        <div className="anim-pop fixed bottom-24 left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-bg shadow-xl md:bottom-8" role="status">
          <CircleCheck className="h-4 w-4 shrink-0" /> <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}

// Liga/desliga as imagens locais (demo) via .env
// .env => VITE_USE_FIGMA_IMAGES=true
const USE_FIGMA = import.meta.env.VITE_USE_FIGMA_IMAGES === "true";

export type Kind = "article" | "video" | "event" | "class";

export type FigmaMap = {
  article: Record<string, string>;
  video: Record<string, string>;
  event: Record<string, string>;
  class: Record<string, string>;
};

/**
 * ✅ Coloquei os 6 nomes que você usou.
 * Eles DEVEM existir nas 4 pastas:
 * public/figma/articles/
 * public/figma/videos/
 * public/figma/events/
 * public/figma/classes/
 */
const BASE_NAMES = [
  "photo-1616569925882-18e6a431bba9.jpg",
  "photo-1575052814086-f385e2e2ad1b.jpg",
  "photo-1545205597-3d9d02c29597.jpg",
  "photo-1599901860904-17e6ed7083a0.jpg",
  "photo-1506126613408-eca07ce68773.jpg",
  "photo-1544367567-0f2fcb009e0b.jpg",
];

// Caminhos por tipo (mesmos nomes em todas as pastas)
const FOLDERS: Record<Kind, string> = {
  article: "/figma/articles/",
  video: "/figma/videos/",
  event: "/figma/events/",
  class: "/figma/classes/",
};

// (Opcional) mapeamentos específicos por slug -> arquivo
// Use isto se você quiser forçar uma imagem exata para um post
export const FIGMA_IMAGES: FigmaMap = {
  article: {
    // "meu-artigo-exato": "/figma/articles/photo-1616569925882-18e6a431bba9.jpg",
  },
  video: {
    // "meu-video-exato": "/figma/videos/photo-1575052814086-f385e2e2ad1b.jpg",
  },
  event: {
    // "meu-evento-exato": "/figma/events/photo-1545205597-3d9d02c29597.jpg",
  },
  class: {
    // "minha-aula-exata": "/figma/classes/photo-1599901860904-17e6ed7083a0.jpg",
  },
};

// util: slug simples
export function slugify(s?: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// hash simples p/ escolher uma imagem de forma determinística
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// monta o caminho final baseado no tipo + nome do arquivo
function pathFor(kind: Kind, baseName: string) {
  return FOLDERS[kind] + baseName;
}

/**
 * Retorna a imagem local (Figma) se habilitado e existir no mapa/queda-padrão.
 * 1) tenta FIGMA_IMAGES[kind][slug]
 * 2) tenta FIGMA_IMAGES[kind][slugify(title)]
 * 3) se nada disso existir, escolhe UMA das 6 automaticamente (determinística)
 */
export function getFigmaImage(kind: Kind, item: any): string | undefined {
  if (!USE_FIGMA) return undefined;

  const table = FIGMA_IMAGES[kind];
  const slug = item?.slug ? String(item.slug) : "";
  const titleSlug = slugify(item?.title);
  const key = slug || titleSlug || String(item?._id || "");

  if (table?.[slug]) return table[slug];
  if (titleSlug && table?.[titleSlug]) return table[titleSlug];

  // fallback automático: escolhe uma das 6 com base no hash
  if (BASE_NAMES.length > 0 && key) {
    const idx = hash(key) % BASE_NAMES.length;
    return pathFor(kind, BASE_NAMES[idx]);
  }

  // por último, se não deu pra decidir, usa a primeira
  return BASE_NAMES[0] ? pathFor(kind, BASE_NAMES[0]) : undefined;
}

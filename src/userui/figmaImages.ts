// src/userui/figmaImages.ts

type Kind = "article" | "video" | "event" | "class";
type AnyItem = { _id?: string; id?: string; slug?: string; title?: string };

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

// Arquivos que EXISTEM em public/figma/<folder>/ (conferido no seu zip)
const files = {
  articles: [
    "photo-1506126613408-eca07ce68773.jpg",
    "photo-1544367567-0f2fcb009e0b.jpg",
    "photo-1545205597-3d9d02c29597.jpg",
    "photo-1575052814086-f385e2e2ad1b.jpg",
    "photo-1599901860904-17e6ed7083a0.jpg",
    "photo-1616569925882-18e6a431bba9.jpg",
  ],
  videos: [
    "photo-1506126613408-eca07ce68773.jpg",
    "photo-1544367567-0f2fcb009e0b.jpg",
    "photo-1545205597-3d9d02c29597.jpg",
    "photo-1575052814086-f385e2e2ad1b.jpg",
    "photo-1599901860904-17e6ed7083a0.jpg",
    "photo-1616569925882-18e6a431bba9.jpg",
  ],
  events: [
    "photo-1506126613408-eca07ce68773.jpg",
    "photo-1544367567-0f2fcb009e0b.jpg",
    "photo-1545205597-3d9d02c29597.jpg",
    "photo-1575052814086-f385e2e2ad1b.jpg",
    "photo-1599901860904-17e6ed7083a0.jpg",
    "photo-1616569925882-18e6a431bba9.jpg",
  ],
  classes: [
    "photo-1506126613408-eca07ce68773.jpg",
    "photo-1544367567-0f2fcb009e0b.jpg",
    "photo-1545205597-3d9d02c29597.jpg",
    "photo-1575052814086-f385e2e2ad1b.jpg",
    "photo-1599901860904-17e6ed7083a0.jpg",
    "photo-1616569925882-18e6a431bba9.jpg",
  ],
} as const;

function hashSeed(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

export function getFigmaImage(kind: Kind, item?: AnyItem) {
  const seed = (item?._id || item?.id || item?.slug || item?.title || "x") + `:${kind}`;

  switch (kind) {
    case "article": {
      const arr = files.articles;
      const idx = hashSeed(seed) % arr.length;
      return `${BASE}figma/articles/${arr[idx]}`;
    }
    case "video": {
      const arr = files.videos;
      const idx = hashSeed(seed) % arr.length;
      return `${BASE}figma/videos/${arr[idx]}`;
    }
    case "event": {
      const arr = files.events;
      const idx = hashSeed(seed) % arr.length;
      return `${BASE}figma/events/${arr[idx]}`;
    }
    case "class": {
      const arr = files.classes;
      const idx = hashSeed(seed) % arr.length;
      return `${BASE}figma/classes/${arr[idx]}`;
    }
    default:
      return undefined;
  }
}

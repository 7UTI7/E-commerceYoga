import { useEffect, useMemo, useState } from "react";
import {
  getArticles,
  getVideos,
  getEvents,
  getClassSlots,
} from "../../lib/api";
import type { Article, Video, Event, ClassSlot } from "../../lib/api";
import { PostCard } from "./PostCard";

type Category = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas";

type FeedItem =
  | { kind: "Article"; raw: Article }
  | { kind: "Video"; raw: Video }
  | { kind: "Event"; raw: Event }
  | { kind: "ClassSlot"; raw: ClassSlot };

// Modelo que o seu PostCard entende (ajuste os nomes se necessário)
type UiCard = {
  key: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image?: string;
  raw: any;
};

function formatWeekday(n?: number) {
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  if (typeof n !== "number" || n < 0 || n > 6) return "Dia";
  return names[n];
}

function coerceDate(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(+d) ? "" : d.toLocaleString("pt-BR");
}

function normalizeToUi(item: FeedItem): UiCard {
  if (item.kind === "Article") {
    const a = item.raw;
    return {
      key: `Article-${a._id}`,
      title: a.title ?? "Artigo",
      category: "Artigos",
      date: coerceDate(a.createdAt),
      excerpt: (a.content ?? "").slice(0, 160) + (a.content ? "…" : ""),
      image: a.coverImage ?? "/assets/placeholder.jpg",
      raw: a,
    };
  }

  if (item.kind === "Video") {
    const v = item.raw;
    return {
      key: `Video-${v._id}`,
      title: v.title ?? "Vídeo",
      category: "Vídeos",
      date: coerceDate(v.createdAt),
      excerpt: (v.description ?? "").slice(0, 160) + (v.description ? "…" : ""),
      image: "/assets/placeholder.jpg",
      raw: v,
    };
  }

  if (item.kind === "Event") {
    const e = item.raw;
    return {
      key: `Event-${e._id}`,
      title: e.title ?? "Evento",
      category: "Eventos",
      date: coerceDate(e.date) || coerceDate(e.createdAt),
      excerpt: (e.description ?? "").slice(0, 160) + (e.description ? "…" : ""),
      image: "/assets/placeholder.jpg",
      raw: e,
    };
  }

  // ClassSlot pode vir sem title/description/dateTime → criamos algo legível
  const c = item.raw;
  const title =
    c.modality
      ? `Aula de ${c.modality}`
      : "Aula";
  const date =
    c.time && typeof c.weekday === "number"
      ? `${formatWeekday(c.weekday)} • ${c.time}`
      : coerceDate(c.createdAt) || "Horário a definir";

  return {
    key: `ClassSlot-${c._id}`,
    title,
    category: "Aulas",
    date,
    excerpt: "Agende sua prática.",
    image: "/assets/placeholder.jpg",
    raw: c,
  };
}

export function PostsSection({ activeCategory }: { activeCategory: Category }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [a, v, e, c] = await Promise.all([
          getArticles(), getVideos(), getEvents(), getClassSlots()
        ]);
        if (!alive) return;
        setArticles(a || []);
        setVideos(v || []);
        setEvents(e || []);
        setClasses(c || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const feed: UiCard[] = useMemo(() => {
    const mapA: FeedItem[] = articles.map((x) => ({ kind: "Article", raw: x }));
    const mapV: FeedItem[] = videos.map((x) => ({ kind: "Video", raw: x }));
    const mapE: FeedItem[] = events.map((x) => ({ kind: "Event", raw: x }));
    const mapC: FeedItem[] = classes.map((x) => ({ kind: "ClassSlot", raw: x }));

    let items: FeedItem[];
    switch (activeCategory) {
      case "Artigos":
        items = mapA;
        break;
      case "Vídeos":
        items = mapV;
        break;
      case "Eventos":
        items = mapE;
        break;
      case "Aulas":
        items = mapC;
        break;
      default: {
        items = [...mapA, ...mapV, ...mapE, ...mapC];
        // ordenar por “mais recente”
        items.sort((x, y) => {
          const dx = new Date(
            x.kind === "Event" ? (x.raw as Event).date
              : (x.raw as any).createdAt
          ).getTime();
          const dy = new Date(
            y.kind === "Event" ? (y.raw as Event).date
              : (y.raw as any).createdAt
          ).getTime();
          return dy - dx;
        });
      }
    }

    return items.map(normalizeToUi);
  }, [activeCategory, articles, videos, events, classes]);

  if (loading) return <div className="p-6 text-center">Carregando…</div>;
  if (!feed.length) return <div className="p-6 text-center">Nada por aqui ainda.</div>;

  return (
    <section className="container mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {feed.map((card) => (
        <PostCard
          key={card.key}
          title={card.title}
          category={card.category}
          date={card.date}
          excerpt={card.excerpt}
          image={card.image}
          // se seu PostCard aceita um objeto para abrir modal/detalhes:
          item={card.raw}
        />
      ))}
    </section>
  );
}

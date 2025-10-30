import { useEffect, useMemo, useState } from "react";
import PostCard from "./PostCard";
import {
  getPublishedArticles,
  getVideos,
  getEvents,
  getClassSlots,
  type Article,
  type Video,
  type Event,
  type ClassSlot,
} from "../../lib/api";
import { getFigmaImage } from "../figmaImages";

type UiCategory = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas";
type DataKey = "recent" | "article" | "video" | "event" | "class";

interface Item {
  id: string;
  kind: "article" | "video" | "event" | "class";
  title: string;
  description?: string;
  image?: string;
  date?: string;
}

function uiToKey(ui?: UiCategory): DataKey {
  switch (ui) {
    case "Artigos": return "article";
    case "Vídeos":  return "video";
    case "Eventos": return "event";
    case "Aulas":   return "class";
    default:        return "recent";
  }
}

const weekdayName = (i: number) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i] ?? "";

function fmtISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function PostsSection({ activeCategory }: { activeCategory?: UiCategory }) {
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const selectedKey = useMemo<DataKey>(() => uiToKey(activeCategory ?? "Recentes"), [activeCategory]);

  useEffect(() => {
    let alive = true;
    async function fetchData() {
      setLoading(true);
      setErr(null);
      try {
        const items: Item[] = [];

        if (selectedKey === "article" || selectedKey === "recent") {
          const articles = await getPublishedArticles();
          items.push(
            ...articles.map((a: Article): Item => ({
              id: a.slug,
              kind: "article",
              title: a.title,
              description: a.content?.trim()
                ? (a.content.length > 140 ? a.content.slice(0, 140) + "…" : a.content)
                : undefined,
              image: a.coverImage || getFigmaImage("article", a),
              date: a.createdAt ?? a.updatedAt,
            }))
          );
        }

        if (selectedKey === "video" || selectedKey === "recent") {
          const videos = await getVideos();
          items.push(
            ...videos.map((v: Video): Item => ({
              id: v._id,
              kind: "video",
              title: v.title,
              description: v.description,
              image: getFigmaImage("video", v),
              date: v.createdAt ?? v.updatedAt,
            }))
          );
        }

        if (selectedKey === "event" || selectedKey === "recent") {
          const events = await getEvents();
          items.push(
            ...events.map((e: Event): Item => ({
              id: e._id,
              kind: "event",
              title: e.title,
              description: e.description,
              image: getFigmaImage("event", e),
              date: e.date ?? e.createdAt ?? e.updatedAt,
            }))
          );
        }

        if (selectedKey === "class" || selectedKey === "recent") {
          const classes = await getClassSlots();
          items.push(
            ...classes.map((c: ClassSlot): Item => {
              const hasNewShape = !!c.dateTime || !!c.title || !!c.description;
              const title = hasNewShape ? (c.title || "Aula de Yoga") : (c.modality ? `Aula de ${c.modality}` : "Aula de Yoga");
              const desc = hasNewShape
                ? (c.description && c.description.trim().length > 0
                    ? c.description
                    : `${fmtISO(c.dateTime)}${c.durationMinutes ? ` • ${c.durationMinutes} min` : ""}${c.maxStudents ? ` • ${c.maxStudents} vagas` : ""}`)
                : `${weekdayName(Number(c.weekday ?? 0))} • ${c.time ?? ""}`;
              const date = hasNewShape ? (c.dateTime ?? c.createdAt ?? c.updatedAt) : (c.createdAt ?? c.updatedAt);
              return {
                id: c._id,
                kind: "class",
                title,
                description: desc,
                image: getFigmaImage("class", c),
                date,
              };
            })
          );
        }

        items.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });

        if (alive) setPosts(items);
      } catch (e: any) {
        if (alive) setErr(e?.response?.data?.message || "Erro ao carregar conteúdos.");
        if (alive) setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchData();
    return () => { alive = false; };
  }, [selectedKey]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {err && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Carregando conteúdo...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Nenhum conteúdo encontrado.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {posts.map((item) => (
            <PostCard
              key={`${item.kind}-${item.id}`}
              id={item.id}
              kind={item.kind}
              title={item.title}
              description={item.description}
              image={item.image}
              date={item.date}
            />
          ))}
        </div>
      )}
    </section>
  );
}

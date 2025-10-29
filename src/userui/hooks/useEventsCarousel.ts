import { useEffect, useState } from "react";
import { getEvents, type Event } from "../../lib/api";
import { getFigmaImage } from "../figmaImages";

export type EventCardItem = {
  id: string;
  title: string;
  subtitle?: string;
  dateISO: string;
  dateLabel: string;
  image?: string;
  href?: string;
};

function formatDateLabel(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function useEventCarousel() {
  const [items, setItems] = useState<EventCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const evts = await getEvents();
        const mapped = evts
          .map((e: Event): EventCardItem => ({
            id: e._id,
            title: e.title,
            subtitle: e.location || e.description || "",
            dateISO: e.date || e.createdAt || e.updatedAt,
            dateLabel: formatDateLabel(e.date || e.createdAt || e.updatedAt),
            image: getFigmaImage("event", e),
            href: `/event/${e._id}`,
          }))
          .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.message || "Erro ao carregar eventos.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, error };
}

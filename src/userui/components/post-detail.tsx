import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticles, getVideos, getEvents, getClassSlots,
} from "../../lib/api";
import { ArrowLeft } from "lucide-react";

function ytIdFrom(url?: string) {
  if (!url) return "";
  const r = /(youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return r?.[2] || "";
}

type Kind = "artigo" | "video" | "evento" | "aula" | undefined;

export default function PostDetail() {
  const { id, kind } = useParams<{ id: string; kind?: Kind }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [type, setType] = useState<"Artigo" | "Vídeo" | "Evento" | "Aula" | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        if (kind === "video") {
          const vids = await getVideos();
          const v = vids.find(x => x._id === id);
          if (v) { setItem(v); setType("Vídeo"); setLoading(false); return; }
        }
        if (kind === "artigo") {
          const arts = await getArticles();
          const a = arts.find(x => x._id === id);
          if (a) { setItem(a); setType("Artigo"); setLoading(false); return; }
        }
        if (kind === "evento") {
          const evs = await getEvents();
          const e = evs.find(x => x._id === id);
          if (e) { setItem(e); setType("Evento"); setLoading(false); return; }
        }
        if (kind === "aula") {
          const cls = await getClassSlots();
          const c = cls.find(x => x._id === id);
          if (c) { setItem(c); setType("Aula"); setLoading(false); return; }
        }

        const [arts, vids, evs, cls] = await Promise.all([
          getArticles(), getVideos(), getEvents(), getClassSlots()
        ]);
        let found: any = arts.find(x => x._id === id);
        if (found) { setItem(found); setType("Artigo"); setLoading(false); return; }
        found = vids.find(x => x._id === id);
        if (found) { setItem(found); setType("Vídeo"); setLoading(false); return; }
        found = evs.find(x => x._id === id);
        if (found) { setItem(found); setType("Evento"); setLoading(false); return; }
        found = cls.find(x => x._id === id);
        if (found) { setItem(found); setType("Aula"); setLoading(false); return; }

        setItem(null); setType(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, kind]);

  const youtubeId = useMemo(() => {
    if (!item) return "";
    const raw =
      (item.youtubeUrl as string | undefined) || // ⇐ backend do Rafael
      (item.url as string | undefined) ||
      (item.videoUrl as string | undefined) ||
      (item.link as string | undefined) ||
      (item.embed as string | undefined);
    if (!raw) return "";
    if (raw.includes("/embed/")) {
      const m = /embed\/([A-Za-z0-9_-]{6,})/.exec(raw);
      return m?.[1] || "";
    }
    return ytIdFrom(raw);
  }, [item]);

  if (loading) return <div className="mx-auto max-w-3xl p-6 text-gray-600">Carregando…</div>;
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-gray-700">Conteúdo não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="rounded-2xl bg-white shadow p-5">
        {type && <div className="mb-2 text-xs font-medium text-purple-700">{type}</div>}
        <h1 className="text-2xl font-semibold mb-3">{item.title || item.slug || "Sem título"}</h1>

        {type === "Vídeo" && youtubeId && (
          <div className="mb-4 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={item.title || "Vídeo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {item.content && <p className="whitespace-pre-wrap">{item.content}</p>}
        {item.description && !item.content && <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>}

        <div className="mt-4 text-sm text-gray-500">
          {item.createdAt && <>Publicado em {new Date(item.createdAt).toLocaleString("pt-BR")}</>}
          {item.date && <> • {new Date(item.date).toLocaleString("pt-BR")}</>}
          {item.modality && <> • Modalidade: {item.modality}</>}
          {item.location && <> • Local: {item.location}</>}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticleById, getVideoById, getEventById, getClassSlotById,
  type Article, type Video, type Event, type ClassSlot
} from "../../lib/api";
import { getFigmaImage } from "../../userui/figmaImages";

type Kind = "article" | "video" | "event" | "class";

function ytIdFrom(url?: string) {
  if (!url) return "";
  const r = /(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return r?.[2] || "";
}

export default function PostDetail() {
  const { kind, id } = useParams<{ kind: Kind; id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Article | Video | Event | ClassSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        let res: any;
        switch (kind) {
          case "article": res = await getArticleById(id!); break;
          case "video":   res = await getVideoById(id!); break;
          case "event":   res = await getEventById(id!); break;
          case "class":   res = await getClassSlotById(id!); break;
          default: throw new Error("Tipo inválido");
        }
        if (alive) setData(res);
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.message || e?.message || "Erro ao carregar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [kind, id]);

  const title = useMemo(() => {
    if (!data) return "";
    if ((data as any).title) return (data as any).title;
    if (kind === "class") {
      const c = data as ClassSlot;
      const names = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
      const weekday = typeof c.weekday === "number" ? names[c.weekday] : "";
      return `${c.modality ? `Aula de ${c.modality}` : "Aula"}${weekday||c.time ? " • " : ""}${weekday} ${c.time || ""}`;
    }
    return "Detalhe";
  }, [data, kind]);

  if (loading) return <div className="p-8 text-center">Carregando…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">Não encontrado.</div>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-3">
        <button className="text-sm text-purple-700 hover:underline" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>

      <div className="mt-2 text-sm text-gray-500">
        {kind === "article" && (data as Article).updatedAt &&
          <>Atualizado em {new Date((data as Article).updatedAt).toLocaleString("pt-BR")}</>}
        {kind === "event" && (data as Event).date &&
          <>Quando: {new Date((data as Event).date).toLocaleString("pt-BR")}</>}
        {kind === "class" &&
          <>Criado em {new Date((data as ClassSlot).createdAt).toLocaleString("pt-BR")}</>}
      </div>

      <div className="mt-6 prose prose-purple max-w-none">
        {kind === "article" && <ArticleBody article={data as Article} />}
        {kind === "video"   && <VideoBody video={data as Video} />}
        {kind === "event"   && <EventBody event={data as Event} />}
        {kind === "class"   && <ClassBody item={data as ClassSlot} />}
      </div>
    </div>
  );
}

function ArticleBody({ article }: { article: Article }) {
  const fallback = getFigmaImage("article", article);
  const cover = article.coverImage || fallback;
  return (
    <>
      {cover && (
        <img src={cover} alt={article.title} className="w-full rounded-xl shadow mb-6" />
      )}
      <div className="whitespace-pre-wrap">
        {article.content || "Sem conteúdo."}
      </div>
    </>
  );
}

function VideoBody({ video }: { video: Video }) {
  const id = ytIdFrom(video.url);
  const fallback = getFigmaImage("video", video);
  return (
    <>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow">
        {id ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${id}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : fallback ? (
          <img src={fallback} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-600">
            URL de vídeo inválida
          </div>
        )}
      </div>
      {video.description && (
        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{video.description}</p>
      )}
    </>
  );
}

function EventBody({ event }: { event: Event }) {
  const fallback = getFigmaImage("event", event);
  return (
    <>
      {fallback && (
        <img src={fallback} alt={event.title} className="w-full rounded-xl shadow mb-6" />
      )}
      <div className="rounded-xl bg-purple-50 p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          <b>Data:</b> {new Date(event.date).toLocaleString("pt-BR")}
          {event.location ? <> • <b>Local:</b> {event.location}</> : null}
        </div>
      </div>
      {event.description && (
        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{event.description}</p>
      )}
    </>
  );
}

function ClassBody({ item }: { item: ClassSlot }) {
  const names = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const weekday = typeof item.weekday === "number" ? names[item.weekday] : "";
  const fallback = getFigmaImage("class", item);
  return (
    <>
      {fallback && (
        <img src={fallback} alt={item.modality || "Aula"} className="w-full rounded-xl shadow mb-6" />
      )}
      <div className="rounded-xl bg-purple-50 p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          <b>Modalidade:</b> {item.modality ?? "—"} • <b>Dia:</b> {weekday} • <b>Horário:</b> {item.time}
        </div>
      </div>
    </>
  );
}

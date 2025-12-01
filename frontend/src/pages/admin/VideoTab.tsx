import { useEffect, useMemo, useState } from "react";
import { createVideo, deleteVideo, getVideos, type Video } from "../../lib/api";

function ytIdFrom(url?: string) {
  if (!url) return "";
  const r = /(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return r?.[2] || "";
}

export default function VideoTab() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const ytId = useMemo(() => ytIdFrom(url), [url]);
  const urlValida = !url || Boolean(ytId);

  async function loadList() {
    setLoadingList(true);
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (e) {
      console.error("Erro listando vídeos:", e);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Informe um título.");
      return;
    }
    if (!url.trim()) {
      setError("Informe a URL do YouTube.");
      return;
    }
    if (!urlValida) {
      setError("URL do YouTube inválida. Ex.: https://youtu.be/XXXX ou https://www.youtube.com/watch?v=XXXX");
      return;
    }

    try {
      setSubmitting(true);
      await createVideo({ title: title.trim(), url: url.trim(), description: description.trim() || undefined });
      
      setTitle("");
      setUrl("");
      setDescription("");
      await loadList();
    } catch (e: any) {
      console.error("Erro ao criar vídeo:", e);
      setError(e?.response?.data?.message || e?.message || "Falha ao publicar vídeo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir este vídeo?")) return;
    try {
      await deleteVideo(id);
      await loadList();
    } catch (e) {
      console.error("Erro ao excluir vídeo:", e);
      alert("Não foi possível excluir.");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="rounded-xl border p-4 sm:p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Publicar vídeo (YouTube)</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-4 ring-purple-200 focus:border-purple-600"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex.: Fluxo básico de Hatha Yoga"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL do YouTube</label>
          <input
            className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-4 ring-purple-200 ${
              urlValida ? "border-gray-300 focus:border-purple-600" : "border-red-400 focus:border-red-600 ring-red-100"
            }`}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXX"
            required
          />
          {!urlValida && <p className="mt-1 text-sm text-red-600">Informe uma URL do YouTube válida.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-4 ring-purple-200 focus:border-purple-600"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Notas ou resumo do vídeo…"
          />
        </div>

        {/* --- PREVIEW DO PLAYER --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            {ytId ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${ytId}`}
                title="Preview vídeo"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                Digite uma URL válida para pré-visualizar
              </div>
            )}
          </div>
        </div>

        {error && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Publicando…" : "Publicar vídeo"}
        </button>
      </form>

      {/* --- LISTA DE VÍDEOS CADASTRADOS --- */}
      <div className="rounded-xl border p-4 sm:p-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vídeos publicados</h3>
        {loadingList ? (
          <p className="text-gray-500">Carregando…</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-500">Nenhum vídeo.</p>
        ) : (
          <ul className="space-y-3">
            {videos.map(v => (
              <li key={v._id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{v.title}</p>
                  <p className="text-sm text-gray-500 truncate">{v.url}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <a
                    className="text-sm text-purple-700 hover:underline"
                    href={`/post/video/${v._id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="text-sm text-red-600 hover:text-red-700"
                    title="Excluir"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
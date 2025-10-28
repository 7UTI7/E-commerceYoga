import { useEffect, useState } from "react";
import {
  getArticles, createArticle, deleteArticle, updateArticle,
  getVideos, createVideo, deleteVideo, updateVideo,
  getEvents, createEvent, deleteEvent, updateEvent,
  getClassSlots, createClassSlot, deleteClassSlot, updateClassSlot,
} from "../../lib/api";

type Tab = "Artigos" | "Vídeos" | "Eventos" | "Aulas";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("Artigos");

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Painel da Professora</h1>

      <nav className="mb-6 flex gap-2">
        {(["Artigos","Vídeos","Eventos","Aulas"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Artigos" && <ArticlesPanel />}
      {tab === "Vídeos"  && <VideosPanel />}
      {tab === "Eventos" && <EventsPanel />}
      {tab === "Aulas"   && <ClassesPanel />}
    </div>
  );
}

/* ---------------- Artigos ---------------- */
function ArticlesPanel() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"PUBLISHED"|"DRAFT">("PUBLISHED");
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await getArticles();
    setList(data);
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await createArticle({ title, slug, content, status });
      setList(prev => [created, ...prev]);
      setTitle(""); setSlug(""); setContent("");
    } finally { setLoading(false); }
  }
  async function onDelete(id: string) {
    if (!confirm("Excluir este artigo?")) return;
    await deleteArticle(id);
    setList(prev => prev.filter(i => i._id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Artigos</h2>
      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="rounded border p-2" placeholder="slug-exemplo" value={slug} onChange={e=>setSlug(e.target.value)} required />
        <textarea className="min-h-28 rounded border p-2" placeholder="Conteúdo" value={content} onChange={e=>setContent(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="text-sm">Status:</label>
          <select className="rounded border p-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
          <button disabled={loading} className="ml-auto rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60">
            {loading ? "Publicando..." : "Publicar artigo"}
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {list.map(a => (
          <li key={a._id} className="flex items-start justify-between rounded border p-3">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-gray-500">{a.slug} • {new Date(a.createdAt).toLocaleString("pt-BR")}</div>
            </div>
            <div className="flex gap-2">
              {/* Exemplo de edição rápida de status */}
              <button
                className="rounded border px-3 py-1 text-xs"
                onClick={async () => {
                  const next = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
                  const updated = await updateArticle(a._id, { status: next });
                  setList(prev => prev.map(x => x._id === a._id ? updated : x));
                }}
              >
                {a.status}
              </button>
              <button onClick={() => onDelete(a._id)} className="rounded bg-red-600 px-3 py-1 text-xs text-white">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Vídeos ---------------- */
function VideosPanel() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState(""); // youtube url ou link de vídeo
  const [description, setDescription] = useState("");

  async function load(){ setList(await getVideos()); }
  useEffect(()=>{ load(); }, []);

  async function onCreate(e: React.FormEvent){
    e.preventDefault();
    const created = await createVideo({ title, url, description });
    setList(prev => [created, ...prev]);
    setTitle(""); setUrl(""); setDescription("");
  }
  async function onDelete(id: string){
    if(!confirm("Excluir este vídeo?")) return;
    await deleteVideo(id);
    setList(prev => prev.filter(i=>i._id!==id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Vídeos</h2>
      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="rounded border p-2" placeholder="URL do vídeo" value={url} onChange={e=>setUrl(e.target.value)} required />
        <textarea className="min-h-24 rounded border p-2" placeholder="Descrição (opcional)" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="text-right">
          <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Publicar vídeo</button>
        </div>
      </form>

      <ul className="space-y-2">
        {list.map(v => (
          <li key={v._id} className="flex items-start justify-between rounded border p-3">
            <div>
              <div className="font-medium">{v.title}</div>
              <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString("pt-BR")}</div>
              {v.description && <div className="text-sm text-gray-700 mt-1 line-clamp-2">{v.description}</div>}
            </div>
            <button onClick={() => onDelete(v._id)} className="rounded bg-red-600 px-3 py-1 text-xs text-white">Excluir</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Eventos ---------------- */
function EventsPanel() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // datetime-local
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  async function load(){ setList(await getEvents()); }
  useEffect(()=>{ load(); }, []);

  async function onCreate(e: React.FormEvent){
    e.preventDefault();
    const created = await createEvent({
      title,
      date: new Date(date).toISOString(),
      location,
      description,
    });
    setList(prev => [created, ...prev]);
    setTitle(""); setDate(""); setLocation(""); setDescription("");
  }
  async function onDelete(id: string){
    if(!confirm("Excluir este evento?")) return;
    await deleteEvent(id);
    setList(prev => prev.filter(i=>i._id!==id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Eventos</h2>
      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="rounded border p-2" type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} required />
        <input className="rounded border p-2" placeholder="Local (opcional)" value={location} onChange={e=>setLocation(e.target.value)} />
        <textarea className="min-h-24 rounded border p-2" placeholder="Descrição (opcional)" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="text-right">
          <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Publicar evento</button>
        </div>
      </form>

      <ul className="space-y-2">
        {list.map(ev => (
          <li key={ev._id} className="flex items-start justify-between rounded border p-3">
            <div>
              <div className="font-medium">{ev.title}</div>
              <div className="text-xs text-gray-500">
                {new Date(ev.date).toLocaleString("pt-BR")}
                {ev.location ? ` • ${ev.location}` : ""}
              </div>
            </div>
            <button onClick={() => onDelete(ev._id)} className="rounded bg-red-600 px-3 py-1 text-xs text-white">Excluir</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Aulas (Class-Slots) ---------------- */
function ClassesPanel() {
  const [list, setList] = useState<any[]>([]);
  const [weekday, setWeekday] = useState<number>(1); // 1=Seg
  const [time, setTime] = useState("19:00");
  const [modality, setModality] = useState("");

  async function load(){ setList(await getClassSlots()); }
  useEffect(()=>{ load(); }, []);

  async function onCreate(e: React.FormEvent){
    e.preventDefault();
    const created = await createClassSlot({ weekday, time, modality });
    setList(prev => [created, ...prev]);
    setWeekday(1); setTime("19:00"); setModality("");
  }
  async function onDelete(id: string){
    if(!confirm("Excluir esta aula?")) return;
    await deleteClassSlot(id);
    setList(prev => prev.filter(i=>i._id!==id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Aulas</h2>
      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="rounded border p-2" value={weekday} onChange={e=>setWeekday(parseInt(e.target.value))}>
            <option value={0}>Dom</option><option value={1}>Seg</option><option value={2}>Ter</option>
            <option value={3}>Qua</option><option value={4}>Qui</option><option value={5}>Sex</option><option value={6}>Sáb</option>
          </select>
          <input className="rounded border p-2" type="time" value={time} onChange={e=>setTime(e.target.value)} />
          <input className="rounded border p-2" placeholder="Modalidade (ex.: Hatha, Yin)" value={modality} onChange={e=>setModality(e.target.value)} />
        </div>
        <div className="text-right">
          <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Cadastrar aula</button>
        </div>
      </form>

      <ul className="space-y-2">
        {list.map(c => (
          <li key={c._id} className="flex items-start justify-between rounded border p-3">
            <div>
              <div className="font-medium">{c.modality || "Aula"}</div>
              <div className="text-xs text-gray-500">Dia {c.weekday} • {c.time}</div>
            </div>
            <button onClick={() => onDelete(c._id)} className="rounded bg-red-600 px-3 py-1 text-xs text-white">Excluir</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  // artigos
  getArticles, createArticle, updateArticle, deleteArticle,
  // vídeos
  getVideos, createVideo, updateVideo, deleteVideo,
  // eventos
  getEvents, createEvent, updateEvent, deleteEvent,
  // aulas
  getClassSlots, createClassSlot, updateClassSlot, deleteClassSlot,
  type Article, type Video, type Event, type ClassSlot,
} from "../../lib/api";

import { Button } from "../../userui/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../../userui/components/ui/dialog";

/* =================== HELPERS =================== */
type Tab = "Artigos" | "Vídeos" | "Eventos" | "Aulas";

// Extrai ID do YouTube (watch?v=, youtu.be/, embed/, shorts/)
function ytIdFrom(url?: string) {
  if (!url) return "";
  const r = /(youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return r?.[2] || "";
}
function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toISO(dtLocal?: string) {
  if (!dtLocal) return undefined;
  const d = new Date(dtLocal);
  return d.toISOString();
}

/* =================== ADMIN ROOT =================== */
export default function Admin() {
  const [tab, setTab] = useState<Tab>("Artigos");

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Painel da Professora</h1>

      <nav className="mb-6 flex flex-wrap gap-2">
        {(["Artigos","Vídeos","Eventos","Aulas"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              tab===t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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

/* =================== ARTIGOS =================== */
function ArticlesPanel() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // criar
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"PUBLISHED"|"DRAFT">("PUBLISHED");
  const [creating, setCreating] = useState(false);

  // editar
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eSlug, setESlug] = useState("");
  const [eContent, setEContent] = useState("");
  const [eStatus, setEStatus] = useState<"PUBLISHED"|"DRAFT">("PUBLISHED");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try { setList(await getArticles()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createArticle({ title, slug, content, status });
      setList(prev => [created, ...prev]);
      setTitle(""); setSlug(""); setContent("");
      setStatus("PUBLISHED");
    } finally { setCreating(false); }
  }

  function onOpenEdit(a: Article) {
    setEditing(a);
    setETitle(a.title || "");
    setESlug(a.slug || "");
    setEContent(a.content || "");
    setEStatus(a.status || "PUBLISHED");
    setOpenEdit(true);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateArticle(editing._id, { title: eTitle, slug: eSlug, content: eContent, status: eStatus });
      setList(prev => prev.map(x => x._id === editing._id ? updated : x));
      setOpenEdit(false);
    } finally { setSaving(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir este artigo?")) return;
    await deleteArticle(id);
    setList(prev => prev.filter(x => x._id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Artigos</h2>

      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4 bg-white">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="rounded border p-2" placeholder="slug-exemplo" value={slug} onChange={e=>setSlug(e.target.value)} required />
        <textarea className="min-h-28 rounded border p-2" placeholder="Conteúdo (markdown ou texto livre)" value={content} onChange={e=>setContent(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="text-sm">Status:</label>
          <select className="rounded border p-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
          <Button type="submit" disabled={creating} className="ml-auto rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
            {creating ? "Publicando..." : "Publicar artigo"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <ul className="space-y-2">
          {list.map(a => (
            <li key={a._id} className="flex items-start justify-between rounded border bg-white p-3">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-500">
                  {a.slug} • {a.status} • {new Date(a.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-lg" onClick={() => onOpenEdit(a)}>Editar</Button>
                <Button variant="destructive" className="rounded-lg" onClick={() => onDelete(a._id)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar artigo</DialogTitle>
            <DialogDescription>Atualize os campos e salve.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <input className="rounded border p-2" placeholder="Título" value={eTitle} onChange={e=>setETitle(e.target.value)} />
            <input className="rounded border p-2" placeholder="slug" value={eSlug} onChange={e=>setESlug(e.target.value)} />
            <textarea className="min-h-28 rounded border p-2" placeholder="Conteúdo" value={eContent} onChange={e=>setEContent(e.target.value)} />
            <div className="flex items-center gap-3">
              <label className="text-sm">Status:</label>
              <select className="rounded border p-2" value={eStatus} onChange={e=>setEStatus(e.target.value as any)}>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
              <div className="ml-auto flex gap-2">
                <button className="rounded-lg border px-3 py-2" onClick={() => setOpenEdit(false)}>Cancelar</button>
                <button className="rounded-lg bg-purple-600 px-3 py-2 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* =================== VÍDEOS (ALINHADO COM O BACKEND) =================== */
function VideosPanel() {
  const [list, setList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // criar
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // opcional
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setList(await getVideos()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const ytId = useMemo(() => ytIdFrom(url), [url]);
  const normalized = ytId ? `https://www.youtube.com/watch?v=${ytId}` : "";
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : "";

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Informe um título.");
    if (!description.trim()) return setError("Informe uma descrição.");
    if (!ytId) return setError("URL do YouTube inválida.");

    setCreating(true);
    try {
      // ⇩⇩⇩ exatamente o que o backend espera
      const created = await createVideo({
        title: title.trim(),
        description: description.trim(),
        youtubeUrl: normalized,
        ...(category.trim() ? { category: category.trim() } : {}),
      } as any);

      setList(prev => [created, ...prev]);
      setTitle(""); setUrl(""); setDescription(""); setCategory("");
    } catch (err: any) {
      console.error("Erro ao criar vídeo:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao criar vídeo.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir este vídeo?")) return;
    try {
      await deleteVideo(id);
      setList(prev => prev.filter(x => x._id !== id));
    } catch (err) {
      console.error("Erro ao excluir vídeo:", err);
      alert("Não foi possível excluir.");
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Vídeos</h2>

      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4 bg-white">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="rounded border p-2" placeholder="URL do YouTube (qualquer formato)" value={url} onChange={e=>setUrl(e.target.value)} />
        <textarea className="min-h-20 rounded border p-2" placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="rounded border p-2" placeholder="Categoria (opcional)" value={category} onChange={e=>setCategory(e.target.value)} />

        {ytId && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe className="absolute inset-0 w-full h-full" src={embedUrl} title="Preview vídeo" allowFullScreen />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={creating} className="ml-auto rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
          {creating ? "Publicando..." : "Publicar vídeo"}
        </Button>
      </form>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <ul className="space-y-2">
          {list.map(v => (
            <li key={v._id} className="flex items-start justify-between rounded border bg-white p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{v.title}</div>
                <div className="text-xs text-gray-500 truncate">{(v as any).youtubeUrl}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a className="text-sm text-purple-700 hover:underline" href={(v as any).youtubeUrl} target="_blank" rel="noreferrer">Ver</a>
                <Button variant="destructive" className="rounded-lg" onClick={() => onDelete(v._id)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* =================== EVENTOS =================== */
function EventsPanel() {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // criar
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // editar
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDate, setEDate] = useState("");
  const [eLocation, setELocation] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try { setList(await getEvents()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createEvent({ title, date: toISO(date)!, location, description });
      setList(prev => [created, ...prev]);
      setTitle(""); setDate(""); setLocation(""); setDescription("");
    } finally { setCreating(false); }
  }

  function onOpenEdit(ev: Event) {
    setEditing(ev);
    setETitle(ev.title || "");
    setEDate(toDatetimeLocal(ev.date));
    setELocation(ev.location || "");
    setEDescription(ev.description || "");
    setOpenEdit(true);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateEvent(editing._id, { title: eTitle, date: toISO(eDate)!, location: eLocation, description: eDescription });
      setList(prev => prev.map(x => x._id === editing._id ? updated : x));
      setOpenEdit(false);
    } finally { setSaving(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir este evento?")) return;
    await deleteEvent(id);
    setList(prev => prev.filter(x => x._id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-medium">Eventos</h2>

      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-lg border p-4 bg-white">
        <input className="rounded border p-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="rounded border p-2" type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} required />
        <input className="rounded border p-2" placeholder="Local (opcional)" value={location} onChange={e=>setLocation(e.target.value)} />
        <textarea className="min-h-20 rounded border p-2" placeholder="Descrição (opcional)" value={description} onChange={e=>setDescription(e.target.value)} />
        <Button type="submit" disabled={creating} className="ml-auto rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
          {creating ? "Publicando..." : "Publicar evento"}
        </Button>
      </form>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <ul className="space-y-2">
          {list.map(ev => (
            <li key={ev._id} className="flex items-start justify-between rounded border bg-white p-3">
              <div>
                <div className="font-medium">{ev.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(ev.date).toLocaleString("pt-BR")} {ev.location ? `• ${ev.location}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-lg" onClick={() => onOpenEdit(ev)}>Editar</Button>
                <Button variant="destructive" className="rounded-lg" onClick={() => onDelete(ev._id)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <input className="rounded border p-2" placeholder="Título" value={eTitle} onChange={e=>setETitle(e.target.value)} />
            <input className="rounded border p-2" type="datetime-local" value={eDate} onChange={e=>setEDate(e.target.value)} />
            <input className="rounded border p-2" placeholder="Local" value={eLocation} onChange={e=>setELocation(e.target.value)} />
            <textarea className="min-h-20 rounded border p-2" placeholder="Descrição" value={eDescription} onChange={e=>setEDescription(e.target.value)} />
            <div className="ml-auto flex gap-2">
              <button className="rounded-lg border px-3 py-2" onClick={() => setOpenEdit(false)}>Cancelar</button>
              <button className="rounded-lg bg-purple-600 px-3 py-2 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* =================== AULAS =================== */
function ClassesPanel() {
  const [list, setList] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dtLocal, setDtLocal] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [maxStudents, setMaxStudents] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<ClassSlot | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eDtLocal, setEDtLocal] = useState("");
  const [eDurationMinutes, setEDurationMinutes] = useState<number | "">("");
  const [eMaxStudents, setEMaxStudents] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  function toDatetimeLocal(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function toISO(dt?: string) {
    if (!dt) return undefined;
    const d = new Date(dt);
    return d.toISOString();
  }

  async function load() {
    setLoading(true);
    try {
      setList(await getClassSlots());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dateTime: toISO(dtLocal)!,
        durationMinutes: typeof durationMinutes === "number" ? durationMinutes : undefined,
        maxStudents: typeof maxStudents === "number" ? maxStudents : undefined,
      };
      if (!payload.title || !payload.description || !payload.dateTime) {
        setError("Preencha título, descrição e data/hora.");
        return;
      }
      const created = await createClassSlot(payload);
      setList((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setDtLocal("");
      setDurationMinutes("");
      setMaxStudents("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao publicar aula.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  function onOpenEdit(c: ClassSlot) {
    setEditing(c);
    setETitle(c.title);
    setEDescription(c.description);
    setEDtLocal(toDatetimeLocal(c.dateTime));
    setEDurationMinutes(c.durationMinutes ?? "");
    setEMaxStudents(c.maxStudents ?? "");
    setOpenEdit(true);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Partial<ClassSlot> = {
        title: eTitle.trim(),
        description: eDescription.trim(),
        dateTime: eDtLocal ? toISO(eDtLocal) : undefined,
        durationMinutes: typeof eDurationMinutes === "number" ? eDurationMinutes : undefined,
        maxStudents: typeof eMaxStudents === "number" ? eMaxStudents : undefined,
      };
      const updated = await updateClassSlot(editing._id, payload);
      setList((prev) => prev.map((x) => (x._id === editing._id ? updated : x)));
      setOpenEdit(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao salvar aula.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    await deleteClassSlot(id);
    setList((prev) => prev.filter((x) => x._id !== id));
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Aulas</h2>

      <form onSubmit={onCreate} className="space-y-3 rounded border bg-white p-4">
        {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border p-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Data e Hora</span>
            <input type="datetime-local" value={dtLocal} onChange={(e) => setDtLocal(e.target.value)} className="rounded border p-2" />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm">Descrição</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded border p-2" rows={3} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Duração (min)</span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : "")}
              className="rounded border p-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Vagas</span>
            <input
              type="number"
              min={1}
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : "")}
              className="rounded border p-2"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={creating} className="ml-auto rounded-lg bg-purple-600 text-white hover:bg-purple-700">
            {creating ? "Publicando..." : "Publicar aula"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c._id} className="flex items-start justify-between rounded border bg-white p-3">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-gray-600">{new Date(c.dateTime).toLocaleString()}</div>
                <div className="text-sm text-gray-700">{c.description}</div>
                <div className="text-xs text-gray-500">
                  {c.durationMinutes ? `Duração: ${c.durationMinutes} min` : ""} {c.maxStudents ? ` • Vagas: ${c.maxStudents}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-lg" onClick={() => onOpenEdit(c)}>
                  Editar
                </Button>
                <Button variant="destructive" className="rounded-lg" onClick={() => onDelete(c._id)}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Título</span>
                <input value={eTitle} onChange={(e) => setETitle(e.target.value)} className="rounded border p-2" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Data e Hora</span>
                <input type="datetime-local" value={eDtLocal} onChange={(e) => setEDtLocal(e.target.value)} className="rounded border p-2" />
              </label>

              <label className="md:col-span-2 flex flex-col gap-1">
                <span className="text-sm">Descrição</span>
                <textarea value={eDescription} onChange={(e) => setEDescription(e.target.value)} className="rounded border p-2" rows={3} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Duração (min)</span>
                <input
                  type="number"
                  min={1}
                  value={eDurationMinutes}
                  onChange={(e) => setEDurationMinutes(e.target.value ? Number(e.target.value) : "")}
                  className="rounded border p-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Vagas</span>
                <input
                  type="number"
                  min={1}
                  value={eMaxStudents}
                  onChange={(e) => setEMaxStudents(e.target.value ? Number(e.target.value) : "")}
                  className="rounded border p-2"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onSaveEdit} disabled={saving} className="ml-auto rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

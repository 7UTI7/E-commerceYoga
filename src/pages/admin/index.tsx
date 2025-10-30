import { useEffect, useMemo, useState } from "react";
import {
  getArticles, createArticle, updateArticle, deleteArticle,
  getVideos, createVideo, updateVideo, deleteVideo,
  getEvents, createEvent, updateEvent, deleteEvent,
  getClassSlots, createClassSlot, updateClassSlot, deleteClassSlot,
  type Article, type Video, type Event, type ClassSlot,
} from "../../lib/api";
import { Button } from "../../userui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../userui/components/ui/dialog";
import { ChevronLeft, Calendar, Video as VideoIcon, FileText, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tab = "Artigos" | "Vídeos" | "Eventos" | "Aulas";

function ytIdFrom(url?: string) {
  if (!url) return "";
  const r = /(youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return r?.[2] || "";
}
function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toISO(dtLocal?: string) {
  if (!dtLocal) return undefined;
  const d = new Date(dtLocal);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("Artigos");
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="secondary" className="rounded-lg" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-semibold">Painel da Professora</h1>
        </div>

        <div className="mb-6 rounded-2xl border bg-white shadow-sm px-2 py-2">
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="text-sm text-gray-600">Gerencie artigos, vídeos, eventos e aulas</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {([
              { k: "Artigos", icon: <FileText className="w-4 h-4 mr-2" /> },
              { k: "Vídeos", icon: <VideoIcon className="w-4 h-4 mr-2" /> },
              { k: "Eventos", icon: <Calendar className="w-4 h-4 mr-2" /> },
              { k: "Aulas", icon: <Users className="w-4 h-4 mr-2" /> },
            ] as const).map(({ k, icon }) => (
              <button
                key={k}
                onClick={() => setTab(k as Tab)}
                className={`h-11 rounded-xl px-4 text-sm flex items-center justify-center transition ${
                  tab === (k as Tab)
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {icon}
                {k}
              </button>
            ))}
          </div>
        </div>

        {tab === "Artigos" && <ArticlesPanel />}
        {tab === "Vídeos" && <VideosPanel />}
        {tab === "Eventos" && <EventsPanel />}
        {tab === "Aulas" && <ClassesPanel />}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-2xl border bg-white shadow-sm">
      <div className="px-5 pt-5">
        <div className="text-lg font-medium">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className || ""}`}>
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`rounded-xl border px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-200 ${props.className || ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`rounded-xl border px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-200 ${props.className || ""}`} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`rounded-xl border px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-200 ${props.className || ""}`} />;
}
function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

// ====================================================================
// --- ARTIGOS ---
// ====================================================================

function ArticlesPanel() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [creating, setCreating] = useState(false);
  // --- Estados de erro separados ---
  const [createError, setCreateError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eSlug, setESlug] = useState("");
  const [eContent, setEContent] = useState("");
  const [eStatus, setEStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [saving, setSaving] = useState(false);

  const [confirmEdit, setConfirmEdit] = useState<Article | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Article | null>(null);

  async function load() {
    setLoading(true);
    setListError(null); // Limpa erros da lista
    try {
      setList(await getArticles());
    } catch (err: any) {
        setListError(err?.response?.data?.message || "Erro ao carregar artigos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null); // Limpa erros de criação
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setCreateError("Preencha título, slug e conteúdo.");
      return;
    }
    setCreating(true);
    try {
      const created = await createArticle({ title: title.trim(), slug: slug.trim(), content: content.trim(), status });
      setList((p) => [created, ...p]);
      setTitle("");
      setSlug("");
      setContent("");
      setStatus("PUBLISHED");
    } catch (err: any) {
        setCreateError(err?.response?.data?.message || "Erro ao criar artigo.");
    } finally {
      setCreating(false);
    }
  }

  function askEdit(a: Article) {
    setListError(null); // Limpa erros da lista ao abrir modal
    setConfirmEdit(a);
  }
  function proceedEdit() {
    if (!confirmEdit) return;
    const a = confirmEdit;
    setEditing(a);
    setETitle(a.title ?? "");
    setESlug(a.slug ?? "");
    setEContent(a.content ?? "");
    setEStatus(a.status ?? "PUBLISHED");
    setOpenEdit(true);
    setConfirmEdit(null);
  }

  async function onSaveEdit() {
    if (!editing) return;
    // Não limpa o erro aqui, pois o erro de salvar deve aparecer no modal de edição
    setSaving(true);
    try {
      const updated = await updateArticle(editing._id, { title: eTitle, slug: eSlug, content: eContent, status: eStatus });
      setList((p) => p.map((x) => (x._id === editing._id ? updated : x)));
      setOpenEdit(false);
    } catch (err: any) {
        // Idealmente, o modal de edição teria seu próprio estado de erro
        // Por enquanto, vamos mostrar na lista
        setListError(err?.response?.data?.message || "Erro ao salvar artigo.");
        setOpenEdit(false); // Fecha modal mesmo com erro
    } finally {
      setSaving(false);
    }
  }

  function askDelete(a: Article) {
    setListError(null); // Limpa erros da lista ao abrir modal
    setConfirmDelete(a);
  }

  async function proceedDelete() {
    if (!confirmDelete) return;
    setListError(null);
    try {
        await deleteArticle(confirmDelete._id);
        setList((p) => p.filter((x) => x._id !== confirmDelete._id));
        setConfirmDelete(null);
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Erro desconhecido ao excluir.";
        setListError(msg); // Mostra o erro no ErrorBanner da lista
        setConfirmDelete(null); 
    }
  }

  return (
    <>
      <Card title="Novo Artigo">
        <form onSubmit={onCreate} className="grid gap-4">
          <ErrorBanner message={createError} /> {/* <-- USA createError */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Slug">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-amigavel" />
            </Field>
          </div>
          <Field label="Conteúdo (Markdown)">
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </Field>
          <div className="flex items-center gap-3">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </Select>
            </Field>
            <Button type="submit" disabled={creating} className="ml-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
              {creating ? "Publicando..." : "Publicar artigo"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Artigos Publicados">
        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : (
        <>
          <ErrorBanner message={listError} /> {/* <-- USA listError */}
          <ul className="space-y-3 mt-4">
            {list.map((a) => (
              <li key={a._id} className="rounded-xl border bg-white p-4 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px]">{a.status}</span>
                    <span className="text-gray-400">/</span>
                    <span className="truncate">{a.slug}</span>
                    <span className="text-gray-400">/</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {a.content ? <div className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</div> : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" className="rounded-xl" onClick={() => askEdit(a)}>
                    Editar
                  </Button>
                  <Button variant="destructive" className="rounded-xl" onClick={() => askDelete(a)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </Card>

      <Dialog open={!!confirmEdit} onOpenChange={(v) => !v && setConfirmEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja editar este artigo?</DialogTitle>
            <DialogDescription>Você está prestes a abrir o editor deste artigo.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button className="rounded-lg" onClick={proceedEdit}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja excluir este artigo?</DialogTitle>
            <DialogDescription>Esta ação não poderá ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-lg" onClick={proceedDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar artigo</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {/* O ideal seria ter um ErrorBanner aqui dentro também */}
          <div className="grid gap-4">
            <Field label="Título">
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </Field>
            <Field label="Slug">
              <Input value={eSlug} onChange={(e) => setESlug(e.target.value)} />
            </Field>
            <Field label="Conteúdo">
              <Textarea rows={6} value={eContent} onChange={(e) => setEContent(e.target.value)} />
        _   </Field>
            <Field label="Status">
              <Select value={eStatus} onChange={(e) => setEStatus(e.target.value as any)}>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </Select>
            </Field>
            <div className="flex items-center gap-2">
              <Button className="ml-auto rounded-xl bg-purple-600 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ====================================================================
// --- VÍDEOS ---
// ====================================================================

function VideosPanel() {
  const [list, setList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  // --- Estados de erro separados ---
  const [createError, setCreateError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eCategory, setECategory] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmEdit, setConfirmEdit] = useState<Video | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Video | null>(null);

  async function load() {
    setLoading(true);
    setListError(null);
    try {
      setList(await getVideos());
    } catch (err: any) {
        setListError(err?.response?.data?.message || "Erro ao carregar vídeos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const ytId = useMemo(() => ytIdFrom(url), [url]);
  const normalized = ytId ? `https://www.youtube.com/watch?v=${ytId}` : "";
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : "";

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!title.trim()) return setCreateError("Informe um título.");
    if (!description.trim()) return setCreateError("Informe uma descrição.");
    if (!ytId) return setCreateError("URL do YouTube inválida.");
    setCreating(true);
    try {
      const created = await createVideo({
        title: title.trim(),
        description: description.trim(),
        youtubeUrl: normalized,
        ...(category.trim() ? { category: category.trim() } : {}),
      } as any);
      setList((p) => [created, ...p]);
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Erro ao criar vídeo.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  function askEdit(v: Video) {
    setListError(null);
    setConfirmEdit(v);
  }
  function proceedEdit() {
    if (!confirmEdit) return;
    const v = confirmEdit;
    setEditing(v);
    setETitle(v.title ?? "");
    setEDescription(v.description ?? "");
    setECategory((v as any).category ?? "");
    setEUrl((v as any).youtubeUrl ?? "");
    setOpenEdit(true);
    setConfirmEdit(null);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const ytIdE = ytIdFrom(eUrl);
      const normalizedE = ytIdE ? `https://www.youtube.com/watch?v=${ytIdE}` : eUrl;
      const updated = await updateVideo(editing._id, {
        title: eTitle.trim(),
        description: eDescription.trim(),
        youtubeUrl: normalizedE,
        category: eCategory.trim(),
      } as any);
      setList((p) => p.map((x) => (x._id === editing._id ? updated : x)));
      setOpenEdit(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Erro ao salvar vídeo.";
      setListError(msg);
      setOpenEdit(false);
    } finally {
      setSaving(false);
    }
  }

  function askDelete(v: Video) {
    setListError(null);
    setConfirmDelete(v);
  }
  
  async function proceedDelete() {
    if (!confirmDelete) return;
    setListError(null);
    try {
        await deleteVideo(confirmDelete._id);
        setList((p) => p.filter((x) => x._id !== confirmDelete._id));
        setConfirmDelete(null);
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Erro desconhecido ao excluir.";
        setListError(msg); 
        setConfirmDelete(null);
    }
  }

  return (
    <>
      <Card title="Novo Vídeo">
        <form onSubmit={onCreate} className="grid gap-4">
          <ErrorBanner message={createError} /> {/* <-- USA createError */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="URL do YouTube">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/..." />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Categoria (opcional)">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>

          {ytId ? (
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-video">
              <iframe className="absolute inset-0 h-full w-full" src={embedUrl} title="Preview vídeo" allowFullScreen />
            </div>
          ) : null}

          <Button type="submit" disabled={creating} className="ml-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
            {creating ? "Publicando..." : "Publicar vídeo"}
          </Button>
        </form>
      </Card>

      <Card title="Vídeos Publicados">
        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : (
        <>
          <ErrorBanner message={listError} /> {/* <-- USA listError */}
          <ul className="space-y-3 mt-4">
            {list.map((v) => (
              <li key={v._id} className="rounded-xl border bg-white p-4 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.title}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{(v as any).youtubeUrl}</div>
                  {(v as any).category ? <div className="text-xs text-gray-500 mt-1">Categoria: {(v as any).category}</div> : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" className="rounded-xl" onClick={() => askEdit(v)}>
                    Editar
                  </Button>
                  <Button variant="destructive" className="rounded-xl" onClick={() => askDelete(v)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </Card>

      <Dialog open={!!confirmEdit} onOpenChange={(v) => !v && setConfirmEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja editar este vídeo?</DialogTitle>
            <DialogDescription>Você está prestes a abrir o editor deste vídeo.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button className="rounded-lg" onClick={proceedEdit}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja excluir este vídeo?</DialogTitle>
            <DialogDescription>Esta ação não poderá ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-lg" onClick={proceedDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
  _     <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vídeo</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Título">
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </Field>
            <Field label="URL do YouTube">
              <Input value={eUrl} onChange={(e) => setEUrl(e.target.value)} placeholder="https://youtube.com/..." />
            </Field>
            <Field label="Descrição">
              <Textarea rows={4} value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
            </Field>
            <Field label="Categoria (opcional)">
              <Input value={eCategory} onChange={(e) => setECategory(e.target.value)} />
            </Field>
            {ytIdFrom(eUrl) ? (
              <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-video">
                <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${ytIdFrom(eUrl)}`} title="Preview edição" allowFullScreen />
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Button className="ml-auto rounded-xl bg-purple-600 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ====================================================================
// --- EVENTOS ---
// ====================================================================

function EventsPanel() {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  // --- Estados de erro separados ---
  const [createError, setCreateError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDate, setEDate] = useState("");
  const [eLocation, setELocation] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmEdit, setConfirmEdit] = useState<Event | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Event | null>(null);

  async function load() {
    setLoading(true);
    setListError(null);
    try {
      setList(await getEvents());
    } catch (err: any) {
        setListError(err?.response?.data?.message || "Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!title.trim() || !date.trim()) {
      setCreateError("Preencha título e data/hora.");
      return;
    }
    setCreating(true);
    try {
      const iso = toISO(date)!;
      const created = await createEvent({ title: title.trim(), date: iso, location: location.trim(), description: description.trim() });
      setList((p) => [created, ...p]);
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
    } catch (err: any) {
        setCreateError(err?.response?.data?.message || "Erro ao criar evento.");
    } finally {
      setCreating(false);
    }
  }

  function askEdit(ev: Event) {
    setListError(null);
    setConfirmEdit(ev);
  }
  function proceedEdit() {
    if (!confirmEdit) return;
    const ev = confirmEdit;
    setEditing(ev);
    setETitle(ev.title ?? "");
    setEDate(toDatetimeLocal(ev.date));
    setELocation(ev.location ?? "");
    setEDescription(ev.description ?? "");
    setOpenEdit(true);
    setConfirmEdit(null);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const iso = toISO(eDate)!;
      const updated = await updateEvent(editing._id, { title: eTitle, date: iso, location: eLocation, description: eDescription });
      setList((p) => p.map((x) => (x._id === editing._id ? updated : x)));
      setOpenEdit(false);
    } catch (err: any) {
        setListError(err?.response?.data?.message || "Erro ao salvar evento.");
        setOpenEdit(false);
    } finally {
      setSaving(false);
    }
  }

  function askDelete(ev: Event) {
    setListError(null);
    setConfirmDelete(ev);
  }
  
  async function proceedDelete() {
    if (!confirmDelete) return;
    setListError(null);
    try {
        await deleteEvent(confirmDelete._id);
        setList((p) => p.filter((x) => x._id !== confirmDelete._id));
        setConfirmDelete(null);
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Erro desconhecido ao excluir.";
        setListError(msg); 
        setConfirmDelete(null);
    }
  }

  return (
    <>
      <Card title="Novo Evento">
        <form onSubmit={onCreate} className="grid gap-4">
          <ErrorBanner message={createError} /> {/* <-- USA createError */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Data e Hora">
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Local (opcional)">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
            <div />
          </div>
          <Field label="Descrição (opcional)">
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Button type="submit" disabled={creating} className="ml-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
            {creating ? "Publicando..." : "Publicar evento"}
          </Button>
        </form>
      </Card>

      <Card title="Eventos Publicados">
        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : (
        <>
          <ErrorBanner message={listError} /> {/* <-- USA listError */}
          <ul className="space-y-3 mt-4">
            {list.map((ev) => (
              <li key={ev._id} className="rounded-xl border bg-white p-4 flex items-start justify-between">
s             <div className="min-w-0">
                  <div className="font-medium truncate">{ev.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(ev.date).toLocaleString("pt-BR")} {ev.location ? `• ${ev.location}` : ""}
                  </div>
                  {ev.description ? <div className="text-sm text-gray-600 mt-1 line-clamp-2">{ev.description}</div> : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" className="rounded-xl" onClick={() => askEdit(ev)}>
                    Editar
        _         </Button>
                  <Button variant="destructive" className="rounded-xl" onClick={() => askDelete(ev)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </Card>

      <Dialog open={!!confirmEdit} onOpenChange={(v) => !v && setConfirmEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja editar este evento?</DialogTitle>
            <DialogDescription>Você está prestes a abrir o editor deste evento.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button className="rounded-lg" onClick={proceedEdit}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja excluir este evento?</DialogTitle>
            <DialogDescription>Esta ação não poderá ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-lg" onClick={proceedDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
s_         <DialogDescription />
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Título">
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </Field>
            <Field label="Data e Hora">
              <Input type="datetime-local" value={eDate} onChange={(e) => setEDate(e.target.value)} />
            </Field>
            <Field label="Local">
              <Input value={eLocation} onChange={(e) => setELocation(e.target.value)} />
            </Field>
            <Field label="Descrição">
              <Textarea rows={4} value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
t         </Field>
            <div className="flex items-center">
              <Button className="ml-auto rounded-xl bg-purple-600 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ====================================================================
// --- AULAS ---
// ====================================================================

function ClassesPanel() {
  const [list, setList] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dtLocal, setDtLocal] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [maxStudents, setMaxStudents] = useState<string>("");
  const [creating, setCreating] = useState(false);
  // --- Estados de erro separados ---
  const [createError, setCreateError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<ClassSlot | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eDtLocal, setEDtLocal] = useState("");
  const [eDurationMinutes, setEDurationMinutes] = useState<string>("");
  const [eMaxStudents, setEMaxStudents] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [confirmEdit, setConfirmEdit] = useState<ClassSlot | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClassSlot | null>(null);

  async function load() {
    setLoading(true);
    setListError(null);
    try {
      setList(await getClassSlots());
    } catch (err: any) {
        setListError(err?.response?.data?.message || "Erro ao carregar aulas.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        dateTime: toISO(dtLocal),
      };
      if (durationMinutes.trim()) payload.durationMinutes = parseInt(durationMinutes, 10);
      if (maxStudents.trim()) payload.maxStudents = parseInt(maxStudents, 10);
      if (!payload.title || !payload.description || !payload.dateTime) {
        setCreateError("Preencha título, descrição e data/hora.");
        setCreating(false); // Adicionado para parar o "criando"
        return;
      }
      const created = await createClassSlot(payload as any);
      setList((p) => [created, ...p]);
      setTitle("");
      setDescription("");
      setDtLocal("");
      setDurationMinutes("");
      setMaxStudents("");
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Erro ao publicar aula.");
    } finally {
      setCreating(false);
    }
  }

  function askEdit(c: ClassSlot) {
    setListError(null);
    setConfirmEdit(c);
  }
  function proceedEdit() {
    if (!confirmEdit) return;
    const c = confirmEdit as any;
    setEditing(c);
    setETitle(c.title ?? "");
    setEDescription(c.description ?? "");
    setEDtLocal(toDatetimeLocal(c.dateTime));
    setEDurationMinutes(typeof c.durationMinutes === "number" ? String(c.durationMinutes) : "");
    setEMaxStudents(typeof c.maxStudents === "number" ? String(c.maxStudents) : "");
    setOpenEdit(true);
    setConfirmEdit(null);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const patch: any = {};
      if (eTitle.trim()) patch.title = eTitle.trim();
      if (eDescription.trim()) patch.description = eDescription.trim();
      const iso = toISO(eDtLocal);
      if (iso) patch.dateTime = iso;
      if (eDurationMinutes.trim()) patch.durationMinutes = parseInt(eDurationMinutes, 10);
      if (eMaxStudents.trim()) patch.maxStudents = parseInt(eMaxStudents, 10);
      const updated = await updateClassSlot(editing._id, patch as any);
      setList((p) => p.map((x) => (x._id === editing._id ? updated : x)));
      setOpenEdit(false);
    } catch (err: any) {
      setListError(err?.response?.data?.message || "Erro ao salvar aula.");
        setOpenEdit(false);
    } finally {
      setSaving(false);
    }
  }

  function askDelete(c: ClassSlot) {
    setListError(null);
    setConfirmDelete(c);
  }
  
  async function proceedDelete() {
    if (!confirmDelete) return;
    setListError(null);
    try {
        await deleteClassSlot(confirmDelete._id);
        setList((p) => p.filter((x) => x._id !== confirmDelete._id));
        setConfirmDelete(null);
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Erro desconhecido ao excluir.";
        setListError(msg); 
        setConfirmDelete(null);
    }
  }

  return (
    <>
      <Card title="Nova Aula">
        <form onSubmit={onCreate} className="grid gap-4">
          <ErrorBanner message={createError} /> {/* <-- USA createError */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Data e Hora">
              <Input type="datetime-local" value={dtLocal} onChange={(e) => setDtLocal(e.target.value)} />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Duração (min)">
              <Input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
Z           </Field>
      _     <Field label="Vagas">
              <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" disabled={creating} className="ml-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
            {creating ? "Publicando..." : "Publicar aula"}
          </Button>
        </form>
      </Card>

      <Card title="Aulas Publicadas">
        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : (
        <>
          <ErrorBanner message={listError} /> {/* <-- USA listError */}
          <ul className="space-y-3 mt-4">
            {list.map((c) => (
              <li key={c._id} className="rounded-xl border bg-white p-4 flex items-start justify-between">
                <div>
                  <div className="font-medium">{(c as any).title || "Aula"}</div>
                  <div className="text-sm text-gray-600">{(c as any).dateTime ? new Date((c as any).dateTime).toLocaleString() : ""}</div>
                  <div className="text-sm text-gray-700">{(c as any).description}</div>
                  <div className="text-xs text-gray-500">
                    {typeof (c as any).durationMinutes === "number" ? `Duração: ${(c as any).durationMinutes} min` : ""}
                    {typeof (c as any).maxStudents === "number" ? ` • Vagas: ${(c as any).maxStudents}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="rounded-xl" onClick={() => askEdit(c)}>
                    Editar
                  </Button>
                  <Button variant="destructive" className="rounded-xl" onClick={() => askDelete(c)}>
                    Excluir
                  </Button>
s             </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </Card>

      <Dialog open={!!confirmEdit} onOpenChange={(v) => !v && setConfirmEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja editar esta aula?</DialogTitle>
            <DialogDescription>Você está prestes a abrir o editor desta aula.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
  t         <Button className="rounded-lg" onClick={proceedEdit}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja excluir esta aula?</DialogTitle>
s           <DialogDescription>Esta ação não poderá ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
s           <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-lg" onClick={proceedDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Título">
                <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
              </Field>
              <Field label="Data e Hora">
                <Input type="datetime-local" value={eDtLocal} onChange={(e) => setEDtLocal(e.target.value)} />
F             </Field>
            </div>
        _   <Field label="Descrição">
              <Textarea rows={4} value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Duração (min)">
                <Input type="number" min={1} value={eDurationMinutes} onChange={(e) => setEDurationMinutes(e.target.value)} />
              </Field>
              <Field label="Vagas">
                <Input type="number" min={1} value={eMaxStudents} onChange={(e) => setEMaxStudents(e.target.value)} />
f           </Field>
            </div>
            <div className="flex items-center">
              <Button className="ml-auto rounded-xl bg-purple-600 text-white hover:bg-purple-700" onClick={onSaveEdit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
  Dos     </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useEffect, useState, useRef } from "react";
import {
    getArticles, createArticle, updateArticle, deleteArticle,
    getVideos, createVideo, updateVideo, deleteVideo,
    getEvents, createEvent, updateEvent, deleteEvent,
    getClassSlots, createClassSlot, updateClassSlot, deleteClassSlot,
    getWhatsAppGroups, createWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup,
    getDashboardStats, uploadImage, type DashboardStats,
    type Article, type Video, type Event, type ClassSlot,
    type WhatsAppGroup,
} from "../../lib/api";
import { Button } from "../../userui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../userui/components/ui/dialog";
import { ChevronLeft, Calendar, Video as VideoIcon, FileText, Users, Link, BarChart3, Camera, Loader2, ZoomIn, Image as ImageIcon, CheckCircle, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// --- UTILS DE CROP (Recorte de Imagem) ---
const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
});

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No 2d context");
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => { if (!blob) { reject(new Error('Canvas empty')); return; } resolve(blob); }, 'image/jpeg');
    });
}

type Tab = "Artigos" | "Vídeos" | "Eventos" | "Aulas" | "Grupos" | "Relatórios";
type Level = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos';
const levelOptions: Level[] = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

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
                        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-semibold">Painel da Professora</h1>
                </div>

                <div className="mb-6 rounded-2xl border bg-white shadow-sm px-2 py-2 overflow-x-auto">
                    <div className="grid grid-cols-6 gap-2 min-w-[600px]">
                        {([
                            { k: "Artigos", icon: <FileText className="w-4 h-4 mr-2" /> },
                            { k: "Vídeos", icon: <VideoIcon className="w-4 h-4 mr-2" /> },
                            { k: "Eventos", icon: <Calendar className="w-4 h-4 mr-2" /> },
                            { k: "Aulas", icon: <Users className="w-4 h-4 mr-2" /> },
                            { k: "Grupos", icon: <Link className="w-4 h-4 mr-2" /> },
                            { k: "Relatórios", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
                        ] as const).map(({ k, icon }) => (
                            <button
                                key={k}
                                onClick={() => setTab(k as Tab)}
                                className={`h-11 rounded-xl px-2 text-sm flex items-center justify-center transition whitespace-nowrap ${tab === (k as Tab) ? "bg-purple-600 text-white shadow" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                            >
                                {icon}{k}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === "Artigos" && <ArticlesPanel />}
                {tab === "Vídeos" && <VideosPanel />}
                {tab === "Eventos" && <EventsPanel />}
                {tab === "Aulas" && <ClassesPanel />}
                {tab === "Grupos" && <GroupsPanel />}
                {tab === "Relatórios" && <ReportsPanel />}
            </div>
        </div>
    );
}

// --- COMPONENTES VISUAIS ---
function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8 rounded-2xl border bg-white shadow-sm">
            <div className="px-5 pt-5"><div className="text-lg font-medium">{title}</div></div>
            <div className="p-5">{children}</div>
        </section>
    );
}
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return <label className={`flex flex-col gap-1 ${className || ""}`}><span className="text-sm text-gray-700">{label}</span>{children}</label>;
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

// --- NOVO COMPONENTE DE FEEDBACK (O Alerta Colorido) ---
type FeedbackType = 'success' | 'error' | null;
interface FeedbackState { type: FeedbackType; message: string; }

function FeedbackBanner({ feedback, onClose }: { feedback: FeedbackState | null, onClose: () => void }) {
    if (!feedback) return null;
    const isSuccess = feedback.type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    const styleClass = isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

    return (
        <div className={`rounded-xl border p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${styleClass}`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium">{feedback.message}</div>
            <button onClick={onClose} className="text-current opacity-60 hover:opacity-100"><X className="w-5 h-5" /></button>
        </div>
    );
}

// --- COMPONENTE DE UPLOAD DE CAPA ---
function CoverUpload({ value, onChange, loading }: { value: string, onChange: (url: string) => void, loading?: boolean }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [openCropModal, setOpenCropModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result as string);
                setOpenCropModal(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const showCroppedImage = async () => {
        try {
            setUploading(true);
            setOpenCropModal(false);
            const croppedImageBlob = await getCroppedImg(imageSrc!, croppedAreaPixels);
            const response = await uploadImage(croppedImageBlob);
            onChange(response.imageUrl);
        } catch (e) {
            console.error(e);
            alert("Erro ao enviar imagem. Verifique as chaves do Cloudinary.");
        } finally {
            setUploading(false);
            setImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">Imagem de Capa</span>
            <div className="relative w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                {value ? (
                    <img src={value} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">Nenhuma imagem</span>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-purple-700 hover:bg-gray-50">
                        <Camera className="w-4 h-4 mr-2" /> {value ? "Trocar" : "Adicionar"}
                    </Button>
                </div>

                {(loading || uploading) && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />

            <Dialog open={openCropModal} onOpenChange={setOpenCropModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Ajustar Capa</DialogTitle><DialogDescription>Recorte 16:9 (Padrão)</DialogDescription></DialogHeader>
                    <div className="relative w-full h-64 bg-gray-900 mt-4">
                        {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onCropComplete={(_, p) => setCroppedAreaPixels(p)} onZoomChange={setZoom} />}
                    </div>
                    <div className="mt-4 flex gap-4 items-center px-2">
                        <ZoomIn className="w-5 h-5 text-gray-500" />
                        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-purple-600" />
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setOpenCropModal(false)}>Cancelar</Button>
                        <Button onClick={showCroppedImage} className="bg-purple-600 text-white">Confirmar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ====================================================================
// --- PAINEL DE RELATÓRIOS (COMPLETO COM ARTIGOS RECENTES) ---
// ====================================================================
function ReportsPanel() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false)); }, []);

    const chartData = stats?.charts.usersByMonth.map((item) => ({ name: new Date(item._id.year, item._id.month - 1).toLocaleString('pt-BR', { month: 'short' }), Alunos: item.count })) || [];

    if (loading) return <div className="text-gray-500 py-10 text-center">Carregando relatórios...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-8 h-8" /></div><div><p className="text-sm text-gray-500 font-medium">Total Alunos</p><h2 className="text-3xl font-bold text-gray-800">{stats?.counts.students || 0}</h2></div></div>
                <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4"><div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><VideoIcon className="w-8 h-8" /></div><div><p className="text-sm text-gray-500 font-medium">Conteúdos</p><h2 className="text-3xl font-bold text-gray-800">{stats?.counts.content || 0}</h2></div></div>
                <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-xl"><Calendar className="w-8 h-8" /></div><div><p className="text-sm text-gray-500 font-medium">Aulas</p><h2 className="text-3xl font-bold text-gray-800">{stats?.counts.classes || 0}</h2></div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Novos Alunos (6 Meses)">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="Alunos" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card title="Últimas Publicações">
                        <div className="space-y-4">
                            {(!stats?.recentActivity?.articles || stats.recentActivity.articles.length === 0) ? (
                                <div className="text-gray-400 text-sm text-center py-8">Nenhuma atividade recente.</div>
                            ) : (
                                stats.recentActivity.articles.map((article) => (
                                    <div key={article._id} className="flex items-start justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${article.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate block" title={article.title}>
                                                    {article.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${article.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {article.status === 'PUBLISHED' ? 'PUBL' : 'RASC'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ====================================================================
// --- PAINEL DE ARTIGOS (Com Upload e Feedback) ---
// ====================================================================
function ArticlesPanel() {
    const [list, setList] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
    const [coverImage, setCoverImage] = useState(""); 
    const [creating, setCreating] = useState(false);
    
    // Feedback
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const feedbackTimerRef = useRef<any>(null);
    const showFeedback = (type: FeedbackType, message: string) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedback({ type, message });
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
    };

    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<Article | null>(null);
    const [eTitle, setETitle] = useState("");
    const [eSlug, setESlug] = useState("");
    const [eContent, setEContent] = useState("");
    const [eStatus, setEStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
    const [eCoverImage, setECoverImage] = useState(""); 
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Article | null>(null);

    useEffect(() => {
        getArticles().then(setList).catch(e => showFeedback('error', "Erro ao carregar artigos")).finally(() => setLoading(false));
        return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };
    }, []);

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setFeedback(null);
        if (!title.trim() || !content.trim()) return showFeedback('error', "Preencha título e conteúdo obrigatórios.");
        setCreating(true);
        try {
            const created = await createArticle({ title, content, status, coverImage }); 
            setList(p => [created, ...p]);
            setTitle(""); setContent(""); setStatus("PUBLISHED"); setCoverImage("");
            showFeedback('success', "Artigo publicado com sucesso!");
        } catch (err: any) { showFeedback('error', err?.response?.data?.message || "Erro ao criar artigo."); } 
        finally { setCreating(false); }
    }

    function openEditor(a: Article) {
        setEditing(a); setETitle(a.title); setESlug(a.slug); setEContent(a.content); setEStatus(a.status as any); setECoverImage(a.coverImage || "");
        setOpenEdit(true);
    }

    async function onSaveEdit() {
        if (!editing) return;
        setSaving(true);
        try {
            const updated = await updateArticle(editing._id, { title: eTitle, slug: eSlug, content: eContent, status: eStatus, coverImage: eCoverImage }); 
            setList(p => p.map(x => x._id === editing._id ? updated : x));
            setOpenEdit(false);
            showFeedback('success', "Artigo atualizado com sucesso!");
        } catch (err) { showFeedback('error', "Erro ao salvar alterações."); } 
        finally { setSaving(false); }
    }

    async function doDelete() {
        if (!confirmDelete) return;
        try {
            await deleteArticle(confirmDelete._id);
            setList(p => p.filter(x => x._id !== confirmDelete._id));
            setConfirmDelete(null);
            showFeedback('success', "Artigo excluído.");
        } catch { showFeedback('error', "Erro ao excluir artigo."); }
    }

    return (
        <>
            <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <Card title="Novo Artigo">
                <form onSubmit={onCreate} className="grid gap-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <Field label="Título *"><Input value={title} onChange={e => setTitle(e.target.value)} required /></Field>
                            <Field label="Conteúdo *"><Textarea rows={8} value={content} onChange={e => setContent(e.target.value)} required /></Field>
                        </div>
                        <div>
                            <CoverUpload value={coverImage} onChange={setCoverImage} loading={creating} />
                            <div className="mt-4">
                                <Field label="Status">
                                    <Select value={status} onChange={e => setStatus(e.target.value as any)}>
                                        <option value="PUBLISHED">Publicado</option>
                                        <option value="DRAFT">Rascunho</option>
                                    </Select>
                                </Field>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={creating} className="bg-purple-600 text-white">{creating ? "Publicando..." : "Publicar Artigo"}</Button>
                    </div>
                </form>
            </Card>

            <Card title="Artigos Publicados">
                {loading ? <div>Carregando...</div> : (
                    <ul className="space-y-3">
                        {list.map(a => (
                            <li key={a._id} className="border p-4 rounded-xl flex justify-between items-start bg-white">
                                <div className="flex gap-4">
                                    {a.coverImage && <img src={a.coverImage} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />}
                                    <div>
                                        <div className="font-medium">{a.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString()} • {a.status}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => openEditor(a)}>Editar</Button>
                                    <Button variant="destructive" onClick={() => setConfirmDelete(a)}>Excluir</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>Editar Artigo</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-2 space-y-4">
                            <Field label="Título"><Input value={eTitle} onChange={e => setETitle(e.target.value)} /></Field>
                            <Field label="Slug"><Input value={eSlug} onChange={e => setESlug(e.target.value)} /></Field>
                            <Field label="Conteúdo"><Textarea rows={8} value={eContent} onChange={e => setEContent(e.target.value)} /></Field>
                        </div>
                        <div className="space-y-4">
                            <CoverUpload value={eCoverImage} onChange={setECoverImage} />
                            <Field label="Status">
                                <Select value={eStatus} onChange={e => setEStatus(e.target.value as any)}>
                                    <option value="PUBLISHED">Publicado</option>
                                    <option value="DRAFT">Rascunho</option>
                                </Select>
                            </Field>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 gap-2">
                        <Button variant="secondary" onClick={() => setOpenEdit(false)}>Cancelar</Button>
                        <Button className="bg-purple-600 text-white" onClick={onSaveEdit} disabled={saving}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Excluir?</DialogTitle><DialogDescription>Irreversível.</DialogDescription></DialogHeader>
                    <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Não</Button><Button variant="destructive" onClick={doDelete}>Sim</Button></div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ====================================================================
// --- PAINEL DE EVENTOS (Com Upload e Feedback) ---
// ====================================================================
function EventsPanel() {
    const [list, setList] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState(""); 
    const [creating, setCreating] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const feedbackTimerRef = useRef<any>(null);
    const showFeedback = (type: FeedbackType, message: string) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedback({ type, message });
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
    };
    
    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<Event | null>(null);
    const [eTitle, setETitle] = useState("");
    const [eDate, setEDate] = useState("");
    const [eLocation, setELocation] = useState("");
    const [eDescription, setEDescription] = useState("");
    const [eCoverImage, setECoverImage] = useState(""); 
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Event | null>(null);

    useEffect(() => { getEvents().then(setList).finally(() => setLoading(false)); return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); }; }, []);

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setFeedback(null);
        if (!title || !date) return showFeedback('error', "Título e Data são obrigatórios.");
        setCreating(true);
        try {
            const created = await createEvent({ title, date: toISO(date)!, location, description, coverImage });
            setList(p => [created, ...p]);
            setTitle(""); setDate(""); setLocation(""); setDescription(""); setCoverImage("");
            showFeedback('success', "Evento criado com sucesso!");
        } catch { showFeedback('error', "Erro ao criar evento."); } 
        finally { setCreating(false); }
    }

    function openEditor(ev: Event) {
        setEditing(ev); setETitle(ev.title); setEDate(toDatetimeLocal(ev.date)); setELocation(ev.location || ""); setEDescription(ev.description || ""); setECoverImage(ev.coverImage || "");
        setOpenEdit(true);
    }

    async function onSaveEdit() {
        if (!editing) return;
        setSaving(true);
        try {
            const updated = await updateEvent(editing._id, { title: eTitle, date: toISO(eDate)!, location: eLocation, description: eDescription, coverImage: eCoverImage });
            setList(p => p.map(x => x._id === editing._id ? updated : x));
            setOpenEdit(false);
            showFeedback('success', "Evento atualizado!");
        } catch { showFeedback('error', "Erro ao salvar evento."); } 
        finally { setSaving(false); }
    }

    async function doDelete() {
        if (!confirmDelete) return;
        try {
            await deleteEvent(confirmDelete._id);
            setList(p => p.filter(x => x._id !== confirmDelete._id));
            setConfirmDelete(null);
            showFeedback('success', "Evento excluído.");
        } catch { showFeedback('error', "Erro ao excluir evento."); }
    }

    return (
        <>
             <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <Card title="Novo Evento">
                <form onSubmit={onCreate} className="grid gap-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Título *"><Input value={title} onChange={e => setTitle(e.target.value)} required /></Field>
                                <Field label="Data *"><Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required /></Field>
                            </div>
                            <Field label="Local"><Input value={location} onChange={e => setLocation(e.target.value)} /></Field>
                            <Field label="Descrição"><Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} /></Field>
                        </div>
                        <CoverUpload value={coverImage} onChange={setCoverImage} loading={creating} />
                    </div>
                    <div className="flex justify-end"><Button type="submit" disabled={creating} className="bg-purple-600 text-white">Publicar Evento</Button></div>
                </form>
            </Card>

            <Card title="Eventos">
                {loading ? <div>Carregando...</div> : (
                    <ul className="space-y-3">
                        {list.map(ev => (
                            <li key={ev._id} className="border p-4 rounded-xl flex justify-between items-start bg-white">
                                <div className="flex gap-4">
                                    {ev.coverImage && <img src={ev.coverImage} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />}
                                    <div>
                                        <div className="font-medium">{ev.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(ev.date).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{ev.location}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => openEditor(ev)}>Editar</Button>
                                    <Button variant="destructive" onClick={() => setConfirmDelete(ev)}>Excluir</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>Editar Evento</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-2 space-y-4">
                            <Field label="Título"><Input value={eTitle} onChange={e => setETitle(e.target.value)} /></Field>
                            <Field label="Data"><Input type="datetime-local" value={eDate} onChange={e => setEDate(e.target.value)} /></Field>
                            <Field label="Local"><Input value={eLocation} onChange={e => setELocation(e.target.value)} /></Field>
                            <Field label="Descrição"><Textarea rows={4} value={eDescription} onChange={e => setEDescription(e.target.value)} /></Field>
                        </div>
                        <CoverUpload value={eCoverImage} onChange={setECoverImage} />
                    </div>
                    <div className="flex justify-end mt-6 gap-2">
                        <Button variant="secondary" onClick={() => setOpenEdit(false)}>Cancelar</Button>
                        <Button className="bg-purple-600 text-white" onClick={onSaveEdit} disabled={saving}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Excluir?</DialogTitle><DialogDescription>Irreversível.</DialogDescription></DialogHeader>
                    <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Não</Button><Button variant="destructive" onClick={doDelete}>Sim</Button></div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function VideosPanel() {
    const [list, setList] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState<Level>("Todos");
    const [creating, setCreating] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const feedbackTimerRef = useRef<any>(null);
    const showFeedback = (type: FeedbackType, message: string) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedback({ type, message });
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
    };

    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<Video | null>(null);
    const [eTitle, setETitle] = useState("");
    const [eUrl, setEUrl] = useState("");
    const [eDescription, setEDescription] = useState("");
    const [eCategory, setECategory] = useState("");
    const [eLevel, setELevel] = useState<Level>("Todos");
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Video | null>(null);

    useEffect(() => { getVideos().then(setList).finally(() => setLoading(false)); return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };}, []);
    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setFeedback(null);
        if (!title || !url) return showFeedback('error', "Título e URL são obrigatórios.");
        setCreating(true);
        try {
            const ytId = ytIdFrom(url);
            const created = await createVideo({ title, description, youtubeUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : url, level, category });
            setList(p => [created, ...p]);
            setTitle(""); setUrl(""); setDescription(""); setCategory("");
            showFeedback('success', "Vídeo publicado!");
        } catch { showFeedback('error', "Erro ao publicar vídeo."); } finally { setCreating(false); }
    }
    function openEditor(v: Video) { setEditing(v); setETitle(v.title); setEUrl(v.youtubeUrl || ""); setEDescription(v.description || ""); setECategory(v.category || ""); setELevel(v.level as Level || "Todos"); setOpenEdit(true); }
    async function onSaveEdit() {
        if (!editing) return;
        setSaving(true);
        try {
            const updated = await updateVideo(editing._id, { title: eTitle, description: eDescription, youtubeUrl: eUrl, level: eLevel, category: eCategory });
            setList(p => p.map(x => x._id === editing._id ? updated : x));
            setOpenEdit(false);
            showFeedback('success', "Vídeo atualizado!");
        } catch { showFeedback('error', "Erro ao salvar vídeo."); } finally { setSaving(false); }
    }
    async function doDelete() { if (!confirmDelete) return; try { await deleteVideo(confirmDelete._id); setList(p => p.filter(x => x._id !== confirmDelete._id)); setConfirmDelete(null); showFeedback('success', "Vídeo excluído."); } catch { showFeedback('error', "Erro ao excluir."); } }

    return (
        <>
            <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <Card title="Novo Vídeo">
                <form onSubmit={onCreate} className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4"><Field label="Título *"><Input value={title} onChange={e => setTitle(e.target.value)} required /></Field><Field label="YouTube URL *"><Input value={url} onChange={e => setUrl(e.target.value)} required /></Field></div>
                    <Field label="Descrição"><Textarea value={description} onChange={e => setDescription(e.target.value)} /></Field>
                    <div className="grid md:grid-cols-2 gap-4"><Field label="Categoria"><Input value={category} onChange={e => setCategory(e.target.value)} /></Field><Field label="Nível"><Select value={level} onChange={e => setLevel(e.target.value as any)}>{levelOptions.map(o => <option key={o} value={o}>{o}</option>)}</Select></Field></div>
                    <div className="flex justify-end"><Button type="submit" disabled={creating} className="bg-purple-600 text-white">Publicar</Button></div>
                </form>
            </Card>
            <Card title="Vídeos">
                <ul className="space-y-3">{list.map(v => (
                    <li key={v._id} className="border p-4 rounded-xl flex justify-between bg-white">
                        <div><div className="font-medium">{v.title}</div><div className="text-xs text-gray-500">{v.level} • {v.category}</div></div>
                        <div className="flex gap-2"><Button variant="secondary" onClick={() => openEditor(v)}>Editar</Button><Button variant="destructive" onClick={() => setConfirmDelete(v)}>Excluir</Button></div>
                    </li>
                ))}</ul>
            </Card>
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent><DialogHeader><DialogTitle>Editar Vídeo</DialogTitle></DialogHeader>
                    <div className="grid gap-4"><Field label="Título"><Input value={eTitle} onChange={e => setETitle(e.target.value)} /></Field><Field label="URL"><Input value={eUrl} onChange={e => setEUrl(e.target.value)} /></Field><Field label="Descrição"><Textarea value={eDescription} onChange={e => setEDescription(e.target.value)} /></Field><div className="flex justify-end"><Button onClick={onSaveEdit}>Salvar</Button></div></div>
                </DialogContent>
            </Dialog>
            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent><DialogHeader><DialogTitle>Excluir?</DialogTitle></DialogHeader><div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Não</Button><Button variant="destructive" onClick={doDelete}>Sim</Button></div></DialogContent>
            </Dialog>
        </>
    );
}

function ClassesPanel() {
    const [list, setList] = useState<ClassSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState(""); const [dt, setDt] = useState(""); const [desc, setDesc] = useState(""); const [dur, setDur] = useState(""); const [max, setMax] = useState(""); const [lvl, setLvl] = useState<Level>("Todos");
    const [creating, setCreating] = useState(false);
    
    // Feedback
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const feedbackTimerRef = useRef<any>(null);
    const showFeedback = (type: FeedbackType, message: string) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedback({ type, message });
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
    };

    const [confirmDelete, setConfirmDelete] = useState<ClassSlot | null>(null);

    useEffect(() => { getClassSlots().then(setList).finally(() => setLoading(false)); return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };}, []);
    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setFeedback(null);
        if (!title || !dt) return showFeedback('error', "Preencha os campos obrigatórios.");
        setCreating(true);
        try { const created = await createClassSlot({ title, description: desc, dateTime: toISO(dt), durationMinutes: Number(dur), maxStudents: Number(max), level: lvl } as any); setList(p => [created, ...p]); setTitle(""); setDt(""); setDesc(""); setDur(""); setMax(""); showFeedback('success', "Aula agendada!"); } catch { showFeedback('error', "Erro ao agendar aula."); } finally { setCreating(false); }
    }
    async function doDelete() { if (!confirmDelete) return; try { await deleteClassSlot(confirmDelete._id); setList(p => p.filter(x => x._id !== confirmDelete._id)); setConfirmDelete(null); showFeedback('success', "Aula excluída."); } catch { showFeedback('error', "Erro ao excluir."); } }

    return (
        <>
            <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <Card title="Nova Aula">
                <form onSubmit={onCreate} className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4"><Field label="Título *"><Input value={title} onChange={e => setTitle(e.target.value)} required /></Field><Field label="Data *"><Input type="datetime-local" value={dt} onChange={e => setDt(e.target.value)} required /></Field></div>
                    <Field label="Descrição"><Textarea value={desc} onChange={e => setDesc(e.target.value)} /></Field>
                    <div className="grid md:grid-cols-3 gap-4"><Field label="Duração (min)"><Input type="number" value={dur} onChange={e => setDur(e.target.value)} /></Field><Field label="Vagas"><Input type="number" value={max} onChange={e => setMax(e.target.value)} /></Field><Field label="Nível"><Select value={lvl} onChange={e => setLvl(e.target.value as any)}>{levelOptions.map(o => <option key={o} value={o}>{o}</option>)}</Select></Field></div>
                    <div className="flex justify-end"><Button type="submit" disabled={creating} className="bg-purple-600 text-white">Agendar Aula</Button></div>
                </form>
            </Card>
            <Card title="Aulas"><ul className="space-y-3">{list.map(c => <li key={c._id} className="border p-4 rounded-xl flex justify-between bg-white"><div><div className="font-medium">{c.title}</div><div className="text-xs text-gray-500">{new Date(c.dateTime).toLocaleString()}</div></div><Button variant="destructive" onClick={() => setConfirmDelete(c)}>Excluir</Button></li>)}</ul></Card>
            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent><DialogHeader><DialogTitle>Excluir?</DialogTitle></DialogHeader><div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Não</Button><Button variant="destructive" onClick={doDelete}>Sim</Button></div></DialogContent>
            </Dialog>
        </>
    );
}

function GroupsPanel() {
    const [list, setList] = useState<WhatsAppGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(""); const [link, setLink] = useState(""); const [desc, setDesc] = useState("");
    const [creating, setCreating] = useState(false);
    
    // Feedback
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const feedbackTimerRef = useRef<any>(null);
    const showFeedback = (type: FeedbackType, message: string) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedback({ type, message });
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
    };

    const [confirmDelete, setConfirmDelete] = useState<WhatsAppGroup | null>(null);

    useEffect(() => { getWhatsAppGroups().then(setList).finally(() => setLoading(false)); return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };}, []);
    async function onCreate(e: React.FormEvent) { e.preventDefault(); setFeedback(null); if (!name || !link) return showFeedback('error', "Preencha os campos obrigatórios."); setCreating(true); try { const created = await createWhatsAppGroup({ name, joinLink: link, description: desc }); setList(p => [created, ...p]); setName(""); setLink(""); setDesc(""); showFeedback('success', "Grupo criado!"); } catch { showFeedback('error', "Erro ao criar grupo."); } finally { setCreating(false); } }
    async function doDelete() { if (!confirmDelete) return; try { await deleteWhatsAppGroup(confirmDelete._id); setList(p => p.filter(x => x._id !== confirmDelete._id)); setConfirmDelete(null); showFeedback('success', "Grupo excluído."); } catch { showFeedback('error', "Erro ao excluir."); } }

    return (
        <>
            <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <Card title="Novo Grupo">
                <form onSubmit={onCreate} className="grid gap-4"><div className="grid md:grid-cols-2 gap-4"><Field label="Nome *"><Input value={name} onChange={e => setName(e.target.value)} required /></Field><Field label="Link *"><Input value={link} onChange={e => setLink(e.target.value)} required /></Field></div><Field label="Descrição"><Textarea value={desc} onChange={e => setDesc(e.target.value)} /></Field><div className="flex justify-end"><Button type="submit" disabled={creating} className="bg-purple-600 text-white">Criar Grupo</Button></div></form>
            </Card>
            <Card title="Grupos"><ul className="space-y-3">{list.map(g => <li key={g._id} className="border p-4 rounded-xl flex justify-between bg-white"><div><div className="font-medium">{g.name}</div><div className="text-xs text-gray-500">{g.joinLink}</div></div><Button variant="destructive" onClick={() => setConfirmDelete(g)}>Excluir</Button></li>)}</ul></Card>
            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent><DialogHeader><DialogTitle>Excluir?</DialogTitle></DialogHeader><div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Não</Button><Button variant="destructive" onClick={doDelete}>Sim</Button></div></DialogContent>
            </Dialog>
        </>
    );
}
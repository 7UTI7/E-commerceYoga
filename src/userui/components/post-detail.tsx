// src/userui/components/post-detail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, BarChart3, Star } from "lucide-react";

import {
  getArticleByIdOrSlug,
  getVideoById,
  getEventById,
  getClassSlotById,
  type Article,
  type Event,
  type Video,
  type ClassSlot,
  type Comment, // <-- ADICIONADO (para a prop 'comments')
} from "../../lib/api";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getFigmaImage } from "../figmaImages";

import { useAuth } from "../../contexts/AuthContext"; //

// +++ IMPORTAÇÃO DO NOVO COMPONENTE +++
import CommentsSection from "./CommentsSection"; // <-- ADICIONADO (verifique o caminho)

type Kind = "article" | "video" | "event" | "class" | "group";
type UiCategory = "Artigos" | "Vídeos" | "Eventos" | "Aulas" | "Grupos";

function kindToUi(kind: Kind): UiCategory {
  switch (kind) {
    case "article": return "Artigos";
    case "video": return "Vídeos";
    case "event": return "Eventos";
    case "class": return "Aulas";
    case "group": return "Grupos";
  }
}

// +++ TIPO 'Unified' ATUALIZADO +++
type Unified = {
  id: string;
  kind: Kind;
  title: string;
  category: UiCategory;
  dateLabel?: string;
  timeLabel?: string;
  duration?: string;
  location?: string;
  levelLabel?: string;
  excerpt?: string;
  fullDescription?: string;
  image: string;
  youtubeId?: string;
  comments?: Comment[]; // <-- ADICIONADO
};

function youtubeIdFromAny(url?: string): string | undefined {
  if (!url) return undefined;
  const m = /(youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/i.exec(url);
  return m?.[2] || undefined;
}

const safeImage = (src?: string) => src || "/assets/cover-default.jpg";

export default function PostDetail() {
  const { kind, id } = useParams<{ kind: Kind; id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Unified | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user, favoriteVideoIds, toggleFavorite } = useAuth(); //

  const [openWhats, setOpenWhats] = useState(false);
  const whatsappHref =
    "https://wa.me/5511999999999?text=Oi%20Karla!%20Quero%20agendar%20uma%20aula%20de%20Yoga.%20Pode%20me%20ajudar%3F";

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!kind || !id) return;

      if (kind === 'group') {
        navigate(-1);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let unified: Unified | null = null;

        // Os 'comments' já estão sendo incluídos na busca
        if (kind === "article") {
          const a: Article = await getArticleByIdOrSlug(id); //
          unified = {
            id: a._id,
            kind,
            title: a.title,
            category: kindToUi(kind),
            dateLabel: a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : undefined,
            excerpt: a.content?.trim() ? a.content.slice(0, 180) : undefined,
            fullDescription: a.content,
            image: safeImage(a.coverImage || getFigmaImage("article", a)),
            comments: a.comments || [], // <-- ADICIONADO
          };
        }

        if (kind === "video") {
          const v: Video = await getVideoById(id); //
          const ytId = youtubeIdFromAny(v.youtubeUrl || v.url);
          unified = {
            id: v._id,
            kind,
            title: v.title,
            category: kindToUi(kind),
            dateLabel: v.createdAt ? new Date(v.createdAt).toLocaleDateString("pt-BR") : undefined,
            levelLabel: v.level,
            excerpt: v.description,
            fullDescription: v.description,
            image: safeImage(getFigmaImage("video", v)),
            youtubeId: ytId,
            comments: v.comments || [], // <-- ADICIONADO
          };
        }

        if (kind === "event") {
          const e: Event = await getEventById(id);
          unified = {
            id: e._id,
            kind,
            title: e.title,
            category: kindToUi(kind),
            dateLabel: e.date ? new Date(e.date).toLocaleString("pt-BR") : undefined,
            location: e.location,
            excerpt: e.description?.trim() ? e.description.slice(0, 180) : undefined,
            fullDescription: e.description,
            image: safeImage(getFigmaImage("event", e)),
            // (Eventos não têm comentários)
          };
        }

        if (kind === "class") {
          const c: ClassSlot = await getClassSlotById(id);
          unified = {
            id: c._id,
            kind,
            title: c.title || (c.modality ? `Aula de ${c.modality}` : "Aula de Yoga"),
            category: kindToUi(kind),
            dateLabel: c.dateTime ? new Date(c.dateTime).toLocaleDateString("pt-BR") : undefined,
            timeLabel: c.dateTime ? new Date(c.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
            duration: typeof c.durationMinutes === "number" ? `${c.durationMinutes} min` : undefined,
            levelLabel: c.level,
            excerpt: c.description?.trim() ? c.description.slice(0, 180) : undefined,
            fullDescription: c.description,
            image: safeImage(getFigmaImage("class", c)),
            // (Aulas não têm comentários)
          };
        }

        if (alive) setItem(unified);
      } catch (err: any) {
        if (alive) {
          setError(err?.response?.data?.message || "Não foi possível carregar o conteúdo.");
          setItem(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [kind, id, navigate]);

  const isFavorited = useMemo(() => {
    if (!item || item.kind !== 'video') return false;
    return favoriteVideoIds.includes(item.id); //
  }, [item, favoriteVideoIds]);

  const showFavoriteStar = item?.kind === 'video' && user; //

  const handleFavoriteClick = () => {
    if (item && item.kind === 'video') {
      toggleFavorite(item.id); //
    }
  };

  const isEvent = item?.kind === "event";
  const isClass = item?.kind === "class";
  // +++ ATUALIZADO (para verificar se é artigo ou vídeo) +++
  const canHaveComments = item?.kind === 'article' || item?.kind === 'video';

  const categoryLabel = item?.category || "";

  const ctaBlock = useMemo(() => {
    if (!item) return null;
    if (isEvent) {
      return {
        title: "Pronto para participar?",
        text: "Entre em contato e garanta sua vaga no evento com a Professora Karla Rodrigues.",
        action: "Participe!",
        variant: "outline" as const,
      };
    }
    if (isClass) {
      return {
        title: "Pronto para começar sua jornada?",
        text: "Entre em contato e agende sua aula com a Professora Karla Rodrigues.",
        action: "Agendar Aula",
        variant: "solid" as const,
      };
    }
    return null;
  }, [item, isEvent, isClass]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-500">
        Carregando…
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-2xl font-semibold mb-2">Ops</div>
          <p className="text-gray-600 mb-6">{error || "Conteúdo não encontrado."}</p>
          <Button className="rounded-lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  const dateLabel = item.dateLabel || "";
  const timeLabel = item.timeLabel || "";
  const location = item.location || "";
  const duration = item.duration || "";
  const levelLabel = item.levelLabel || "";
  const embedSrc = item.youtubeId ? `https://www.youtube.com/embed/${item.youtubeId}` : "";

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Button>
        </div>
      </div>

      <div className="relative h-[460px] overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white z-10">
          <div className="mx-auto max-w-5xl">
            <div className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm mb-4">
              {categoryLabel}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-white mb-0">{item.title}</h1>
              {showFavoriteStar && (
                <button
                  onClick={handleFavoriteClick}
                  className="p-1 rounded-full text-white/70 hover:text-white"
                  aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Star className={`w-7 h-7 transition-colors ${isFavorited
                      ? 'fill-yellow-400 stroke-yellow-400'
                      : 'fill-transparent stroke-currentColor'
                    }`} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-white/90 mt-4">
              {dateLabel && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{dateLabel}</span>
                </div>
              )}
              {timeLabel && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{timeLabel}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{location}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{duration}</span>
                </div>
              )}
              {levelLabel && (
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>{levelLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {item.excerpt && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border-l-4 border-purple-600">
            <h3 className="text-purple-900 mb-3">Resumo</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{item.excerpt}</p>
          </div>
        )}

        {item.kind === "article" && item.fullDescription && (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {item.fullDescription}
            </p>
          </div>
        )}

        {item.kind === "video" && (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-5">
            {embedSrc ? (
              <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={embedSrc}
                  title={item.title}
                  allowFullScreen
                />
              </div>
            ) : null}
            {item.fullDescription && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.fullDescription}</p>
            )}
          </div>
        )}

        {(isEvent || isClass) && item.fullDescription && (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.fullDescription}</p>
          </div>
        )}

        {/* +++ SEÇÃO DE COMENTÁRIOS ADICIONADA +++ */}
        {canHaveComments && (
          <CommentsSection
            postId={item.id}
            kind={item.kind as 'article' | 'video'} // Nós sabemos que é um desses
            initialComments={item.comments || []}
          />
        )}

        {ctaBlock && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-xl p-8 text-center text-white">
            <h3 className="text-white mb-3">{ctaBlock.title}</h3>
            <p className="mb-6 text-purple-100">{ctaBlock.text}</p>

            <Button
              className={`px-6 md:px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors ${isEvent
                ? "bg-white hover:bg-gray-50 border-2 border-green-500 text-green-600"
                : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              onClick={() => setOpenWhats(true)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {ctaBlock.action}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={openWhats} onOpenChange={setOpenWhats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir WhatsApp?</DialogTitle>
            {/* Corrigido o typo */}
            <DialogDescription>
              Este link abrirá o WhatsApp em uma nova aba para {isEvent ? "participar do evento" : "agendar sua aula"}. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button
              className="rounded-lg"
              onClick={() => {
                window.open(whatsappHref, "_blank", "noopener,noreferrer");
                setOpenWhats(false);
              }}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
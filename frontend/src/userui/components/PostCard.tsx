import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Tag, BarChart3, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { useAuth } from "../../contexts/AuthContext";

export interface PostCardProps {
  id: string;
  kind: "article" | "video" | "event" | "class" | "group";
  title: string;
  description?: string;
  image?: string;
  date?: string;
  joinLink?: string;
  level?: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos';
  isFavorited: boolean;
  onToggleFavorite: (videoId: string) => void;
}

function mapKindToCategory(kind: PostCardProps["kind"]) {
  switch (kind) {
    case "article": return "Artigo";
    case "video": return "Vídeo";
    case "event": return "Evento";
    case "class": return "Aula";
    case "group": return "Grupo";
    default: return "Post";
  }
}

export default function PostCard({
  id,
  kind,
  title,
  description,
  image,
  date,
  joinLink,
  level,
  isFavorited,
  onToggleFavorite
}: PostCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (kind === 'group' && joinLink) {
      e.preventDefault();
      setConfirmOpen(true);
    } else {
      navigate(`/post/${kind}/${id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  const category = mapKindToCategory(kind);
  const formattedDate = date ? new Date(date).toLocaleDateString("pt-BR") : "";

  const showLevel = (kind === 'video' || kind === 'class') && level;
  const showFavoriteStar = kind === 'video' && user;

  return (
    <>
      <article
        className="w-full relative bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isHovered ? '0 10px 40px rgba(147, 51, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: isHovered ? 10 : 1
        }}
      >
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="w-full h-48 md:w-48 md:h-48 md:flex-shrink-0 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 text-sm font-medium">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex-1 p-4 md:p-6 flex flex-col">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 flex-1 leading-tight md:pr-4">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-purple-700 text-sm flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{category}</span>
                </div>
                {showFavoriteStar && (
                  <button
                    onClick={handleFavoriteClick}
                    className="p-0.5 rounded-full text-gray-400 hover:text-yellow-500"
                    aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Star className={`w-5 h-5 transition-colors ${isFavorited
                      ? 'fill-yellow-400 stroke-yellow-400 text-yellow-400'
                      : 'fill-transparent stroke-currentColor'
                      }`} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2 flex-grow">{description || ""}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-auto">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              {showLevel && (
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{level}</span>
                </div>
              )}
            </div>

            <div
              className="mt-0 transition-all duration-300"
              style={{
                maxHeight: isHovered ? '200px' : '0',
                opacity: isHovered ? 1 : 0,
                overflow: 'hidden',
                marginTop: isHovered ? '1rem' : '0'
              }}
            >
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-700 mb-2">{description || "Mais detalhes sobre este post..."}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Abrir WhatsApp?</DialogTitle>
            <DialogDescription>
              Você está prestes a abrir um link de grupo do WhatsApp. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              className="rounded-lg"
              onClick={() => {
                if (joinLink) {
                  window.open(joinLink, "_blank", "noopener,noreferrer");
                }
                setConfirmOpen(false);
              }}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
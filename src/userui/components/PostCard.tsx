import { useState } from "react"; // 'useState' já estava
import { useNavigate } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";

// +++ 1. IMPORTAR COMPONENTES DO MODAL +++
// (Estou assumindo os caminhos com base no seu EventsCarousel.tsx)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

export interface PostCardProps {
  id: string;
  kind: "article" | "video" | "event" | "class" | "group";
  title: string;
  description?: string;
  image?: string;
  date?: string;
  joinLink?: string;
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
  joinLink
}: PostCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // +++ 2. ADICIONAR ESTADO PARA O MODAL +++
  const [confirmOpen, setConfirmOpen] = useState(false);

  // +++ 3. ATUALIZAR O HANDLER DE CLIQUE +++
  const handleClick = (e: React.MouseEvent) => {
    // Se for um grupo, previna a ação padrão e abra o modal
    if (kind === 'group' && joinLink) {
      e.preventDefault(); // Impede outros comportamentos
      setConfirmOpen(true);
    } else {
      // Comportamento padrão para outros tipos
      navigate(`/post/${kind}/${id}`);
    }
  };

  const category = mapKindToCategory(kind);
  const formattedDate = date ? new Date(date).toLocaleDateString("pt-BR") : "";

  // +++ 4. ENVOLVER RETORNO EM FRAGMENT (<>) +++
  return (
    <>
      <article
        className="w-full relative bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick} // <-- Chama o novo handler
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isHovered ? '0 10px 40px rgba(147, 51, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: isHovered ? 10 : 1
        }}
      >
        <div className="flex gap-4">
          {/* Imagem */}
          <div className="w-48 h-48 flex-shrink-0 overflow-hidden">
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

          {/* Conteúdo */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 flex-1 pr-4">
                {title}
              </h3>
              <div className="flex items-center gap-1 text-purple-700 text-sm ml-4 flex-shrink-0">
                <Tag className="w-4 h-4" />
                <span>{category}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{description || ""}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Conteúdo Expandido */}
            <div
              className="mt-4 transition-all duration-300"
              style={{
                maxHeight: isHovered ? '200px' : '0',
                opacity: isHovered ? 1 : 0,
                overflow: 'hidden'
              }}
            >
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-700 mb-2">{description || "Mais detalhes sobre este post..."}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* +++ 5. ADICIONAR O MODAL (copiado do carrossel) +++ */}
      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen} // Controla o fechamento
      >
        <DialogContent
          // Impede que o clique DENTRO do modal feche ele
          onPointerDownOutside={(e) => e.preventDefault()}
          // Impede que o clique DENTRO do modal dispare o onClick do <article>
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
                // Ação principal: abrir o link e fechar o modal
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
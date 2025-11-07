import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Tag } from "lucide-react"; // Você vai precisar instalar (npm install lucide-react)

// A interface de props do seu arquivo original
export interface PostCardProps {
  id: string;
  kind: "article" | "video" | "event" | "class";
  title: string;
  description?: string;
  image?: string;
  date?: string;
}

// Helper para traduzir 'kind' em 'category'
function mapKindToCategory(kind: PostCardProps["kind"]) {
  switch (kind) {
    case "article": return "Artigo";
    case "video": return "Vídeo";
    case "event": return "Evento";
    case "class": return "Aula";
    default: return "Post";
  }
}

export default function PostCard({ id, kind, title, description, image, date }: PostCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Lógica de clique do seu arquivo original
  const handleClick = () => {
    navigate(`/post/${kind}/${id}`);
  };

  const category = mapKindToCategory(kind);
  const formattedDate = date ? new Date(date).toLocaleDateString("pt-BR") : "";

  return (
    <article
      className="w-full relative bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        // Efeito de sombra e escala do Figma
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

          {/* Usamos a 'description' como 'excerpt' */}
          <p className="text-gray-700 mb-4 line-clamp-2">{description || ""}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            {/* Note: 'duration' não existe na sua prop 'Item', então foi removido */}
          </div>

          {/* Conteúdo Expandido (do Figma) */}
          <div
            className="mt-4 transition-all duration-300"
            style={{
              maxHeight: isHovered ? '200px' : '0',
              opacity: isHovered ? 1 : 0,
              overflow: 'hidden'
            }}
          >
            <div className="border-t border-gray-200 pt-4">
              {/* Usamos 'description' aqui também como 'fullDescription' */}
              <p className="text-gray-700 mb-2">{description || "Mais detalhes sobre este post..."}</p>
              {/* Note: 'instructor' não existe na sua prop 'Item', então foi removido */}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
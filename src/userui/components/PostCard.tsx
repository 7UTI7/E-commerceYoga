import { useNavigate } from "react-router-dom";

export interface PostCardProps {
  id: string;
  kind: "article" | "video" | "event" | "class";
  title: string;
  description?: string;
  image?: string;
  date?: string;
}

export default function PostCard({ id, kind, title, description, image, date }: PostCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${kind}/${id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 flex h-full flex-col"
    >
      {/* Imagem */}
      {image ? (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 text-sm font-medium">
          Sem imagem
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-2">
          {title}
        </h3>

        {/* ocupa espaço mínimo para não encolher em Aulas */}
        <p className="mt-2 text-sm text-gray-600 line-clamp-3 min-h-[48px]">
          {description || ""}
        </p>

        {/* Rodapé (cola no fim) */}
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">
            {kind === "article" && "Artigo"}
            {kind === "video" && "Vídeo"}
            {kind === "event" && "Evento"}
            {kind === "class" && "Aula"}
          </span>
          {date && <span>{new Date(date).toLocaleDateString("pt-BR")}</span>}
        </div>
      </div>
    </article>
  );
}

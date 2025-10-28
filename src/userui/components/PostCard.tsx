// src/userui/components/PostCard.tsx
import React from "react";

export type PostCardProps = {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image?: string;
  item?: any; // objeto bruto (Article/Video/Event/ClassSlot) se quiser abrir modal/detalhe
  onClick?: (item: any) => void;
};

export const PostCard: React.FC<PostCardProps> = ({
  title,
  category,
  date,
  excerpt,
  image = "/assets/placeholder.jpg",
  item,
  onClick,
}) => {
  return (
    <article
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition"
      role="button"
      onClick={() => onClick?.(item)}
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
            {category}
          </span>
          <time className="tabular-nums">{date}</time>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{excerpt}</p>
      </div>
    </article>
  );
};

// Se em algum lugar você estiver importando como default, isso evita quebrar:
export default PostCard;

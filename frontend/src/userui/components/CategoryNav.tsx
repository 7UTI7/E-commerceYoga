import React from "react";
// Lembre-se de atualizar este tipo no arquivo de origem
import type { UiCategory as OriginalUiCategory } from "../userApp";

type UiCategory = OriginalUiCategory | "Grupos" | "Favoritos";

type Props = {
  activeCategory: UiCategory;
  onCategoryChange: (category: UiCategory) => void;
};

const CATEGORIES: UiCategory[] = ["Recentes", "Artigos", "Vídeos", "Eventos", "Aulas", "Grupos", "Favoritos"];

export function CategoryNav({ activeCategory, onCategoryChange }: Props) {
  return (
    <nav className="sticky top-[72px] z-40 bg-[#7B2CF6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* --- CORREÇÃO DE ALINHAMENTO ---
            justify-start: No celular, começa da esquerda para permitir scroll.
            md:justify-center: No PC, centraliza os itens.
        */}
        <div className="
            flex flex-nowrap items-center gap-3 py-4 overflow-x-auto 
            justify-start md:justify-center
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-track]:bg-purple-800
            [&::-webkit-scrollbar-thumb]:bg-purple-300
            [&::-webkit-scrollbar-thumb]:rounded-full
        ">
          {CATEGORIES.map((label) => {
            const active = activeCategory === label;
            return (
              <button
                key={label}
                onClick={() => onCategoryChange(label)}
                className={[
                  "flex-shrink-0 px-5 py-2 rounded-[20px] text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-white/50",
                  // --- CORREÇÃO DAS CORES (VOLTAR AO ORIGINAL) ---
                  active
                    ? "bg-white/25 text-white shadow-inner" // Estilo Original (Roxinho claro/transparente)
                    : "text-white hover:bg-white/10"        // Estilo Inativo Original
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
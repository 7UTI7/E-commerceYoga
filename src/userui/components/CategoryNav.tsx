import React from "react";
// Lembre-se de atualizar este tipo no arquivo de origem (ex: src/userApp.ts)
// para incluir "Grupos" e "Favoritos"
import type { UiCategory as OriginalUiCategory } from "../userApp";

// +++ ATUALIZADO +++
// Criamos um tipo local que estende o original, adicionando os novos itens
type UiCategory = OriginalUiCategory | "Grupos" | "Favoritos";

type Props = {
  activeCategory: UiCategory;
  onCategoryChange: (category: UiCategory) => void;
};

// +++ "Favoritos" ADICIONADO AO ARRAY +++
const CATEGORIES: UiCategory[] = ["Recentes", "Artigos", "Vídeos", "Eventos", "Aulas", "Grupos", "Favoritos"];

export function CategoryNav({ activeCategory, onCategoryChange }: Props) {
  return (
    <nav className="sticky top-[72px] z-40">
      <div className="bg-[#7B2CF6]"> {/* roxo vibrante do Figma */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            {CATEGORIES.map((label) => {
              const active = activeCategory === label;
              return (
                <button
                  key={label}
                  onClick={() => onCategoryChange(label)}
                  className={[
                    "px-5 py-2 rounded-[20px] text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-white/50",
                    active
                      ? "bg-white/25 text-white shadow-inner" // Estilo Ativo
                      : "text-white hover:bg-white/10" // Estilo Inativo
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
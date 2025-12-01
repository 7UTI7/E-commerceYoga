import { useState } from "react";
import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import EventsCarousel from "./components/EventCarousel";
import PostsSection from "./components/PostsSection";
import FooterPublic from "../components/footer";

// 1. IMPORTE O NOVO COMPONENTE AQUI
import { SearchBar } from "./components/SearchBar"; //

// 🔹 Tipo compartilhado atualizado para incluir "Favoritos"
export type UiCategory = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas" | "Grupos" | "Favoritos";

export default function UserApp() {
  const [activeCategory, setActiveCategory] = useState<UiCategory>("Recentes");
  const showCarousel = activeCategory === "Recentes" || activeCategory === "Eventos";
  const [searchQuery, setSearchQuery] = useState(""); // <-- NOSSO NOVO ESTADO

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Header onLogoClick={() => setActiveCategory("Recentes")} activeCategory={activeCategory} />

      <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* 2. COLOQUE O COMPONENTE AQUI */}
      {/* A prop 'onSearch' do seu SearchBar 
        conecta perfeitamente com o 'setSearchQuery' que você já tem. 
      */}


      {showCarousel && <EventsCarousel />}

      <SearchBar onSearch={setSearchQuery} />

      {/* PostsSection aceita prop opcional; aqui passamos a categoria ativa */}
      <PostsSection activeCategory={activeCategory} searchQuery={searchQuery} />

      <FooterPublic />
    </div>
  );
}
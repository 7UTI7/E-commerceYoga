import { useState } from "react";
import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { EventsCarousel } from "./components/EventCarousel";
import PostsSection from "./components/PostsSection";
import { Footer } from "./components/Footer"; 
import { SearchBar } from "./components/SearchBar";


export type UiCategory = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas" | "Grupos" | "Favoritos";

export default function UserApp() {
  const [activeCategory, setActiveCategory] = useState<UiCategory>("Recentes");
  const showCarousel = activeCategory === "Recentes" || activeCategory === "Eventos";
  const [searchQuery, setSearchQuery] = useState(""); 

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Header 
        onLogoClick={() => setActiveCategory("Recentes")} 
        activeCategory={activeCategory} 
      />

      <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {showCarousel && <EventsCarousel />}

      <SearchBar onSearch={setSearchQuery} />

      {/* PostsSection aceita prop opcional; aqui passamos a categoria ativa */}
      <PostsSection activeCategory={activeCategory} searchQuery={searchQuery} />

      <Footer />
    </div>
  );
}
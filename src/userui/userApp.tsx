import { useState } from "react";
import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { EventCarousel } from "./components/EventCarousel";
import PostsSection from "./components/PostsSection";
import FooterPublic from "../components/footer";

// 🔹 Tipo compartilhado com CategoryNav/PostsSection
export type UiCategory = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas";

export default function UserApp() {
  const [activeCategory, setActiveCategory] = useState<UiCategory>("Recentes");
  const showCarousel = activeCategory === "Recentes" || activeCategory === "Eventos";

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Header onLogoClick={() => setActiveCategory("Recentes")} activeCategory={activeCategory} />

      {/* Agora o CategoryNav é tipado com UiCategory e aceita setActiveCategory direto */}
      <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {showCarousel && <EventCarousel />}

      {/* PostsSection aceita prop opcional; aqui passamos a categoria ativa */}
      <PostsSection activeCategory={activeCategory} />

      <FooterPublic />
    </div>
  );
}

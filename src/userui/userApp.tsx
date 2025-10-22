import { useState } from "react";
import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { EventCarousel } from "./components/EventCarousel";
import { PostsSection } from "./components/PostsSection";
import FooterPublic from "../components/footer"; // 👈 footer da home (minúsculo)

export default function UserApp() {
  const [activeCategory, setActiveCategory] = useState("Recentes");
  const showCarousel = activeCategory === "Recentes" || activeCategory === "Eventos";

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Header onLogoClick={() => setActiveCategory("Recentes")} activeCategory={activeCategory} />
      <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      {showCarousel && <EventCarousel />}
      <PostsSection activeCategory={activeCategory} />

      {/* Footer da página inicial */}
      <FooterPublic />
    </div>
  );
}

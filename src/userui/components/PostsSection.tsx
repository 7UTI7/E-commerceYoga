import { useEffect, useMemo, useState } from "react";
import PostCard from "./PostCard";
import {
  getPublishedArticles,
  getVideos,
  getEvents,
  getClassSlots,
  type Article,
  type Video,
  type Event,
  type ClassSlot,
} from "../../lib/api"; // Verifique se este caminho está correto para seu projeto
import { getFigmaImage } from "../figmaImages"; // Verifique se este caminho está correto
import { Clock } from "lucide-react";

// Tipos e Interfaces
type UiCategory = "Recentes" | "Artigos" | "Vídeos" | "Eventos" | "Aulas";
type DataKey = "recent" | "article" | "video" | "event" | "class";

interface Item {
  id: string;
  kind: "article" | "video" | "event" | "class";
  title: string;
  description?: string;
  image?: string;
  date?: string;
}

// Funções Helper (dentro do arquivo ou importadas)
function uiToKey(ui?: UiCategory): DataKey {
  switch (ui) {
    case "Artigos": return "article";
    case "Vídeos": return "video";
    case "Eventos": return "event";
    case "Aulas": return "class";
    default: return "recent";
  }
}

const weekdayName = (i: number) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i] ?? "";

function fmtISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(); // Ajuste o formato da data como preferir
}


// Componente Principal
export default function PostsSection({ activeCategory }: { activeCategory?: UiCategory }) {
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const selectedKey = useMemo<DataKey>(() => uiToKey(activeCategory ?? "Recentes"), [activeCategory]);

  // State da Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5; // 5 itens por página, como no design do Figma

  // Efeito para buscar os dados da API
  useEffect(() => {
    let alive = true;
    async function fetchData() {
      setLoading(true);
      setErr(null);
      try {
        const items: Item[] = [];

        if (selectedKey === "article" || selectedKey === "recent") {
          const articles = await getPublishedArticles();
          items.push(
            ...articles.map((a: Article): Item => ({
              id: a.slug,
              kind: "article",
              title: a.title,
              description: a.content?.trim()
                ? (a.content.length > 140 ? a.content.slice(0, 140) + "…" : a.content)
                : undefined,
              image: a.coverImage || getFigmaImage("article", a),
              date: a.createdAt ?? a.updatedAt,
            }))
          );
        }

        if (selectedKey === "video" || selectedKey === "recent") {
          const videos = await getVideos();
          items.push(
            ...videos.map((v: Video): Item => ({
              id: v._id,
              kind: "video",
              title: v.title,
              description: v.description,
              image: getFigmaImage("video", v),
              date: v.createdAt ?? v.updatedAt,
            }))
          );
        }

        if (selectedKey === "event" || selectedKey === "recent") {
          const events = await getEvents();
          items.push(
            ...events.map((e: Event): Item => ({
              id: e._id,
              kind: "event",
              title: e.title,
              description: e.description,
              image: getFigmaImage("event", e),
              date: e.date ?? e.createdAt ?? e.updatedAt,
            }))
          );
        }

        if (selectedKey === "class" || selectedKey === "recent") {
          const classes = await getClassSlots();
          items.push(
            ...classes.map((c: ClassSlot): Item => {
              const hasNewShape = !!c.dateTime || !!c.title || !!c.description;
              const title = hasNewShape ? (c.title || "Aula de Yoga") : (c.modality ? `Aula de ${c.modality}` : "Aula de Yoga");
              const desc = hasNewShape
                ? (c.description && c.description.trim().length > 0
                  ? c.description
                  : `${fmtISO(c.dateTime)}${c.durationMinutes ? ` • ${c.durationMinutes} min` : ""}${c.maxStudents ? ` • ${c.maxStudents} vagas` : ""}`)
                : `${weekdayName(Number(c.weekday ?? 0))} • ${c.time ?? ""}`;
              const date = hasNewShape ? (c.dateTime ?? c.createdAt ?? c.updatedAt) : (c.createdAt ?? c.updatedAt);
              return {
                id: c._id,
                kind: "class",
                title,
                description: desc,
                image: getFigmaImage("class", c),
                date,
              };
            })
          );
        }

        // Ordenar todos os itens por data, mais recente primeiro
        items.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });

        if (alive) setPosts(items);
      } catch (e: any) {
        if (alive) setErr(e?.response?.data?.message || "Erro ao carregar conteúdos.");
        if (alive) setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchData();
    return () => { alive = false; };
  }, [selectedKey]); // Roda o efeito sempre que a categoria mudar

  // Efeito para resetar a paginação quando a categoria muda
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedKey]);

  // Lógica de Paginação (Cálculos)
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex); // Pega apenas os posts da página atual

  // Renderização do Componente
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10">

      {/* Wrapper principal para centralizar e definir a largura máxima */}
      <div className="mx-auto max-w-7xl"> {/* Você pode mudar de 5xl para 6xl se quiser mais largo */}

        {err && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

        {/* Título da Seção (alinhado com os cards abaixo) */}
        <div className="flex items-center gap-2 mb-6">
          {activeCategory === 'Recentes' && <Clock className="w-6 h-6 text-gray-700" />}
          <h2 className="text-xl font-semibold text-gray-900 tracking-wide">
            {activeCategory === 'Recentes' ? 'RECENTES' : activeCategory?.toUpperCase()}
          </h2>
        </div>

        {/* Conteúdo Condicional (Loading, Erro, Posts) */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Carregando conteúdo...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Nenhum conteúdo encontrado.</div>
        ) : (
          <>
            {/* Lista de Posts */}
            <div className="space-y-6 mb-8">
              {currentPosts.map((item) => (
                <PostCard
                  key={`${item.kind}-${item.id}`}
                  id={item.id}
                  kind={item.kind}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  date={item.date}
                />
              ))}
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Lógica para mostrar apenas números relevantes (primeiro, último, atual e vizinhos)
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-md transition-colors ${page === currentPage
                          ? 'bg-purple-600 text-white' // Botão ativo
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // Botão inativo
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    // Adiciona "..."
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null; // Oculta os outros números de página
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div> {/* Fim do wrapper 'max-w-5xl' */}
    </section>
  );
}
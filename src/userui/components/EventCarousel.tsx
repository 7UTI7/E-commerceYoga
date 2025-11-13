import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { getEvents, type Event } from "../../lib/api";
import { getFigmaImage } from "../figmaImages";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

type Item = {
  id: string;
  title: string;
  description?: string;
  dateISO: string;
  dateLabel: string;
  timeLabel: string;
  location?: string;
  image?: string;
};

function formatDatePt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function formatTimePt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}h${mm}`;
}

const AUTO_MS = 15000;

// exatamente o mesmo link do Header
const whatsappHref =
  "https://wa.me/5511999999999?text=Oi%20Karla!%20Quero%20agendar%20uma%20aula%20de%20Yoga.%20Pode%20me%20ajudar%3F";

const EventsCarousel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const evts = await getEvents();
        const mapped: Item[] = evts
          .map((e: Event) => ({
            id: e._id,
            title: e.title,
            description: e.description || "",
            dateISO: e.date || e.createdAt || e.updatedAt,
            dateLabel: formatDatePt(e.date || e.createdAt || e.updatedAt),
            timeLabel: formatTimePt(e.date || e.createdAt || e.updatedAt),
            location: e.location || "",
            image: getFigmaImage("event", e),
          }))
          .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
        if (alive) {
          setItems(mapped);
          setIndex(0);
        }
      } catch (err) {
        console.error("Erro ao carregar eventos para o carrossel:", err);
        if (alive) setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const total = items.length;
  const goTo = (i: number) => total && setIndex((i + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function stopAuto() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  function startAuto() {
    if (!timerRef.current && total) {
      timerRef.current = window.setInterval(next, AUTO_MS);
    }
  }

  useEffect(() => {
    if (!total) return;
    stopAuto();
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  const translateX = useMemo(() => `translateX(-${index * 100}%)`, [index]);

  if (!total) return null;

  return (
    <div className="bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* --- ATUALIZAÇÃO RESPONSIVA ---
            CELULAR: h-[550px] (Mais alto para caber texto)
            DESKTOP: md:h-[500px] (Altura original)
        */}
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl h-[550px] md:h-[500px]"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
        >
          <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: translateX }}>
            {items.map((ev) => (
              <div key={ev.id} className="w-full flex-shrink-0 h-full">
                <div className="flex h-full relative">
                  {/* Imagem + overlay */}
                  <div className="absolute inset-0 z-0">
                    <ImageWithFallback src={ev.image || ""} alt={ev.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
                  </div>

                  {/* Conteúdo central */}
                  {/* --- ATUALIZAÇÃO RESPONSIVA ---
                      CELULAR: p-6
                      DESKTOP: md:p-12
                  */}
                  <div className="relative z-10 w-full p-6 md:p-12 flex flex-col justify-center text-white">
                    <div className="max-w-3xl mx-auto text-center">
                      <div className="inline-block bg-white text-purple-700 px-4 py-1 rounded-full text-sm mb-6">
                        EVENTO
                      </div>

                      <h2 className="text-white mb-6 text-2xl md:text-3xl font-semibold">{ev.title}</h2>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Calendar className="w-5 h-5" />
                          <span>{ev.dateLabel}</span>
                        </div>
                        {ev.location ? (
                          <div className="flex items-center justify-center gap-2 text-white">
                            <MapPin className="w-5 h-5" />
                            <span>{ev.location}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Clock className="w-5 h-5" />
                          <span>{ev.timeLabel}</span>
                        </div>
                      </div>

                      {ev.description ? (
                        <p className="text-white leading-relaxed mb-6 line-clamp-4">{ev.description}</p>
                      ) : (
                        <div className="mb-6" />
                      )}

                      <Button
                        variant="outline"
                        className="bg-white hover:bg-gray-50 border-2 border-green-500 text-green-600 px-6 py-3 rounded-lg mx-auto"
                        onClick={() => {
                          stopAuto();
                          setConfirmOpen(true);
                        }}
                      >
                        Participe!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setas */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg z-10"
          >
            <ChevronLeft className="w-6 h-6 text-purple-700" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg z-10"
          >
            <ChevronRight className="w-6 h-6 text-purple-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "bg-white w-8" : "bg-white/50 w-2"}`}
                aria-label={`Ir para evento ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal de confirmação (sem fallback que troca a aba atual) */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) startAuto();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir WhatsApp?</DialogTitle>
            <DialogDescription>
              Este link abrirá o WhatsApp em uma nova aba para realizar seu agendamento. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button
              className="rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(whatsappHref, "_blank", "noopener,noreferrer");
                setConfirmOpen(false);
              }}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsCarousel;
export { EventsCarousel };
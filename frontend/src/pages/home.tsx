import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EventCarousel from "../userui/components/EventCarousel";

export default function Home() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dotsWrapRef = useRef<HTMLDivElement | null>(null);

  const [imagemZoom, setImagemZoom] = useState<string | null>(null);

  useEffect(() => {
    // --- LÓGICA DO CARROSSEL DE DEPOIMENTOS ---
    const scroller = scrollerRef.current;
    const dotsWrap = dotsWrapRef.current;
    if (!scroller || !dotsWrap) return;

    const cards = Array.from(scroller.children) as HTMLElement[];
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
      b.className = "h-2.5 w-2.5 rounded-full bg-slate-300";
      dotsWrap.appendChild(b);
    });

    const dots = Array.from(dotsWrap.children) as HTMLButtonElement[];
    const setActiveDot = (idx: number) => {
      dots.forEach((d, i) => {
        d.className = "h-2.5 w-2.5 rounded-full transition " + (i === idx ? "bg-indigo-500" : "bg-slate-300");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = cards.indexOf(e.target as HTMLElement);
            setActiveDot(idx);
          }
        });
      },
      { root: scroller, threshold: 0.6 }
    );
    cards.forEach((c) => io.observe(c));

    dots.forEach((d, i) =>
      d.addEventListener("click", () => {
        cards[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      })
    );

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      scroller.classList.add("cursor-grabbing");
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
      e.preventDefault();
    };
    const onMouseUp = () => {
      isDown = false;
      scroller.classList.remove("cursor-grabbing");
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - scroller.offsetLeft;
      const walk = x - startX;
      scroller.scrollLeft = scrollLeft - walk;
    };
    const onMouseLeave = () => {
      isDown = false;
      scroller.classList.remove("cursor-grabbing");
    };

    scroller.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    scroller.addEventListener("mousemove", onMouseMove);
    scroller.addEventListener("mouseleave", onMouseLeave);

    return () => {
      io.disconnect();
      scroller.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      scroller.removeEventListener("mousemove", onMouseMove);
      scroller.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <>
      {/* --- LIGHTBOX (ZOOM) --- */}
      {imagemZoom && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setImagemZoom(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold p-2"
            onClick={() => setImagemZoom(null)}
          >
            &times;
          </button>
          <img
            src={imagemZoom}
            alt="Zoom"
            className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] min-h-[560px] flex items-center justify-center text-center">
        <img src="/assets/yogatelainicial2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <img
            src="/assets/ChatGPT Image 7 de out. de 2025, 23_30_26.png"
            alt="Logo Karla Rodrigues Yoga"
            className="w-48 mx-auto md:w-auto md:px-60 mt-0 rounded-lg mb-6"
          />

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">Encontre seu equilíbrio interior</h2>
          <p className="mt-6 text-lg sm:text-xl text-white/90">
            Descubra a paz e harmonia através da prática do yoga. Transforme corpo, mente e espírito.
          </p>
          <Link
            to="/cadastro"
            className="mt-8 inline-flex items-center rounded-xl bg-purple-600 px-6 py-3 text-white text-lg font-semibold hover:bg-purple-700 hover:scale-[1.02] transition"
          >
            Comece sua jornada
          </Link>
        </div>
      </section>

      {/* --- SOBRE A INSTRUTORA --- */}
      <section id="sobre" className="py-20 bg-red-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div className="mx-auto w-3/4 md:w-full overflow-hidden rounded-2xl shadow-xl md:max-h-[600px] md:max-w-[550px]">
              <img
                className="w-full h-auto md:h-[650px] md:w-[550px] object-cover"
                src="/assets/karla.jpeg"
                alt="Instrutora de Yoga"
              />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900">Sobre nossa instrutora</h3>
              <h4 className="mt-2 text-xl font-semibold text-purple-700">Karla Rodrigues</h4>
              <p className="mt-4 text-gray-600">
                Praticante de yoga há 20 anos. Facilitadora de Hatha Yoga, formada Hatha Yoga pelo IEPY, (Instituto de Pesquisas em Yoga) em parceria com o Instituto
                Kaivalyadhama (Índia).
              </p>
              <p className="mt-4 text-gray-600">
                Também facilitadora de Yoga Restaurativo, Yoga Acessível para Trauma, Hatha Yoga sob a visão da Ayurveda, Yoga para Crianças e para Gestantes.
                Facilitadora em Atenção e Concentração nas Práticas Meditativas, pela Associação Palas Athena do Brasil.
              </p>
              <p className="mt-4 text-gray-600">
                Doula, pelo Grupo de Apoio à Maternidade Ativa, Terapeuta em Ayurveda, Casa João de Barro, Fatec Paraná, Terapeuta em Reiki e Karuna, Mestre Cristine di
                Lorenzo, Terapeuta em Yoga Massagem Ayurvédica, Puja Punita.
              </p>
              <p className="quote mt-6 italic border-l-4 border-purple-600 pl-4 text-gray-700">
                "Em suas aulas e atendimentos aplica seus conhecimentos com um olhar terapêutico. Alunos são convidados a experienciar equilíbrio mental por meio da
                experiência física, da observação consciente do corpo e da respiração."
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">Hatha Yoga</span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">Yoga Restaurativo</span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">Yoga Massagem Ayurvédica</span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">Reiki e Karuna</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ESPECIALIDADES --- */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900">ESPECIALIDADES</h3>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <div className="group rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition h-full flex flex-col">
              <img src="/assets/especialidade1.jpg" alt="Hatha Yoga" className="h-40 w-full object-cover rounded-2xl" />
              <h4 className="mt-4 text-xl font-bold text-gray-900 text-center">Hatha Yoga</h4>
              <ul className="mt-3 text-gray-600 text-sm leading-relaxed list-disc list-inside text-left space-y-1">
                <li>Melhora <strong>força</strong>, <strong>flexibilidade</strong> e postura.</li>
                <li>Aumenta <strong>mobilidade</strong> e <strong>consciência corporal</strong>.</li>
                <li>Reduz <strong>estresse</strong> e <strong>ansiedade</strong>; melhora o foco.</li>
                <li>Qualifica a <strong>respiração</strong> e o <strong>sono</strong>.</li>
                <li>Alivia <strong>tensões</strong> e dores do dia a dia.</li>
              </ul>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition h-full flex flex-col">
              <img src="/assets/especialidaed2.jpg" alt="Reiki e Karuna" className="h-40 w-full object-cover rounded-2xl" />
              <h4 className="mt-4 text-xl font-bold text-gray-900 text-center">Reiki e Karuna</h4>
              <ul className="mt-3 text-gray-600 text-sm leading-relaxed list-disc list-inside text-left space-y-1">
                <li>Induz <strong>relaxamento profundo</strong> e bem-estar.</li>
                <li>Reduz <strong>ansiedade</strong> e tensão emocional.</li>
                <li>Favorece <strong>sono</strong> mais reparador.</li>
                <li>Equilibra a <strong>energia</strong> e recupera a disposição.</li>
                <li>Desenvolve <strong>autocompaixão</strong> e libera padrões emocionais.</li>
              </ul>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition h-full flex flex-col">
              <img src="/assets/especialidade3.jpg" alt="Yoga Restaurativo" className="h-40 w-full object-cover rounded-2xl" />
              <h4 className="mt-4 text-xl font-bold text-gray-900 text-center">Yoga Restaurativo</h4>
              <ul className="mt-3 text-gray-600 text-sm leading-relaxed list-disc list-inside text-left space-y-1">
                <li>Acalma o <strong>sistema nervoso</strong>; reduz estresse e ansiedade.</li>
                <li>Promove <strong>descanso profundo</strong> e melhora do sono.</li>
                <li>Suaviza <strong>dores crônicas</strong> e fadiga.</li>
                <li>Aumenta a <strong>consciência da respiração</strong> e a presença.</li>
                <li>Excelente para <strong>recuperação</strong> física e mental.</li>
              </ul>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition h-full flex flex-col">
              <img src="/assets/especilidade5.jpg" alt="Yoga Massagem Ayurvédica" className="h-40 w-full object-cover rounded-2xl" />
              <h4 className="mt-4 text-xl font-bold text-gray-900 text-center">Yoga Massagem Ayurvédica</h4>
              <ul className="mt-3 text-gray-600 text-sm leading-relaxed list-disc list-inside text-left space-y-1">
                <li>Desfaz <strong>tensões musculares</strong>; melhora a circulação.</li>
                <li>Aumenta <strong>amplitude de movimento</strong> e flexibilidade.</li>
                <li>Melhora <strong>postura</strong> e consciência corporal.</li>
                <li>Alivia <strong>dores</strong> e cansaço.</li>
                <li>Sensação de <strong>leveza</strong> e energia.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- EVENTOS --- */}
      <section className="py-20 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900">EVENTOS</h3>
          </div>
          <div className="mt-12">
            <EventCarousel />
          </div>
        </div>
      </section>

      {/* --- CONHEÇA NOSSA ESTRUTURA (GALERIA) --- */}
      <section id="estrutura" className="py-20 bg-red-100">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">CONHEÇA NOSSA ESTRUTURA</h2>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 23 }).map((_, i) => {
              const src = `/assets/estudio-yoga-${i + 1}.jpg`;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`Foto ${i + 1}`}
                  onClick={() => setImagemZoom(src)}
                  className="w-full h-32 md:h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* --- DEPOIMENTOS --- */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">DEPOIMENTOS</h3>
            <p className="mt-2 text-gray-600">Avaliação 5 estrelas no Google Meu Negócio</p>
          </div>

          <div className="mt-10">
            <div
              ref={scrollerRef}
              id="testimonial-scroller"
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
            >
              <article className="flex-none w-[88%] sm:w-[70%] md:w-[32%] snap-start rounded-2xl bg-white p-8 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_60px_-8px_rgba(0,0,0,0.30)] transition-shadow duration-300">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-100">
                  <img src="/assets/maria helena.jpg" alt="Foto de Maria Helena Maia" className="h-full w-full object-cover" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-slate-800 text-center">Maria Helena Maia</h4>
                <p className="mt-3 text-slate-600 text-center">
                  “A Karla é uma professora que só de chegar perto dela a gente já fica bem, ela toda inspira paz. Suas aulas são maravilhosas, meu corpo ganhou muita
                  flexibilidade depois que comecei a fazer yoga com ela. Namastê.”
                </p>
              </article>

              <article className="flex-none w-[88%] sm:w-[70%] md:w-[32%] snap-start rounded-2xl bg-white p-8 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_60px_-8px_rgba(0,0,0,0.30)] transition-shadow duration-300">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-100">
                  <img src="/assets/tamires.png" alt="Foto de Tamires Sevila" className="h-full w-full object-cover" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-slate-800 text-center">Tamires Sevila</h4>
                <p className="mt-3 text-slate-600 text-center">
                  “Espaço maravilhoso!!!! Só de pisar na entrada do espaço já consegue sentir uma sensação maravilhosa de relaxamento e calmaria para corpo e a mente, sem
                  contar com a excelência da profissional Karla Rodrigues que faz muito bem o seu trabalho. Maravilha, parabéns!!!!”
                </p>
              </article>

              <article className="flex-none w-[88%] sm:w-[70%] md:w-[32%] snap-start rounded-2xl bg-white p-8 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_60px_-8px_rgba(0,0,0,0.30)] transition-shadow duration-300">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-100">
                  <img src="/assets/valeria.png" alt="Foto de Valquíria Zago" className="h-full w-full object-cover" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-slate-800 text-center">Valquíria Zago</h4>
                <p className="mt-3 text-slate-600 text-center">
                  “Cliente da Yoga Massagem há mais de um ano! Ajuda a renovar as energias e recuperar o corpo do stress diário. Super recomendo!”
                </p>
              </article>

              <article className="flex-none w-[88%] sm:w-[70%] md:w-[32%] snap-start rounded-2xl bg-white p-8 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_60px_-8px_rgba(0,0,0,0.30)] transition-shadow duration-300">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-100">
                  <img src="/assets/flavia marcon.jpg" alt="Foto de Flavia Marcon" className="h-full w-full object-cover" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-slate-800 text-center">Flavia Marcon</h4>
                <p className="mt-3 text-slate-600 text-center">
                  “Após algumas pesquisas o Estúdio da Karla foi muito bem recomendado. Ela é super consciente e respeita os limites de cada aluna. Também abre as portas do
                  seu espaço para palestras e vivências bem legais de outros profissionais. Adoro seu estúdio e indico sempre.”
                </p>
              </article>
            </div>

            <div ref={dotsWrapRef} id="testimonial-dots" className="mt-6 flex justify-center gap-3"></div>
          </div>
        </div>
      </section>
    </>
  );
}
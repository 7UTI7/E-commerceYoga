import { useState } from "react"; 
import { Link } from "react-router-dom";

const CONTENT_MAX = "max-w-[800px]";

export default function Header() {
  
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
          <div className="h-[72px] flex items-center justify-between gap-3">

            {/* --- LOGO (Esquerda) --- */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
                <span className="text-xl font-bold text-purple-700 whitespace-nowrap hidden sm:block">
                  Karla Rodrigues Yoga
                </span>
              </Link>
            </div>

            {/* --- ÁREA DA DIREITA --- */}
            <div className="flex items-center gap-3 shrink-0">

              {/* VERSÃO DESKTOP */}
              <div className="hidden md:flex items-center gap-3">
                {/* Ícones Sociais */}
                <div className="flex items-center gap-3 text-purple-600 mr-2">
                  <a href="https://www.instagram.com/karlarodriguesyoga/" target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-purple-800">
                    <i className="fab fa-instagram text-[20px]" />
                  </a>
                  <a href="https://www.facebook.com/KarlaRodriguesYoga" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-purple-800">
                    <i className="fab fa-facebook text-[20px]" />
                  </a>
                </div>

                {/* Botões Desktop */}
                <Link to="/login" className="px-4 py-2 rounded-lg border-2 border-purple-600 text-purple-600 font-medium hover:bg-purple-600 hover:text-white transition">
                  Entrar
                </Link>
                <Link to="/cadastro" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
                  Cadastrar
                </Link>
              </div>

              {/* VERSÃO MOBILE (Botão Hambúrguer) */}
              <button
                onClick={() => setMenuAberto(true)}
                className="block md:hidden text-purple-700 p-2 focus:outline-none"
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* --- MENU MOBILE (OVERLAY / GAVETA) --- */}
      <div
        className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${menuAberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMenuAberto(false)}
        ></div>

        <div
          className={`relative bg-white w-64 h-full shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${menuAberto ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Botão Fechar */}
          <button
            onClick={() => setMenuAberto(false)}
            className="self-end text-gray-500 hover:text-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Links do Menu Mobile */}
          <div className="flex flex-col gap-4 mt-4">
            <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Menu</span>

            <Link
              to="/login"
              onClick={() => setMenuAberto(false)}
              className="text-lg font-medium text-gray-700 hover:text-purple-600 border-b pb-2"
            >
              Entrar
            </Link>

            <Link
              to="/cadastro"
              onClick={() => setMenuAberto(false)}
              className="text-lg font-medium text-gray-700 hover:text-purple-600 border-b pb-2"
            >
              Cadastrar
            </Link>

            {/* Redes Sociais no Mobile */}
            <div className="flex gap-4 mt-4 justify-center">
              <a href="https://www.instagram.com/karlarodriguesyoga/" target="_blank" rel="noopener" className="text-purple-600 text-2xl">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://www.facebook.com/KarlaRodriguesYoga" target="_blank" rel="noopener" className="text-purple-600 text-2xl">
                <i className="fab fa-facebook" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
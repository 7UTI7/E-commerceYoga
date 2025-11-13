import { Link } from "react-router-dom";

const CONTENT_MAX = "max-w-[800px]"; // ajuste aqui: menor aproxima, maior afasta

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
        <div className="h-[72px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
              {/* --- ATUALIZAÇÃO RESPONSIVA ---
                  O texto fica oculto por padrão (celular)
                  e aparece em telas 'sm' (640px) ou maiores.
              */}
              <span className="text-xl font-bold text-purple-700 whitespace-nowrap hidden sm:block">
                Karla Rodrigues Yoga
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-3 text-purple-600">
              <a
                href="https://www.instagram.com/karlarodriguesyoga/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="hover:text-purple-800"
              >
                <i className="fab fa-instagram text-[20px]" />
              </a>
              <a
                href="https://www.facebook.com/KarlaRodriguesYoga"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="hover:text-purple-800"
              >
                <i className="fab fa-facebook text-[20px]" />
              </a>
            </div>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border-2 border-purple-600 text-purple-600 font-medium hover:bg-purple-600 hover:text-white transition"
            >
              Entrar
            </Link>

            <Link
              to="/cadastro"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
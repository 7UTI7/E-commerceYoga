import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-[72px] flex items-center justify-between gap-3">
          {/* ESQUERDA: logo + telefone */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
              <span className="text-xl font-bold text-purple-700 whitespace-nowrap">Karla Rodrigues Yoga</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 text-sm text-gray-600 whitespace-nowrap">
              <i className="fas fa-phone text-[18px] text-purple-600"></i>
              <span>(11) 99999-9999</span>
            </div>
          </div>

          {/* CENTRO: endereço (clicável → Google Maps) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center min-w-0 text-sm">
            <i className="fas fa-map-marker-alt text-[18px] text-purple-600 shrink-0"></i>
            <a
              href="https://www.google.com/maps/search/?api=1&query=R.%20Navajas%2C%20632%20-%20sala%203%20-%20Shangai%2C%20Mogi%20das%20Cruzes%20-%20SP%2C%2008745-200"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-purple-700 transition-colors block max-w-[700px] truncate"
              title="R. Navajas, 632 - sala 3 - Shangai, Mogi das Cruzes - SP, 08745-200"
            >
              R. Navajas, 632 - sala 3 - Shangai, Mogi das Cruzes - SP, 08745-200
            </a>
          </div>

          {/* DIREITA: redes + ENTRAR + CADASTRAR */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-3 text-purple-600">
              <a
                href="https://www.instagram.com/karlarodriguesyoga/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="hover:text-purple-800"
              >
                <i className="fab fa-instagram text-[20px]"></i>
              </a>
              <a
                href="https://www.facebook.com/KarlaRodriguesYoga"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="hover:text-purple-800"
              >
                <i className="fab fa-facebook text-[20px]"></i>
              </a>
            </div>

            {/* ENTRAR */}
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border-2 border-purple-600 text-purple-600 font-medium hover:bg-purple-600 hover:text-white transition"
            >
              Entrar
            </Link>

            {/* CADASTRAR */}
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

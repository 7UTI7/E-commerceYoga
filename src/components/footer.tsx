export default function Footer() {
  return (
    <footer className="bg-purple-600 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="text-xl font-bold">Karla Rodrigues Yoga</h5>
            <p className="mt-2 text-purple-100">Transforme sua vida através da prática do yoga.</p>
          </div>

          <div>
            <h6 className="text-lg font-semibold">Contato</h6>
            <div className="mt-3 space-y-2 text-purple-100">
              <div className="flex items-center gap-2"><i className="fas fa-phone"></i><span>(11) 99999-9999</span></div>
              <div className="flex items-center gap-2"><i className="fas fa-envelope"></i><span>contato@namasteyoga.com</span></div>
              <div className="flex items-center gap-2"><i className="fas fa-map-marker-alt"></i><span>Rua das Flores, 123 - São Paulo</span></div>
            </div>
          </div>

          <div>
            <h6 className="text-lg font-semibold">Redes Sociais</h6>
            <div className="mt-3 flex items-center gap-4 text-2xl">
              <a
                href="https://www.instagram.com/karlarodriguesyoga/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Karla Rodrigues Yoga"
                className="cursor-pointer hover:text-purple-200 px-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.facebook.com/KarlaRodriguesYoga"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Karla Rodrigues Yoga"
                className="cursor-pointer hover:text-purple-200 px-0 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
              >
                <i className="fab fa-facebook"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-purple-700 pt-4 text-center text-purple-200">
          &copy; {new Date().getFullYear()} Karla Rodrigues Yoga. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

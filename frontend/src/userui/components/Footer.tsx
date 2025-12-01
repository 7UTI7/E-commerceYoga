import { Phone, MapPin, Mail, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-purple-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div>
            <h3 className="text-white mb-4">Karla Rodrigues Yoga</h3>
            <p className="text-purple-200 text-sm mb-4">
              Transforme seu dia através da prática do Yoga
            </p>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white mb-4">Contato</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@karlayoga.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>R. Naruzes, 622 - sala 3 - SP, 08745-320</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-300 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-600 mt-8 pt-6 text-center text-sm text-purple-200">
          <p>© 2025 Karla Rodrigues Yoga. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

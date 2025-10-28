import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, User, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../userui/components/ui/dialog";
import { Button } from "../../userui/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";

export interface HeaderProps {
  onLogoClick?: () => void;
  activeCategory?: string;
}

export function Header({ onLogoClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [openWhats, setOpenWhats] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const whatsappHref =
    "https://wa.me/5511999999999?text=Oi%20Karla!%20Quero%20agendar%20uma%20aula%20de%20Yoga.%20Pode%20me%20ajudar%3F";

  const handleLogoClick = () => {
    if (onLogoClick) return onLogoClick();
    window.location.reload();
  };

  const goInstagram = () =>
    window.open("https://www.instagram.com/karlarodriguesyoga/", "_blank", "noopener,noreferrer");
  const goFacebook = () =>
    window.open("https://www.facebook.com/KarlaRodriguesYoga", "_blank", "noopener,noreferrer");

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-[72px] flex items-center justify-between gap-3">
            {/* ESQUERDA */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 shrink-0 hover:opacity-90 transition"
                aria-label="Atualizar a página"
              >
                <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
                <span className="text-xl font-semibold text-purple-800 whitespace-nowrap">
                  Karla Rodrigues Yoga
                </span>
              </button>

              <div className="hidden sm:block h-5 w-px bg-gray-200 mx-2" />

              <div className="hidden lg:flex items-center gap-5 text-sm text-gray-700 min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>(11) 99999-9999</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=R.%20Navajas%2C%20632%20-%20sala%203%20-%20Shangai%2C%20Mogi%20das%20Cruzes%20-%20SP%2C%2008745-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir no Google Maps"
                  className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 min-w-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    R. Navajas, 632 - sala 3 - Shangai, Mogi das Cruzes - SP, 08745-200
                  </span>
                </a>
              </div>
            </div>

            {/* DIREITA */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={goInstagram}
                aria-label="Instagram"
                className="text-purple-600 hover:text-purple-800"
                title="Instagram"
              >
                <i className="fab fa-instagram text-[18px]" />
              </button>
              <button
                onClick={goFacebook}
                aria-label="Facebook"
                className="text-purple-600 hover:text-purple-800"
                title="Facebook"
              >
                <i className="fab fa-facebook text-[18px]" />
              </button>

              {/* Agendar — só para não-admin */}
              {!isAdmin && (
                <Button
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
                  onClick={() => setOpenWhats(true)}
                >
                  <i className="fab fa-whatsapp text-[16px] mr-2" />
                  Agendar
                </Button>
              )}

              {/* Gerenciar Conteúdo — só para admin */}
              {isAdmin && (
                <Button
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow"
                  onClick={() => navigate("/admin")}
                  title="Ir para o painel administrativo"
                >
                  Gerenciar Conteúdo
                </Button>
              )}

              <Button
                variant="secondary"
                className="rounded-lg border-purple-300"
                onClick={() => navigate("/user/profile")}
                title="Perfil"
              >
                <User className="w-4 h-4 mr-2" />
                {user?.name?.split(" ")[0] || "Aluno"}
              </Button>

              <Button
                variant="secondary"
                className="rounded-lg border-purple-300"
                onClick={() => setOpenLogout(true)}
                title="Sair"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal WhatsApp (só quando não-admin) */}
      {!isAdmin && (
        <Dialog open={openWhats} onOpenChange={setOpenWhats}>
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
                onClick={() => {
                  window.open(whatsappHref, "_blank", "noopener,noreferrer");
                  setOpenWhats(false);
                }}
              >
                Continuar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Sair — CORRIGIDO: tudo dentro do DialogContent */}
      <Dialog open={openLogout} onOpenChange={setOpenLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja encerrar a sessão?</DialogTitle>
            <DialogDescription>Você será redirecionado para a página inicial.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Não</Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="rounded-lg"
              onClick={() => {
                clearSession?.();
                navigate("/");
              }}
            >
              Sim, sair
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

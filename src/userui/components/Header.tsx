import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
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

const CONTENT_MAX = "max-w-[850px]";

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

  // Estado para o menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappHref =
    "https://wa.me/5511999999999?text=Oi%20Karla!%20Quero%20agendar%20uma%20aula%20de%20Yoga.%20Pode%20me%20ajudar%3F";

  const handleLogoClick = () => {
    if (onLogoClick) return onLogoClick();
    window.location.reload();
  };

  const goInstagram = () => window.open("https://www.instagram.com/karlarodriguesyoga/", "_blank", "noopener,noreferrer");
  const goFacebook = () => window.open("https://www.facebook.com/KarlaRodriguesYoga", "_blank", "noopener,noreferrer");

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
          <div className="h-[72px] flex items-center justify-between gap-3">

            {/* --- LOGO --- */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 shrink-0 hover:opacity-90 transition"
                aria-label="Atualizar a página"
              >
                <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
                <span className="text-xl font-semibold text-purple-800 whitespace-nowrap hidden md:inline">
                  Karla Rodrigues Yoga
                </span>
              </button>
            </div>

            {/* --- DIREITA: DESKTOP (Hidden no Mobile) --- */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button onClick={goInstagram} className="text-purple-600 hover:text-purple-800">
                <i className="fab fa-instagram text-[18px]" />
              </button>
              <button onClick={goFacebook} className="text-purple-600 hover:text-purple-800">
                <i className="fab fa-facebook text-[18px]" />
              </button>

              {!isAdmin && (
                <Button className="rounded-lg bg-green-600 hover:bg-green-700 text-white shadow" onClick={() => setOpenWhats(true)}>
                  <i className="fab fa-whatsapp text-[16px] mr-2" />
                  Agendar
                </Button>
              )}

              {isAdmin && (
                <Button className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow" onClick={() => navigate("/admin")}>
                  Gerenciar Conteúdo
                </Button>
              )}

              {/* Botão Perfil */}
              <Button variant="secondary" className="rounded-lg border-purple-300" onClick={() => navigate("/user/profile")}>
                <User className="w-4 h-4 mr-2" />
                {user?.name?.split(" ")[0] || "Aluno"}
              </Button>

              {/* --- BOTÃO SAIR (RESTAURADO AO ORIGINAL) --- */}
              <Button
                variant="secondary"
                className="rounded-lg border-purple-300"
                onClick={() => setOpenLogout(true)}
                title="Sair"
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>

            {/* --- DIREITA: MOBILE (Botão Hambúrguer) --- */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(true)} className="text-purple-800 p-2">
                <Menu className="w-8 h-8" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* --- SIDEBAR MOBILE (GAVETA) --- */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Fundo escuro */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>

        {/* Conteúdo Branco */}
        <div className={`relative bg-white w-72 h-full shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-bold text-purple-800 text-lg">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Perfil Mobile */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg" onClick={() => { navigate("/user/profile"); setMenuOpen(false); }}>
              <div className="bg-purple-200 p-2 rounded-full">
                <User className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="font-semibold text-purple-900">{user?.name?.split(" ")[0]}</p>
                <p className="text-xs text-purple-600">Ver perfil</p>
              </div>
            </div>

            {/* Ações Mobile */}
            {!isAdmin && (
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" onClick={() => { setOpenWhats(true); setMenuOpen(false); }}>
                <i className="fab fa-whatsapp text-[16px] mr-2" />
                Agendar Aula
              </Button>
            )}

            {isAdmin && (
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                Gerenciar Conteúdo
              </Button>
            )}

            {/* Redes Sociais Mobile */}
            <div className="flex gap-4 mt-2 justify-center border-t border-b py-4">
              <button onClick={goInstagram} className="text-purple-600 text-2xl"><i className="fab fa-instagram" /></button>
              <button onClick={goFacebook} className="text-purple-600 text-2xl"><i className="fab fa-facebook" /></button>
            </div>

            {/* Sair Mobile */}
            <button
              onClick={() => { setOpenLogout(true); setMenuOpen(false); }}
              className="flex items-center gap-2 text-red-600 font-medium mt-auto p-2 hover:bg-red-50 rounded"
            >
              <LogOut className="w-5 h-5" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAIS (Iguais) --- */}
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
              <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
              <Button onClick={() => { window.open(whatsappHref, "_blank", "noopener,noreferrer"); setOpenWhats(false); }}>Continuar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={openLogout} onOpenChange={setOpenLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja encerrar a sessão?</DialogTitle>
            <DialogDescription>Você será redirecionado para a página inicial.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild><Button variant="secondary">Não</Button></DialogClose>
            <Button variant="destructive" onClick={() => { clearSession?.(); navigate("/"); }}>Sim, sair</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
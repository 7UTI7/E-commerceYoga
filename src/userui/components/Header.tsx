import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
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
        <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
          <div className="h-[72px] flex items-center justify-between gap-3">
            {/* --- LOGO E TÍTULO --- */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 shrink-0 hover:opacity-90 transition"
                aria-label="Atualizar a página"
              >
                <img src="/assets/logo.jpg" alt="Logo Karla Rodrigues Yoga" className="h-10 w-10 rounded" />
                {/* --- ATUALIZAÇÃO RESPONSIVA ---
                    O texto do logo fica oculto em telas pequenas (celular)
                    e reaparece em telas 'md' (desktop)
                */}
                <span className="text-xl font-semibold text-purple-800 whitespace-nowrap hidden md:inline">
                  Karla Rodrigues Yoga
                </span>
              </button>
            </div>

            {/* --- BOTÕES DA DIREITA --- */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Ícones de Redes Sociais (Mantidos) */}
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

              {/* Botão Agendar (Não-Admin) */}
              {!isAdmin && (
                <Button
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
                  onClick={() => setOpenWhats(true)}
                  title="Agendar" // Title é útil para acessibilidade no celular
                >
                  {/* --- ATUALIZAÇÃO RESPONSIVA ---
                      Ícone: A margem (mr-2) agora é condicional (md:mr-2)
                      Texto: Envolvido em span 'hidden md:inline'
                  */}
                  <i className="fab fa-whatsapp text-[16px] md:mr-2" />
                  <span className="hidden md:inline">Agendar</span>
                </Button>
              )}

              {/* Botão Gerenciar (Admin) */}
              {isAdmin && (
                <Button
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow"
                  onClick={() => navigate("/admin")}
                  title="Ir para o painel administrativo"
                >
                  {/* (Este botão já é longo, mas podemos aplicar o mesmo padrão se necessário) */}
                  <span className="hidden md:inline">Gerenciar Conteúdo</span>
                  {/* (Exemplo de ícone se tivesse um)
                  <i className="fas fa-cog md:mr-2" />
                  <span className="hidden md:inline">Gerenciar</span>
                  */}
                </Button>
              )}

              {/* Botão Perfil */}
              <Button
                variant="secondary"
                className="rounded-lg border-purple-300"
                onClick={() => navigate("/user/profile")}
                title="Perfil"
              >
                {/* --- ATUALIZAÇÃO RESPONSIVA --- */}
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">
                  {user?.name?.split(" ")[0] || "Aluno"}
                </span>
              </Button>

              {/* Botão Sair */}
              <Button
                variant="secondary"
                className="rounded-lg border-purple-300"
                onClick={() => setOpenLogout(true)}
                title="Sair"
              >
                {/* --- ATUALIZAÇÃO RESPONSIVA --- */}
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MODAIS (Sem alteração) --- */}
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
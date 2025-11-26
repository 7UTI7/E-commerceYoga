import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "../../contexts/AuthContext";

const CONTENT_MAX = "max-w-[850px]";

export function Header() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [openWhats, setOpenWhats] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappHref = "https://wa.me/5511999999999?text=Oi%20Karla!%20Quero%20agendar%20uma%20aula.";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
          {/* Flex container principal: garante espaçamento entre os lados */}
          <div className="h-[72px] flex items-center justify-between">

            {/* --- LADO ESQUERDO: LOGO --- */}
            <div className="flex items-center shrink-0">
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 hover:opacity-80 transition">
                <img src="/assets/logo.jpg" alt="Logo" className="h-10 w-10 rounded-md object-cover" />
                <span className="text-lg md:text-xl font-semibold text-purple-800 hidden sm:inline whitespace-nowrap">
                  Karla Rodrigues Yoga
                </span>
              </button>
            </div>

            {/* --- LADO DIREITO: DESKTOP --- */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => window.open("https://instagram.com", "_blank")} className="text-purple-600 hover:text-purple-800 transition"><i className="fab fa-instagram text-[20px]" /></button>

              {!isAdmin && (
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm h-9 px-4" onClick={() => setOpenWhats(true)}>
                  <i className="fab fa-whatsapp text-[16px] mr-2" /> Agendar
                </Button>
              )}

              {isAdmin && (
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm h-9 px-4" onClick={() => navigate("/admin")}>
                  Gerenciar
                </Button>
              )}

              {/* BOTÃO PERFIL */}
              <Button
                variant="secondary"
                className="border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 h-9 pl-1 pr-3 gap-2"
                onClick={() => navigate("/user/profile")}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover bg-gray-200" />
                ) : (
                  <div className="bg-purple-200 rounded-full p-1"><User className="w-4 h-4 text-purple-700" /></div>
                )}
                <span className="truncate max-w-[100px]">{user?.name?.split(" ")[0] || "Perfil"}</span>
              </Button>

              <button onClick={() => setOpenLogout(true)} className="text-gray-400 hover:text-red-600 transition ml-1" title="Sair">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* --- LADO DIREITO: MOBILE (HAMBURGUER) --- */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(true)} className="p-2 text-purple-800 hover:bg-purple-50 rounded-lg transition">
                <Menu className="w-7 h-7" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* --- MENU MOBILE (DRAWER) --- */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>

        <div className={`relative bg-white w-[80%] max-w-[300px] h-full shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-bold text-purple-800 text-lg">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex flex-col gap-4">
            {/* PERFIL MOBILE */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl cursor-pointer border border-purple-100" onClick={() => { navigate("/user/profile"); setMenuOpen(false); }}>
              <div className="shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-purple-700" /></div>
                )}
              </div>
              <div>
                <p className="font-bold text-purple-900">{user?.name?.split(" ")[0]}</p>
                <p className="text-xs text-purple-600">Editar perfil</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {!isAdmin && (
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white h-10" onClick={() => { setOpenWhats(true); setMenuOpen(false); }}>
                <i className="fab fa-whatsapp text-[18px] mr-3" /> Agendar Aula
              </Button>
            )}

            {isAdmin && (
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white h-10" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                Gerenciar Conteúdo
              </Button>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100">
              <button onClick={() => { setOpenLogout(true); setMenuOpen(false); }} className="flex items-center gap-3 text-red-600 font-medium w-full p-2 hover:bg-red-50 rounded-lg transition">
                <LogOut className="w-5 h-5" /> Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAIS --- */}
      <Dialog open={openWhats} onOpenChange={setOpenWhats}>
        <DialogContent>
          <DialogHeader><DialogTitle>WhatsApp</DialogTitle><DialogDescription>Ir para o WhatsApp?</DialogDescription></DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpenWhats(false)}>Cancelar</Button>
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => { window.open(whatsappHref, "_blank"); setOpenWhats(false); }}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openLogout} onOpenChange={setOpenLogout}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sair?</DialogTitle><DialogDescription>Deseja realmente sair?</DialogDescription></DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpenLogout(false)}>Não</Button>
            <Button variant="destructive" onClick={() => { clearSession?.(); navigate("/"); }}>Sim</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
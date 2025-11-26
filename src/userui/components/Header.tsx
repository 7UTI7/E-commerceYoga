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
      {/* --- HEADER FIXO --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm h-[72px]">
        <div className={`mx-auto ${CONTENT_MAX} px-4 h-full flex items-center justify-between`}>

          {/* LOGO (Esquerda) */}
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 hover:opacity-80 transition">
              <img src="/assets/logo.jpg" alt="Logo" className="h-10 w-10 rounded-md object-cover" />
              <span className="text-xl font-semibold text-purple-800 hidden sm:block">Karla Rodrigues Yoga</span>
            </button>
          </div>

          {/* MENU DESKTOP (Direita - Hidden no Mobile) */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => window.open("https://instagram.com", "_blank")} className="text-purple-600 hover:text-purple-800"><i className="fab fa-instagram text-[20px]" /></button>
            <button onClick={() => window.open("https://facebook.com", "_blank")} className="text-purple-600 hover:text-purple-800"><i className="fab fa-facebook text-[20px]" /></button>

            {!isAdmin && (
              <Button className="bg-green-600 hover:bg-green-700 text-white h-9 shadow-sm" onClick={() => setOpenWhats(true)}>
                <i className="fab fa-whatsapp text-[16px] mr-2" /> Agendar
              </Button>
            )}

            {isAdmin && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white h-9 shadow-sm" onClick={() => navigate("/admin")}>
                Gerenciar
              </Button>
            )}

            {/* Perfil Desktop com FOTO */}
            <Button
              variant="secondary"
              className="border border-purple-200 bg-purple-50 text-purple-900 h-9 pl-1 pr-3 gap-2 hover:bg-purple-100 flex items-center"
              onClick={() => navigate("/user/profile")}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover bg-gray-200" />
              ) : (
                <User className="w-4 h-4 mr-1" />
              )}
              <span className="truncate max-w-[100px]">{user?.name?.split(" ")[0] || "Perfil"}</span>
            </Button>

            <button onClick={() => setOpenLogout(true)} className="text-gray-400 hover:text-red-500 ml-1" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* BOTÃO MOBILE (Direita) */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(true)} className="p-2 text-purple-800">
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* --- GAVETA MOBILE (CORRIGIDA) --- */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        {/* Fundo Escuro */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

        {/* Painel Branco Deslizante */}
        <div className={`absolute top-0 right-0 w-[80%] max-w-[300px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

          {/* Header da Gaveta */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <span className="font-bold text-lg text-purple-900">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
          </div>

          {/* Conteúdo da Gaveta */}
          <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Card de Perfil Mobile */}
            <div
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100"
              onClick={() => { navigate("/user/profile"); setMenuOpen(false); }}
            >
              <div className="shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700"><User className="w-6 h-6" /></div>
                )}
              </div>
              <div>
                <p className="font-bold text-purple-900">{user?.name?.split(" ")[0]}</p>
                <p className="text-xs text-purple-600">Editar perfil</p>
              </div>
            </div>

            <hr className="border-gray-100 my-2" />

            {!isAdmin && (
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white h-10" onClick={() => { setOpenWhats(true); setMenuOpen(false); }}>
                <i className="fab fa-whatsapp mr-2 text-lg" /> Agendar Aula
              </Button>
            )}

            {isAdmin && (
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white h-10" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                Gerenciar Conteúdo
              </Button>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100">
              <button
                onClick={() => { setOpenLogout(true); setMenuOpen(false); }}
                className="flex items-center gap-2 text-red-600 font-medium w-full p-2 hover:bg-red-50 rounded-lg transition"
              >
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
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => window.open(whatsappHref, "_blank")}>Continuar</Button>
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
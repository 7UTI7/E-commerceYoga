import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
// IMPORTAÇÕES CORRIGIDAS (Caminho relativo seguro)
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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className={`mx-auto ${CONTENT_MAX} px-4 sm:px-6 lg:px-8`}>
        <div className="h-[72px] flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 shrink-0 hover:opacity-90">
              <img src="/assets/logo.jpg" alt="Logo" className="h-10 w-10 rounded" />
              <span className="text-xl font-semibold text-purple-800 hidden md:inline">Karla Rodrigues Yoga</span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button className="text-purple-600 hover:text-purple-800"><i className="fab fa-instagram text-[18px]" /></button>
            <button className="text-purple-600 hover:text-purple-800"><i className="fab fa-facebook text-[18px]" /></button>

            {!isAdmin && (
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow" onClick={() => setOpenWhats(true)}>
                <i className="fab fa-whatsapp text-[16px] mr-2" /> Agendar
              </Button>
            )}

            {isAdmin && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow" onClick={() => navigate("/admin")}>
                Gerenciar
              </Button>
            )}

            {/* Perfil com Foto */}
            <Button variant="secondary" className="border-purple-300 pl-2" onClick={() => navigate("/user/profile")}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover mr-2 bg-gray-200" />
              ) : (
                <User className="w-4 h-4 mr-2" />
              )}
              {user?.name?.split(" ")[0] || "Aluno"}
            </Button>

            <Button variant="secondary" className="border-purple-300" onClick={() => setOpenLogout(true)} title="Sair">
              <LogOut className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Sair</span>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(true)} className="text-purple-800 p-2"><Menu className="w-8 h-8" /></button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)}></div>
        <div className={`relative bg-white w-72 h-full shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-bold text-purple-800 text-lg">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer" onClick={() => { navigate("/user/profile"); setMenuOpen(false); }}>
              <div className="shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="bg-purple-200 p-2 rounded-full"><User className="w-5 h-5 text-purple-700" /></div>
                )}
              </div>
              <div><p className="font-semibold text-purple-900">{user?.name?.split(" ")[0]}</p><p className="text-xs text-purple-600">Ver perfil</p></div>
            </div>
            <button onClick={() => { setOpenLogout(true); setMenuOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium mt-auto p-2 hover:bg-red-50 rounded"><LogOut className="w-5 h-5" />Sair da conta</button>
          </div>
        </div>
      </div>

      {/* Modais */}
      <Dialog open={openWhats} onOpenChange={setOpenWhats}>
        <DialogContent><DialogHeader><DialogTitle>WhatsApp</DialogTitle><DialogDescription>Ir para o WhatsApp?</DialogDescription></DialogHeader><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpenWhats(false)}>Cancelar</Button><Button onClick={() => window.open("https://wa.me/5511999999999", "_blank")}>Continuar</Button></div></DialogContent>
      </Dialog>
      <Dialog open={openLogout} onOpenChange={setOpenLogout}>
        <DialogContent><DialogHeader><DialogTitle>Sair?</DialogTitle></DialogHeader><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpenLogout(false)}>Não</Button><Button variant="destructive" onClick={() => { clearSession?.(); navigate("/"); }}>Sim</Button></div></DialogContent>
      </Dialog>
    </header>
  );
}
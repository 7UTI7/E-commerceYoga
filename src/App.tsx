import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/header";
import { Header as UserHeader } from "./userui/components/Header"; // header do logado
import Footer from "./components/footer";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { token } = useAuth();
  const location = useLocation();

  // esconder layout padrão em telas limpas
  const hideDefaultLayout = ["/login", "/cadastro"].includes(location.pathname);
  const hideFooter = hideDefaultLayout;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {!hideDefaultLayout && (token ? <UserHeader /> : <Header />)}

      <main className="flex-1 min-h-[60vh]">
        <Outlet />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

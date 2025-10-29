import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import UserApp from "./userui/userApp";
import Admin from "./pages/admin";
import ProfilePage from "./pages/profile";
import PostDetail from "./userui/components/post-detail";
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalErrorBoundary from "./userui/components/GlobalErrorBoundary";
import "./index.css";

// Logs globais
window.addEventListener("error", (e) => {
  console.error("[window.error]", (e as ErrorEvent).error || (e as ErrorEvent).message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", (e as PromiseRejectionEvent).reason);
});

// Rotas
const appRoutes = {
  path: "/",
  element: <App />,
  children: [{ index: true, element: <Home /> }],
};




const bareRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <UserApp />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post/:kind/:id",
    element: (
      <ProtectedRoute>
        <PostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Admin />
      </AdminRoute>
    ),
  },
  {
    path: "*",
    element: (
      <div className="min-h-dvh flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">404</h1>
          <p className="mt-2 text-gray-600">Página não encontrada.</p>
        </div>
      </div>
    ),
  },
];

const router = createBrowserRouter([appRoutes, ...bareRoutes]);

// Guard de bootstrap: se *qualquer* erro acontecer antes de montar,
// a gente mostra na tela em vez de ficar branco.
function renderApp() {
  try {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <AuthProvider>
          <GlobalErrorBoundary>
            <RouterProvider router={router} />
          </GlobalErrorBoundary>
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (err: any) {
    const msg =
      (err && (err.message || String(err))) || "Erro desconhecido durante o bootstrap do app.";
    console.error("[bootstrap error]", err);
    const box = document.createElement("pre");
    box.style.whiteSpace = "pre-wrap";
    box.style.padding = "16px";
    box.style.margin = "24px";
    box.style.border = "1px solid #fecaca";
    box.style.background = "#fef2f2";
    box.style.color = "#991b1b";
    box.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    box.textContent = `Falha ao iniciar a UI:\n\n${msg}`;
    document.body.innerHTML = "";
    document.body.appendChild(box);
  }
}

renderApp();

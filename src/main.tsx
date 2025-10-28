import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import UserApp from "./userui/userApp";                 // área logada (feed)
import Admin from "./pages/admin";                      // painel da professora
import PostDetail from "./userui/components/post-detail";          // <- ajuste o caminho se necessário
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

// --- Layout com Header/Footer (precisa ter <Outlet/> dentro de App) ---
const appRoutes = {
  path: "/",
  element: <App />,
  children: [
    { index: true, element: <Home /> }, // "/"
    // outras rotas públicas com header/footer, se quiser
  ],
};

// --- Rotas sem layout (telas “limpas”) ---
const bareRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },

  // feed do usuário (protegido)
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <UserApp />
      </ProtectedRoute>
    ),
  },

  // detalhes de post (protegido)
  {
    path: "/post/:kind/:id", // kind: article | video | event | class
    element: (
      <ProtectedRoute>
        <PostDetail />
      </ProtectedRoute>
    ),
  },

  // painel admin (precisa ser ADMIN)
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Admin />
      </AdminRoute>
    ),
  },

  // 404
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

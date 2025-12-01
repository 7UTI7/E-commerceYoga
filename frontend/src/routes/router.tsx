// src/routes/router.tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

// layouts / guards
import App from "../App"; // layout com Header/Footer e <Outlet/>
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

// páginas
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import User from "../pages/user";
import Admin from "../pages/admin";
import VerificacaoCadastro from "../pages/verificacaoCadastro";

// 404 simples
function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">Página não encontrada.</p>
      </div>
    </div>
  );
}

// Rotas que usam o layout App (com Header/Footer)
const appRoutes = {
  path: "/",
  element: <App />,
  children: [
    { index: true, element: <Home /> }, // "/"
    // se quiser outras páginas com header/footer, coloque aqui
  ],
};

// Rotas sem layout (login, cadastro, área do usuário, admin)
const bareRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },

  // protegido: precisa estar logado
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },

  {
  path: "/verify-email/:token", // <--- O link do e-mail aponta pra cá
  element: <VerificacaoCadastro />
},

  // admin: precisa estar logado e ter role ADMIN
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Admin />
      </AdminRoute>
    ),
  },

  { path: "*", element: <NotFound /> },
];

export const router = createBrowserRouter([appRoutes, ...bareRoutes]);

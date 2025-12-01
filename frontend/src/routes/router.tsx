import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import User from "../pages/user";
import Admin from "../pages/admin";
import VerificacaoCadastro from "../pages/verificacaoCadastro";

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

const appRoutes = {
  path: "/",
  element: <App />,
  children: [
    { index: true, element: <Home /> },
  ],
};

const bareRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },

  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },

  {
    path: "/verify-email/:token",
    element: <VerificacaoCadastro />
  },

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
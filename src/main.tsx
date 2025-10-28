import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import UserApp from "./userui/userApp";          // <= tela logada real
import Admin from "./pages/admin";               // <= painel da professora
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

// --- Layout com Header/Footer ---
const appRoutes = {
  path: "/",
  element: <App />, // deve renderizar <Outlet />
  children: [
    { index: true, element: <Home /> }, // "/"
  ],
};

// --- Rotas sem layout (telas limpas) ---
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

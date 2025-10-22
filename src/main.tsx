import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/home";
import Login from "./pages/login";
import "./index.css";
import Cadastro from "./pages/cadastro";
import User from "./pages/user"; 

// === Layout com Header/Footer ===
const appRoutes = {
  path: "/",
  element: <App />, // tem header/footer
  children: [
    { index: true, element: <Home /> }, // rota /
    // aqui entram outras páginas que também terão header/footer
  ],
};

// === Layout sem Header/Footer (ex: login, cadastro) ===
const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },
  { path: "/user", element: <User /> },
  // { path: "/cadastro", element: <Cadastro /> } quando criar
];

// === Criação final do roteador ===
const router = createBrowserRouter([appRoutes, ...authRoutes]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

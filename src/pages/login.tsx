import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function getStorage() {
    return remember ? localStorage : sessionStorage;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      setLoading(true);

      // chama a API
      const data = await apiLogin(email, password);

      // alguns backends retornam { user, token }; outros retornam flat
      const user = (data as any).user ?? {
        _id: (data as any)._id,
        name: (data as any).name,
        email: (data as any).email,
        role: (data as any).role,
      };
      const token = (data as any).token;

      if (!token || !user) {
        throw new Error("Resposta de login inválida.");
      }

      const storage = getStorage();
      storage.setItem("auth_token", token);
      storage.setItem("auth_user", JSON.stringify(user));

      // ADMIN vai pro painel; USER vai pra tela do usuário logado
      if (user.role === "ADMIN") navigate("/admin");
      else navigate("/user");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Falha no login. Verifique suas credenciais.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid md:grid-cols-2 min-h-dvh bg-white text-gray-900 antialiased">
      {/* imagem lateral */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&crop=center"
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-purple-600/20"></div>
      </div>

      {/* formulário */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <img
            src="/assets/logo.jpg"
            alt="Logo Namaste Yoga"
            className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px]"
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Entre na sua conta</h2>
          <p className="text-sm text-gray-600 mt-1">Bem-vindo de volta! Continue sua jornada.</p>

          <form onSubmit={handleLogin} className="mt-6 rounded-2xl bg-purple-50 p-6 shadow-lg space-y-4">
            {/* email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                />
              </div>
            </div>

            {/* senha */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            {/* lembrar/esqueceu */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-purple-600"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Lembrar de mim</span>
              </label>
              <a href="#" className="text-purple-700 font-medium hover:text-purple-800">
                Esqueceu a senha?
              </a>
            </div>

            {/* erro */}
            {errorMsg && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* botão entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            {/* separador */}
            <div className="relative my-2 text-center">
              <span className="relative z-10 bg-purple-50 px-3 text-sm text-gray-600">ou</span>
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-300" />
            </div>

            {/* rodapé */}
            <div className="text-center text-sm text-gray-600">
              Ainda não tem conta?{" "}
              <Link to="/cadastro" className="text-purple-700 font-medium hover:text-purple-800">
                Cadastre-se
              </Link>
            </div>
          </form>

          {/* voltar */}
          <div className="mt-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

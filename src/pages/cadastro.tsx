import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister, login as apiLogin } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Cadastro() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const _phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const termsChecked = (form.elements.namedItem("terms") as HTMLInputElement).checked;

    if (!termsChecked) {
      setErrorMsg("Você precisa aceitar os termos para continuar.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRegister(name, email, password);

      const tokenFromRegister = (data as any)?.token;
      const userFromRegister =
        (data as any).user ?? {
          _id: (data as any)?._id,
          name: (data as any)?.name,
          email: (data as any)?.email,
          role: (data as any)?.role,
        };

      let token = tokenFromRegister;
      let user = userFromRegister;

      if (!token) {
        const loginData = await apiLogin(email, password);
        user =
          (loginData as any).user ?? {
            _id: (loginData as any)?._id,
            name: (loginData as any)?.name,
            email: (loginData as any)?.email,
            role: (loginData as any)?.role,
          };
        token = (loginData as any).token;
      }

      if (!token || !user) throw new Error("Não foi possível autenticar após o cadastro.");

      setSession(user, token, true); // lembrar por padrão
      navigate("/user");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Falha ao criar conta. Tente novamente.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid md:grid-cols-2 min-h-dvh bg-white text-gray-900 antialiased">
      {/* IMAGEM LATERAL */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop&crop=center"
          className="absolute inset-0 h-full w-full object-cover"
          alt="Yoga ambiente"
        />
        <div className="absolute inset-0 bg-purple-600/20" />
      </div>

      {/* FORMULÁRIO */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* LOGO E TÍTULOS */}
          <div className="text-center mb-6">
            <img
              src="/assets/logo.jpg"
              alt="Logo Namaste Yoga"
              className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px]"
            />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Crie sua conta</h2>
            <p className="mt-1 text-sm text-gray-600">
              Junte-se à nossa comunidade e inicie sua jornada.
            </p>
          </div>

          {/* CARD DE CADASTRO */}
          <div className="rounded-2xl bg-purple-50 p-6 shadow-lg">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Nome */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
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

              {/* Telefone (opcional) */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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

              {/* Confirmar senha */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Termos */}
              <div className="flex items-start gap-2 text-sm">
                <input id="terms" name="terms" type="checkbox" className="mt-1 size-4 accent-purple-600" required />
                <label htmlFor="terms" className="text-gray-700">
                  Eu aceito os{" "}
                  <a href="#" className="text-purple-700 hover:text-purple-800 font-medium">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-purple-700 hover:text-purple-800 font-medium">
                    política de privacidade
                  </a>
                  .
                </label>
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Criando conta…" : "Criar conta"}
              </button>

              <div className="relative my-2 text-center">
                <span className="relative z-10 bg-purple-50 px-3 text-sm text-gray-600">ou</span>
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-300" />
              </div>

              <div className="text-center text-sm text-gray-600">
                Já tem conta?{" "}
                <Link to="/login" className="text-purple-700 font-medium hover:text-purple-800">
                  Faça login aqui
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

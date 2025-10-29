// src/pages/cadastro.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister, login as apiLogin } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

function formatPhone(value: string) {
  // mantém apenas dígitos
  const digits = value.replace(/\D/g, "").slice(0, 11); // máximo 11 (celular BR)
  const d = digits.split("");

  // (DD) 9XXXX-XXXX
  if (d.length <= 2) return `(${d.join("")}`;
  if (d.length <= 7) return `(${d.slice(0, 2).join("")}) ${d.slice(2).join("")}`;
  if (d.length <= 11)
    return `(${d.slice(0, 2).join("")}) ${d.slice(2, 7).join("")}-${d.slice(7).join("")}`;
  return value;
}

function isValidBrazilMobileMasked(masked: string) {
  // Aceita formato (DD) 9XXXX-XXXX -> 2 dígitos + 9 + 4
  // Não forço o 9 na terceira posição, mas mantenho 11 dígitos total.
  const digits = masked.replace(/\D/g, "");
  return digits.length === 11;
}

function isStrongPassword(pw: string) {
  // mínimo 8, ao menos 1 minúscula e 1 maiúscula
  return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pw);
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // para aplicar máscara de telefone no input (não preciso controlar todos os campos)
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const phoneMask = (form.elements.namedItem("phone") as HTMLInputElement)?.value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const termsChecked = (form.elements.namedItem("terms") as HTMLInputElement).checked;

    if (!termsChecked) {
      setErrorMsg("Você precisa aceitar os termos para continuar.");
      return;
    }

    if (!isStrongPassword(password)) {
      setErrorMsg("A senha deve ter ao menos 8 caracteres, com letras minúsculas e maiúsculas.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    if (phoneMask && !isValidBrazilMobileMasked(phoneMask)) {
      setErrorMsg("Informe um celular válido no formato (DD) 9XXXX-XXXX.");
      return;
    }

    try {
      setLoading(true);

      // o backend já valida a senha; aqui garantimos feedback imediato
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

      // se o registro não devolver token, faz login em seguida
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

      setSession(user, token, true); // lembra por padrão (como no login)
      navigate("/user");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Falha no cadastro. Verifique os dados e tente novamente.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid md:grid-cols-2 min-h-dvh bg-white text-gray-900 antialiased">
      {/* Imagem lateral */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&crop=center"
          alt="Yoga background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Conteúdo */}
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
                  <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

              {/* Telefone (opcional, com máscara e limite) */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="(11) 9XXXX-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onInput={(e) => {
                      const el = e.currentTarget as HTMLInputElement;
                      el.value = formatPhone(el.value);
                    }}
                    maxLength={16} // ex.: "(99) 99999-9999" tem 16 caracteres
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
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    minLength={8}
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
                <p className="mt-1 text-xs text-gray-600">
                  A senha deve ter <strong>mínimo de 8 caracteres</strong>, com <strong>letras minúsculas</strong> e{" "}
                  <strong>maiúsculas</strong>.
                </p>
              </div>

              {/* Confirmar senha */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

              {/* Erro (mesmo estilo do login) */}
              {errorMsg && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Termos */}
              <div className="flex items-center gap-3">
                <input id="terms" name="terms" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Eu li e concordo com os{" "}
                  <a className="text-purple-700 hover:text-purple-800 underline" href="#" onClick={(ev) => ev.preventDefault()}>
                    termos de uso
                  </a>
                  .
                </label>
              </div>

              {/* Criar conta */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white shadow hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Criando conta…" : "Criar conta"}
              </button>

              {/* Separador */}
              <div className="relative my-2 text-center">
                <span className="relative z-10 bg-purple-50 px-2 text-xs text-gray-500">ou</span>
                <div className="absolute left-0 right-0 top-1/2 -z-0 h-px bg-gray-200" />
              </div>

              {/* Já tem conta */}
              <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-purple-700 hover:text-purple-800 font-medium">
                  Entrar
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

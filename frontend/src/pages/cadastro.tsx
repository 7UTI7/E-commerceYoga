import { useState } from "react";
import { Link } from "react-router-dom";
import { register as apiRegister } from "../lib/api";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const d = digits.split("");
  if (d.length <= 2) return `(${d.join("")}`;
  if (d.length <= 7) return `(${d.slice(0, 2).join("")}) ${d.slice(2).join("")}`;
  if (d.length <= 11)
    return `(${d.slice(0, 2).join("")}) ${d.slice(2, 7).join("")}-${d.slice(7).join("")}`;
  return value;
}

function isValidBrazilMobileMasked(masked: string) {
  const digits = masked.replace(/\D/g, "");
  return digits.length === 11;
}

function isStrongPassword(pw: string) {
  return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pw);
}

export default function Cadastro() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

      await apiRegister(name, email, password);

      setRegisteredEmail(email);
      setIsSuccess(true);

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
          {/* LOGO */}
          <div className="text-center mb-6">
            <img
              src="/assets/logo.jpg"
              alt="Logo Namaste Yoga"
              className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px]"
            />
          </div>

          {/* CARD PRINCIPAL */}
          <div className="rounded-2xl bg-purple-50 p-6 shadow-lg">

            {isSuccess ? (
              // --- TELA DE SUCESSO PÓS-CADASTRO ---
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope-open-text text-3xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quase lá!</h2>
                <p className="text-gray-600 mb-6">
                  Enviamos um link de confirmação para <strong>{registeredEmail}</strong>.
                  <br />
                  Por favor, verifique seu e-mail para ativar sua conta.
                </p>

                <div className="bg-white p-4 rounded-lg border border-purple-100 text-sm text-gray-500 mb-6">
                  <p>Não recebeu? Verifique sua caixa de Spam ou Lixo Eletrônico.</p>
                </div>

                <Link
                  to="/login"
                  className="inline-block w-full rounded-lg bg-purple-600 py-3 font-medium text-white shadow hover:bg-purple-700 transition"
                >
                  Ir para o Login
                </Link>
              </div>
            ) : (
              // --- FORMULÁRIO DE CADASTRO ---
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Junte-se à nossa comunidade e inicie sua jornada.
                  </p>
                </div>

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

                  {/* Telefone */}
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
                        maxLength={16}
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
                      Mínimo de 8 caracteres, com letras minúsculas e maiúsculas.
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

                  {/* Erro */}
                  {errorMsg && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

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
              </>
            )}
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
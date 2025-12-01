import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg("Por favor, insira seu e-mail.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao enviar e-mail. Verifique se o endereço está correto.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <img
          src="/assets/logo.jpg"
          alt="Logo Namaste Yoga"
          className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px]"
        />

        <h2 className="mt-4 text-2xl font-bold text-gray-900">Recuperar senha</h2>
        <p className="text-sm text-gray-600 mt-1">Insira seu e-mail para redefinir sua senha.</p>

        <div className="mt-6 rounded-2xl bg-purple-50 p-6 shadow-lg space-y-4">
          {isSubmitted ? (
            // --- TELA DE SUCESSO ---
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-paper-plane text-3xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">E-mail Enviado!</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enviamos instruções de recuperação para <strong>{email}</strong>.
                <br />Verifique sua caixa de entrada e spam.
              </p>
              <div className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-purple-700 font-medium hover:text-purple-800">
                  Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            // --- FORMULÁRIO ---
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 text-left">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                </div>
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
                {loading ? "Enviando..." : "Enviar Link"}
              </button>

              <div className="relative my-2 text-center">
                <span className="relative z-10 bg-purple-50 px-3 text-sm text-gray-600">ou</span>
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-300" />
              </div>

              <div className="text-center text-sm text-gray-600">
                Lembrou sua senha?{" "}
                <Link to="/login" className="text-purple-700 font-medium hover:text-purple-800">
                  Fazer login
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Voltar para página inicial
          </Link>
        </div>

      </div>
    </div>
  );
}
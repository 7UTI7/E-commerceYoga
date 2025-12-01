import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../lib/api";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg("Token inválido ou inexistente.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao redefinir senha. O link pode ter expirado.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-600">Erro: Link de recuperação inválido.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8">
      <div className="w-full max-w-md text-center">

        <img
          src="/assets/logo.jpg"
          alt="Logo Namaste Yoga"
          className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px]"
        />

        <h2 className="mt-4 text-2xl font-bold text-gray-900">Nova Senha</h2>
        <p className="text-sm text-gray-600 mt-1">Crie uma nova senha segura para sua conta.</p>

        <div className="mt-6 rounded-2xl bg-purple-50 p-6 shadow-lg space-y-4">
          {success ? (
            // --- SUCESSO ---
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-3xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Senha Alterada!</h2>
              <p className="text-sm text-gray-600 mb-6">
                Sua senha foi atualizada com sucesso. Você já pode fazer login.
              </p>
              <Link to="/login" className="inline-block w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 transition text-center">
                Ir para Login
              </Link>
            </div>
          ) : (
            // --- FORMULÁRIO DE NOVA SENHA ---
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nova Senha */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 text-left">Nova Senha</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 text-left">Confirmar Senha</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-base outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
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
                className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 transition disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
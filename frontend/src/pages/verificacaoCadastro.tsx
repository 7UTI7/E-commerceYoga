import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../lib/api";

export default function VerificacaoCadastro() {
  const { token } = useParams<{ token: string }>();

  const effectRan = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (effectRan.current === true) return;

    async function executeVerification() {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Token inválido ou não encontrado.");
        return;
      }

      effectRan.current = true;

      try {
        const data = await verifyEmail(token);

        setSuccess(true);
        setMessage(data.message || "Cadastro concluído com sucesso!");

        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

      } catch (err: any) {
        setSuccess(false);
        const errorMsg = err?.response?.data?.message || "Erro ao verificar e-mail.";

        if (errorMsg.includes("expirado") || errorMsg.includes("inválido")) {
          setMessage("Link expirado ou código errado.");
        } else {
          setMessage(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    }

    executeVerification();

    return () => {
      effectRan.current = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8">
      <div className="w-full max-w-md text-center">

        <img
          src="/assets/logo.jpg"
          alt="Logo Namaste Yoga"
          className="block mx-auto h-auto object-contain !w-[140px] sm:!w-[160px] md:!w-[180px] mb-6"
        />

        <div className="rounded-2xl bg-white p-8 shadow-xl border border-purple-50">

          {loading ? (
            <div className="py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700">Verificando...</h2>
            </div>
          ) : success ? (
            <div className="py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-4xl text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h2>
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>

              <Link
                to="/login"
                className="inline-block w-full rounded-lg bg-purple-600 py-3 font-medium text-white shadow hover:bg-purple-700 transition"
              >
                Fazer Login Agora
              </Link>
            </div>
          ) : (
            <div className="py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-times text-4xl text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to="/cadastro"
                  className="inline-block w-full rounded-lg bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200 transition"
                >
                  Tentar Cadastrar Novamente
                </Link>
                <Link
                  to="/login"
                  className="text-purple-600 hover:underline text-sm"
                >
                  Voltar ao Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Namaste Yoga
        </div>

      </div>
    </div>
  );
}
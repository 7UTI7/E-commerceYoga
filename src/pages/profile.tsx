// src/pages/profile.tsx
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, User as UserIcon, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMe, updateMe, type User } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

import { Button } from "../userui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../userui/components/ui/dialog";

// helpers
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const d = digits.split("");
  if (d.length <= 2) return `(${d.join("")}`;
  if (d.length <= 7) return `(${d.slice(0, 2).join("")}) ${d.slice(2).join("")}`;
  return `(${d.slice(0, 2).join("")}) ${d.slice(2, 7).join("")}-${d.slice(7).join("")}`;
}
function isValidPhone(masked: string) {
  return masked.replace(/\D/g, "").length === 11;
}
function isStrongPassword(pw: string) {
  return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pw);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // edição
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // troca senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // modais
  const [openConfirmInfo, setOpenConfirmInfo] = useState(false);
  const [openConfirmPassword, setOpenConfirmPassword] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await getMe();
        if (!alive) return;
        setMe(data);
        setName(data.name || "");
        setPhone(formatPhone(data.phone || ""));
      } catch (err: any) {
        if (!alive) return;
        setErrorMsg(err?.response?.data?.message || "Não foi possível carregar seu perfil.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  async function doSaveInfo() {
    setErrorMsg(null); setSuccessMsg(null);
    try {
      if (!name.trim()) throw new Error("Informe seu nome.");
      if (phone && !isValidPhone(phone)) throw new Error("Informe um celular válido.");

      const updated = await updateMe({
        name: name.trim(),
        phone: phone ? phone.replace(/\D/g, "") : undefined,
      });

      setMe(updated);
      const token = localStorage.getItem("auth_token") || "";
      setSession?.(updated, token, true);
      setSuccessMsg("Perfil atualizado com sucesso.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Falha ao atualizar perfil.");
    }
  }

  async function doChangePassword() {
    setErrorMsg(null); setSuccessMsg(null);
    try {
      if (!currentPassword) throw new Error("Informe sua senha atual.");
      if (!isStrongPassword(newPassword))
        throw new Error("Nova senha deve ter ao menos 8 caracteres, com letras minúsculas e maiúsculas.");
      if (newPassword !== confirmNewPassword) throw new Error("A confirmação da nova senha não confere.");

      await updateMe({ currentPassword, newPassword });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMsg("Senha alterada com sucesso.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Não foi possível alterar a senha.");
    }
  }

  if (loading) {
    return <div className="min-h-dvh flex items-center justify-center text-gray-500">Carregando…</div>;
  }

  return (
    <section className="min-h-dvh bg-gradient-to-b from-purple-50 to-white">
      {/* topo */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <div className="text-sm text-gray-600">
            Logado como <strong>{user?.email}</strong>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meu Perfil</h1>

        {errorMsg && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {/* Dados pessoais */}
        <div className="rounded-2xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-medium mb-4">Dados Pessoais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Nome</span>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Telefone</span>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  inputMode="numeric"
                  placeholder="(11) 9XXXX-XXXX"
                  maxLength={16}
                />
              </div>
              <span className="text-xs text-gray-500">Opcional • apenas números válidos serão aceitos</span>
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm text-gray-700">Email</span>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-600"
                value={me?.email || ""}
                readOnly
              />
              <span className="text-xs text-gray-500">Seu email de login não pode ser alterado.</span>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setOpenConfirmInfo(true)}>
              Salvar alterações
            </Button>
          </div>
        </div>

        {/* Trocar senha */}
        <div className="rounded-2xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-medium mb-4">Trocar Senha</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Senha atual</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2.5 outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  type={showCurr ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurr((v) => !v)}
                >
                  <i className={`fas ${showCurr ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Nova senha</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2.5 outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNew((v) => !v)}
                >
                  <i className={`fas ${showNew ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              <span className="text-xs text-gray-500">
                Mínimo de 8 caracteres, com letras minúsculas e maiúsculas.
              </span>
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm text-gray-700">Confirmar nova senha</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 py-2.5 outline-none ring-purple-200 focus:border-purple-600 focus:ring-4"
                  type={showConf ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConf((v) => !v)}
                >
                  <i className={`fas ${showConf ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setOpenConfirmPassword(true)}
              disabled={!currentPassword && !newPassword && !confirmNewPassword}
            >
              Alterar senha
            </Button>
          </div>
        </div>
      </div>

      {/* Modal confirmar salvar dados */}
      <Dialog open={openConfirmInfo} onOpenChange={setOpenConfirmInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar alterações do perfil?</DialogTitle>
            <DialogDescription>Confirme para atualizar seus dados.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button
              className="rounded-lg"
              onClick={() => {
                setOpenConfirmInfo(false);
                void doSaveInfo();
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar troca de senha */}
      <Dialog open={openConfirmPassword} onOpenChange={setOpenConfirmPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alteração de senha?</DialogTitle>
            <DialogDescription>Você precisará informar sua senha atual corretamente.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-lg">Cancelar</Button>
            </DialogClose>
            <Button
              className="rounded-lg"
              onClick={() => {
                setOpenConfirmPassword(false);
                void doChangePassword();
              }}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

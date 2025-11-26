import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Phone, User as UserIcon, Lock, Camera, Loader2, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getMe, updateMe, updatePassword, uploadImage, type User } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../userui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../userui/components/ui/dialog";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
function isStrongPassword(pw: string) {
  return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pw);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [openConfirmInfo, setOpenConfirmInfo] = useState(false);
  const [openConfirmPassword, setOpenConfirmPassword] = useState(false);

  // Crop States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [openCropModal, setOpenCropModal] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getMe();
        if (!alive) return;
        setMe(data);
        setName(data.name || "");
        setPhone(formatPhone(data.phone || ""));
        setAvatar(data.avatar || "");
      } catch (err: any) {
        if (!alive) return;
        setErrorMsg("Erro ao carregar perfil.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setOpenCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = async () => {
    try {
      setIsUploading(true);
      setOpenCropModal(false);
      const croppedImageBlob = await getCroppedImg(imageSrc!, croppedAreaPixels);
      const response = await uploadImage(croppedImageBlob);
      setAvatar(response.imageUrl);
      setSuccessMsg("Foto enviada! Clique em 'Salvar alterações' para finalizar.");
    } catch (e) {
      setErrorMsg("Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
      setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function doSaveInfo() {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (!name.trim()) throw new Error("Nome obrigatório.");

      const payload = {
        name: name.trim(),
        phone: phone.replace(/\D/g, ""),
        email: me?.email,
        avatar: avatar // Envia URL da foto
      };

      // Chama a API
      const updatedUser = await updateMe(payload);
      setMe(updatedUser);

      // ATUALIZA A SESSÃO SEM DESLOGAR
      const currentToken = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
      setSession(updatedUser, currentToken, true);

      setSuccessMsg("Perfil salvo com sucesso!");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Erro ao salvar.");
    }
  }

  async function doChangePassword() {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (!currentPassword) throw new Error("Senha atual obrigatória.");
      if (!isStrongPassword(newPassword)) throw new Error("Senha muito fraca.");
      if (newPassword !== confirmNewPassword) throw new Error("Senhas não conferem.");
      await updatePassword({ oldPassword: currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setSuccessMsg("Senha alterada com sucesso.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Erro ao alterar senha.");
    }
  }

  if (loading) return <div className="min-h-dvh flex items-center justify-center">Carregando...</div>;

  return (
    <section className="min-h-dvh bg-gradient-to-b from-purple-50 to-white">
      <div className="sticky top-0 z-40 bg-white border-b p-4">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-purple-700">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <span className="text-sm text-gray-600">Logado como <strong>{user?.email}</strong></span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">{errorMsg}</div>}
        {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200">{successMsg}</div>}

        {/* CARD DADOS */}
        <div className="bg-white shadow p-6 rounded-2xl">
          <h2 className="text-lg font-medium mb-6">Dados Pessoais</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-purple-50">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 m-auto mt-6 text-gray-300" />}
                {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
              </div>
              <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="bg-purple-600 text-white p-2 rounded-full shadow hover:bg-purple-700">
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
            </div>

            <div className="flex-1 grid gap-4 md:grid-cols-2 content-start">
              <div><label className="text-sm text-gray-700">Nome</label><input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="text-sm text-gray-700">Telefone</label><input className="w-full border rounded p-2" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength={16} /></div>
              <div className="md:col-span-2"><label className="text-sm text-gray-700">Email</label><input className="w-full border rounded p-2 bg-gray-50" value={me?.email || ""} disabled /></div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setOpenConfirmInfo(true)}>Salvar alterações</Button>
          </div>
        </div>

        {/* CARD SENHA */}
        <div className="bg-white shadow p-6 rounded-2xl">
          <h2 className="text-lg font-medium mb-4">Trocar Senha</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative"><label className="text-sm">Senha Atual</label><input type={showCurr ? "text" : "password"} className="w-full border rounded p-2" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /><button onClick={() => setShowCurr(!showCurr)} className="absolute right-3 top-8 text-gray-400"><Lock className="w-4 h-4" /></button></div>
            <div className="relative"><label className="text-sm">Nova Senha</label><input type={showNew ? "text" : "password"} className="w-full border rounded p-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-gray-400"><Lock className="w-4 h-4" /></button></div>
            <div className="relative md:col-span-2"><label className="text-sm">Confirmar</label><input type={showConf ? "text" : "password"} className="w-full border rounded p-2" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} /><button onClick={() => setShowConf(!showConf)} className="absolute right-3 top-8 text-gray-400"><Lock className="w-4 h-4" /></button></div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setOpenConfirmPassword(true)}>Alterar senha</Button>
          </div>
        </div>
      </div>

      {/* MODAL CROP */}
      <Dialog open={openCropModal} onOpenChange={setOpenCropModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajustar Foto</DialogTitle><DialogDescription>Arraste e zoom.</DialogDescription></DialogHeader>
          <div className="relative h-64 w-full bg-black mt-4">
            {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} onZoomChange={setZoom} />}
          </div>
          <div className="mt-4 flex gap-4 items-center">
            <ZoomIn className="w-5 h-5 text-gray-500" />
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpenCropModal(false)}>Cancelar</Button>
            <Button onClick={showCroppedImage} className="bg-purple-600 text-white">Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAIS CONFIRMAÇÃO */}
      <Dialog open={openConfirmInfo} onOpenChange={setOpenConfirmInfo}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salvar?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setOpenConfirmInfo(false)}>Não</Button><Button onClick={() => { setOpenConfirmInfo(false); void doSaveInfo() }}>Sim</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={openConfirmPassword} onOpenChange={setOpenConfirmPassword}>
        <DialogContent>
          <DialogHeader><DialogTitle>Trocar Senha?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setOpenConfirmPassword(false)}>Não</Button><Button onClick={() => { setOpenConfirmPassword(false); void doChangePassword() }}>Sim</Button></div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// UTILS
const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.setAttribute('crossOrigin', 'anonymous');
  image.src = url;
});
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("No 2d context");
  canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => { if (!blob) { reject(new Error('Canvas empty')); return; } resolve(blob); }, 'image/jpeg');
  });
}
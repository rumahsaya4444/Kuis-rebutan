import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { UserAccountProfile } from '../types/quiz';
import { RefreshCw, Check, Copy, Download, Upload, Smartphone, Laptop, X, ShieldCheck } from 'lucide-react';

interface AccountSyncModalProps {
  currentProfile: UserAccountProfile;
  onProfileSynced: (syncedProfile: UserAccountProfile) => void;
  onClose: () => void;
}

export const AccountSyncModal: React.FC<AccountSyncModalProps> = ({
  currentProfile,
  onProfileSynced,
  onClose
}) => {
  const [syncToken, setSyncToken] = useState(currentProfile.syncToken);
  const [inputToken, setInputToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  // Render QR code for easy mobile scan
  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(
        qrRef.current,
        syncToken,
        {
          width: 130,
          margin: 1,
          color: {
            dark: '#ffffff',
            light: '#0b0f19'
          }
        },
        () => {}
      );
    }
  }, [syncToken]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(syncToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Push current profile to server cloud
  const handlePushCloud = async () => {
    setIsPushing(true);
    try {
      const res = await fetch('/api/sync/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: 'Data profil berhasil diunggah ke Cloud Server!', type: 'success' });
      } else {
        setStatusMessage({ text: data.message || 'Gagal menyinkronkan data.', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Koneksi server terganggu.', type: 'error' });
    } finally {
      setIsPushing(false);
    }
  };

  // Pull profile from server cloud using a token from another device
  const handlePullCloud = async () => {
    if (!inputToken.trim()) return;
    try {
      const res = await fetch(`/api/sync/account/${encodeURIComponent(inputToken.trim())}`);
      const data = await res.json();
      if (data.success && data.profile) {
        onProfileSynced(data.profile);
        setStatusMessage({ text: 'Berhasil mengimpor profil dari perangkat lain!', type: 'success' });
      } else {
        setStatusMessage({ text: data.message || 'Kode sinkronisasi tidak ditemukan.', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Gagal mengambil data dari server.', type: 'error' });
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KilatQuiz_Backup_${currentProfile.name}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-2xl text-indigo-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Sinkronisasi Akun Lintas Perangkat
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Akses statistik, kustomisasi avatar, dan rekor kuis di HP, Laptop, atau Tablet manapun.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section 1: Token Perangkat Saat Ini & QR Code */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <canvas ref={qrRef} className="rounded" />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kode Token Sinkronisasi Anda:
            </span>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-mono font-extrabold text-lg text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 tracking-wider">
                {syncToken}
              </span>
              <button
                onClick={handleCopyToken}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Salin Token"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Gunakan kode ini di perangkat lain untuk mengambil seluruh data profil dan XP kuis kamu.
            </p>

            <button
              onClick={handlePushCloud}
              disabled={isPushing}
              className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
              <span>Simpan ke Cloud Server</span>
            </button>
          </div>
        </div>

        {/* Section 2: Ambil Data dari Perangkat Lain */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Impor Akun dari Perangkat Lain
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Masukkan Kode Token (contoh: KZ-SYNC-9842)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handlePullCloud}
              className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Tarik Data</span>
            </button>
          </div>
        </div>

        {/* Section 3: Backup & Cadangan File */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cadangan Offline Lokal
          </span>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Profil (.JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

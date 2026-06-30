import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface CallOverlayProps {
  peerName: string;
  peerAvatar?: string;
  mode: 'audio' | 'video';
  connected: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangUp: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
}

const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function CallOverlay({
  peerName,
  peerAvatar,
  mode,
  connected,
  localStream,
  remoteStream,
  onHangUp,
  onToggleMute,
  isMuted
}: CallOverlayProps) {
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // ── Décompte : démarre uniquement une fois la connexion établie ──────────
  useEffect(() => {
    if (connected) {
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connected]);

  return (
    <div className="fixed inset-0 z-[998] flex flex-col items-center justify-end text-white overflow-hidden">
      {/* ── Fond ──────────────────────────────────────────────────────────── */}
      {mode === 'video' ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-charcoal-dark"
        />
      ) : (
        <>
          {/* L'audio distant doit quand même être lu, même invisible */}
          <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=1200')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 backdrop-blur-[2px]" />
        </>
      )}

      {/* ── Caméra locale (mode vidéo uniquement) ───────────────────────────── */}
      {mode === 'video' && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-6 right-4 w-24 h-36 sm:w-28 sm:h-40 rounded-2xl object-cover border-2 border-white/50 shadow-2xl z-10"
        />
      )}

      {/* ── Infos + contrôles ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full flex flex-col items-center gap-6 pb-10 px-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-24">
        {mode === 'audio' && (
          <div className="relative">
            {peerAvatar ? (
              <img
                src={peerAvatar}
                alt={peerName}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-medium/70 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-emerald-medium/20 border-4 border-emerald-medium/70 flex items-center justify-center text-3xl font-serif font-bold">
                {peerName.charAt(0)}
              </div>
            )}
            {!connected && (
              <span className="absolute inset-0 rounded-full border-4 border-emerald-medium animate-ping" />
            )}
          </div>
        )}

        <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
          <p className="font-serif text-xl font-bold tracking-tight">{peerName}</p>
          <p className="text-xs text-white/80 mt-1 font-medium">
            {connected ? `En communication • ${formatDuration(duration)}` : 'Appel en cours...'}
          </p>
        </div>

        <div className="flex items-center gap-5">
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`p-4 rounded-full backdrop-blur-md border border-white/20 active:scale-95 transition-all shadow-xl ${
                isMuted ? 'bg-gold-deep/80 hover:bg-gold-deep' : 'bg-white/15 hover:bg-white/25'
              }`}
              aria-label={isMuted ? 'Réactiver le micro' : 'Couper le micro'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={onHangUp}
            className="p-5 rounded-full bg-red-500/90 hover:bg-red-600 backdrop-blur-md border border-white/10 active:scale-95 transition-all shadow-2xl"
            aria-label="Raccrocher"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
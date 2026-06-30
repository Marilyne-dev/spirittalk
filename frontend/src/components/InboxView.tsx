// APRÈS
import React, { useState, useRef, useEffect, startTransition } from 'react';
import { 
  Mic, Square, Play, Image as ImageIcon, Send, Users, Sparkles, 
  Phone, Video, Volume2, Check, CheckCheck, ChevronLeft,
  PhoneOff, X
} from 'lucide-react';
import { Friend, DirectMessage } from '../types';
import { apiService } from '../services/api';

interface InboxViewProps {
  user: any;
  friends: Friend[];
  messages: DirectMessage[];
  unreadCounts: Record<string, number>;
  onSendMessage: (recipientId: string, text?: string, images?: string[], audioUrl?: string, audioDuration?: string) => void;
  onSimulateTyping: (recipientId: string) => void;
  onSelectFriend: (friendId: string) => void;
  onStartCall: (recipientId: string, mode: 'audio' | 'video') => void;
}

const API_BASE = ((import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/spirittalk').replace(/\/$/, '');

export default function InboxView({
  user,
  friends,
  messages,
  unreadCounts,
  onSendMessage,
  onSimulateTyping,
  onSelectFriend,
  onStartCall
}: InboxViewProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const [liveTypingText, setLiveTypingText] = useState<string>('');
  const [friendIsTyping, setFriendIsTyping] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // ── État appel (côté appelant) ────────────────────────────────────────────
  const [outgoingCall, setOutgoingCall] = useState<{ friendId: string; mode: 'audio' | 'video' } | null>(null);
  const [callIsActive, setCallIsActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingSecondsRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDisplayTimeout = useRef<NodeJS.Timeout | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const selectedFriend = friends.find(f => String(f.id) === String(selectedFriendId));
  const myId = String(user?.id || '');

  // ── FIX : scroll automatique ─────────────────────────────────────────────
 // APRÈS
useEffect(() => {
  const el = messagesEndRef.current;
  if (!el) return;
  const timeout = setTimeout(() => {
    try { el.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }, 150);
  return () => clearTimeout(timeout);
}, [messages.length, liveTypingText, friendIsTyping]);

  // ── Marquer comme lu ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFriendId) return;
    onSelectFriend(selectedFriendId);
    apiService.markMessagesAsRead(selectedFriendId).catch(() => {});
    setLiveTypingText('');
    setFriendIsTyping(false);
  }, [selectedFriendId]);

  // ── Timer durée appel ─────────────────────────────────────────────────────
  useEffect(() => {
    if (callIsActive) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callIsActive]);

  // ── Écouter les événements d'App.tsx ──────────────────────────────────────
 // APRÈS
  useEffect(() => {
    const handler = (e: any) => {
      const { type, stream } = e.detail || {};
      startTransition(() => {
        if (type === 'call_accepted') {
          setCallIsActive(true);
          if (stream) setRemoteStream(stream);
        }
        if (type === 'call_ended') {
          setOutgoingCall(null);
          setCallIsActive(false);
          setCallDuration(0);
          setRemoteStream(null);
        }
      });
    };
    window.addEventListener('spirittalk_call_event', handler);
    return () => window.removeEventListener('spirittalk_call_event', handler);
  }, []);

  // ── Lancer un appel ───────────────────────────────────────────────────────
  const handleStartCallLocal = (friendId: string, mode: 'audio' | 'video') => {
    setOutgoingCall({ friendId, mode });
    setCallIsActive(false);
    onStartCall(friendId, mode);
  };

  const handleHangUp = () => {
    setOutgoingCall(null);
    setCallIsActive(false);
    window.dispatchEvent(new CustomEvent('spirittalk_call_event', { detail: { type: 'hang_up' } }));
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Envoi typing ──────────────────────────────────────────────────────────
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (!selectedFriendId) return;
    
    apiService.sendTypingStatus(selectedFriendId, val.length > 0).catch(() => {});
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      apiService.sendTypingStatus(selectedFriendId, false).catch(() => {});
    }, 2000);
  };

  // ── Enregistrement audio ──────────────────────────────────────────────────
  const startRecording = async () => {
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => { const n = s + 1; recordingSecondsRef.current = n; return n; });
      }, 1000);
    } catch {
      alert("Microphone inaccessible");
    }
  };

  const stopRecordingAndSend = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      const durationAtStop = recordingSecondsRef.current;
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        streamRef.current?.getTracks().forEach(t => t.stop());

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onSendMessage(selectedFriendId!, undefined, undefined, base64, formatDuration(durationAtStop));
        };
        reader.readAsDataURL(blob);
      };
      mr.stop();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedImages.length === 0) return;
    if (!selectedFriendId) return;
    onSendMessage(selectedFriendId, inputText.trim(), attachedImages.length > 0 ? attachedImages : undefined);
    setInputText('');
    setAttachedImages([]);
    apiService.sendTypingStatus(selectedFriendId, false).catch(() => {});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;
  Array.from(files).forEach((file: any) => {
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    const reader = new FileReader();
    reader.onloadend = () => {
      img.onload = () => {
        const MAX = 200;
        let w = img.width, h = img.height;
        if (w > MAX) { h = h * MAX / w; w = MAX; }
        if (h > MAX) { w = w * MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        setAttachedImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.5)]);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

  // ── FILTRE DES MESSAGES (Correction IDs) ──────────────────────────────────
  const activeMessages = messages.filter(m => {
    const sId = String(m.senderId);
    const rId = String(m.recipientId);
    const fId = String(selectedFriendId);

    const isFromMeToFriend = (sId === myId || sId === 'me') && rId === fId;
    const isFromFriendToMe = sId === fId && (rId === myId || rId === 'me');

    return isFromMeToFriend || isFromFriendToMe;
  });

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const outgoingFriend = outgoingCall ? friends.find(f => String(f.id) === String(outgoingCall.friendId)) : null;

  return (
    <div className="h-[70vh] bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-3xl shadow-sm overflow-hidden flex relative">

      {/* ══════════════════════════════════════════════════════════════════
          OVERLAY APPEL SORTANT
      ══════════════════════════════════════════════════════════════════ */}
      {outgoingCall && outgoingFriend && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center text-white space-y-8 px-8 w-full max-w-md">

            {/* Video Remote (si vidéo et actif) */}
            {outgoingCall.mode === 'video' && callIsActive && (
                <video 
                    ref={(ref) => { if (ref && remoteStream) ref.srcObject = remoteStream; }}
                    autoPlay playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            )}

            <div className="relative mx-auto w-28 h-28 z-10">
              <img
                src={outgoingFriend.avatar}
                alt={outgoingFriend.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-medium mx-auto shadow-2xl"
              />
              {!callIsActive && <span className="absolute inset-0 rounded-full border-4 border-emerald-medium animate-ping" />}
            </div>

            <div className="space-y-1 z-10 relative">
              <p className="text-[11px] uppercase tracking-widest text-emerald-light font-bold">
                {outgoingCall.mode === 'video' ? '📹 Appel vidéo' : '📞 Appel audio'}
              </p>
              <h3 className="font-serif text-2xl font-bold">{outgoingFriend.name}</h3>
              <p className="text-sm text-white/60 mt-2">
                {callIsActive ? `En communication • ${formatDuration(callDuration)}` : 'Appel en cours...'}
              </p>
            </div>

            <button
              onClick={handleHangUp}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center mx-auto relative z-10 shadow-xl active:scale-90 transition-all"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SIDEBAR AMIS
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`w-full md:w-80 border-r border-cream-darker dark:border-charcoal-light/10 flex flex-col bg-slate-50/50 dark:bg-charcoal-dark/20 ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-cream-darker dark:border-charcoal-light/10">
          <h3 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1.5">
            <Users className="w-5 h-5 text-emerald-medium" />
            <span>Messagerie</span>
            {totalUnread > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">{totalUnread}</span>}
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {friends.filter(f => f.status === 'accepted').map((friend) => {
            const unread = unreadCounts[String(friend.id)] || 0;
            return (
              <button
                key={friend.id}
                onClick={() => setSelectedFriendId(String(friend.id))}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                  String(selectedFriendId) === String(friend.id) ? 'bg-emerald-medium/10 border border-emerald-medium/20' : 'hover:bg-cream-darker/40'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={friend.avatar} className="w-11 h-11 rounded-full object-cover border border-slate-200" alt="" />
                  {friend.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-xs font-bold truncate">{friend.name}</span>
                    {unread > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{unread}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONE DE CHAT
      ══════════════════════════════════════════════════════════════════ */}
      {selectedFriendId && selectedFriend ? (
        <div className="flex-grow flex flex-col bg-white dark:bg-charcoal-card h-full">

          {/* Header */}
          <div className="p-4 border-b border-cream-darker dark:border-charcoal-light/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedFriendId(null)} className="md:hidden"><ChevronLeft /></button>
              <img src={selectedFriend.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                <h4 className="font-serif text-sm font-bold">{selectedFriend.name}</h4>
                <p className="text-[10px] text-slate-400">
                  {friendIsTyping ? 'en train d\'écrire...' : selectedFriend.isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleStartCallLocal(selectedFriendId, 'audio')} className="p-2 text-slate-400 hover:text-emerald-medium"><Phone className="w-4 h-4" /></button>
              <button onClick={() => handleStartCallLocal(selectedFriendId, 'video')} className="p-2 text-slate-400 hover:text-emerald-medium"><Video className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/10 no-scrollbar">
            {activeMessages.map((msg) => {
              const isMe = String(msg.senderId) === myId || msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-2 text-xs shadow-sm ${
                    isMe ? 'bg-[#1D3557] text-white rounded-tr-none' : 'bg-white border border-cream-darker rounded-tl-none'
                  }`}>
                    {msg.text && <p>{msg.text}</p>}
                      {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.images.map((img, i) => (
                        <img key={i} src={img} className="max-w-[120px] max-h-[120px] rounded-lg object-cover" alt="" />
                      ))}
                    </div>
                  )}
                       {msg.audioUrl && (
                        <button 
                        onClick={() => { const a = new Audio(msg.audioUrl); a.play().catch(() => alert('Impossible de lire')); }}
                        className="flex items-center gap-2 p-2 bg-black/10 rounded-xl"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Note vocale ({msg.audioDuration})</span>
                      </button>
                    )}
                    <div className="text-[8px] opacity-60 text-right">{msg.timestamp}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <label className="cursor-pointer text-slate-400"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" /><ImageIcon className="w-5 h-5" /></label>
              
              {isRecording ? (
                <div className="flex-grow bg-red-50 text-red-500 p-2 rounded-xl flex justify-between items-center text-xs">
                  <span>Enregistrement... {recordingSeconds}s</span>
                  <button type="button" onClick={stopRecordingAndSend} className="bg-red-500 text-white px-3 py-1 rounded-lg">Envoyer</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Écrire..."
                    className="flex-grow text-xs bg-slate-50 border rounded-xl px-4 py-3 outline-none"
                  />
                  <button type="button" onClick={startRecording} className="text-slate-400"><Mic className="w-5 h-5" /></button>
                  <button type="submit" className="p-2.5 bg-[#1D3557] text-white rounded-xl"><Send className="w-5 h-5" /></button>
                </>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-slate-400 italic text-sm">
           Sélectionnez une discussion pour commencer
        </div>
      )}
    </div>
  );
}
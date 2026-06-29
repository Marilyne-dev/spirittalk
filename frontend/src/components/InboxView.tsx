import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // ── Typing en direct ──────────────────────────────────────────────────────
  const [liveTypingText, setLiveTypingText] = useState<string>('');
  const [friendIsTyping, setFriendIsTyping] = useState(false);

  // ── Audio Recorder ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // ── État appel (côté appelant) ────────────────────────────────────────────
  const [outgoingCall, setOutgoingCall] = useState<{ friendId: string; mode: 'audio' | 'video' } | null>(null);
  const [callIsActive, setCallIsActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingSecondsRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDisplayTimeout = useRef<NodeJS.Timeout | null>(null);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // ── FIX : scroll + force re-render à chaque nouveau message ─────────────
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length !== prevMsgCount.current) {
      prevMsgCount.current = messages.length;
      // Forcer le scroll même si on était déjà en bas
      requestAnimationFrame(() => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      });
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [selectedFriendId, liveTypingText, friendIsTyping]);

  // ── Marquer comme lu quand on ouvre ──────────────────────────────────────
  useEffect(() => {
    if (!selectedFriendId) return;
    onSelectFriend(selectedFriendId);
    apiService.markMessagesAsRead(selectedFriendId).catch(() => {});
    setLiveTypingText('');
    setFriendIsTyping(false);
  }, [selectedFriendId]);

  // ── Timer enregistrement ──────────────────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      recordingSecondsRef.current = 0;
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => { const n = s + 1; recordingSecondsRef.current = n; return n; });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

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

  // ── FIX TYPING : écouter via window.__inboxSetLiveTyping ─────────────────
  // App.tsx appelle cette fonction quand Pusher reçoit typing-status
  useEffect(() => {
    (window as any).__inboxSetLiveTyping = (senderId: string, text: string, isTyping: boolean) => {
      if (senderId !== selectedFriendId) return;

      if (text !== undefined && text !== '') {
        setLiveTypingText(text);
        setFriendIsTyping(true);
      } else {
        setFriendIsTyping(isTyping);
        if (!isTyping) setLiveTypingText('');
      }

      // Auto-effacer après 3 secondes d'inactivité
      if (typingDisplayTimeout.current) clearTimeout(typingDisplayTimeout.current);
      typingDisplayTimeout.current = setTimeout(() => {
        setFriendIsTyping(false);
        setLiveTypingText('');
      }, 3000);
    };
    return () => { delete (window as any).__inboxSetLiveTyping; };
  }, [selectedFriendId]);

  // ── Écouter les événements appel depuis App.tsx via CustomEvent ───────────
  useEffect(() => {
    const handler = (e: any) => {
      const { type } = e.detail || {};
      if (type === 'call_accepted') {
        setCallIsActive(true);
      }
      if (type === 'call_ended') {
        setOutgoingCall(null);
        setCallIsActive(false);
        setCallDuration(0);
      }
    };
    window.addEventListener('spirittalk_call_event', handler);
    return () => window.removeEventListener('spirittalk_call_event', handler);
  }, []);

  // ── Lancer un appel ───────────────────────────────────────────────────────
  const handleStartCallLocal = (friendId: string, mode: 'audio' | 'video') => {
    setOutgoingCall({ friendId, mode });
    setCallIsActive(false);
    setCallDuration(0);
    onStartCall(friendId, mode);
  };

  // ── Raccrocher (côté appelant) ────────────────────────────────────────────
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

  // ── Envoi typing au backend lettre par lettre ─────────────────────────────
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (!selectedFriendId) return;
    try {
      await fetch(`${API_BASE}/direct-messages/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spirittalk_token') || ''}`
        },
        body: JSON.stringify({
          recipient_id: selectedFriendId,
          is_typing: val.length > 0,
          live_text: val
        })
      });
    } catch {}
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
    } catch {
      setIsRecording(true);
    }
  };

  // ── FIX AUDIO : upload base64 pour que le destinataire puisse l'écouter ──
  const stopRecordingAndSend = () => {
    if (!isRecording) return;
    setIsRecording(false);
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      const durationAtStop = recordingSecondsRef.current;
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        // Essayer d'uploader vers le serveur d'abord
        let audioUrl = '';
        try {
          const fd = new FormData();
          fd.append('audio', blob, `voice_${Date.now()}.webm`);
          const res = await fetch(`${API_BASE}/upload-audio`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('spirittalk_token') || ''}` },
            body: fd
          });
          if (res.ok) {
            const data = await res.json();
            audioUrl = data.url || data.path || '';
          }
        } catch {}

        // Fallback : base64 (fonctionne dans la même session)
        if (!audioUrl) {
          audioUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }

        handleSendVoice(audioUrl, formatDuration(durationAtStop));
      };
      mr.stop();
    } else {
      handleSendVoice('mock-audio', formatDuration(recordingSecondsRef.current || 4));
    }
  };

  const handleSendVoice = (audioUrl: string, dur: string) => {
    if (!selectedFriendId) return;
    onSendMessage(selectedFriendId, undefined, undefined, audioUrl, dur);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedImages.length === 0) return;
    if (!selectedFriendId) return;
    onSendMessage(selectedFriendId, inputText.trim(), attachedImages.length > 0 ? attachedImages : undefined);
    setInputText('');
    setAttachedImages([]);
    setLiveTypingText('');
    setFriendIsTyping(false);
    apiService.sendTypingStatus(selectedFriendId, false).catch(() => {});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // ── FIX MESSAGES TEMPS RÉEL : filtre corrigé ─────────────────────────────
  // Pusher met senderId=ID_réel et recipientId=ID_réel ou 'me'
  // On normalise en vérifiant les deux sens
  const myId = String(user?.id || '');
  const activeMessages = messages.filter(m => {
    const senderIsMe = m.senderId === 'me' || m.senderId === myId;
    const recipientIsMe = m.recipientId === 'me' || m.recipientId === myId;
    const senderIsFriend = m.senderId === selectedFriendId;
    const recipientIsFriend = m.recipientId === selectedFriendId;
    return (senderIsMe && recipientIsFriend) || (senderIsFriend && recipientIsMe);
  });

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const outgoingFriend = outgoingCall ? friends.find(f => f.id === outgoingCall.friendId) : null;

  return (
    <div className="h-[70vh] bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-3xl shadow-sm overflow-hidden flex relative">

      {/* ══════════════════════════════════════════════════════════════════
          OVERLAY APPEL SORTANT (côté appelant)
      ══════════════════════════════════════════════════════════════════ */}
      {outgoingCall && outgoingFriend && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d2b21]/96 backdrop-blur-sm">
          <div className="text-center text-white space-y-8 px-8 w-full max-w-xs">

            {/* Avatar avec animation ping */}
            <div className="relative mx-auto w-28 h-28">
              <img
                src={outgoingFriend.avatar}
                alt={outgoingFriend.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-medium/50 mx-auto"
              />
              {!callIsActive && (
                <>
                  <span className="absolute inset-0 rounded-full border-4 border-emerald-medium/30 animate-ping" />
                  <span className="absolute inset-[-8px] rounded-full border-2 border-emerald-medium/15 animate-ping [animation-delay:0.5s]" />
                </>
              )}
              {callIsActive && (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </span>
              )}
            </div>

            {/* Nom + statut */}
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-widest text-emerald-light font-bold">
                {outgoingCall.mode === 'video' ? '📹 Appel vidéo' : '📞 Appel audio'}
              </p>
              <h3 className="font-serif text-2xl font-bold">{outgoingFriend.name}</h3>
              <p className="text-sm text-white/60 mt-2 h-6">
                {callIsActive
                  ? <span className="text-green-400 font-semibold">En communication • {formatDuration(callDuration)}</span>
                  : <span className="animate-pulse">Appel en cours...</span>
                }
              </p>
            </div>

            {/* Bouton raccrocher */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleHangUp}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center active:scale-95 transition-all shadow-xl"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-[10px] uppercase tracking-widest text-white/50">Raccrocher</span>
            </div>

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
            <span>Messagerie Spirituelle</span>
            {totalUnread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {totalUnread}
              </span>
            )}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Échanges privés en temps réel</p>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 no-scrollbar p-2 space-y-1">
          {friends.filter(f => f.status === 'accepted').map((friend) => {
            const lastMsg = messages.filter(
              m => {
                const senderIsMe = m.senderId === 'me' || m.senderId === myId;
                const recipientIsMe = m.recipientId === 'me' || m.recipientId === myId;
                return (senderIsMe && m.recipientId === friend.id) || (m.senderId === friend.id && recipientIsMe);
              }
            ).slice(-1)[0];
            const unread = unreadCounts[friend.id] || 0;

            return (
              <button
                key={friend.id}
                onClick={() => setSelectedFriendId(friend.id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                  selectedFriendId === friend.id
                    ? 'bg-emerald-medium/10 border border-emerald-medium/20 text-emerald-deep dark:text-gold-bright'
                    : 'hover:bg-cream-darker/40 dark:hover:bg-charcoal-light/15 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200">
                    <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-charcoal-card rounded-full" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`font-serif text-xs font-bold block truncate ${unread > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-cream-base'}`}>
                      {friend.name}
                    </span>
                    <span className={`text-[8px] font-bold uppercase ${friend.religion === 'Chrétienne' ? 'text-emerald-medium' : 'text-gold-deep'}`}>
                      {friend.religion}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-[10px] truncate pr-2 ${unread > 0 ? 'text-slate-700 dark:text-cream-base font-semibold' : 'text-slate-400'}`}>
                      {friend.isTyping ? (
                        <span className="text-emerald-medium font-semibold animate-pulse">écrit...</span>
                      ) : lastMsg ? (
                        lastMsg.text || (lastMsg.audioUrl ? '🎵 Note vocale' : '🖼️ Image')
                      ) : (
                        'Commencez une discussion'
                      )}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {lastMsg && <span className="text-[8px] text-slate-400">{lastMsg.timestamp}</span>}
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {friends.filter(f => f.status === 'accepted').length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400 text-xs italic space-y-2">
              <p>Vous n'avez pas encore d'amis connectés.</p>
              <p className="text-[10px]">Allez dans "Membres & Amis" pour en ajouter !</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONE DE CHAT
      ══════════════════════════════════════════════════════════════════ */}
      {selectedFriendId && selectedFriend ? (
        <div className="flex-grow flex flex-col bg-white dark:bg-charcoal-card h-full">

          {/* Header */}
          <div className="p-4 border-b border-cream-darker dark:border-charcoal-light/10 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFriendId(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-lg md:hidden"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                  <img src={selectedFriend.avatar} className="w-full h-full object-cover" alt="" />
                </div>
                {selectedFriend.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
                )}
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-cream-base flex items-center gap-1.5">
                  {selectedFriend.name}
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${selectedFriend.religion === 'Chrétienne' ? 'bg-emerald-medium/10 text-emerald-medium' : 'bg-gold-deep/10 text-gold-deep'}`}>
                    {selectedFriend.religion}
                  </span>
                </h4>
                {/* FIX TYPING : afficher "en train d'écrire" dans le header */}
                <p className="text-[10px] text-slate-400 h-4">
                  {friendIsTyping || liveTypingText
                    ? <span className="text-emerald-medium font-semibold animate-pulse">en train d'écrire...</span>
                    : selectedFriend.isOnline ? 'En ligne' : 'Hors ligne'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartCallLocal(selectedFriend.id, 'audio')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium"
                title="Appel audio"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStartCallLocal(selectedFriend.id, 'video')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium"
                title="Appel vidéo"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/10 dark:bg-charcoal-dark/5">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === 'me' || msg.senderId === myId;
              const isRead = !!msg.readAt;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-2 text-xs shadow-sm ${
                    isMe
                      ? 'bg-[#1D3557] text-white rounded-tr-none'
                      : 'bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 text-slate-800 dark:text-cream-base rounded-tl-none'
                  }`}>
                    {msg.text && <p className="leading-relaxed font-sans">{msg.text}</p>}
                    {msg.images && msg.images.length > 0 && (
                      <div className="grid gap-1 grid-cols-2 rounded-lg overflow-hidden mt-1 max-w-sm">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img} className="w-full h-40 object-cover" alt="" referrerPolicy="no-referrer" />
                        ))}
                      </div>
                    )}
                    {msg.audioUrl && (
                      <div className={`flex items-center gap-3 p-2 rounded-xl border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-emerald-medium/10 border-emerald-medium/10 text-emerald-deep dark:text-cream-base'}`}>
                        <button
                          onClick={() => {
                            if (msg.audioUrl && msg.audioUrl !== 'mock-audio') {
                              const audio = new Audio(msg.audioUrl);
                              audio.play().catch(() => alert('Enregistrement audio non disponible.'));
                            }
                          }}
                          className={`p-2.5 rounded-full ${isMe ? 'bg-white text-[#1D3557]' : 'bg-emerald-medium text-white'}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="flex-grow space-y-1">
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Note vocale</span>
                          </div>
                          <div className="flex items-end gap-0.5 h-3 pt-1">
                            {[2,4,1,3,5,2,4,1,3,5,2,4].map((h, i) => (
                              <div key={i} className={`w-0.5 rounded-full ${isMe ? 'bg-white/40' : 'bg-slate-400'}`} style={{ height: `${h*20}%` }} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold opacity-80 shrink-0">{msg.audioDuration || '0:05'}</span>
                      </div>
                    )}
                    <div className="flex justify-end items-center gap-1 opacity-70 text-[9px] mt-1">
                      <span>{msg.timestamp}</span>
                      {isMe && (isRead
                        ? <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                        : <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── TYPING INDICATOR ── */}
            {(friendIsTyping || liveTypingText) && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img src={selectedFriend.avatar} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-2xl rounded-tl-none p-3 text-xs max-w-[70%]">
                  {liveTypingText ? (
                    <span className="text-slate-600 dark:text-cream-base font-sans italic">
                      {liveTypingText}
                      <span className="inline-block w-0.5 h-3.5 bg-emerald-medium ml-0.5 animate-pulse align-middle" />
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-medium font-semibold font-serif">
                        {selectedFriend.name}
                      </span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMessages.length === 0 && !friendIsTyping && !liveTypingText && (
              <div className="text-center py-20 text-slate-400 text-xs italic space-y-2">
                <Sparkles className="w-8 h-8 text-gold-deep mx-auto mb-1 opacity-50 animate-pulse" />
                <p>Aucun message avec {selectedFriend.name} pour le moment.</p>
                <p className="text-[10px] max-w-xs mx-auto">Engagez une saine discussion fraternelle !</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cream-darker dark:border-charcoal-light/10 space-y-3 bg-white dark:bg-charcoal-card">
            {attachedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-cream-darker shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]">✕</button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <label className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-light/30 text-slate-400 hover:text-emerald-medium shrink-0">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                <ImageIcon className="w-5 h-5" />
              </label>
              {isRecording ? (
                <div className="flex-grow flex items-center justify-between bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
                    <span className="font-semibold">Enregistrement...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-cream-base">{formatDuration(recordingSeconds)}</span>
                    <button type="button" onClick={stopRecordingAndSend}
                      className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-600 text-[10px] uppercase">
                      <Square className="w-3 h-3" /><span>Envoyer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={`Écrire à ${selectedFriend.name}...`}
                    className="flex-grow text-xs bg-slate-50 dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />
                  <button type="button" onClick={startRecording}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-light/30 text-slate-400 hover:text-emerald-medium shrink-0">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button type="submit" disabled={!inputText.trim() && attachedImages.length === 0}
                    className="p-2.5 bg-[#1D3557] hover:bg-emerald-deep text-white rounded-xl disabled:opacity-40 transition-colors shrink-0 shadow-sm">
                    <Send className="w-5 h-5" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-grow hidden md:flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-cream-darker/30 dark:bg-charcoal-dark/40 rounded-full flex items-center justify-center text-emerald-medium dark:text-gold-bright">
            <Volume2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-slate-700 dark:text-cream-base">Sélectionnez une discussion</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
              Discutez avec vos frères et sœurs, partagez de l'entraide et des conseils sacrés.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
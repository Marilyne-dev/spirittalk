import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Square, Play, Image as ImageIcon, Send, Users, Sparkles, 
  Phone, Video, Volume2, Check, CheckCheck, ChevronLeft
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

  // Typing en direct : texte live reçu de l'autre (lettre par lettre via Pusher)
  const [liveTypingText, setLiveTypingText] = useState<string>('');

  // Audio Recorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typing debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingSentRef = useRef(false);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedFriendId, liveTypingText]);

  // Quand on ouvre une conversation → marquer comme lu
  useEffect(() => {
    if (!selectedFriendId) return;
    onSelectFriend(selectedFriendId);
    apiService.markMessagesAsRead(selectedFriendId).catch(() => {});
    setLiveTypingText('');
  }, [selectedFriendId]);

  // Timer enregistrement audio
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Écouter les événements Pusher pour le typing lettre par lettre
  // On expose une fonction globale que pusherService peut appeler
  useEffect(() => {
    // On stocke la fn dans window pour que pusherService puisse la déclencher
    (window as any).__inboxSetLiveTyping = (senderId: string, text: string) => {
      if (senderId === selectedFriendId) {
        setLiveTypingText(text);
        // Effacer après 3 secondes d'inactivité
        if ((window as any).__liveTypingClear) clearTimeout((window as any).__liveTypingClear);
        (window as any).__liveTypingClear = setTimeout(() => setLiveTypingText(''), 3000);
      }
    };
    return () => {
      delete (window as any).__inboxSetLiveTyping;
    };
  }, [selectedFriendId]);

  // Envoyer le texte en cours de frappe au backend (lettre par lettre)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (!selectedFriendId) return;

    // Envoyer typing=true avec le texte en cours
    try {
      await fetch(`${(import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/spirittalk'}/api/direct-messages/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spirittalk_token') || ''}`
        },
        body: JSON.stringify({
          recipient_id: selectedFriendId,
          is_typing: val.length > 0,
          live_text: val  // texte en direct lettre par lettre
        })
      });
    } catch {}

    // Stop typing après 2s d'inactivité
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      apiService.sendTypingStatus(selectedFriendId, false).catch(() => {});
    }, 2000);
  };

  const startRecording = async () => {
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(true);
    }
  };

  const stopRecordingAndSend = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setTimeout(() => {
        const dur = formatDuration(recordingSeconds);
        handleSendVoice(recordedAudioUrl || 'mock-audio', dur);
      }, 200);
    } else {
      handleSendVoice('mock-audio', formatDuration(recordingSeconds || 4));
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
    // Signaler stop typing
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

  const activeMessages = messages.filter(
    m => (m.senderId === 'me' && m.recipientId === selectedFriendId) ||
         (m.senderId === selectedFriendId && m.recipientId === 'me')
  );

  // Badge rouge total non lus pour l'icone messagerie (calculé à l'extérieur)
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="h-[70vh] bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-3xl shadow-sm overflow-hidden flex">

      {/* Sidebar amis */}
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
          <p className="text-[10px] text-slate-400 mt-1">Échanges privés rapides en temps réel</p>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 no-scrollbar p-2 space-y-1">
          {friends.filter(f => f.status === 'accepted').map((friend) => {
            const lastMsg = messages.filter(
              m => (m.senderId === 'me' && m.recipientId === friend.id) ||
                   (m.senderId === friend.id && m.recipientId === 'me')
            ).slice(-1)[0];

            const unread = unreadCounts[friend.id] || 0;

            return (
              <button
                key={friend.id}
                onClick={() => {
                  setSelectedFriendId(friend.id);
                }}
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
                      {/* Badge rouge non lus */}
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
              <p className="text-[10px]">Allez dans "Membres & Amis" pour ajouter des fidèles !</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone de chat */}
      {selectedFriendId && selectedFriend ? (
        <div className="flex-grow flex flex-col bg-white dark:bg-charcoal-card h-full">

          {/* Header conversation */}
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
                <p className="text-[10px] text-slate-400">
                  {selectedFriend.isOnline ? 'En ligne' : 'Hors ligne'}
                  {selectedFriend.profession && ` • ${selectedFriend.profession}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => onStartCall(selectedFriend.id, 'audio')} className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium">
                <Phone className="w-4 h-4" />
              </button>
              <button onClick={() => onStartCall(selectedFriend.id, 'video')} className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/10 dark:bg-charcoal-dark/5">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
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
                              new Audio(msg.audioUrl).play();
                            } else if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const u = new SpeechSynthesisUtterance("Que la paix de Dieu soit avec toi aujourd'hui !");
                              u.lang = 'fr-FR';
                              window.speechSynthesis.speak(u);
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
                            {[2, 4, 1, 3, 5, 2, 4, 1, 3, 5, 2, 4].map((h, i) => (
                              <div key={i} className={`w-0.5 rounded-full ${isMe ? 'bg-white/40' : 'bg-slate-400'}`} style={{ height: `${h * 20}%` }} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold opacity-80 shrink-0">{msg.audioDuration || '0:05'}</span>
                      </div>
                    )}

                    {/* Timestamp + coches bleues/grises */}
                    <div className="flex justify-end items-center gap-1 opacity-70 text-[9px] mt-1">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        isRead
                          ? <CheckCheck className="w-3.5 h-3.5 text-sky-400" />   /* Lu = bleu */
                          : <CheckCheck className="w-3.5 h-3.5 text-slate-400" /> /* Envoyé = gris */
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator : texte en direct lettre par lettre */}
            {(selectedFriend.isTyping || liveTypingText) && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-2xl rounded-tl-none p-3 text-xs max-w-[75%]">
                  {liveTypingText ? (
                    /* On voit ce que l'autre tape en direct */
                    <span className="text-slate-600 dark:text-cream-base font-sans italic">
                      {liveTypingText}
                      <span className="inline-block w-0.5 h-3 bg-emerald-medium ml-0.5 animate-pulse align-middle" />
                    </span>
                  ) : (
                    /* Fallback : points animés classiques */
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="font-serif font-semibold text-emerald-medium text-[11px] animate-pulse">
                        {selectedFriend.name} écrit
                      </span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMessages.length === 0 && !selectedFriend.isTyping && !liveTypingText && (
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
                    <button
                      type="button"
                      onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]"
                    >✕</button>
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
                    <button type="button" onClick={stopRecordingAndSend} className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-600 text-[10px] uppercase">
                      <Square className="w-3 h-3" />
                      <span>Envoyer</span>
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
                  <button type="button" onClick={startRecording} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-light/30 text-slate-400 hover:text-emerald-medium shrink-0">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button type="submit" disabled={!inputText.trim() && attachedImages.length === 0} className="p-2.5 bg-[#1D3557] hover:bg-emerald-deep text-white rounded-xl disabled:opacity-40 transition-colors shrink-0 shadow-sm">
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
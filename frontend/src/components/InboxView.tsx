import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Square, Play, Pause, Image as ImageIcon, Send, Users, Sparkles, 
  Phone, Video, ShieldAlert, Smile, Paperclip, ChevronLeft, Volume2, Music, Check, CheckCheck
} from 'lucide-react';
import { Friend, DirectMessage } from '../types';

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
  
  // Audio Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedFriendId]);

  // Audio Recording duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle HTML5 real audio recording
  const startRecording = async () => {
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access denied or unavailable, using simulation recorder", err);
      setIsRecording(true);
    }
  };

  const stopRecordingAndSend = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // MediaRecorder stop will fire onstop and populate recordedAudioUrl. 
      // To keep it immediate, we will send a mock voice note in the callback or simulate it
      setTimeout(() => {
        const durationStr = formatDuration(recordingSeconds);
        // Use real recording if generated or fall back to mock
        const finalAudioUrl = recordedAudioUrl || 'mock-audio';
        handleSendVoice(finalAudioUrl, durationStr);
      }, 200);
    } else {
      // Simulation fallback voice
      const durationStr = formatDuration(recordingSeconds || 4);
      handleSendVoice('mock-audio', durationStr);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendVoice = (audioUrl: string, durationStr: string) => {
    if (!selectedFriendId) return;
    onSendMessage(selectedFriendId, undefined, undefined, audioUrl, durationStr);
    onSimulateTyping(selectedFriendId);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedImages.length === 0) return;
    if (!selectedFriendId) return;

    onSendMessage(selectedFriendId, inputText.trim(), attachedImages.length > 0 ? attachedImages : undefined);
    setInputText('');
    setAttachedImages([]);
    onSimulateTyping(selectedFriendId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const activeMessages = messages.filter(
    m => (m.senderId === 'me' && m.recipientId === selectedFriendId) || 
         (m.senderId === selectedFriendId && m.recipientId === 'me')
  );

  return (
    <div className="h-[70vh] bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-3xl shadow-sm overflow-hidden flex">
      
      {/* Sidebar - Friends Selection */}
      <div className={`w-full md:w-80 border-r border-cream-darker dark:border-charcoal-light/10 flex flex-col bg-slate-50/50 dark:bg-charcoal-dark/20 ${
        selectedFriendId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-cream-darker dark:border-charcoal-light/10">
          <h3 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1.5">
            <Users className="w-5 h-5 text-emerald-medium" />
            <span>Messagerie Spirituelle</span>
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
                  onSelectFriend(friend.id);
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
                    <span className="font-serif text-xs font-bold text-slate-800 dark:text-cream-base block truncate">
                      {friend.name}
                    </span>
                    <span className={`text-[8px] font-bold uppercase ${
                      friend.religion === 'Chrétienne' ? 'text-emerald-medium' : 'text-gold-deep'
                    }`}>
                      {friend.religion}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-[10px] text-slate-400 truncate pr-2">
                      {friend.isTyping ? (
                        <span className="text-emerald-medium font-semibold animate-pulse">écrit...</span>
                      ) : lastMsg ? (
                        lastMsg.text || (lastMsg.audioUrl ? '🎵 Note vocale' : '🖼️ Image')
                      ) : (
                        'Commencez une discussion spirituelle'
                      )}
                    </p>
                    {lastMsg && (
                      <span className="text-[8px] text-slate-400">{lastMsg.timestamp}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {friends.filter(f => f.status === 'accepted').length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400 text-xs italic space-y-2">
              <p>Vous n'avez pas encore d'amis connectés.</p>
              <p className="text-[10px]">Allez dans l'onglet "Membres & Amis" de la communauté pour ajouter des fidèles chrétiens et musulmans !</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
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
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
                    selectedFriend.religion === 'Chrétienne' ? 'bg-emerald-medium/10 text-emerald-medium' : 'bg-gold-deep/10 text-gold-deep'
                  }`}>
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
              <button 
                onClick={() => onStartCall(selectedFriend.id, 'audio')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onStartCall(selectedFriend.id, 'video')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-light/30 rounded-xl text-slate-400 hover:text-emerald-medium"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/10 dark:bg-charcoal-dark/5">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-2 text-xs shadow-sm ${
                    isMe 
                      ? 'bg-[#1D3557] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 text-slate-800 dark:text-cream-base rounded-tl-none'
                  }`}>
                    
                    {/* Text block */}
                    {msg.text && (
                      <p className="leading-relaxed font-sans">{msg.text}</p>
                    )}

                    {/* Images block */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="grid gap-1 grid-cols-2 rounded-lg overflow-hidden mt-1 max-w-sm">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img} className="w-full h-40 object-cover" alt="" referrerPolicy="no-referrer" />
                        ))}
                      </div>
                    )}

                    {/* Playable custom audio voice note */}
                    {msg.audioUrl && (
                      <div className={`flex items-center gap-3 p-2 rounded-xl border ${
                        isMe 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-emerald-medium/10 border-emerald-medium/10 text-emerald-deep dark:text-cream-base'
                      }`}>
                        <button
                          onClick={() => {
                            if (msg.audioUrl && msg.audioUrl !== 'mock-audio') {
                              const aud = new Audio(msg.audioUrl);
                              aud.play();
                            } else {
                              if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const textToSpeak = msg.senderId === 'me'
                                  ? "Ceci est votre note vocale spirituelle enregistrée sur SpiritTalk."
                                  : (msg.text || "Que la paix de Dieu soit avec toi aujourd'hui ! C'est un bonheur d'échanger avec toi.");
                                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                                utterance.lang = 'fr-FR';
                                utterance.rate = 0.95;
                                window.speechSynthesis.speak(utterance);
                              } else {
                                console.warn("Speech synthesis not supported");
                              }
                            }
                          }}
                          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                            isMe ? 'bg-white text-[#1D3557]' : 'bg-emerald-medium text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <div className="flex-grow space-y-1">
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Note vocale</span>
                          </div>
                          {/* Simulated mini waveform wave */}
                          <div className="flex items-end gap-0.5 h-3 pt-1">
                            {[2, 4, 1, 3, 5, 2, 4, 1, 3, 5, 2, 4].map((h, index) => (
                              <div
                                key={index}
                                className={`w-0.5 rounded-full ${isMe ? 'bg-white/40' : 'bg-slate-400'}`}
                                style={{ height: `${h * 20}%` }}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold opacity-80 shrink-0">{msg.audioDuration || '0:05'}</span>
                      </div>
                    )}

                    {/* Timestamp & doublecheck */}
                    <div className="flex justify-end items-center gap-1 opacity-70 text-[9px] mt-1 text-right">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Simulated typing status */}
            {selectedFriend.isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5 text-slate-400">
                  <span className="font-serif font-semibold text-emerald-medium text-[11px] animate-pulse">
                    {selectedFriend.name} est en train d'écrire
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            {activeMessages.length === 0 && !selectedFriend.isTyping && (
              <div className="text-center py-20 text-slate-400 text-xs italic space-y-2">
                <Sparkles className="w-8 h-8 text-gold-deep mx-auto mb-1 opacity-50 animate-pulse" />
                <p>Aucun message avec {selectedFriend.name} pour le moment.</p>
                <p className="text-[10px] max-w-xs mx-auto">Engagez une saine discussion fraternelle, partagez des versets sacrés ou envoyez un message audio.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Controls Footer */}
          <div className="p-3 border-t border-cream-darker dark:border-charcoal-light/10 space-y-3 bg-white dark:bg-charcoal-card">
            {/* Selected Images Previews */}
            {attachedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-cream-darker shrink-0 group">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input bar */}
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <label className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-light/30 text-slate-400 hover:text-emerald-medium shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5" />
              </label>

              {/* Direct voice recorder control */}
              {isRecording ? (
                <div className="flex-grow flex items-center justify-between bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
                    <span className="font-semibold">Enregistrement audio en cours...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-cream-base">{formatDuration(recordingSeconds)}</span>
                    <button
                      type="button"
                      onClick={stopRecordingAndSend}
                      className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-600 text-[10px] uppercase"
                    >
                      <Square className="w-3 h-3" />
                      <span>Arrêter & Envoyer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Écrire votre message à ${selectedFriend.name}...`}
                    className="flex-grow text-xs bg-slate-50 dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />

                  {/* Mic button to trigger recording */}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-light/30 text-slate-400 hover:text-emerald-medium shrink-0"
                    title="Enregistrer une note vocale"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputText.trim() && attachedImages.length === 0}
                    className="p-2.5 bg-[#1D3557] hover:bg-emerald-deep text-white rounded-xl disabled:opacity-40 transition-colors shrink-0 shadow-sm"
                  >
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
            <h4 className="font-serif text-base font-bold text-slate-700 dark:text-cream-base">Sélectionnez une discussion spirituelle</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
              Discutez avec vos frères et sœurs chrétiens ou musulmans, partagez de l'écoute, de l'entraide et des conseils sacrés.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

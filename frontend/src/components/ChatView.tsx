import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, Bookmark, Check, Share2, Loader2, MicOff } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onBookmark: (text: string, reference: string, source: string) => void;
  isGenerating: boolean;
}

const CHIPS = [
  "Bonjour, comment vas-tu ?",
  "Conseil pour l'anxiété",
  "Je vis un dilemme difficile",
  "Aide-moi à me connaître",
  "Problème de couple",
  "Force intérieure",
];

export default function ChatView({
  messages,
  onSendMessage,
  onBookmark,
  isGenerating
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [savedMessages, setSavedMessages] = useState<Record<string, boolean>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isGenerating) return;
    setInput("");
    await onSendMessage(trimmed);
  };

  // ── Vraie reconnaissance vocale ──────────────────────────────────────────
  const toggleVoice = () => {
    setRecordingError(null);

    // Si déjà en train d'enregistrer → arrêter
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Vérifier que le navigateur supporte la reconnaissance vocale
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError("Ton navigateur ne supporte pas la reconnaissance vocale. Utilise Chrome ou Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'fr-FR';        // Français
    recognition.continuous = false;     // S'arrête après une pause
    recognition.interimResults = true;  // Affiche le texte en temps réel pendant la dictée

    recognition.onstart = () => {
      setIsRecording(true);
    };

    // Résultat en temps réel (intermédiaire)
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        setRecordingError("Permission microphone refusée. Autorise le micro dans ton navigateur.");
      } else if (event.error === 'no-speech') {
        setRecordingError("Aucune voix détectée. Réessaie en parlant clairement.");
      } else {
        setRecordingError(`Erreur : ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Si du texte a été capté, on peut l'envoyer automatiquement ou laisser l'utilisateur valider
      // Ici on laisse l'utilisateur appuyer sur Envoyer pour contrôler
    };

    recognition.start();
  };

  const handleBookmarkMessage = (msg: ChatMessage) => {
    if (!msg.scriptureQuote) {
      onBookmark(msg.text.substring(0, 80) + "...", "Guidance SpiritTalk", "Autre");
    } else {
      onBookmark(
        msg.scriptureQuote.text,
        msg.scriptureQuote.reference,
        msg.scriptureQuote.source
      );
    }
    setSavedMessages(prev => ({ ...prev, [msg.id]: true }));
    setTimeout(() => {
      setSavedMessages(prev => ({ ...prev, [msg.id]: false }));
    }, 2000);
  };

  const handleShareMessage = (msg: ChatMessage) => {
    const shareText = msg.scriptureQuote
      ? `"${msg.scriptureQuote.text}" — ${msg.scriptureQuote.reference}\n\nGuidance: ${msg.text}`
      : msg.text;
    navigator.clipboard.writeText(shareText);
    alert("Message copié dans le presse-papiers !");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] md:h-[calc(100vh-120px)] animate-fade-in max-w-[800px] mx-auto relative">

      {/* Scrollable conversation stream */}
      <div className="flex-grow overflow-y-auto pt-4 pb-4 px-1 space-y-6 custom-scroll">

        {messages.length <= 1 && (
          <div className="text-center py-8 space-y-2 animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-light dark:text-emerald-fixed">
              Refuge Spirituel
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-emerald-deep dark:text-cream-base italic leading-relaxed px-4">
              Comment puis-je éclairer votre chemin aujourd'hui ?
            </h2>
            <p className="text-xs text-slate-400 dark:text-cream-base/40 mt-2">
              🎤 Tu peux parler directement en cliquant sur le micro
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isAI = msg.role === 'model';
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
              <div className={`max-w-[88%] rounded-2xl p-5 shadow-sm space-y-4 ${
                isAI
                  ? 'glass-panel message-ai text-slate-800 dark:text-cream-base bg-emerald-fixed/15 dark:bg-charcoal-card border border-emerald-medium/10'
                  : 'bg-emerald-medium text-cream-base rounded-tr-none shadow-md'
              }`}>
                {isAI && (
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-medium dark:text-gold-bright font-bold">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-deep dark:text-gold-bright" />
                    <span>Sagesse Divine</span>
                  </div>
                )}

                {msg.scriptureQuote && (
                  <div className="scripture-quote bg-white/60 dark:bg-charcoal-dark/60 p-4 rounded-r-xl border-l-4 border-gold-deep dark:border-gold-bright italic text-sm text-emerald-deep dark:text-cream-base leading-relaxed">
                    "{msg.scriptureQuote.text}"
                    <span className="block not-italic text-[10px] uppercase tracking-widest text-gold-deep dark:text-gold-bright font-bold mt-2 font-sans">
                      — {msg.scriptureQuote.reference}
                    </span>
                  </div>
                )}

                <p className="font-sans text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                {isAI && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-emerald-medium/5">
                    <button
                      onClick={() => handleBookmarkMessage(msg)}
                      className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider hover:opacity-75 transition-opacity ${
                        savedMessages[msg.id] ? "text-green-600" : "text-slate-500 dark:text-gold-bright"
                      }`}
                    >
                      {savedMessages[msg.id] ? (
                        <><Check className="w-3 h-3" /><span>Sauvegardé</span></>
                      ) : (
                        <><Bookmark className="w-3 h-3" /><span>Sauvegarder</span></>
                      )}
                    </button>
                    <button
                      onClick={() => handleShareMessage(msg)}
                      className="p-1 text-slate-400 hover:text-emerald-medium dark:hover:text-cream-base transition-colors"
                      title="Partager"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] glass-panel rounded-2xl p-5 border border-emerald-medium/10 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-light dark:text-gold-bright font-bold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Sagesse Divine formule sa réflexion...</span>
              </div>
              <div className="flex gap-1.5 py-1">
                <span className="w-2 h-2 bg-emerald-medium dark:bg-emerald-fixed rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-medium dark:bg-emerald-fixed rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-emerald-medium dark:bg-emerald-fixed rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chips suggestions */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar scroll-smooth shrink-0 border-t border-cream-darker dark:border-charcoal-light/10">
        {CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={isGenerating}
            className="shrink-0 px-4 py-2 text-xs font-semibold rounded-full bg-[#759486]/10 text-emerald-medium hover:bg-[#759486]/20 border border-emerald-medium/10 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Indicateur enregistrement en cours */}
      {isRecording && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-[11px] font-bold tracking-wider uppercase rounded-full flex items-center gap-2 animate-pulse shadow-md z-30">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
          <span>Écoute en cours... Parle maintenant</span>
        </div>
      )}

      {/* Erreur micro */}
      {recordingError && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] px-4 py-2 bg-orange-500 text-white text-[11px] font-semibold rounded-xl shadow-md z-30 text-center">
          ⚠️ {recordingError}
          <button onClick={() => setRecordingError(null)} className="ml-2 underline">OK</button>
        </div>
      )}

      {/* Barre de saisie */}
      <div className="py-3 bg-cream-base dark:bg-charcoal-dark shrink-0">
        <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-emerald-medium/15 shadow-lg bg-white/80 dark:bg-charcoal-card/80">

          {/* Bouton micro — vrai micro maintenant */}
          <button
            onClick={toggleVoice}
            disabled={isGenerating}
            className={`p-3 rounded-xl transition-all active:scale-90 disabled:opacity-40 ${
              isRecording
                ? 'text-red-500 bg-red-500/10 animate-pulse'
                : 'text-slate-400 hover:bg-cream-darker dark:hover:bg-charcoal-light/35 hover:text-emerald-medium'
            }`}
            title={isRecording ? "Arrêter l'enregistrement" : "Parler (reconnaissance vocale)"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={isRecording ? "Parle, j'écoute... 🎤" : "Posez une question ou parlez au micro..."}
            className="flex-grow bg-transparent border-none focus:outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-cream-base/30 text-emerald-deep dark:text-cream-base px-2 py-3"
            disabled={isGenerating}
          />

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isGenerating}
            className="bg-gold-bright hover:brightness-110 active:scale-95 disabled:opacity-45 disabled:pointer-events-none text-emerald-deep p-3.5 rounded-xl shadow-md transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>

        <p className="text-center text-[9px] text-slate-400 dark:text-cream-base/30 mt-2.5 uppercase tracking-wider">
          🎤 Micro · ✍️ Texte · Votre refuge spirituel guidé par l'IA
        </p>
      </div>
    </div>
  );
}
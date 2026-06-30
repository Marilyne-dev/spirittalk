import React, { useCallback, useState, useEffect, useRef, startTransition } from 'react';
import { AnimatePresence } from 'motion/react';
import { Home, Sparkles, Search, User, Award, Moon, Sun, Bell, MessageSquare, Users, MessageCircle, Phone, PhoneOff } from 'lucide-react';
import { ChatMessage, Bookmark, Note, InspirationCard, Religion, CommunityPost, Friend, DirectMessage, SpiritNotification } from './types';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import CommunityView from './components/CommunityView';
import InboxView from './components/InboxView';
import QuizModal from './components/QuizModal';
import InspirationModal from './components/InspirationModal';
import AuthView from './components/AuthView';
import { apiService } from './services/api';
import { generateLocalAiResponse } from './services/localAiService';
import { pusherService } from './services/pusherService';

const PRE_SEEDED_CHAT: ChatMessage[] = [
  {
    id: 'msg_initial',
    role: 'model',
    text: "Face à l'incertitude, n'oubliez pas que vous n'êtes jamais seul. Cette paix que vous cherchez réside déjà dans votre foi. Comment puis-je vous aider à explorer ce sentiment de sérénité aujourd'hui ?",
    timestamp: "10:00",
    scriptureQuote: {
      text: "Le Seigneur est ma lumière et mon salut ; de qui aurais-je crainte ?",
      reference: "Psaumes 27:1",
      source: "Bible"
    }
  },
  {
    id: 'msg_user_1',
    role: 'user',
    text: "Je me sens un peu anxieux concernant mon avenir professionnel.",
    timestamp: "10:02"
  },
  {
    id: 'msg_ai_2',
    role: 'model',
    text: "L'anxiété est souvent le reflet d'un désir de contrôle sur l'inconnu. Les textes nous rappellent de confier nos inquiétudes à une force plus grande. Voici une réflexion qui pourrait vous apaiser :",
    timestamp: "10:03",
    scriptureQuote: {
      text: "Ne vous inquiétez donc pas du lendemain ; car le lendemain aura soin de lui-même.",
      reference: "Matthieu 6:34",
      source: "Bible"
    }
  }
];

const PRE_SEEDED_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    name: "Samuel Koffi",
    username: "sam_koffi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    content: "Bonjour chers frères et sœurs ! Aujourd'hui, je médite sur l'importance du pardon dans nos communautés. Apprenons à nous réconcilier de la même façon que le Seigneur nous fait grâce chaque jour.",
    religion: "Chrétienne",
    likes: 12,
    likedByMe: false,
    time: "Il y a 2h",
    comments: [
      {
        id: 'comment_1_1',
        authorName: "Amina Diop",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        content: "Tellement vrai Samuel ! En Islam, la réconciliation et le fait de pardonner aux autres sont également de très grandes vertus bénies par le Miséricordieux.",
        time: "Il y a 1h"
      }
    ]
  },
  {
    id: 'post_2',
    name: "Amina Diop",
    username: "amina_diop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    content: "Une merveilleuse matinée à tous ! Je partage ce sublime lever de soleil spirituel. Que la paix de Dieu enveloppe vos foyers et vos familles aujourd'hui.",
    religion: "Musulmane",
    likes: 24,
    likedByMe: true,
    time: "Il y a 4h",
    images: ["https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=600"],
    comments: []
  }
];

const PRE_SEEDED_NOTES: Note[] = [
  {
    id: 'note_silence',
    title: "Réflexion sur le Silence",
    content: "Le silence n'est pas une absence, c'est une présence totale. La prière commence là où les mots s'arrêtent...",
    date: "Hier",
    category: "Silence"
  },
  {
    id: 'note_gratitude',
    title: "Gratitude Quotidienne",
    content: "Reconnaître les petites bénédictions dans les moments de difficulté permet d'ouvrir les portes de l'abondance spirituelle...",
    date: "3 oct.",
    category: "Gratitude"
  }
];

const PRE_SEEDED_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm_1',
    verseText: "C'est ainsi que Dieu vous facilite les signes, afin que vous raisonniez.",
    reference: "Coran, Al-Baqara 2:242",
    source: "Coran",
    savedAt: "Hier"
  },
  {
    id: 'bm_2',
    verseText: "L'amour est patient, il est plein de bonté; l'amour n'est point envieux...",
    reference: "1 Corinthiens 13:4",
    source: "Bible",
    savedAt: "Hier"
  }
];

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('spirittalk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState<'home' | 'community' | 'inbox' | 'chat' | 'search' | 'profile'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ── APPELS : états partagés App ──────────────────────────────────────────
  const [activeCall, setActiveCall] = useState<{ peerId: string; mode: 'audio' | 'video' } | null>(null);
  // FIX : incomingCall est l'interface qui s'affiche chez le DESTINATAIRE
  const [incomingCall, setIncomingCall] = useState<{ peerId: string; mode: 'audio' | 'video'; signal: any } | null>(null);

  const peerConnectionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentCallRef = useRef<{ peerId: string; mode: 'audio' | 'video' } | null>(null);
  const pendingCallRef = useRef<{ peerId: string; mode: 'audio' | 'video' } | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('spirittalk_posts');
    return saved ? JSON.parse(saved) : PRE_SEEDED_POSTS;
  });

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('spirittalk_friends');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((f: Friend) => f.id && !f.id.toString().startsWith('friend_') && !f.id.toString().startsWith('user_'));
  });

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('spirittalk_direct_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SpiritNotification[]>(() => {
    const saved = localStorage.getItem('spirittalk_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('spirittalk_xp');
    return saved ? parseInt(saved, 10) : 1200;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('spirittalk_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    return localStorage.getItem('spirittalk_checked_in_today') === 'true';
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('spirittalk_bookmarks');
    return saved ? JSON.parse(saved) : PRE_SEEDED_BOOKMARKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('spirittalk_notes');
    return saved ? JSON.parse(saved) : PRE_SEEDED_NOTES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('spirittalk_chats');
    return saved ? JSON.parse(saved) : PRE_SEEDED_CHAT;
  });

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('spirittalk_xp', xp.toString()); }, [xp]);
  useEffect(() => { localStorage.setItem('spirittalk_streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('spirittalk_checked_in_today', hasCheckedInToday ? 'true' : 'false'); }, [hasCheckedInToday]);
  useEffect(() => { localStorage.setItem('spirittalk_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('spirittalk_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('spirittalk_chats', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('spirittalk_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('spirittalk_friends', JSON.stringify(friends)); }, [friends]);
  useEffect(() => { localStorage.setItem('spirittalk_direct_messages', JSON.stringify(directMessages)); }, [directMessages]);
  useEffect(() => { localStorage.setItem('spirittalk_notifications', JSON.stringify(notifications)); }, [notifications]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Charger les unread counts depuis le backend au démarrage
  useEffect(() => {
    if (!user) return;
    apiService.getUnreadCounts().then(counts => {
      setUnreadCounts(counts);
    }).catch(() => {});
  }, [user]);

  // ── handleEndCall déclaré tôt ─────────────────────────────────────────────
  const handleEndCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    currentCallRef.current = null;
    pendingCallRef.current = null;
    setActiveCall(null);
    window.dispatchEvent(new CustomEvent('spirittalk_call_event', { detail: { type: 'call_ended' } }));
  }, []);

  // Écouter le raccrochage émis par InboxView
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.type === 'hang_up') handleEndCall();
    };
    window.addEventListener('spirittalk_call_event', handler);
    return () => window.removeEventListener('spirittalk_call_event', handler);
  }, [handleEndCall]);

  // ── Accepter l'appel entrant ──────────────────────────────────────────────
  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const { peerId, signal } = incomingCall;
    setIncomingCall(null);
    try {
      // APRÈS
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        throw new Error('Microphone inaccessible');
      });
      localStreamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          void apiService.sendCallSignal(peerId, event.candidate.toJSON(), 'ice-candidate');
        }
      };
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          void remoteAudioRef.current.play().catch(() => undefined);
        }
      };
      // FIX : s'assurer que signal est bien un RTCSessionDescriptionInit
      const sessionDesc = signal instanceof RTCSessionDescription ? signal : new RTCSessionDescription(signal);
      await pc.setRemoteDescription(sessionDesc);
      // APRÈS
      for (const candidate of pendingCandidatesRef.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
      pendingCandidatesRef.current = [];
      
      const answer = await pc.createAnswer();
      const callMode = incomingCall.mode;
      await pc.setLocalDescription(answer);
      await apiService.sendCallSignal(peerId, answer, 'answer');
      currentCallRef.current = { peerId, mode: callMode };
      setActiveCall({ peerId, mode: callMode });
      window.dispatchEvent(new CustomEvent('spirittalk_call_event', { detail: { type: 'call_accepted' } }));
    } catch (error) {
      console.warn('Could not answer call', error);
      alert("Impossible d'accéder au microphone.");
    }
  }, [incomingCall]);

  const handleDeclineCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // ── Pusher : temps réel ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const pusher = pusherService.initialize(
      // FIX MESSAGES : on s'assure que recipientId = myId (vrai ID) et que
      // l'état est mis à jour avec un nouveau tableau (référence différente)
      // pour forcer le re-render d'InboxView
      (newMsg) => {
        const myId = String(user.id);
        const rawSenderId = String(newMsg.senderId);
        const rawRecipientId = String(newMsg.recipientId);

        // ── FILTRE CRITIQUE : ignorer les messages qui ne me sont pas destinés ──
        // Le canal est PUBLIC donc tout le monde reçoit tous les messages
        // On n'accepte que : expéditeur = moi (mes propres envois sync) OU destinataire = moi
        if (rawSenderId === myId) return;         // ignorer ses propres messages (déjà ajoutés localement)
        if (rawRecipientId !== myId) return;      // ignorer les messages entre deux autres utilisateurs

        const mappedMsg: DirectMessage = {
          id: newMsg.id ? String(newMsg.id) : `dm_pusher_${rawSenderId}_${Date.now()}`,
          senderId: rawSenderId,
          recipientId: myId,
          text: newMsg.text,
          images: newMsg.images,
          audioUrl: newMsg.audioUrl,
          audioDuration: newMsg.audioDuration,
          timestamp: newMsg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readAt: null
        };

        startTransition(() => {
          setDirectMessages(prev => {
            if (prev.some(m => m.id === mappedMsg.id)) return prev;
            return [...prev, mappedMsg];
          });
          setUnreadCounts(prev => ({
            ...prev,
            [rawSenderId]: (prev[rawSenderId] || 0) + 1
          }));
        });
      },

      (newPost) => {
        if (newPost.username !== user.username) {
          setPosts(prev => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [newPost as CommunityPost, ...prev];
          });
        }
      },

      (friendId, isTyping, liveText?: string) => {
        setFriends(prev => prev.map(f => f.id === String(friendId) ? { ...f, isTyping } : f));
        if ((window as any).__inboxSetLiveTyping) {
          (window as any).__inboxSetLiveTyping(String(friendId), liveText ?? '', isTyping);
        }
      },

      async (callPayload) => {
        if (!user) return;
        const myId = String(user.id);
        const peerId = String(callPayload.senderId);
        const targetId = String(callPayload.recipientId);

        // ── FILTRE CRITIQUE : canal public, ignorer les signaux pas destinés à moi ──
        if (peerId === myId) return;      // ignorer mes propres signaux
        if (targetId !== myId) return;    // ignorer les appels entre deux autres users

        // ── OFFRE D'APPEL : montrer l'écran d'appel entrant ──
        if (callPayload.type === 'offer') {
          setIncomingCall({
            peerId,
            mode: callPayload.signal?.callMode === 'video' ? 'video' : 'audio',
            signal: callPayload.signal
          });
          return;
        }

        // ── RÉPONSE : côté appelant, finaliser la connexion ──
        // APRÈS
if (callPayload.type === 'answer' && peerConnectionRef.current) {
  try {
    const sessionDesc = callPayload.signal instanceof RTCSessionDescription
      ? callPayload.signal
      : new RTCSessionDescription(callPayload.signal);
    await peerConnectionRef.current.setRemoteDescription(sessionDesc);
    for (const candidate of pendingCandidatesRef.current) {
      try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
    pendingCandidatesRef.current = [];
    window.dispatchEvent(new CustomEvent('spirittalk_call_event', { detail: { type: 'call_accepted' } }));
  } catch (err) {
    console.warn('Failed to set remote description from answer', err);
  }
}

        // ── ICE CANDIDATE ──
      // APRÈS
        if (callPayload.type === 'ice-candidate') {
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(callPayload.signal));
            } catch {}
          } else {
            pendingCandidatesRef.current.push(callPayload.signal);
          }
        }
      }
    );

    return () => { if (pusher) pusher.disconnect(); };
  }, [user]);

  // Charger les messages depuis le backend au démarrage
  useEffect(() => {
    if (!user) return;
    const loadMessages = async () => {
        try {
          const msgs = await apiService.getDirectMessages();
          if (msgs && msgs.length > 0) {
            const myId = String(user.id);
            const normalized = msgs.map((m: any) => ({
              ...m,
              // ✅ FIX : les IDs sont maintenant de vrais strings numériques
              // plus jamais 'me' venant du backend
              senderId: String(m.senderId || m.sender_id),
              recipientId: String(m.recipientId || m.recipient_id),
            }));
            setDirectMessages(normalized);
          }
        } catch {}
      };
    loadMessages();
  }, [user]);

  // Charger posts backend
  useEffect(() => {
    if (!user) return;
    const loadBackendInspirations = async () => {
      try {
        const data = await apiService.getInspirations();
        if (data && Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            id: item.id.toString(),
            name: item.user?.name || 'Anonyme',
            username: item.user?.username || 'user',
            avatar: item.user?.avatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200',
            content: item.content,
            religion: item.user?.religion || 'Mixte',
            likes: item.likes || item.likes_count || 0,
            likedByMe: item.is_liked || false,
            time: new Date(item.created_at).toLocaleDateString('fr-FR'),
            verse_reference: item.verse_reference,
            verse_text: item.verse_text,
            comments: item.comments || []
          }));
          setPosts(mapped);
        }
      } catch {}
    };
    loadBackendInspirations();
  }, [user]);

  // Charger amis depuis le backend
  useEffect(() => {
    if (!user) return;
    const fetchAndMergeUsers = async () => {
      try {
        const [backendUsers, friendships] = await Promise.all([
          apiService.getRegisteredUsers(),
          apiService.getFriendships()
        ]);

        const friendshipMap = new Map<string, string>();
        friendships.forEach((f: any) => {
          const key = (f.email || f.username || f.id?.toString() || '').toLowerCase();
          if (key) friendshipMap.set(key, f.status);
        });

        if (backendUsers && backendUsers.length > 0) {
          const friendsList = backendUsers
            .filter((bu: any) => {
              const isMe = bu.email === user.email || bu.username === user.username || bu.id?.toString() === user.id?.toString();
              return !isMe;
            })
            .map((bu: any): Friend => {
              const key = (bu.email || bu.username || bu.id?.toString() || '').toLowerCase();
              const status = (friendshipMap.get(key) || 'none') as Friend['status'];
              return {
                id: bu.id?.toString() || bu.username,
                name: bu.name,
                username: bu.username,
                email: bu.email,
                avatar: bu.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200",
                religion: bu.religion || 'Mixte',
                profession: bu.profession || "Fidèle de la Communauté",
                status,
                isOnline: bu.isOnline !== undefined ? bu.isOnline : (Math.random() > 0.4),
              };
            });
          setFriends(friendsList);
        }
      } catch {}
    };
    fetchAndMergeUsers();
  }, [user]);

  const handleSearchMembers = useCallback(async (query: string) => {
    if (!user) return;
    try {
      const [backendUsers, friendships] = await Promise.all([
        apiService.getRegisteredUsers(query),
        apiService.getFriendships()
      ]);

      const friendshipMap = new Map<string, string>();
      friendships.forEach((f: any) => {
        const key = (f.email || f.username || f.id?.toString() || '').toLowerCase();
        if (key) friendshipMap.set(key, f.status);
      });

      const source = (!backendUsers || backendUsers.length === 0) ? await apiService.getRegisteredUsers() : backendUsers;

      const friendsList = (source || [])
        .filter((bu: any) => {
          const isMe = bu.email === user.email || bu.username === user.username || bu.id?.toString() === user.id?.toString();
          return !isMe;
        })
        .map((bu: any): Friend => {
          const key = (bu.email || bu.username || bu.id?.toString() || '').toLowerCase();
          const status = (friendshipMap.get(key) || 'none') as Friend['status'];
          return {
            id: bu.id?.toString() || bu.username,
            name: bu.name,
            username: bu.username,
            email: bu.email,
            avatar: bu.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200",
            religion: bu.religion || 'Mixte',
            profession: bu.profession || "Fidèle de la Communauté",
            status,
            isOnline: bu.isOnline !== undefined ? bu.isOnline : (Math.random() > 0.4),
          };
        });
      setFriends(friendsList);
    } catch {}
  }, [user]);

  const handleAddXP = (amount: number) => setXp(prev => prev + amount);

  const handleCheckIn = () => {
    if (hasCheckedInToday) return;
    setHasCheckedInToday(true);
    setStreak(prev => prev + 1);
    handleAddXP(50);
    alert("Présence enregistrée ! +50 XP octroyés. Que votre journée soit paisible.");
  };

  const handleAddBookmark = (verseText: string, reference: string, source: string) => {
    if (bookmarks.some(bm => bm.verseText === verseText && bm.reference === reference)) return;
    const newBookmark: Bookmark = { id: `bm_${Date.now()}`, verseText, reference, source, savedAt: "Aujourd'hui" };
    setBookmarks(prev => [newBookmark, ...prev]);
    handleAddXP(10);
  };

  const handleRemoveBookmark = (id: string) => setBookmarks(prev => prev.filter(bm => bm.id !== id));

  const handleAddNote = (newNote: Omit<Note, 'id' | 'date'>) => {
    const note: Note = { ...newNote, id: `note_${Date.now()}`, date: "Aujourd'hui" };
    setNotes(prev => [note, ...prev]);
    handleAddXP(20);
  };

  const handleDeleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      let data: any = null;
      let isSuccess = false;

      try {
        const response = await fetch('https://marilyne.alwaysdata.net/spirittalk/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatMessages, userMessage: text })
        });
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType?.includes("application/json")) {
          data = await response.json();
          if (data?.text) isSuccess = true;
        }
      } catch {}

      if (!isSuccess) {
        const localRes = await generateLocalAiResponse(text, user?.religion);
        data = { text: localRes.text, scriptureQuote: localRes.scriptureQuote };
        isSuccess = true;
      }

      if (isSuccess && data) {
        const aiMsg: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scriptureQuote: data.scriptureQuote
        };
        setChatMessages(prev => [...prev, aiMsg]);
        handleAddXP(15);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'model',
        text: `Désolé, une fluctuation m'empêche de répondre. ${err.message || ""}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToChatWithQuery = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  const handleNotificationClick = () => alert("Vos notifications spirituelles sont à jour !");

  const handleUpdateProfile = async (updates: { name: string; email: string; religion: Religion; avatar: string; profession?: string; password?: string }) => {
    const result = await apiService.updateProfile(updates);
    const finalUser = result?.user ? result.user : { ...user, ...updates };
    setUser(finalUser);
    localStorage.setItem('spirittalk_user', JSON.stringify(finalUser));
    alert("Profil spirituel mis à jour avec succès !");
  };

  const handleLogout = async () => {
    await apiService.logout();
    localStorage.removeItem('spirittalk_user');
    setUser(null);
  };

  const handleCreatePost = async (content: string, images?: string[], videoUrl?: string, verse_reference?: string, verse_text?: string) => {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      name: user?.name || 'Chercheur anonyme',
      username: user?.username || 'me',
      avatar: user?.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200",
      content, religion: user?.religion || 'Mixte',
      likes: 0, likedByMe: false,
      time: "À l'instant",
      images, videoUrl, comments: [],
      verse_reference, verse_text
    };
    setPosts(prev => [newPost, ...prev]);
    handleAddXP(30);

    try {
      await apiService.createInspiration(content.trim(), verse_reference, verse_text,
        verse_reference ? (verse_reference.includes('Coran') ? 'Coran' : 'Bible') : undefined
      );
      const data = await apiService.getInspirations();
      if (data && Array.isArray(data)) {
        setPosts(data.map((item: any) => ({
          id: item.id.toString(),
          name: item.user?.name || 'Anonyme',
          username: item.user?.username || 'user',
          avatar: item.user?.avatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200',
          content: item.content,
          religion: item.user?.religion || 'Mixte',
          likes: item.likes || item.likes_count || 0,
          likedByMe: item.is_liked || false,
          time: new Date(item.created_at).toLocaleDateString('fr-FR'),
          verse_reference: item.verse_reference,
          verse_text: item.verse_text,
          comments: item.comments || []
        })));
      }
    } catch {}
  };

  const handleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(post => post.id === postId
      ? { ...post, likes: post.likedByMe ? Math.max(0, post.likes - 1) : post.likes + 1, likedByMe: !post.likedByMe }
      : post
    ));
    try { await apiService.likeInspiration(postId); } catch {}
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      authorName: user.name || 'Chercheur anonyme',
      authorAvatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      content,
      time: "À l'instant"
    };
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post));
    handleAddXP(10);
  };

  const playPusherPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  const setupWebRtc = useCallback(async (peerId: string, mode: 'audio' | 'video' = 'audio') => {
    if (!user) return;
    try {
      // APRÈS
      const constraints: MediaStreamConstraints = { audio: true };
      if (mode === 'video') constraints.video = { width: 640, height: 480 };
      const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(async () => {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      });
      localStreamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) void apiService.sendCallSignal(peerId, event.candidate.toJSON(), 'ice-candidate');
      };
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          void remoteAudioRef.current.play().catch(() => undefined);
        }
      };
      currentCallRef.current = { peerId, mode };
      setActiveCall({ peerId, mode });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // FIX : envoyer l'offre avec type explicite pour que Pusher puisse router
      await apiService.sendCallSignal(peerId, { ...offer, callMode: mode }, 'offer');
    } catch (error) {
      console.warn('WebRTC setup failed', error);
      window.alert("Votre navigateur bloque l'accès au microphone.");
    }
  }, [user]);

  const handleStartCall = useCallback(async (friendId: string, mode: 'audio' | 'video' = 'audio') => {
    pendingCallRef.current = { peerId: friendId, mode };
    // ✅ FIX : délai de 500ms pour laisser Pusher s'abonner côté destinataire
    await new Promise(resolve => setTimeout(resolve, 500));
    await setupWebRtc(friendId, mode);
  }, [setupWebRtc]);

  const handleSendFriendRequest = async (friendId: string) => {
    setFriends(prev => prev.map(f => f.id === friendId ? { ...f, status: 'pending_sent' } : f));
    playPusherPing();
    try { await apiService.sendFriendRequest(friendId); } catch {}
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    setFriends(prev => prev.map(f => f.id === friendId ? { ...f, status: 'accepted', isOnline: true } : f));
    setNotifications(prev => prev.filter(n => !(n.type === 'friend_request' && n.description.includes(friendId))));
    const newNotif: SpiritNotification = {
      id: `notif_accept_${Date.now()}`,
      title: "Nouvelle fraternité établie !",
      description: `Vous êtes maintenant connecté avec ${friends.find(f => f.id === friendId)?.name || 'un fidèle'}.`,
      time: "À l'instant", isRead: false, type: 'friend_accept'
    };
    setNotifications(prev => [newNotif, ...prev]);
    handleAddXP(40);
    try { await apiService.acceptFriendRequest(friendId); } catch {}
  };

  const handleRemoveFriend = async (friendId: string) => {
    setFriends(prev => prev.map(f => f.id === friendId ? { ...f, status: 'none' } : f));
    try { await apiService.removeFriend(friendId); } catch {}
  };

  const handleSendDirectMessage = async (recipientId: string, text?: string, images?: string[], audioUrl?: string, audioDuration?: string) => {
    const myId = String(user?.id || 'me');
    const newMsgId = `dm_msg_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: DirectMessage = {
      id: newMsgId,
      senderId: myId,       // FIX : utiliser le vrai ID pour que le filtre fonctionne
      recipientId,
      text, timestamp: timestampStr, images, audioUrl, audioDuration, readAt: null
    };
    setDirectMessages(prev => [...prev, newMsg]);
    setUnreadCounts(prev => { const c = { ...prev }; delete c[recipientId]; return c; });
    try {
      await apiService.sendDirectMessage(String(recipientId), text, images, audioUrl, audioDuration);
    } catch {}
  };

  const handleSimulateTyping = async (recipientId: string) => {
    try {
      await apiService.sendTypingStatus(String(recipientId), true);
      setTimeout(() => apiService.sendTypingStatus(String(recipientId), false).catch(() => {}), 3000);
    } catch {}
    setFriends(prev => prev.map(f => f.id === recipientId ? { ...f, isTyping: true } : f));
    setTimeout(() => setFriends(prev => prev.map(f => f.id === recipientId ? { ...f, isTyping: false } : f)), 2000);
  };

  // Infos appelant pour l'écran d'appel entrant
  const callerName = incomingCall
    ? (friends.find(f => f.id === incomingCall.peerId)?.name || 'Appel entrant')
    : '';
  const callerAvatar = incomingCall
    ? (friends.find(f => f.id === incomingCall.peerId)?.avatar || '')
    : '';

  return (
    <>
      {!user && (
        <AuthView onAuthSuccess={(authenticatedUser) => {
          localStorage.setItem('spirittalk_user', JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
        }} />
      )}

      {user && <div>
        <div className="min-h-screen bg-cream-base dark:bg-charcoal-dark text-slate-800 dark:text-cream-base flex flex-col md:flex-row transition-colors duration-300">
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

          {/* ══════════════════════════════════════════════════════════════════
              ÉCRAN D'APPEL ENTRANT (affiché partout dans l'app)
              FIX : cet overlay est dans App.tsx donc visible peu importe
              l'onglet actif, et incomingCall est mis à jour par Pusher
          ══════════════════════════════════════════════════════════════════ */}
          {incomingCall && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-charcoal-dark rounded-3xl p-8 text-center shadow-2xl space-y-6 max-w-xs w-full mx-4 border border-emerald-medium/20 animate-fade-in">
                {/* Avatar + animation de sonnerie */}
                <div className="relative mx-auto w-24 h-24">
                  {callerAvatar ? (
                    <img
                      src={callerAvatar}
                      alt={callerName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-medium/40"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-emerald-medium/10 flex items-center justify-center">
                      <Phone className="w-10 h-10 text-emerald-medium" />
                    </div>
                  )}
                  {/* Anneaux de sonnerie animés */}
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-medium/40 animate-ping" />
                  <span className="absolute inset-[-8px] rounded-full border-2 border-emerald-medium/20 animate-ping [animation-delay:0.4s]" />
                  <span className="absolute inset-[-18px] rounded-full border border-emerald-medium/10 animate-ping [animation-delay:0.8s]" />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    {incomingCall.mode === 'video' ? '📹 Appel vidéo entrant' : '📞 Appel audio entrant'}
                  </p>
                  <p className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base">
                    {callerName}
                  </p>
                  <p className="text-xs text-slate-400">vous appelle...</p>
                </div>

                {/* Boutons Refuser / Décrocher */}
                <div className="flex gap-8 justify-center pt-2">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleDeclineCall}
                      className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white active:scale-95 transition-all shadow-lg"
                      aria-label="Refuser l'appel"
                    >
                      <PhoneOff className="w-7 h-7" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Refuser</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleAcceptCall}
                      className="p-5 rounded-full bg-emerald-medium hover:bg-emerald-deep text-white active:scale-95 transition-all shadow-lg animate-pulse"
                      aria-label="Décrocher l'appel"
                    >
                      <Phone className="w-7 h-7" />
                    </button>
                    <span className="text-[10px] text-emerald-medium font-bold uppercase tracking-wide">Décrocher</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Desktop */}
          <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 gap-8 border-r border-cream-darker dark:border-charcoal-light/10 bg-white/70 dark:bg-charcoal-card/70 backdrop-blur-md z-40">
            <div className="flex items-center gap-1 font-serif text-emerald-deep dark:text-gold-bright font-bold py-2 shrink-0 text-sm">
              <span>S</span><span>T</span>
            </div>

            <div className="flex-grow flex flex-col justify-center gap-6">
              {[
                { tab: 'home', icon: <Home className="w-5 h-5" />, title: 'Accueil' },
                { tab: 'community', icon: <Users className="w-5 h-5" />, title: 'Communauté' },
                { tab: 'inbox', icon: <MessageCircle className="w-5 h-5" />, title: 'Messagerie', badge: Object.values(unreadCounts).reduce((a, b) => a + b, 0) },
                { tab: 'chat', icon: <Sparkles className="w-5 h-5" />, title: 'Guidance IA' },
                { tab: 'search', icon: <Search className="w-5 h-5" />, title: 'Rechercher' },
                { tab: 'profile', icon: <User className="w-5 h-5" />, title: 'Mon Profil' },
              ].map(({ tab, icon, title, badge }) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab as any)}
                  className={`p-3 rounded-xl transition-all relative ${
                    currentTab === tab
                      ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                      : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
                  }`}
                  title={title}
                >
                  {icon}
                  {badge && badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full px-1 min-w-[16px] text-center">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="p-3 text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 transition-all"
              title="Changer de thème"
            >
              {darkMode ? <Sun className="w-5 h-5 text-gold-bright" /> : <Moon className="w-5 h-5" />}
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-grow md:pl-20 flex flex-col">
            <header className="sticky top-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-cream-base/80 dark:bg-charcoal-dark/85 backdrop-blur-md border-b border-cream-darker dark:border-charcoal-light/10">
              <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-emerald-deep dark:text-gold-bright">SpiritTalk</h1>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-emerald-medium/5 dark:bg-charcoal-card px-3 py-1.5 rounded-lg border border-emerald-medium/10">
                  <Award className="w-3.5 h-3.5 text-gold-deep dark:text-gold-bright" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-medium dark:text-cream-base/75">{xp} XP</span>
                </div>
                <button onClick={() => setDarkMode(prev => !prev)} className="md:hidden p-2 text-slate-500 dark:text-cream-base/60 hover:bg-cream-darker dark:hover:bg-charcoal-light/25 rounded-lg transition-colors">
                  {darkMode ? <Sun className="w-4 h-4 text-gold-bright" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={handleNotificationClick} className="p-2 text-slate-500 dark:text-cream-base/60 hover:bg-cream-darker dark:hover:bg-charcoal-light/25 rounded-lg transition-colors relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-deep rounded-full animate-ping" />
                </button>
              </div>
            </header>

            <main className="flex-grow p-4 md:p-8 max-w-[1000px] mx-auto w-full">
              {currentTab === 'home' && (
                <HomeView user={user} xp={xp} streak={streak} onOpenQuiz={() => setIsQuizOpen(true)} onSelectInspiration={setSelectedInspiration} onBookmark={handleAddBookmark} onAddXP={handleAddXP} onNavigateToChatWithQuery={handleNavigateToChatWithQuery} posts={posts} onAddPost={handleCreatePost} onLikePost={handleLikePost} />
              )}
              {currentTab === 'community' && (
                <CommunityView user={user} posts={posts} friends={friends} notifications={notifications} onAddPost={handleCreatePost} onLikePost={handleLikePost} onAddComment={handleAddComment} onSendFriendRequest={handleSendFriendRequest} onAcceptFriendRequest={handleAcceptFriendRequest} onRemoveFriend={handleRemoveFriend} onClearNotification={(notifId) => setNotifications(prev => prev.filter(n => n.id !== notifId))} onNavigateToChat={() => setCurrentTab('inbox')} onSearchMembers={handleSearchMembers} />
              )}
              {currentTab === 'inbox' && (
                <InboxView
                  user={user}
                  friends={friends}
                  messages={directMessages}
                  unreadCounts={unreadCounts}
                  onSendMessage={handleSendDirectMessage}
                  onSimulateTyping={handleSimulateTyping}
                  onSelectFriend={(friendId) => {
                    setUnreadCounts(prev => { const c = { ...prev }; delete c[friendId]; return c; });
                  }}
                  onStartCall={handleStartCall}
                />
              )}
              {currentTab === 'chat' && (
                <ChatView messages={chatMessages} onSendMessage={handleSendMessage} onBookmark={handleAddBookmark} isGenerating={isGenerating} />
              )}
              {currentTab === 'search' && (
                <SearchView onBookmark={handleAddBookmark} onNavigateToChatWithQuery={handleNavigateToChatWithQuery} />
              )}
              {currentTab === 'profile' && (
                <ProfileView user={user} xp={xp} streak={streak} bookmarks={bookmarks} notes={notes} onCheckIn={handleCheckIn} onRemoveBookmark={handleRemoveBookmark} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onNavigateToChatWithQuery={handleNavigateToChatWithQuery} hasCheckedInToday={hasCheckedInToday} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
              )}
            </main>
          </div>

          {/* Bottom Nav Mobile */}
          <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-20 pb-safe bg-cream-base/90 dark:bg-charcoal-card/90 backdrop-blur-md border-t border-cream-darker dark:border-charcoal-light/10 shadow-lg">
            {[
              { tab: 'home', icon: <Home className="w-5 h-5 mb-1" />, label: 'Accueil' },
              { tab: 'community', icon: <Users className="w-5 h-5 mb-1" />, label: 'Communauté' },
              { tab: 'inbox', icon: <MessageCircle className="w-5 h-5 mb-1" />, label: 'Messages', badge: Object.values(unreadCounts).reduce((a, b) => a + b, 0) },
              { tab: 'chat', icon: <Sparkles className="w-5 h-5 mb-1" />, label: 'IA' },
              { tab: 'search', icon: <Search className="w-5 h-5 mb-1" />, label: 'Étude' },
              { tab: 'profile', icon: <User className="w-5 h-5 mb-1" />, label: 'Profil' },
            ].map(({ tab, icon, label, badge }) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab as any)}
                className={`flex flex-col items-center justify-center p-2 text-xs font-semibold relative ${currentTab === tab ? "text-emerald-deep dark:text-gold-bright" : "text-slate-400 hover:text-slate-600"}`}
              >
                {icon}
                <span className="text-[9px] tracking-wide font-medium">{label}</span>
                {badge && badge > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black rounded-full px-1 min-w-[14px] text-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <>
            {isQuizOpen && (
              <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onQuizComplete={(xpGained) => { handleAddXP(xpGained); if (!hasCheckedInToday) { setHasCheckedInToday(true); setStreak(prev => prev + 1); } }} />
            )}
            {selectedInspiration && (
              <InspirationModal card={selectedInspiration} onClose={() => setSelectedInspiration(null)} onBookmark={handleAddBookmark} />
            )}
          </>
        </div>
      </div>}
    </>
  );
}
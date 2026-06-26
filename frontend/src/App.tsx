import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Search, User, Award, Moon, Sun, Bell, MessageSquare, Users, MessageCircle } from 'lucide-react';
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

const PRE_SEEDED_FRIENDS: Friend[] = [
  {
    id: 'friend_amina',
    name: "Amina Diop",
    username: "amina_diop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    religion: "Musulmane",
    profession: "Étudiante en Psychologie",
    isOnline: true,
    status: 'accepted'
  },
  {
    id: 'friend_samuel',
    name: "Samuel Koffi",
    username: "sam_koffi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    religion: "Chrétienne",
    profession: "Enseignant d'Histoire",
    isOnline: true,
    status: 'accepted'
  },
  {
    id: 'friend_jordan',
    name: "Jordan Mensah",
    username: "jordan_m",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    religion: "Chrétienne",
    profession: "Infirmier de nuit",
    isOnline: false,
    status: 'accepted'
  },
  {
    id: 'friend_fatima',
    name: "Fatima Sylla",
    username: "fatima_sy",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    religion: "Musulmane",
    profession: "Architecte",
    isOnline: false,
    status: 'pending_received'
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
        content: "Tellement vrai Samuel ! En Islam, la réconciliation et le fait de pardonner aux autres ('Al-Afx') sont également de très grandes vertus bénies par le Miséricordieux.",
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

const PRE_SEEDED_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm_1',
    senderId: 'friend_amina',
    recipientId: 'me',
    text: "As-salamu alaykum mon frère/sœur ! Comment se passe votre journée d'étude spirituelle aujourd'hui ?",
    timestamp: "10:30"
  },
  {
    id: 'dm_2',
    senderId: 'me',
    recipientId: 'friend_amina',
    text: "Aleykoum salam Amina ! Très bien, je lisais justement de magnifiques passages sur la bienveillance.",
    timestamp: "10:32"
  },
  {
    id: 'dm_3',
    senderId: 'friend_amina',
    recipientId: 'me',
    text: "Gloire à Dieu ! C'est si apaisant pour le cœur. N'hésite pas si tu as envie d'en discuter en vocal.",
    timestamp: "10:35"
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

  // Community States
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('spirittalk_posts');
    return saved ? JSON.parse(saved) : PRE_SEEDED_POSTS;
  });

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('spirittalk_friends');
    return saved ? JSON.parse(saved) : PRE_SEEDED_FRIENDS;
  });

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('spirittalk_direct_messages');
    return saved ? JSON.parse(saved) : PRE_SEEDED_DIRECT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<SpiritNotification[]>(() => {
    const saved = localStorage.getItem('spirittalk_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif_1',
        title: "Demande de fraternité reçue",
        description: "Fatima Sylla souhaite se connecter avec vous.",
        time: "Il y a 10m",
        isRead: false,
        type: 'friend_request'
      }
    ];
  });
  
  // Persisted Stats & Data
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('spirittalk_xp');
    return saved ? parseInt(saved, 10) : 1200;
  });
  
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('spirittalk_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    const saved = localStorage.getItem('spirittalk_checked_in_today');
    return saved === 'true';
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

  // Modal / overlay states
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationCard | null>(null);
  
  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('spirittalk_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('spirittalk_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('spirittalk_checked_in_today', hasCheckedInToday ? 'true' : 'false');
  }, [hasCheckedInToday]);

  useEffect(() => {
    localStorage.setItem('spirittalk_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('spirittalk_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('spirittalk_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('spirittalk_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('spirittalk_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('spirittalk_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem('spirittalk_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync Dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize Pusher real-time synchronization
  useEffect(() => {
    if (!user) return;

    const pusher = pusherService.initialize(
      // onNewMessage callback
      (newMsg) => {
        if (newMsg.senderId !== 'me') {
          setDirectMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, {
              id: newMsg.id || `dm_msg_${Date.now()}`,
              senderId: newMsg.senderId,
              recipientId: newMsg.recipientId,
              text: newMsg.text,
              images: newMsg.images,
              audioUrl: newMsg.audioUrl,
              audioDuration: newMsg.audioDuration,
              timestamp: newMsg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
          });

          // Also trigger a notification for new messages
          const senderFriend = friends.find(f => f.id === newMsg.senderId);
          if (senderFriend) {
            const msgPreview = newMsg.text || (newMsg.audioUrl ? "Note vocale 🎵" : "Image 🖼️");
            const newNotif: SpiritNotification = {
              id: `notif_msg_${Date.now()}`,
              title: `Message de ${senderFriend.name}`,
              description: msgPreview.substring(0, 50) + (msgPreview.length > 50 ? "..." : ""),
              time: "À l'instant",
              isRead: false,
              type: 'message'
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        }
      },
      // onNewPost callback
      (newPost) => {
        if (newPost.username !== user.username) {
          setPosts(prev => {
            const exists = prev.some(p => p.id === newPost.id);
            if (exists) return prev;
            return [newPost as CommunityPost, ...prev];
          });
        }
      },
      // onFriendTyping callback
      (friendId, isTyping) => {
        setFriends(prev => prev.map(f => f.id === friendId ? { ...f, isTyping } : f));
      }
    );

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [user, friends]);

  const handleAddXP = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const handleCheckIn = () => {
    if (hasCheckedInToday) return;
    setHasCheckedInToday(true);
    setStreak(prev => prev + 1);
    handleAddXP(50);
    alert("Présence enregistrée ! +50 XP octroyés. Que votre journée soit paisible.");
  };

  const handleAddBookmark = (verseText: string, reference: string, source: string) => {
    const alreadySaved = bookmarks.some(bm => bm.verseText === verseText && bm.reference === reference);
    if (alreadySaved) return;

    const newBookmark: Bookmark = {
      id: `bm_${Date.now()}`,
      verseText,
      reference,
      source,
      savedAt: "Aujourd'hui"
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    handleAddXP(10); // +10 XP for bookmarking
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== id));
  };

  const handleAddNote = (newNote: Omit<Note, 'id' | 'date'>) => {
    const note: Note = {
      ...newNote,
      id: `note_${Date.now()}`,
      date: "Aujourd'hui"
    };
    setNotes(prev => [note, ...prev]);
    handleAddXP(20); // +20 XP for logging a reflection
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

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
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatMessages,
            userMessage: text
          })
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          data = await response.json();
          if (data && data.text) {
            isSuccess = true;
          }
        }
      } catch (e) {
        console.warn("Direct server chat endpoint failed, falling back to local AI engine", e);
      }

      // If server failed, generate client fallback
      if (!isSuccess) {
        const localRes = await generateLocalAiResponse(text, user?.religion);
        data = {
          text: localRes.text,
          scriptureQuote: localRes.scriptureQuote
        };
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
        handleAddXP(15); // Gain some XP for interacting/learning
      } else {
        throw new Error("Impossible de générer une réponse.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'model',
        text: `Désolé Seeker, une fluctuation spirituelle m'empêche de répondre. Vérifions les connexions. ${err.message || ""}`,
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

  const handleNotificationClick = () => {
    alert("Vos notifications spirituelles sont à jour !");
  };

  const handleUpdateProfile = async (updates: { name: string; email: string; religion: Religion; avatar: string; profession?: string; password?: string }) => {
    const result = await apiService.updateProfile(updates);
    let finalUser = user;
    if (result && result.user) {
      finalUser = result.user;
    } else {
      finalUser = { ...user, ...updates };
    }
    setUser(finalUser);
    localStorage.setItem('spirittalk_user', JSON.stringify(finalUser));
    alert("Profil spirituel mis à jour avec succès ! Vos préférences ont été enregistrées.");
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
  };

  // Community & Direct Messaging Handlers
  const handleCreatePost = (content: string, images?: string[], videoUrl?: string, verse_reference?: string, verse_text?: string) => {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      name: user.name || 'Chercheur anonyme',
      username: user.username || 'me',
      avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content,
      religion: user.religion || 'Mixte',
      likes: 0,
      likedByMe: false,
      time: "À l'instant",
      images,
      videoUrl,
      comments: [],
      verse_reference,
      verse_text
    };
    setPosts(prev => [newPost, ...prev]);
    handleAddXP(30);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          likedByMe: !post.likedByMe
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      authorName: user.name || 'Chercheur anonyme',
      authorAvatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content,
      time: "À l'instant"
    };
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    handleAddXP(10);
  };

  const handleSendFriendRequest = (friendId: string) => {
    setFriends(prev => prev.map(f => {
      if (f.id === friendId) {
        return { ...f, status: 'pending_sent' };
      }
      return f;
    }));
    alert("Demande de fraternité envoyée !");
  };

  const handleAcceptFriendRequest = (friendId: string) => {
    setFriends(prev => prev.map(f => {
      if (f.id === friendId) {
        return { ...f, status: 'accepted', isOnline: true };
      }
      return f;
    }));
    setNotifications(prev => prev.filter(n => !(n.type === 'friend_request' && n.description.includes(friendId))));
    const newNotif: SpiritNotification = {
      id: `notif_accept_${Date.now()}`,
      title: "Nouvelle fraternité établie !",
      description: `Vous êtes maintenant connecté avec ${friends.find(f => f.id === friendId)?.name || 'un fidèle'}.`,
      time: "À l'instant",
      isRead: false,
      type: 'friend_accept'
    };
    setNotifications(prev => [newNotif, ...prev]);
    handleAddXP(40);
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleSendDirectMessage = (recipientId: string, text?: string, images?: string[], audioUrl?: string, audioDuration?: string) => {
    const newMsg: DirectMessage = {
      id: `dm_msg_${Date.now()}`,
      senderId: 'me',
      recipientId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      images,
      audioUrl,
      audioDuration
    };
    setDirectMessages(prev => [...prev, newMsg]);
  };

  const handleSimulateTyping = (recipientId: string) => {
    const activeFriend = friends.find(f => f.id === recipientId);
    if (!activeFriend) return;

    setTimeout(() => {
      setFriends(prev => prev.map(f => f.id === recipientId ? { ...f, isTyping: true } : f));
      
      setTimeout(() => {
        setFriends(prev => prev.map(f => f.id === recipientId ? { ...f, isTyping: false } : f));
        
        let replyText = "Que la paix et la bénédiction de Dieu t'accompagnent mon frère / ma sœur. C'est un immense bonheur de pouvoir échanger avec toi aujourd'hui !";
        if (activeFriend.religion === 'Chrétienne') {
          const christianQuotes = [
            "Gloire à Dieu ! Que Sa parole soit une lampe à nos pieds et une lumière sur notre sentier (Psaume 119:105). Demeurons confiants.",
            "Amen ! Rappelons-nous que tout est possible à celui qui croit (Marc 9:23). Je prie pour toi aujourd'hui.",
            "Merci pour ce partage fraternel ! Le Seigneur est notre berger, nous ne manquerons de rien."
          ];
          replyText = christianQuotes[Math.floor(Math.random() * christianQuotes.length)];
        } else {
          const muslimQuotes = [
            "Barak'Allahu feek ! Certes, la prière apaise les cœurs et éloigne l'angoisse. Qu'Allah te protège.",
            "Alhamdulillah ! C'est un excellent rappel. 'Certes, après la difficulté vient la facilité' (Coran 94:5).",
            "Masha'Allah mon frère ! Que la paix ('Salam') d'Allah soit sur toi et ta sainte demeure."
          ];
          replyText = muslimQuotes[Math.floor(Math.random() * muslimQuotes.length)];
        }

        const replyMsg: DirectMessage = {
          id: `dm_msg_reply_${Date.now()}`,
          senderId: recipientId,
          recipientId: 'me',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setDirectMessages(prev => [...prev, replyMsg]);
        
        const newNotif: SpiritNotification = {
          id: `notif_msg_${Date.now()}`,
          title: `Nouveau message de ${activeFriend.name}`,
          description: replyText.substring(0, 50) + "...",
          time: "À l'instant",
          isRead: false,
          type: 'message'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }, 2500);

    }, 1500);
  };

  // Render Authentication screen if not logged in
  if (!user) {
    return <AuthView onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="min-h-screen bg-cream-base dark:bg-charcoal-dark text-slate-800 dark:text-cream-base flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Navigation for Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 gap-8 border-r border-cream-darker dark:border-charcoal-light/10 bg-white/70 dark:bg-charcoal-card/70 backdrop-blur-md z-40">
        <div className="flex items-center gap-1 font-serif text-emerald-deep dark:text-gold-bright font-bold py-2 shrink-0 text-sm">
          <span>S</span>
          <span>T</span>
        </div>
        
        <div className="flex-grow flex flex-col justify-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'home'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Accueil"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('community')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'community'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Communauté"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('inbox')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'inbox'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Messagerie"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('chat')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'chat'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Guidance IA"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('search')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'search'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`p-3 rounded-xl transition-all ${
              currentTab === 'profile'
                ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-md scale-110"
                : "text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-darker dark:hover:bg-charcoal-light/20"
            }`}
            title="Mon Profil"
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom actions on desktop sidebar */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="p-3 text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 transition-all"
            title="Changer de thème"
          >
            {darkMode ? <Sun className="w-5 h-5 text-gold-bright" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow md:pl-20 flex flex-col">
        
        {/* Top App Bar Header */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-cream-base/80 dark:bg-charcoal-dark/85 backdrop-blur-md border-b border-cream-darker dark:border-charcoal-light/10">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-emerald-deep dark:text-gold-bright">
              SpiritTalk
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick stats on Header */}
            <div className="hidden sm:flex items-center gap-1 bg-emerald-medium/5 dark:bg-charcoal-card px-3 py-1.5 rounded-lg border border-emerald-medium/10">
              <Award className="w-3.5 h-3.5 text-gold-deep dark:text-gold-bright" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-medium dark:text-cream-base/75">
                {xp} XP
              </span>
            </div>

            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="md:hidden p-2 text-slate-500 dark:text-cream-base/60 hover:bg-cream-darker dark:hover:bg-charcoal-light/25 rounded-lg transition-colors"
              title="Thème"
            >
            
              {darkMode ? <Sun className="w-4 h-4 text-gold-bright" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleNotificationClick}
              className="p-2 text-slate-500 dark:text-cream-base/60 hover:bg-cream-darker dark:hover:bg-charcoal-light/25 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-deep rounded-full animate-ping"></span>
            </button>
          </div>
        </header>

        {/* Center Main Reading Stage */}
        <main className="flex-grow p-4 md:p-8 max-w-[1000px] mx-auto w-full">
          {currentTab === 'home' && (
            <HomeView
              user={user}
              xp={xp}
              streak={streak}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onSelectInspiration={setSelectedInspiration}
              onBookmark={handleAddBookmark}
              onAddXP={handleAddXP}
              onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
            />
          )}

          {currentTab === 'community' && (
            <CommunityView
              user={user}
              posts={posts}
              friends={friends}
              notifications={notifications}
              onAddPost={handleCreatePost}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onSendFriendRequest={handleSendFriendRequest}
              onAcceptFriendRequest={handleAcceptFriendRequest}
              onRemoveFriend={handleRemoveFriend}
              onClearNotification={(notifId) => setNotifications(prev => prev.filter(n => n.id !== notifId))}
              onNavigateToChat={() => setCurrentTab('chat')}
            />
          )}

          {currentTab === 'inbox' && (
            <InboxView
              user={user}
              friends={friends}
              messages={directMessages}
              onSendMessage={handleSendDirectMessage}
              onSimulateTyping={handleSimulateTyping}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onBookmark={handleAddBookmark}
              isGenerating={isGenerating}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              onBookmark={handleAddBookmark}
              onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              xp={xp}
              streak={streak}
              bookmarks={bookmarks}
              notes={notes}
              onCheckIn={handleCheckIn}
              onRemoveBookmark={handleRemoveBookmark}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
              hasCheckedInToday={hasCheckedInToday}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile View */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-20 pb-safe bg-cream-base/90 dark:bg-charcoal-card/90 backdrop-blur-md border-t border-cream-darker dark:border-charcoal-light/10 shadow-lg">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'home'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">Accueil</span>
        </button>

        <button
          onClick={() => setCurrentTab('community')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'community'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">Communauté</span>
        </button>

        <button
          onClick={() => setCurrentTab('inbox')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'inbox'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">Messages</span>
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'chat'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">IA</span>
        </button>

        <button
          onClick={() => setCurrentTab('search')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'search'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">Étude</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center p-2 text-xs font-semibold ${
            currentTab === 'profile'
              ? "text-emerald-deep dark:text-gold-bright"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[9px] tracking-wide font-medium">Profil</span>
        </button>
      </nav>

      {/* Overlays / Modals */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onQuizComplete={(xpGained) => {
          handleAddXP(xpGained);
          if (!hasCheckedInToday) {
            setHasCheckedInToday(true);
            setStreak(prev => prev + 1);
          }
        }}
      />

      <InspirationModal
        card={selectedInspiration}
        onClose={() => setSelectedInspiration(null)}
        onBookmark={handleAddBookmark}
      />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Search, User, Award, Moon, Sun, Bell, MessageSquare } from 'lucide-react';
import { ChatMessage, Bookmark, Note, InspirationCard } from './types';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import QuizModal from './components/QuizModal';
import InspirationModal from './components/InspirationModal';

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
  const [currentTab, setCurrentTab] = useState<'home' | 'chat' | 'search' | 'profile'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
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

  // Sync Dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          userMessage: text
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
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
        throw new Error(data.error || "Failed to fetch response");
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
              xp={xp}
              streak={streak}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onSelectInspiration={setSelectedInspiration}
              onBookmark={handleAddBookmark}
              onAddXP={handleAddXP}
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
          <span className="text-[10px] tracking-wide font-medium">Home</span>
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
          <span className="text-[10px] tracking-wide font-medium">Chat</span>
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
          <span className="text-[10px] tracking-wide font-medium">Search</span>
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
          <span className="text-[10px] tracking-wide font-medium">Profile</span>
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

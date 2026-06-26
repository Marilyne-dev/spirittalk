import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Flame, Play, Share2, Bookmark, CheckCircle, ChevronRight, Award, Send, Heart, MessageCircle, User as UserIcon } from 'lucide-react';
import { Verse, ReadingPlan, InspirationCard, Religion } from '../types';
import { VERSETS_DU_JOUR, READING_PLANS, INSPIRATIONS, SCRIPTURE_LIBRARY } from '../data';
import { apiService } from '../services/api';

interface HomeViewProps {
  user: any;
  xp: number;
  streak: number;
  onOpenQuiz: () => void;
  onSelectInspiration: (card: InspirationCard) => void;
  onBookmark: (text: string, reference: string, source: string) => void;
  onAddXP: (amount: number) => void;
  onNavigateToChatWithQuery?: (prompt: string) => void;
  posts?: CommunityPost[];
  onAddPost?: (content: string, images?: string[], videoUrl?: string, verse_reference?: string, verse_text?: string) => void;
  onLikePost?: (id: string) => void;
}

interface CommunityPost {
  id: string;
  name: string;
  username: string;
  avatar: string;
  content: string;
  religion: Religion;
  likes: number;
  likedByMe?: boolean;
  time: string;
  verse_reference?: string;
  verse_text?: string;
}

const PRESEED_POSTS: CommunityPost[] = [
  {
    id: 'p_1',
    name: 'Samuel Koffi',
    username: 'sam_koffi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    content: "Merveilleux temps de prière ce matin. Je méditais sur la patience. Restons connectés au Tout-Puissant dans chaque épreuve.",
    religion: 'Chrétienne',
    likes: 12,
    time: 'Il y a 2h',
    verse_reference: 'Galates 5:22',
    verse_text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté..."
  },
  {
    id: 'p_2',
    name: 'Amina Diop',
    username: 'amina_diop',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    content: "La Sourate Ar-Ra'd apporte une telle sérénité aux cœurs fatigués. Qu'Allah apaise vos esprits en ce vendredi béni.",
    religion: 'Musulmane',
    likes: 24,
    time: 'Il y a 3h',
    verse_reference: 'Sourate Ar-Ra\'d (13:28)',
    verse_text: "N'est-ce point par l'évocation d'Allah que les cœurs se tranquillisent ?"
  },
  {
    id: 'p_3',
    name: 'Jordan M.',
    username: 'jordan_mix',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200',
    content: "Peu importe notre sensibilité chrétienne ou musulmane, la bonté, le pardon et l'amour du prochain restent universels.",
    religion: 'Mixte',
    likes: 31,
    time: 'Il y a 5h'
  }
];

export default function HomeView({
  user,
  xp,
  streak,
  onOpenQuiz,
  onSelectInspiration,
  onBookmark,
  onAddXP,
  onNavigateToChatWithQuery,
  posts: parentPosts,
  onAddPost,
  onLikePost
}: HomeViewProps) {
  const [verseIdx, setVerseIdx] = useState(0);
  const [plans, setPlans] = useState<ReadingPlan[]>(READING_PLANS);
  const [votedVerse, setVotedVerse] = useState<Record<string, boolean>>({});
  
  // Community Feed states
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('spirittalk_posts');
    return saved ? JSON.parse(saved) : PRESEED_POSTS;
  });
  const [newPostText, setNewPostText] = useState("");
  const [selectedVerseRef, setSelectedVerseRef] = useState("");
  const [feedFilter, setFeedFilter] = useState<'All' | 'Chrétienne' | 'Musulmane'>('All');

  const displayPosts = parentPosts || localPosts;

  // Save posts to local state
  useEffect(() => {
    if (!parentPosts) {
      localStorage.setItem('spirittalk_posts', JSON.stringify(localPosts));
    }
  }, [localPosts, parentPosts]);

  // Load custom community posts from backend if possible
  useEffect(() => {
    if (parentPosts) return;
    const loadBackendInspirations = async () => {
      const data = await apiService.getInspirations();
      if (data && Array.isArray(data)) {
        const mapped = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.user?.name || 'Anonyme',
          username: item.user?.username || 'user',
          avatar: item.user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
          content: item.content,
          religion: item.user?.religion || 'Mixte',
          likes: item.likes_count || 0,
          likedByMe: item.is_liked || false,
          time: new Date(item.created_at).toLocaleDateString('fr-FR'),
          verse_reference: item.verse_reference,
          verse_text: item.verse_text
        }));
        setLocalPosts(mapped);
      }
    };
    loadBackendInspirations();
  }, [parentPosts]);

  const userReligion: Religion = user?.religion || 'Mixte';

  // Filter Verses based on selected religion
  const filteredVerses = VERSETS_DU_JOUR.filter(v => {
    if (userReligion === 'Chrétienne') return v.source === 'Bible';
    if (userReligion === 'Musulmane') return v.source === 'Coran';
    return true; // Mixte shows all
  });

  const currentVerse = filteredVerses[verseIdx % filteredVerses.length] || VERSETS_DU_JOUR[0];

  const handleNextVerse = () => {
    setVerseIdx(prev => (prev + 1) % filteredVerses.length);
  };

  const handleBookmarkThis = (verse: Verse) => {
    onBookmark(verse.text, verse.reference, verse.source);
    setVotedVerse(prev => ({ ...prev, [verse.id]: true }));
    setTimeout(() => {
      setVotedVerse(prev => ({ ...prev, [verse.id]: false }));
    }, 2000);
  };

  const handleShare = (verse: Verse) => {
    navigator.clipboard.writeText(`"${verse.text}" — ${verse.reference}`);
    alert("Verset copié pour partage ! Que la paix soit avec vous.");
  };

  // Filter Reading Plans based on selected religion
  const filteredPlans = READING_PLANS.filter(p => {
    if (userReligion === 'Chrétienne') {
      return p.id.includes('wisdom') || p.id.includes('forgiveness');
    }
    if (userReligion === 'Musulmane') {
      return p.id.includes('peace') || p.id.includes('wisdom');
    }
    return true; // Mixte shows all
  });

  const handleIncrementProgress = (planId: string) => {
    setPlans(prevPlans =>
      prevPlans.map(p => {
        if (p.id === planId) {
          const nextChapter = Math.min(p.currentChapter + 1, p.totalChapters);
          const nextProgress = Math.round((nextChapter / p.totalChapters) * 100);
          
          if (nextChapter > p.currentChapter) {
            onAddXP(15); // +15 XP for reading a chapter
            apiService.updateReadingProgress(planId, nextChapter, nextProgress, nextChapter === p.totalChapters);
          }
          
          return {
            ...p,
            currentChapter: nextChapter,
            progress: nextProgress
          };
        }
        return p;
      })
    );
  };

  // Create community post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    let attachedVerseText = "";
    let attachedVerseRef = "";
    if (selectedVerseRef) {
      const match = SCRIPTURE_LIBRARY.find(v => v.reference.toLowerCase().includes(selectedVerseRef.toLowerCase()));
      if (match) {
        attachedVerseText = match.text;
        attachedVerseRef = match.reference;
      }
    }

    const newPost: CommunityPost = {
      id: `p_${Date.now()}`,
      name: user?.name || 'Seeker',
      username: user?.username || 'seeker',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
      content: newPostText.trim(),
      religion: userReligion,
      likes: 0,
      time: 'À l\'instant',
      verse_reference: attachedVerseRef || undefined,
      verse_text: attachedVerseText || undefined
    };

    if (onAddPost) {
      onAddPost(newPostText.trim(), undefined, undefined, attachedVerseRef || undefined, attachedVerseText || undefined);
    } else {
      setLocalPosts(prev => [newPost, ...prev]);
      // Try posting to Laravel AlwaysData backend
      await apiService.createInspiration(
        newPostText.trim(),
        attachedVerseRef || undefined,
        attachedVerseText || undefined,
        attachedVerseRef ? (attachedVerseRef.includes('Coran') ? 'Coran' : 'Bible') : undefined
      );
    }

    setNewPostText("");
    setSelectedVerseRef("");
    onAddXP(30); // +30 XP for sharing wisdom in community!
  };

  // Like community post
  const handleLikePost = async (id: string) => {
    if (onLikePost) {
      onLikePost(id);
    } else {
      setLocalPosts(prev => prev.map(p => {
        if (p.id === id) {
          const isLiked = !p.likedByMe;
          return {
            ...p,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            likedByMe: isLiked
          };
        }
        return p;
      }));

      await apiService.likeInspiration(id);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Welcome Profile Section (Custom visual style depending on faith) */}
      <section className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all ${
        userReligion === 'Chrétienne'
          ? 'bg-gradient-to-r from-emerald-medium/15 to-emerald-light/5 border-emerald-medium/10'
          : userReligion === 'Musulmane'
          ? 'bg-gradient-to-r from-gold-bright/10 to-gold-muted/5 border-gold-muted/20'
          : 'bg-gradient-to-r from-emerald-medium/10 to-gold-bright/5 border-emerald-medium/5'
      }`}>
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-gold-muted/80 shadow-lg bg-emerald-medium/10">
            <img
              className="w-full h-full object-cover"
              src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"}
              alt="Seeker Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-medium text-white p-1.5 rounded-full border-2 border-white shadow-md dark:border-charcoal-dark">
            <Award className="w-4 h-4 text-gold-bright" />
          </span>
        </div>
        
        <div className="space-y-3 text-center md:text-left flex-grow">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-emerald-deep dark:text-cream-base tracking-tight">
              Que la paix soit avec vous, {user?.name || "Seeker"}
            </h2>
            <p className="font-serif text-sm italic text-slate-600 dark:text-cream-base/70 max-w-xl leading-relaxed">
              {userReligion === 'Chrétienne' ? (
                `"Demandez, et l'on vous donnera; cherchez, et vous trouverez; frappez, et l'on vous ouvrira." — Matthieu 7:7`
              ) : userReligion === 'Musulmane' ? (
                `"Certes, Dieu est avec ceux qui sont pieux et ceux qui font le bien." — Sourate An-Nahl 16:128`
              ) : (
                `"La vérité est un miroir tombé des mains de Dieu et qui s'est brisé. Chacun en ramasse un morceau et croit détenir toute la vérité." — Rûmî`
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-emerald-medium/10 text-emerald-medium dark:text-emerald-fixed text-xs font-semibold uppercase tracking-wider border border-emerald-medium/20">
              Cabinet: {userReligion}
            </span>
            <span className="px-3 py-1 rounded-full bg-gold-bright/20 text-gold-deep dark:text-gold-bright text-xs font-semibold uppercase tracking-wider border border-gold-muted/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Niveau: Explorateur
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-fixed/30 text-emerald-deep dark:bg-charcoal-light dark:text-cream-base/80 text-xs font-mono font-medium">
              {xp} XP
            </span>
          </div>
        </div>
      </section>

      {/* Verse of the Day Hero */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider">
            Écriture Inspirante du Jour
          </h3>
          <button
            onClick={handleNextVerse}
            className="text-xs text-emerald-medium dark:text-emerald-fixed hover:underline font-semibold flex items-center gap-1"
          >
            Sujet suivant <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="glass-panel rounded-2xl p-6 md:p-8 text-center border border-cream-darker dark:border-charcoal-light/10 shadow-[0_12px_36px_rgba(13,43,33,0.04)] relative overflow-hidden bg-[#F2E8CF]/15 dark:bg-[#F2E8CF]/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-bright/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-emerald-light dark:text-emerald-fixed mb-4 block font-bold">
            {currentVerse.source === 'Bible' ? '📖 Sainte Bible' : '✨ Saint Coran'} • {currentVerse.category}
          </span>
          
          <blockquote className="font-serif text-xl md:text-2xl text-emerald-deep dark:text-cream-base max-w-[650px] mx-auto leading-relaxed italic">
            "{currentVerse.text}"
          </blockquote>
          
          <cite className="mt-4 block font-sans text-xs text-slate-500 dark:text-cream-base/60 not-italic uppercase tracking-widest font-bold">
            — {currentVerse.reference}
          </cite>
          
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => handleShare(currentVerse)}
              className="p-2.5 rounded-full border border-emerald-medium/10 hover:bg-emerald-medium/5 active:scale-90 transition-all text-slate-600 dark:text-cream-base/70"
              title="Copier le verset"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleBookmarkThis(currentVerse)}
              className={`p-2.5 rounded-full border transition-all text-slate-600 dark:text-cream-base/70 ${
                votedVerse[currentVerse.id]
                  ? "bg-green-500/10 border-green-500/30 text-green-600"
                  : "border-emerald-medium/10 hover:bg-emerald-medium/5 active:scale-90"
              }`}
              title="Sauvegarder"
            >
              <Bookmark className={`w-4 h-4 ${votedVerse[currentVerse.id] ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Bento Layout Grid for reading progress & quiz */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Continue Reading Section (6 columns on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider">
            Plans d'Étude Recommandés
          </h3>
          
          <div className="space-y-4">
            {filteredPlans.map((plan) => {
              const isFinished = plan.currentChapter === plan.totalChapters;
              
              return (
                <div
                  key={plan.id}
                  className="p-5 bg-white dark:bg-charcoal-card rounded-xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-grow mr-4">
                    <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${
                      plan.id.includes('peace') 
                        ? 'bg-emerald-fixed/60 text-emerald-deep' 
                        : plan.id.includes('wisdom')
                        ? 'bg-gold-bright/30 text-gold-deep'
                        : 'bg-emerald-medium/10 text-emerald-medium dark:text-emerald-fixed'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-grow space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-sans text-sm font-bold text-emerald-deep dark:text-cream-base">
                          {plan.title}
                        </h4>
                        <span className="text-xs font-mono text-slate-400 dark:text-cream-base/40">
                          {plan.progress}%
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-cream-base/60">
                        {isFinished 
                          ? "Terminé ! Magnifique étude." 
                          : `Jour/Chapitre ${plan.currentChapter} sur ${plan.totalChapters}`}
                      </p>
                      
                      {/* Linear progress bar */}
                      <div className="w-full bg-cream-darker dark:bg-charcoal-light/30 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-medium dark:bg-emerald-fixed h-full transition-all duration-300"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleIncrementProgress(plan.id)}
                    disabled={isFinished}
                    className={`p-2 rounded-lg transition-all ${
                      isFinished
                        ? "text-green-500 bg-green-500/10"
                        : "text-emerald-medium dark:text-emerald-fixed border border-emerald-medium/10 group-hover:bg-emerald-medium group-hover:text-white dark:group-hover:bg-emerald-fixed dark:group-hover:text-charcoal-dark"
                    }`}
                    title={isFinished ? "Complété" : "Marquer comme lu (+15 XP)"}
                  >
                    {isFinished ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quizzes & Progress (5 columns on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider">
            Défi Théologique du Jour
          </h3>
          
          <div className="glass-panel rounded-xl p-6 border border-cream-darker dark:border-charcoal-light/10 flex flex-col justify-between relative overflow-hidden bg-white/40 dark:bg-charcoal-card/40 h-full min-h-[260px]">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-medium/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="font-serif text-xl font-bold text-emerald-deep dark:text-cream-base">
                    Série de {streak} jours
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-cream-base/60">
                    Esprit assidu, révélation continue !
                  </p>
                </div>
                
                <div className="bg-gold-bright/20 text-gold-deep dark:text-gold-bright px-2.5 py-1 rounded-full font-mono text-[10px] uppercase font-bold flex items-center gap-1 tracking-wider border border-gold-muted/20 shrink-0">
                  <Flame className="w-3.5 h-3.5 animate-pulse text-orange-500" />
                  <span>+250 XP</span>
                </div>
              </div>

              {/* Grid represent streak checklist */}
              <div className="grid grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isCurrent = day === streak;
                  const isPassed = day < streak;
                  
                  return (
                    <div
                      key={day}
                      className={`h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                        isPassed
                          ? "bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-sm"
                          : isCurrent
                          ? "bg-gold-bright text-gold-deep border-2 border-gold-muted/60 animate-pulse"
                          : "bg-cream-darker dark:bg-charcoal-light/40 text-slate-400 dark:text-cream-base/30 border border-cream-darker/40"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <span>J{day}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onOpenQuiz}
              className="w-full mt-6 py-3.5 bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark font-sans text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-emerald-deep dark:hover:bg-emerald-light transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Commencer le Quiz</span>
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>

      </section>

      {/* Dynamic Community Inspirations Feed */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-darker dark:border-charcoal-light/10 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-medium dark:text-gold-bright" />
              <span>Fil de la Communauté Spirituelle</span>
            </h3>
            <p className="text-xs text-slate-400">Échangez vos inspirations, méditations et versets favoris</p>
          </div>

          <div className="flex bg-cream-darker dark:bg-charcoal-light/30 p-1 rounded-xl w-full sm:w-auto">
            {(['All', 'Chrétienne', 'Musulmane'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFeedFilter(filter)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex-grow sm:flex-grow-0 ${
                  feedFilter === filter
                    ? 'bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {filter === 'All' ? 'Tous' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Share New Inspiration Box */}
        <form onSubmit={handleCreatePost} className="bg-white dark:bg-charcoal-card p-5 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <img src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200"} className="w-full h-full object-cover" alt="" />
            </div>
            <textarea
              required
              rows={2}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Que vous murmure votre âme aujourd'hui ? Écrivez une pensée..."
              className="w-full bg-cream-base dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div className="w-full sm:w-1/2">
              <select
                value={selectedVerseRef}
                onChange={(e) => setSelectedVerseRef(e.target.value)}
                className="w-full bg-cream-base dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-lg px-3 py-1.5 text-[10px] focus:ring-1 focus:ring-emerald-medium text-slate-500 dark:text-cream-base/70"
              >
                <option value="">📖 Rattacher un verset d'étude (Optionnel)</option>
                {SCRIPTURE_LIBRARY.filter(v => {
                  if (userReligion === 'Chrétienne') return v.source === 'Bible';
                  if (userReligion === 'Musulmane') return v.source === 'Coran';
                  return true;
                }).map(v => (
                  <option key={v.id} value={v.reference}>{v.reference} - "{v.text.slice(0, 40)}..."</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-deep active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Publier</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Post Lists */}
        <div className="space-y-4">
          {displayPosts
            .filter(p => feedFilter === 'All' || p.religion === feedFilter || p.religion === 'Mixte')
            .map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-charcoal-card p-5 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-cream-darker">
                      <img src={post.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif text-sm font-bold text-emerald-deep dark:text-cream-base">
                          {post.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">@{post.username}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{post.time}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                    post.religion === 'Chrétienne'
                      ? 'bg-emerald-medium/10 text-emerald-medium dark:text-emerald-fixed'
                      : post.religion === 'Musulmane'
                      ? 'bg-gold-bright/20 text-gold-deep dark:text-gold-bright'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {post.religion}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-cream-base/85 leading-relaxed whitespace-pre-line font-sans">
                  {post.content}
                </p>

                {post.verse_reference && (
                  <div className="p-3 bg-cream-base/50 dark:bg-charcoal-dark/40 rounded-xl border border-cream-darker/60 dark:border-charcoal-light/10 relative space-y-1 scripture-quote border-gold-deep">
                    <blockquote className="font-serif text-xs italic text-slate-600 dark:text-cream-base/80 leading-relaxed">
                      "{post.verse_text}"
                    </blockquote>
                    <cite className="block text-right font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold not-italic">
                      — {post.verse_reference}
                    </cite>
                  </div>
                )}

                <div className="pt-2 border-t border-cream-darker dark:border-charcoal-light/10 flex items-center justify-between">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      post.likedByMe
                        ? 'text-red-500'
                        : 'text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current text-red-500' : ''}`} />
                    <span>{post.likes} J'aime</span>
                  </button>

                  <button
                    onClick={() => onNavigateToChatWithQuery?.(`La personne Amina ou Samuel a dit ceci sur SpiritTalk : "${post.content}". Analyse cela et dis-moi quoi lui répondre de manière fraternelle et spirituelle.`)}
                    className="text-[10px] font-bold text-emerald-medium dark:text-emerald-fixed hover:underline flex items-center gap-1"
                  >
                    <span>Consulter l'IA sur ce post</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Inspiration Carousel Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider">
            Inspirations & Méditations Guidées
          </h3>
        </div>
        
        <div className="flex overflow-x-auto gap-6 pb-4 custom-scroll -mx-4 px-4 md:mx-0 md:px-0">
          {INSPIRATIONS.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectInspiration(card)}
              className="min-w-[280px] md:min-w-[320px] max-w-[320px] shrink-0 group cursor-pointer bg-white dark:bg-charcoal-card rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={card.imageUrl}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-white/20 z-20">
                  {card.duration}
                </span>
              </div>
              
              <div className="p-4 space-y-1">
                <h4 className="font-serif text-lg text-emerald-deep dark:text-cream-base font-bold group-hover:text-gold-deep dark:group-hover:text-gold-bright transition-colors">
                  {card.title}
                </h4>
                <p className="text-slate-500 dark:text-cream-base/60 text-xs line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

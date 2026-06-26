import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Flame, Play, Share2, Bookmark, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { Verse, ReadingPlan, InspirationCard } from '../types';
import { VERSETS_DU_JOUR, READING_PLANS, INSPIRATIONS } from '../data';

interface HomeViewProps {
  xp: number;
  streak: number;
  onOpenQuiz: () => void;
  onSelectInspiration: (card: InspirationCard) => void;
  onBookmark: (text: string, reference: string, source: string) => void;
  onAddXP: (amount: number) => void;
}

export default function HomeView({
  xp,
  streak,
  onOpenQuiz,
  onSelectInspiration,
  onBookmark,
  onAddXP
}: HomeViewProps) {
  const [verseIdx, setVerseIdx] = useState(0);
  const [plans, setPlans] = useState<ReadingPlan[]>(READING_PLANS);
  const [votedVerse, setVotedVerse] = useState<Record<string, boolean>>({});

  const currentVerse = VERSETS_DU_JOUR[verseIdx];

  const handleNextVerse = () => {
    setVerseIdx(prev => (prev + 1) % VERSETS_DU_JOUR.length);
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

  const handleIncrementProgress = (planId: string) => {
    setPlans(prevPlans =>
      prevPlans.map(p => {
        if (p.id === planId) {
          const nextChapter = Math.min(p.currentChapter + 1, p.totalChapters);
          const nextProgress = Math.round((nextChapter / p.totalChapters) * 100);
          
          if (nextChapter > p.currentChapter) {
            onAddXP(15); // +15 XP for reading a chapter
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

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Welcome Profile Section */}
      <section className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left bg-gradient-to-r from-emerald-medium/10 to-gold-bright/5 p-6 rounded-2xl border border-emerald-medium/5">
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-gold-muted/80 shadow-lg bg-emerald-medium/10">
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
              alt="Seeker Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-medium text-white p-1.5 rounded-full border-2 border-white shadow-md dark:border-charcoal-dark">
            <Award className="w-4 h-4 text-gold-bright" />
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-emerald-deep dark:text-cream-base tracking-tight">
              Bienvenue, Seeker
            </h2>
            <p className="font-serif text-sm italic text-slate-600 dark:text-cream-base/70 max-w-xl leading-relaxed">
              "La vérité est un miroir tombé des mains de Dieu et qui s'est brisé. Chacun en ramasse un morceau et croit détenir toute la vérité." — <span className="font-semibold text-emerald-medium dark:text-gold-bright">Rûmî</span>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-emerald-medium/10 text-emerald-medium dark:text-emerald-fixed text-xs font-semibold uppercase tracking-wider border border-emerald-medium/20">
              Bible &amp; Quran Study
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
            Verset du Jour
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
            Révélation Quotidienne • {currentVerse.category}
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
            Plans de Lecture Actifs
          </h3>
          
          <div className="space-y-4">
            {plans.map((plan) => {
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
                          : `Chapitre ${plan.currentChapter} sur ${plan.totalChapters}`}
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
            Défi Théologique
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

      {/* Inspiration Carousel Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider">
            Inspirations & Méditations
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

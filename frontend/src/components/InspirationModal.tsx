import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Clock, Tag, Share2, Bookmark } from 'lucide-react';
import { InspirationCard } from '../types';

interface InspirationModalProps {
  card: InspirationCard | null;
  onClose: () => void;
  onBookmark: (text: string, ref: string, source: string) => void;
}

export default function InspirationModal({ card, onClose, onBookmark }: InspirationModalProps) {
  if (!card) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(`"${card.title}" - Une réflexion spirituelle sur SpiritTalk.\n${card.description}`);
    alert("Lien de réflexion copié dans le presse-papiers !");
  };

  const handleBookmarkThis = () => {
    onBookmark(card.title, `Sagesse: ${card.category}`, "Autre");
  };

  return (
    <AnimatePresence>
      <div id="inspiration-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream-base dark:bg-charcoal-dark border border-emerald-medium/10 shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Hero Banner image with overlay */}
          <div className="relative h-56 w-full overflow-hidden shrink-0">
            <img
              src={card.imageUrl}
              alt={card.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/45 hover:bg-black/70 text-white rounded-full transition-all border border-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-5 left-6 right-6 text-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-medium/90 border border-emerald-light/20 text-[10px] font-semibold uppercase tracking-widest text-gold-bright flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  {card.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/80 font-medium">
                  <Clock className="w-3 h-3 text-gold-bright" />
                  {card.duration}
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                {card.title}
              </h3>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-emerald-light dark:text-emerald-fixed">
              <BookOpen className="w-4 h-4 text-gold-deep dark:text-gold-bright" />
              <span>Méditation guidée • Lecture</span>
            </div>

            {/* Description quote box */}
            <div className="p-4 rounded-xl bg-white dark:bg-charcoal-card border-l-4 border-gold-deep dark:border-gold-bright italic text-sm text-slate-600 dark:text-cream-base/80 leading-relaxed shadow-sm">
              "{card.description}"
            </div>

            {/* Main content body text */}
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <p className="font-sans text-base leading-relaxed text-slate-700 dark:text-cream-base/90 space-y-4 whitespace-pre-line first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-emerald-medium first-letter:mr-1">
                {card.content}
              </p>
            </article>
          </div>

          {/* Footer actions */}
          <div className="p-5 border-t border-cream-darker dark:border-charcoal-light/30 bg-white/50 dark:bg-charcoal-card/50 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleBookmarkThis}
                className="p-2.5 text-slate-500 hover:text-emerald-medium dark:text-cream-base/60 dark:hover:text-gold-bright hover:bg-cream-darker/50 dark:hover:bg-charcoal-light/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium border border-cream-darker dark:border-charcoal-light/15"
              >
                <Bookmark className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 text-slate-500 hover:text-emerald-medium dark:text-cream-base/60 dark:hover:text-gold-bright hover:bg-cream-darker/50 dark:hover:bg-charcoal-light/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium border border-cream-darker dark:border-charcoal-light/15"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-medium hover:bg-emerald-deep text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-sm"
            >
              Fermer la Réflexion
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

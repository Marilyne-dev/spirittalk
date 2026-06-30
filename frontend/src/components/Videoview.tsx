import React, { useState, useRef } from 'react';
import { Play, Search, ExternalLink, Youtube, ChevronRight, RefreshCw, Grid, List } from 'lucide-react';

// ── Requêtes de recherche en français ─────────────────────────────────────
const CATEGORIES = [
  { key: 'tout',         emoji: '🙏', label: 'Tout',              query: 'prière spirituelle français 2024' },
  { key: 'chretienne',  emoji: '✝️', label: 'Chrétienne',        query: 'prière chrétienne louange adoration français' },
  { key: 'musulmane',   emoji: '☪️', label: 'Musulmane',         query: 'récitation coran dua prière islam français' },
  { key: 'gospel',      emoji: '🎵', label: 'Gospel',             query: 'gospel africain français louange bénin' },
  { key: 'meditation',  emoji: '☮️', label: 'Méditation',        query: 'méditation guidée paix intérieure français' },
  { key: 'bienetre',    emoji: '✨', label: 'Bien-être',          query: 'motivation spirituelle bien être foi français' },
  { key: 'coran',       emoji: '📖', label: 'Coran',              query: 'coran traduction française récitation sourate' },
  { key: 'psaumes',     emoji: '📜', label: 'Psaumes',            query: 'psaumes bible méditation foi français' },
  { key: 'nasheed',     emoji: '🎶', label: 'Nasheed',            query: 'nasheed français anachid islam' },
  { key: 'jeunesse',    emoji: '🌱', label: 'Jeunesse',           query: 'foi jeunesse chrétienne musulmane français' },
] as const;
type CatKey = typeof CATEGORIES[number]['key'];

// ── Suggestions cliquables (30+ thèmes) ───────────────────────────────────
const SUGGESTIONS = [
  // Chrétien
  { label: '🌅 Prière du matin',          query: 'prière du matin chrétienne française puissante' },
  { label: '🌙 Prière du soir',           query: 'prière du soir catholique protestant français' },
  { label: '🕊️ Prière de paix',          query: 'prière paix intérieure chrétienne français' },
  { label: '💪 Prière de force',          query: 'prière de force courage protection chrétienne français' },
  { label: '🙌 Louange & Adoration',      query: 'louange adoration contemporaine français 2024' },
  { label: '🎶 Gospel africain',          query: 'gospel africain français bénin côte ivoire congo' },
  { label: '✝️ Culte du dimanche',        query: 'culte dimanche église français sermon prédication' },
  { label: '📖 Lecture Bible',            query: 'lecture bible français méditation verset' },
  { label: '🙏 Prière intercession',      query: 'prière intercession chrétienne français puissante' },
  { label: '🌿 Retraite spirituelle',     query: 'retraite spirituelle chrétienne français jeûne prière' },

  // Musulman
  { label: '📿 Dua du matin',             query: 'dua matin dhikr islam français invocation' },
  { label: '🌙 Dua du soir',             query: 'dua soir islam français invocation protection' },
  { label: '📖 Sourate Al-Fatiha',       query: 'sourate fatiha récitation traduction française' },
  { label: '📖 Sourate Yassin',          query: 'sourate yassin récitation traduction française' },
  { label: '📖 Sourate Al-Baqara',       query: 'sourate baqara récitation traduction française' },
  { label: '🎶 Nasheed doux',            query: 'nasheed français doux spirituel islam' },
  { label: '🕌 Prière du vendredi',      query: 'prière vendredi khoutba islam français' },
  { label: '💎 99 Noms d\'Allah',         query: '99 noms allah français récitation explication' },
  { label: '🌟 Ramadan',                 query: 'ramadan prière islam français récitation coran' },
  { label: '📿 Dikhr & Chapelet',        query: 'dhikr chapelet islamique français calme' },

  // Méditation & Bien-être
  { label: '🧘 Méditation 5 min',        query: 'méditation guidée 5 minutes français rapide' },
  { label: '🧘 Méditation 10 min',       query: 'méditation guidée 10 minutes français sophrologie' },
  { label: '😴 Méditation sommeil',      query: 'méditation pour dormir français relaxation nuit' },
  { label: '😟 Méditation anxiété',      query: 'méditation anxiété stress français apaisement' },
  { label: '❤️ Méditation amour',        query: 'méditation amour bienveillance gratitude français' },
  { label: '🌊 Sons nature prière',      query: 'sons nature eau prière méditation spirituelle' },
  { label: '💪 Motivation spirituelle',  query: 'motivation spirituelle foi force courage français' },
  { label: '🌅 Réveil spirituel',        query: 'réveil spirituel foi matin français témoignage' },
  { label: '🌿 Guérison intérieure',     query: 'guérison intérieure délivrance français chrétien' },
  { label: '✨ Gratitude & Foi',          query: 'gratitude spirituelle foi témoignage français bénédictions' },
];

// Génère l'URL embed YouTube recherche en français
const embedUrl = (query: string) =>
  `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&hl=fr&gl=FR&controls=1&modestbranding=1&rel=0`;

export default function VideoView() {
  const [activeCat, setActiveCat]         = useState<CatKey>('tout');
  const [currentQuery, setCurrentQuery]   = useState(CATEGORIES[0].query);
  const [currentLabel, setCurrentLabel]   = useState(CATEGORIES[0].label);
  const [searchInput, setSearchInput]     = useState('');
  const [iframeKey, setIframeKey]         = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [showAllSuggestions, setShowAll]  = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);

  const loadQuery = (query: string, label: string) => {
    setCurrentQuery(query);
    setCurrentLabel(label);
    setIframeKey(k => k + 1);
    setIsLoading(true);
    // Scroll vers le lecteur
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[number]) => {
    setActiveCat(cat.key);
    setSearchInput('');
    loadQuery(cat.query, cat.label);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    loadQuery(`${q} français`, `"${q}"`);
  };

  const openYouTube = () =>
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuery)}&hl=fr`, '_blank', 'noopener,noreferrer');

  const visibleSuggestions = showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 12);

  return (
    <div className="space-y-5 animate-fade-in pb-20">

      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base flex items-center gap-2">
          <Play className="w-6 h-6 text-emerald-medium fill-current" />
          Vidéos Spirituelles
        </h2>
        <p className="text-xs text-slate-500 dark:text-cream-base/60">
          Prières, louanges, récitations et méditations en français · Contenu YouTube
        </p>
      </div>

      {/* ── Recherche ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Ex : prière du soir, sourate Yassin, gospel bénin..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-emerald-medium text-white rounded-xl text-sm font-semibold hover:bg-emerald-deep transition-colors whitespace-nowrap">
          Chercher
        </button>
      </form>

      {/* ── Catégories ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryClick(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCat === cat.key
                ? 'bg-emerald-medium text-white shadow-sm'
                : 'bg-slate-100 dark:bg-charcoal-card text-slate-500 dark:text-cream-base/60 hover:bg-slate-200 dark:hover:bg-charcoal-light/30'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Lecteur principal ─────────────────────────────────────────────── */}
      <div ref={playerRef} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-emerald-medium font-bold flex items-center gap-1.5">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            {currentLabel}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => { setIframeKey(k => k + 1); setIsLoading(true); }} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-medium font-semibold transition-colors">
              <RefreshCw className="w-3 h-3" /> Actualiser
            </button>
            <button onClick={openYouTube} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 font-semibold transition-colors">
              <ExternalLink className="w-3 h-3" /> YouTube
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 shadow-md bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-dark/95 z-10 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-medium/30 border-t-emerald-medium rounded-full animate-spin" />
              <p className="text-xs text-white/60">Chargement des vidéos en français...</p>
            </div>
          )}
          {/* Grand lecteur : hauteur 600px pour voir beaucoup de vidéos dans la liste */}
          <iframe
            key={iframeKey}
            src={embedUrl(currentQuery)}
            style={{ height: 600 }}
            width="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Vidéos spirituelles"
            className="w-full block"
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <p className="text-center text-[10px] text-slate-400">
          👆 Cliquez sur une vignette dans le lecteur pour lancer la vidéo
        </p>
      </div>

      {/* ── Raccourcis rapides — toutes les catégories en mini-blocs ─────── */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Changer de catégorie rapidement
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryClick(cat)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all text-center ${
                activeCat === cat.key
                  ? 'border-emerald-medium bg-emerald-medium/10 text-emerald-deep dark:text-gold-bright'
                  : 'border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-slate-600 dark:text-cream-base/70 hover:border-emerald-medium/40 hover:bg-emerald-medium/5'
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 30 suggestions de thèmes ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {SUGGESTIONS.length} thèmes disponibles
          </p>
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-[10px] text-emerald-medium font-semibold hover:underline"
          >
            {showAllSuggestions ? 'Réduire ▲' : `Tout afficher (${SUGGESTIONS.length}) ▼`}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visibleSuggestions.map(({ label, query }) => (
            <button
              key={query}
              onClick={() => loadQuery(query, label)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left group ${
                currentQuery === query
                  ? 'border-emerald-medium bg-emerald-medium/10'
                  : 'border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card hover:border-emerald-medium/40 hover:bg-emerald-medium/5'
              }`}
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-cream-base group-hover:text-emerald-deep dark:group-hover:text-gold-bright leading-snug flex-grow">
                {label}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                currentQuery === query ? 'text-emerald-medium' : 'text-slate-300 group-hover:text-emerald-medium'
              }`} />
            </button>
          ))}
        </div>

        {/* Bouton voir tout si pas encore affiché */}
        {!showAllSuggestions && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-charcoal-light/20 text-xs font-semibold text-slate-400 hover:border-emerald-medium/40 hover:text-emerald-medium transition-all"
          >
            + Voir les {SUGGESTIONS.length - 12} autres thèmes
          </button>
        )}
      </div>

      {/* ── Bouton YouTube ────────────────────────────────────────────────── */}
      <button
        onClick={openYouTube}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/30 text-red-400 hover:text-red-500 hover:border-red-400 text-xs font-semibold transition-all"
      >
        <Youtube className="w-4 h-4" />
        Voir encore plus de vidéos sur YouTube
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <Youtube className="w-3 h-3 text-red-500" />
        Contenu fourni par YouTube · SpiritTalk ne stocke aucune vidéo
      </p>
    </div>
  );
}
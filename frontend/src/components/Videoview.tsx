import React, { useState } from 'react';
import { Play, Search, ExternalLink, X, Youtube, ChevronRight } from 'lucide-react';

// ── Vidéos spirituelles sélectionnées à la main ───────────────────────────
// Format : id YouTube (la partie après "watch?v=") + métadonnées
interface VideoCard {
  id: string;
  title: string;
  channel: string;
  category: 'Chrétienne' | 'Musulmane' | 'Méditation' | 'Bien-être';
  thumbnail?: string; // si vide on utilise le thumbnail YouTube auto
}

const CURATED_VIDEOS: VideoCard[] = [
  // ── Chrétienne ────────────────────────────────────────────────────────────
  { id: 'ub1BEYdXoHo', title: 'Prière du matin — Force et paix intérieure', channel: 'Foi & Louange', category: 'Chrétienne' },
  { id: 'Kn_gMkKsyQU', title: 'Louange et adoration — Présence de Dieu', channel: 'Gospel Afrique', category: 'Chrétienne' },
  { id: 'aV0q3Q6HLiY', title: 'Méditation sur les Psaumes', channel: 'Parole de Vie', category: 'Chrétienne' },
  { id: 'UmAMjFBODG4', title: 'Gospel Africain — Joie et bénédiction', channel: 'Chorale Lumière', category: 'Chrétienne' },
  { id: '1YDMlrJLqCY', title: 'Prière de protection quotidienne', channel: 'Évangile Vivant', category: 'Chrétienne' },

  // ── Musulmane ─────────────────────────────────────────────────────────────
  { id: 'E7TWuJh5H_c', title: 'Récitation Coran — Sourate Al-Fatiha', channel: 'Quran Central', category: 'Musulmane' },
  { id: 'F5NxiYE9KW8', title: 'Dua pour la paix et la sérénité', channel: 'Islam & Sérénité', category: 'Musulmane' },
  { id: 'Iqbv9oTf-e4', title: 'Nasheed — Salawat et invocations', channel: 'Spiritualité Islam', category: 'Musulmane' },
  { id: 'lsXBdykdRWQ', title: 'Sourate Yassin — Récitation complète', channel: 'Quran Central', category: 'Musulmane' },
  { id: 'K7lFNcIbIjE', title: 'Méditation islamique — Paix du cœur', channel: 'Lumière d\'Islam', category: 'Musulmane' },

  // ── Méditation ────────────────────────────────────────────────────────────
  { id: 'inpok4MKVLM', title: 'Méditation guidée 10 min — Calme profond', channel: 'Zen Afrique', category: 'Méditation' },
  { id: 'ZToicYcHIOU', title: 'Méditation de pleine conscience', channel: 'Paix Intérieure', category: 'Méditation' },
  { id: 'O-6f5wQXSu8', title: 'Sons de la nature pour la prière', channel: 'Nature & Âme', category: 'Méditation' },

  // ── Bien-être ─────────────────────────────────────────────────────────────
  { id: 'Jyy0ra2ymko', title: 'Motivation spirituelle du matin', channel: 'Foi & Succès', category: 'Bien-être' },
  { id: '86m4RC_ADEY', title: 'Guérison intérieure — Lâcher prise', channel: 'Âme & Lumière', category: 'Bien-être' },
];

const CATEGORIES = [
  { key: 'Tout',        emoji: '🙏', label: 'Tout' },
  { key: 'Chrétienne', emoji: '✝️', label: 'Chrétienne' },
  { key: 'Musulmane',  emoji: '☪️', label: 'Musulmane' },
  { key: 'Méditation', emoji: '☮️', label: 'Méditation' },
  { key: 'Bien-être',  emoji: '✨', label: 'Bien-être' },
] as const;

// Thumbnail YouTube auto (qualité max disponible)
const thumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export default function VideoView() {
  const [activeCategory, setActiveCategory] = useState<string>('Tout');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [playingId, setPlayingId]       = useState<string | null>(null);
  const [searchMode, setSearchMode]     = useState(false); // true = afficher l'iframe de recherche YT
  const [iframeKey, setIframeKey]       = useState(0);

  // ── Filtrage local ────────────────────────────────────────────────────────
  const filtered = CURATED_VIDEOS.filter(v => {
    const matchCat = activeCategory === 'Tout' || v.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setSearchQuery(q);
    setSearchMode(false); // afficher les résultats locaux d'abord
  };

  const openYouTubeSearch = () => {
    const query = searchInput.trim() || `prière spirituelle ${activeCategory !== 'Tout' ? activeCategory : ''}`;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
    setSearchQuery('');
    setSearchInput('');
    setSearchMode(false);
    setPlayingId(null);
  };

  // Embed src pour un video précis
  const embedSrc = (id: string) =>
    `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

  // Embed src pour recherche libre
  const searchEmbedSrc = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery || 'prière spirituelle')}&controls=1&modestbranding=1&rel=0`;

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base flex items-center gap-2">
          <Play className="w-6 h-6 text-emerald-medium fill-current" />
          Vidéos Spirituelles
        </h2>
        <p className="text-xs text-slate-500 dark:text-cream-base/60">
          Prières, louanges, récitations et méditations sélectionnées pour vous.
        </p>
      </div>

      {/* ── Recherche ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher une prière, un thème..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
          />
          {(searchInput || searchQuery) && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchQuery(''); setSearchMode(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button type="submit" className="px-4 py-2 bg-emerald-medium text-white rounded-xl text-sm font-semibold hover:bg-emerald-deep transition-colors">
          Chercher
        </button>
      </form>

      {/* ── Catégories ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryClick(cat.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.key
                ? 'bg-emerald-medium text-white shadow-sm'
                : 'bg-slate-100 dark:bg-charcoal-card text-slate-500 dark:text-cream-base/60 hover:bg-slate-200'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Lecteur en plein écran (quand une vidéo est sélectionnée) ─────── */}
      {playingId && (
        <div className="relative rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 shadow-lg bg-black">
          <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
            <iframe
              src={embedSrc(playingId)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Lecteur spirituel"
            />
          </div>
          <button
            onClick={() => setPlayingId(null)}
            className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 backdrop-blur-sm z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Bannière "chercher sur YouTube" si résultats locaux vides ──────── */}
      {searchQuery && filtered.length === 0 && (
        <div className="bg-slate-50 dark:bg-charcoal-card rounded-2xl p-5 text-center border border-cream-darker dark:border-charcoal-light/10 space-y-3">
          <p className="text-sm text-slate-500 dark:text-cream-base/70">
            Aucune vidéo locale pour <strong>"{searchQuery}"</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => { setSearchMode(true); setIframeKey(k => k + 1); }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Chercher "{searchQuery}" sur YouTube
            </button>
            <button
              onClick={openYouTubeSearch}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir YouTube (nouvel onglet)
            </button>
          </div>
        </div>
      )}

      {/* ── Iframe recherche YouTube (mode plein) ───────────────────────────── */}
      {searchMode && searchQuery && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold flex items-center gap-1">
              <Youtube className="w-3 h-3" /> Résultats YouTube pour "{searchQuery}"
            </p>
            <button onClick={() => setSearchMode(false)} className="text-slate-400 hover:text-slate-600 text-xs">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 shadow-sm bg-black" style={{ height: 440 }}>
            <iframe
              key={iframeKey}
              src={searchEmbedSrc}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Recherche YouTube"
              className="w-full h-full"
            />
          </div>
          <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Youtube className="w-3 h-3 text-red-500" />
            Contenu fourni par YouTube · Si la lecture ne fonctionne pas,{' '}
            <button onClick={openYouTubeSearch} className="underline hover:text-red-500">ouvrez YouTube</button>
          </p>
        </div>
      )}

      {/* ── Grille de vidéos ─────────────────────────────────────────────── */}
      {(!searchMode || !searchQuery) && (
        <>
          {searchQuery && filtered.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-emerald-medium font-bold">
              🔍 {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          )}

          {filtered.length === 0 && !searchQuery && (
            <p className="text-center text-sm text-slate-400 italic py-8">Aucune vidéo dans cette catégorie.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(video => (
              <button
                key={video.id}
                onClick={() => { setPlayingId(video.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group text-left bg-white dark:bg-charcoal-card rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-200 dark:bg-charcoal-dark overflow-hidden">
                  <img
                    src={thumb(video.id)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Overlay play */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-emerald-deep fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Badge catégorie */}
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    video.category === 'Chrétienne' ? 'bg-emerald-medium text-white' :
                    video.category === 'Musulmane'  ? 'bg-gold-deep text-white' :
                    video.category === 'Méditation' ? 'bg-blue-500 text-white' :
                                                       'bg-purple-500 text-white'
                  }`}>
                    {video.category === 'Chrétienne' ? '✝️' :
                     video.category === 'Musulmane'  ? '☪️' :
                     video.category === 'Méditation' ? '☮️' : '✨'} {video.category}
                  </span>
                </div>

                {/* Infos */}
                <div className="p-3 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-cream-base line-clamp-2 leading-snug group-hover:text-emerald-medium transition-colors">
                    {video.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{video.channel}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Bouton "Plus sur YouTube" en bas */}
          <button
            onClick={openYouTubeSearch}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-red-300 dark:border-red-800/40 text-red-400 hover:text-red-500 hover:border-red-400 text-xs font-semibold transition-all"
          >
            <Youtube className="w-4 h-4" />
            Voir plus de vidéos spirituelles sur YouTube
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

    </div>
  );
}
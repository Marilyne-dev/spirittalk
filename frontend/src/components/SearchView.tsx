import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Book, Bookmark, Check, Copy, Tag, MessageSquare, BookOpen, 
  ChevronRight, Loader2, RefreshCw, Compass, HelpCircle, ArrowRight 
} from 'lucide-react';
import { Verse } from '../types';
import { SCRIPTURE_LIBRARY } from '../data';
import { scriptureService, BIBLE_BOOKS, QuranSurah, ScriptureVerse, ParsedReference } from '../services/scriptureService';

interface SearchViewProps {
  onBookmark: (text: string, reference: string, source: string) => void;
  onNavigateToChatWithQuery: (initialPrompt: string) => void;
}

const CATEGORIES = ["Tout", "Paix", "Sagesse", "Pardon", "Amour", "Confiance", "Patience", "Prière", "Espoir", "Méditation"];

export default function SearchView({ onBookmark, onNavigateToChatWithQuery }: SearchViewProps) {
  // Tabs: 'search' (thematic), 'reader' (integral), or 'reference' (lookup by exact coordinates)
  const [activeTab, setActiveTab] = useState<'search' | 'reader' | 'reference'>('search');
  
  // Keyword Search states
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Bible' | 'Coran'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  
  // Quran live keyword results
  const [liveQuranResults, setLiveQuranResults] = useState<ScriptureVerse[]>([]);
  const [isSearchingQuran, setIsSearchingQuran] = useState(false);

  // Reference Lookup states
  const [refQuery, setRefQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<ScriptureVerse[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Live Reader states
  const [readerSource, setReaderSource] = useState<'Bible' | 'Coran'>('Bible');
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[0].id);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [surahsList, setSurahsList] = useState<QuranSurah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [chapterVerses, setChapterVerses] = useState<ScriptureVerse[]>([]);
  const [isLoadingReader, setIsLoadingReader] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);

  // --- Search Mode Logic ---
  // Live fetch Quran search results on search query change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 3) {
        setIsSearchingQuran(true);
        const quranMatches = await scriptureService.searchQuran(query);
        setLiveQuranResults(quranMatches);
        setIsSearchingQuran(false);
      } else {
        setLiveQuranResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Detected reference in thematic search bar to guide user
  const detectedSearchRef = useMemo(() => {
    if (query.length < 4) return null;
    return scriptureService.parseReferenceText(query);
  }, [query]);

  // Combined keyword search results: Static library (Bible/Coran) + Quran Live Search results
  const combinedSearchResults = useMemo(() => {
    // 1. Filter local SCRIPTURE_LIBRARY
    const localMatches = SCRIPTURE_LIBRARY.filter(verse => {
      const textMatch = verse.text.toLowerCase().includes(query.toLowerCase()) || 
                        verse.reference.toLowerCase().includes(query.toLowerCase());
      const catMatch = selectedCategory === "Tout" || verse.category === selectedCategory;
      const srcMatch = sourceFilter === 'All' || verse.source === sourceFilter;
      return textMatch && catMatch && srcMatch;
    });

    // 2. Map live Quran search results to same schema if 'Coran' or 'All' is selected and there's no category filter
    const mappedQuranLive = (sourceFilter === 'All' || sourceFilter === 'Coran') && selectedCategory === "Tout"
      ? liveQuranResults.map((r, index) => ({
          id: `live_quran_${index}_${r.number}`,
          text: r.text,
          reference: r.reference,
          source: 'Coran' as const,
          category: 'Résultat de recherche'
        }))
      : [];

    return [...localMatches, ...mappedQuranLive];
  }, [query, selectedCategory, sourceFilter, liveQuranResults]);

  // --- Reference Lookup Trigger ---
  const handleReferenceLookup = async (parsedRef?: ParsedReference) => {
    const targetRef = parsedRef || scriptureService.parseReferenceText(refQuery);
    if (!targetRef) {
      setLookupError("Nous n'avons pas réussi à comprendre cette référence. Essayez un format standard comme 'Genèse 2:1-3' ou 'Sourate 19 versets 1 à 5'.");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    try {
      const results = await scriptureService.fetchByReference(targetRef);
      setLookupResults(results);
      if (results.length === 0) {
        setLookupError("Aucun verset trouvé pour cette référence dans nos bases de données.");
      }
    } catch (err: any) {
      setLookupError(err.message || "Erreur de chargement. Veuillez vérifier votre connexion.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // --- Reader Mode Logic ---
  // Load Quran surah list on reader activation
  useEffect(() => {
    const loadSurahs = async () => {
      const list = await scriptureService.fetchQuranSurahs();
      setSurahsList(list);
    };
    loadSurahs();
  }, []);

  // Compute number of chapters for current selected Bible Book
  const totalChaptersOfBook = useMemo(() => {
    return BIBLE_BOOKS.find(b => b.id === selectedBook)?.chapters || 1;
  }, [selectedBook]);

  // Reset chapter input when book selection changes
  useEffect(() => {
    setSelectedChapter(1);
  }, [selectedBook]);

  // Fetch the selected passage
  const handleLoadPassage = async () => {
    setIsLoadingReader(true);
    setReaderError(null);
    try {
      if (readerSource === 'Bible') {
        const verses = await scriptureService.fetchBibleChapter(selectedBook, selectedChapter);
        setChapterVerses(verses);
      } else {
        const verses = await scriptureService.fetchQuranSurah(selectedSurah);
        setChapterVerses(verses);
      }
    } catch (err: any) {
      setReaderError(err.message || "Erreur lors du chargement des écritures.");
    } finally {
      setIsLoadingReader(false);
    }
  };

  // Auto-load passage once on select or source changes
  useEffect(() => {
    handleLoadPassage();
  }, [readerSource, selectedBook, selectedChapter, selectedSurah]);

  const handleCopy = (text: string, reference: string, id: string) => {
    navigator.clipboard.writeText(`"${text}" — ${reference}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (text: string, reference: string, source: string, id: string) => {
    onBookmark(text, reference, source);
    setSavedIds(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedIds(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-medium" />
            <span>Explorateur d'Écritures Sacrées</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-cream-base/60 leading-relaxed">
            Accédez à la Bible de Jérusalem et au Coran de Hamidullah. Recherchez par thèmes ou accédez directement aux chapitres et sourates.
          </p>
        </div>
      </div>

      {/* Primary Tab Selector (Thematic vs Reader vs Exact Reference) */}
      <div className="grid grid-cols-3 bg-cream-darker/40 dark:bg-charcoal-card/40 p-1 rounded-xl border border-cream-darker dark:border-charcoal-light/10">
        <button
          onClick={() => setActiveTab('search')}
          className={`py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'search'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm border border-cream-darker/10 dark:border-charcoal-light/5'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Thematique</span>
          <span className="sm:hidden">Thème</span>
        </button>

        <button
          onClick={() => setActiveTab('reference')}
          className={`py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reference'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm border border-cream-darker/10 dark:border-charcoal-light/5'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Référence de Précision</span>
          <span className="sm:hidden">Référence</span>
        </button>

        <button
          onClick={() => setActiveTab('reader')}
          className={`py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reader'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm border border-cream-darker/10 dark:border-charcoal-light/5'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <Book className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lecteur Intégral</span>
          <span className="sm:hidden">Lecteur</span>
        </button>
      </div>

      {/* --- TAB CONTENT: THEMATIC SEARCH MODE --- */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search Input Bar */}
          <div className="glass-panel rounded-xl p-2 flex items-center gap-2 border border-emerald-medium/10 shadow-md bg-white/80 dark:bg-charcoal-card/85">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par mot-clé (ex: miséricorde, paix, lumière)..."
              className="flex-grow bg-transparent border-none focus:outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-cream-base/30 text-emerald-deep dark:text-cream-base py-2.5 px-1"
            />
            {isSearchingQuran && (
              <Loader2 className="w-4 h-4 text-emerald-medium animate-spin mr-2" />
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 font-semibold"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Prompt reference suggestion card if detected */}
          {detectedSearchRef && (
            <div className="p-4 rounded-xl bg-emerald-medium/5 border border-emerald-medium/20 text-emerald-deep dark:text-cream-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-medium shrink-0 animate-pulse" />
                <span>
                  Nous avons détecté une référence exacte : <strong>{detectedSearchRef.bookName} {detectedSearchRef.chapter}{detectedSearchRef.verseStart ? `:${detectedSearchRef.verseStart}` : ''}{detectedSearchRef.verseEnd ? `-${detectedSearchRef.verseEnd}` : ''}</strong>.
                </span>
              </div>
              <button
                onClick={() => {
                  setRefQuery(query);
                  setActiveTab('reference');
                  handleReferenceLookup(detectedSearchRef);
                }}
                className="px-3.5 py-1.5 bg-[#1D3557] hover:bg-emerald-deep text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 self-end sm:self-auto"
              >
                <span>Slicer ce passage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Filters: Source and Categories */}
          <div className="space-y-3 shrink-0">
            {/* Source Selector */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSourceFilter('All')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  sourceFilter === 'All'
                    ? "bg-[#759486] text-white shadow-sm"
                    : "border border-cream-darker dark:border-charcoal-light/10 text-slate-600 dark:text-cream-base/60 hover:bg-cream-darker/50"
                }`}
              >
                Tous les Livres
              </button>
              
              <button
                onClick={() => setSourceFilter('Bible')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  sourceFilter === 'Bible'
                    ? "bg-emerald-fixed text-emerald-deep font-bold shadow-sm"
                    : "border border-cream-darker dark:border-charcoal-light/10 text-slate-600 dark:text-cream-base/60 hover:bg-cream-darker/50"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Sainte Bible (LSG)</span>
              </button>
              
              <button
                onClick={() => setSourceFilter('Coran')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  sourceFilter === 'Coran'
                    ? "bg-gold-bright text-gold-deep font-bold shadow-sm"
                    : "border border-cream-darker dark:border-charcoal-light/10 text-slate-600 dark:text-cream-base/60 hover:bg-cream-darker/50"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Saint Coran (Hamidullah)</span>
              </button>
            </div>

            {/* Category Pills Slider */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
              {CATEGORIES.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-[#759486] text-white"
                        : "bg-[#759486]/10 text-[#0d2b21] dark:text-[#c9eada] hover:bg-[#759486]/20"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Results count */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              {combinedSearchResults.length} résultat{combinedSearchResults.length > 1 ? 's' : ''} trouvé{combinedSearchResults.length > 1 ? 's' : ''}
              {query && ` pour "${query}"`}
            </p>
          </div>

          {/* Scripture Results Listing */}
          <div className="space-y-4">
            {combinedSearchResults.length > 0 ? (
              combinedSearchResults.map((verse) => {
                const isBible = verse.source === 'Bible';
                const isSaved = savedIds[verse.id];
                const isCopied = copiedId === verse.id;

                return (
                  <div
                    key={verse.id}
                    className="p-6 bg-white dark:bg-charcoal-card rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4"
                  >
                    {/* Verse classification metadata */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isBible 
                            ? 'bg-emerald-fixed/60 text-emerald-deep' 
                            : 'bg-gold-bright/20 text-gold-deep dark:text-gold-bright border border-gold-muted/20'
                        }`}>
                          {verse.source}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {verse.category}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSave(verse.text, verse.reference, verse.source, verse.id)}
                          className={`p-1.5 rounded-lg border text-slate-400 hover:bg-slate-50 dark:hover:bg-charcoal-light/30 transition-colors ${
                            isSaved ? "text-green-600 bg-green-500/10 border-green-500/20" : "border-cream-darker dark:border-charcoal-light/10"
                          }`}
                          title="Enregistrer"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                        
                        <button
                          onClick={() => handleCopy(verse.text, verse.reference, verse.id)}
                          className={`p-1.5 rounded-lg border text-slate-400 hover:bg-slate-50 dark:hover:bg-charcoal-light/30 transition-colors ${
                            isCopied ? "text-emerald-medium bg-emerald-fixed/20 border-emerald-medium/20" : "border-cream-darker dark:border-charcoal-light/10"
                          }`}
                          title="Copier"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => onNavigateToChatWithQuery(`Explique-moi la profondeur théologique et donne-moi une réflexion de méditation sur ce verset : "${verse.text}" (${verse.reference})`)}
                          className="p-1.5 rounded-lg border border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-charcoal-light/30 hover:text-emerald-medium transition-colors"
                          title="Demander à l'IA"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quote Box styled dynamically */}
                    <div className={`scripture-quote italic text-base leading-relaxed text-emerald-deep dark:text-cream-base ${
                      isBible ? 'border-emerald-light' : 'border-gold-deep'
                    }`}>
                      "{verse.text}"
                    </div>

                    {/* Citation */}
                    <div className="text-right">
                      <span className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-cream-base/55">
                        — {verse.reference}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty state */
              <div className="text-center py-16 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
                <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">
                  Aucun verset ne correspond
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Essayez de taper des mots comme "amour", "paix", "patience" ou modifiez vos filtres de source.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: EXACT REFERENCE CHOPPING / SLICING --- */}
      {activeTab === 'reference' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Reference lookup bar */}
          <div className="bg-white dark:bg-charcoal-card p-6 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-emerald-deep dark:text-cream-base">
              Extraction de passage précis par coordonnées
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tapez n'importe quelle adresse biblique ou coranique en français (ex: <strong>Genèse 2:1-3</strong>, <strong>Jean 3 verset 16</strong>, ou <strong>Sourate 19 versets 1 à 5</strong>). Notre système s'occupe de découper l'intervalle exact désiré.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleReferenceLookup(); }} className="flex gap-2">
              <input
                type="text"
                value={refQuery}
                onChange={(e) => setRefQuery(e.target.value)}
                placeholder="ex: Jean 3:16 ou Sourate 112:1-4"
                className="flex-grow bg-cream-base/30 dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-medium text-emerald-deep dark:text-cream-base font-semibold"
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-6 py-3 bg-emerald-medium text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-deep transition-colors flex items-center gap-1.5"
              >
                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                <span>Slicer</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/10 text-rose-500 text-xs font-semibold">
                {lookupError}
              </div>
            )}
          </div>

          {/* Results Container */}
          <div className="space-y-4">
            {isLookingUp ? (
              <div className="text-center py-20 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
                <Loader2 className="w-8 h-8 text-emerald-medium animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">Découpage de l'intervalle d'Écritures en cours...</p>
              </div>
            ) : lookupResults.length > 0 ? (
              <div className="bg-white dark:bg-charcoal-card rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-cream-base/20 dark:bg-charcoal-light/5 border-b border-cream-darker dark:border-charcoal-light/10 flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-emerald-deep dark:text-cream-base">
                    Passage extrait : {refQuery}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-medium/10 text-emerald-deep dark:text-gold-bright text-[10px] font-bold uppercase tracking-wider">
                    {lookupResults.length} verset{lookupResults.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {lookupResults.map((verse) => {
                    const id = `lookup_${verse.reference}`;
                    const isSaved = savedIds[id];
                    const isCopied = copiedId === id;

                    return (
                      <div key={verse.number} className="space-y-2 pb-4 border-b border-cream-darker/40 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-md bg-cream-base dark:bg-charcoal-dark flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-cream-base">
                            v.{verse.number}
                          </span>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSave(verse.text, verse.reference, "Référence", id)}
                              className={`p-1 rounded text-[10px] flex items-center gap-1 transition-all ${
                                isSaved ? "text-green-600 bg-green-500/10 border-green-500/20 font-bold" : "border border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              <Bookmark className="w-3 h-3" />
                              <span>{isSaved ? "Enregistré" : "Sauvegarder"}</span>
                            </button>
                            <button
                              onClick={() => handleCopy(verse.text, verse.reference, id)}
                              className={`p-1 rounded text-[10px] flex items-center gap-1 transition-all ${
                                isCopied ? "text-emerald-medium bg-emerald-fixed/20 border-emerald-medium/20 font-bold" : "border border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? "Copié !" : "Copier"}</span>
                            </button>
                            <button
                              onClick={() => onNavigateToChatWithQuery(`Explique-moi en profondeur théologique ce passage : "${verse.text}" (${verse.reference})`)}
                              className="p-1 rounded border border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50 text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Commenter par l'IA</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-sm md:text-base leading-relaxed text-emerald-deep dark:text-cream-base font-sans font-medium">
                          {verse.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">
                  Prêt pour l'extraction
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Entrez des coordonnées valides ci-dessus et cliquez sur Slicer pour charger l'extrait exact en direct.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB CONTENT: LIVE READER MODE --- */}
      {activeTab === 'reader' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-charcoal-card p-5 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4">
            
            {/* Source Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setReaderSource('Bible')}
                className={`py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                  readerSource === 'Bible'
                    ? "bg-emerald-medium text-white shadow-sm font-bold"
                    : "border border-cream-darker dark:border-charcoal-light/10 text-slate-600 dark:text-cream-base/60 hover:bg-cream-darker/50"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Sainte Bible (Louis Segond)</span>
              </button>
              <button
                onClick={() => setReaderSource('Coran')}
                className={`py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                  readerSource === 'Coran'
                    ? "bg-gold-deep text-white shadow-sm font-bold"
                    : "border border-cream-darker dark:border-charcoal-light/10 text-slate-600 dark:text-cream-base/60 hover:bg-cream-darker/50"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Saint Coran (Hamidullah)</span>
              </button>
            </div>

            {/* Select dropdowns based on Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {readerSource === 'Bible' ? (
                <>
                  {/* Bible Book Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Livre de la Bible
                    </label>
                    <select
                      value={selectedBook}
                      onChange={(e) => setSelectedBook(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-cream-base/30 dark:bg-charcoal-dark text-sm focus:outline-none focus:ring-1 focus:ring-emerald-medium text-emerald-deep dark:text-cream-base font-semibold"
                    >
                      {BIBLE_BOOKS.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bible Chapter Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Chapitre ({totalChaptersOfBook} au total)
                    </label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-cream-base/30 dark:bg-charcoal-dark text-sm focus:outline-none focus:ring-1 focus:ring-emerald-medium text-emerald-deep dark:text-cream-base font-semibold"
                    >
                      {Array.from({ length: totalChaptersOfBook }, (_, i) => i + 1).map((ch) => (
                        <option key={ch} value={ch}>
                          Chapitre {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                /* Quran Select */
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Sélectionner la Sourate (114 Sourates dispos)
                  </label>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-cream-base/30 dark:bg-charcoal-dark text-sm focus:outline-none focus:ring-1 focus:ring-gold-deep text-emerald-deep dark:text-cream-base font-semibold"
                  >
                    {surahsList.length > 0 ? (
                      surahsList.map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. {surah.englishNameTranslation} ({surah.englishName}) — {surah.numberOfAyahs} versets
                        </option>
                      ))
                    ) : (
                      <option value={1}>Sourate Al-Fatihah</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Quick action triggers */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleLoadPassage}
                disabled={isLoadingReader}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 text-white ${
                  readerSource === 'Bible' ? 'bg-emerald-medium hover:bg-emerald-deep' : 'bg-gold-deep hover:bg-[#856529]'
                }`}
              >
                {isLoadingReader ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Actualiser la lecture</span>
              </button>
            </div>
          </div>

          {/* Passage Reader Canvas */}
          <div className="bg-white dark:bg-charcoal-card rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm overflow-hidden">
            {/* Header branding */}
            <div className={`px-6 py-4 flex items-center justify-between border-b border-cream-darker dark:border-charcoal-light/10 ${
              readerSource === 'Bible' ? 'bg-emerald-medium/5' : 'bg-gold-deep/5'
            }`}>
              <div className="space-y-0.5">
                <h3 className="font-serif font-bold text-lg text-emerald-deep dark:text-cream-base">
                  {readerSource === 'Bible' 
                    ? BIBLE_BOOKS.find(b => b.id === selectedBook)?.name + ` (Chapitre ${selectedChapter})`
                    : surahsList.find(s => s.number === selectedSurah)?.englishNameTranslation + ` (Sourate ${selectedSurah})`
                  }
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {readerSource === 'Bible' ? 'Sainte Bible - Louis Segond (LSG)' : 'Saint Coran - Traduction Hamidullah'}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                readerSource === 'Bible' ? 'bg-emerald-fixed/60 text-emerald-deep' : 'bg-gold-bright/20 text-gold-deep dark:text-gold-bright'
              }`}>
                Complet
              </span>
            </div>

            {/* Content view state managers */}
            <div className="p-6">
              {isLoadingReader ? (
                <div className="text-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-medium animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Chargement des saintes écritures en direct...</p>
                </div>
              ) : readerError ? (
                <div className="text-center py-12 text-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10">
                  <p className="text-sm font-semibold">{readerError}</p>
                  <button
                    onClick={handleLoadPassage}
                    className="mt-3 text-xs bg-rose-500 text-white font-bold uppercase px-4 py-2 rounded-xl hover:bg-rose-600"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar font-serif leading-relaxed text-slate-800 dark:text-cream-base">
                  {/* Bismillah for Quran surahs except Surah 9 (At-Tawbah) */}
                  {readerSource === 'Coran' && selectedSurah !== 9 && (
                    <div className="text-center pb-4 border-b border-cream-darker/30 dark:border-charcoal-light/5">
                      <p className="font-serif text-lg font-bold text-gold-deep dark:text-gold-bright">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      <p className="text-xs italic text-slate-400 mt-1 font-sans">
                        "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux."
                      </p>
                    </div>
                  )}

                  {chapterVerses.map((verse) => {
                    const id = `reader_${verse.reference}`;
                    const isSaved = savedIds[id];
                    const isCopied = copiedId === id;
                    
                    // Filter out duplicate Bismillah text from verses in Surah 1 or other surahs if they already include it
                    let displayText = verse.text;
                    if (readerSource === 'Coran' && selectedSurah !== 1 && displayText.startsWith("Au nom d'Allah")) {
                      displayText = displayText.replace(/^Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux\.\s*/i, "");
                    }

                    return (
                      <div 
                        key={verse.number} 
                        className="group flex flex-col md:flex-row md:items-start gap-3 p-3 rounded-xl hover:bg-cream-darker/30 dark:hover:bg-charcoal-light/10 transition-colors border border-transparent hover:border-cream-darker dark:hover:border-charcoal-light/5"
                      >
                        {/* Verse number */}
                        <div className="shrink-0 flex items-center justify-between md:justify-start md:flex-col gap-2">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                            readerSource === 'Bible' 
                              ? 'bg-emerald-medium/10 text-emerald-deep dark:text-cream-base' 
                              : 'bg-gold-deep/10 text-gold-deep dark:text-gold-bright'
                          }`}>
                            {verse.number}
                          </span>
                        </div>

                        {/* Verse Text & Actions */}
                        <div className="flex-grow space-y-2">
                          <p className="text-sm md:text-base leading-relaxed text-emerald-deep dark:text-cream-base font-sans font-medium tracking-wide">
                            {displayText}
                          </p>
                          
                          {/* Single Verse Micro Actions */}
                          <div className="flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleSave(displayText, verse.reference, readerSource, id)}
                              className={`p-1 rounded border text-[10px] flex items-center gap-1 transition-all ${
                                isSaved 
                                  ? "text-green-600 bg-green-500/10 border-green-500/20 font-bold" 
                                  : "border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-charcoal-light/30"
                              }`}
                              title="Enregistrer"
                            >
                              <Bookmark className="w-3 h-3" />
                              <span>{isSaved ? "Enregistré" : "Sauvegarder"}</span>
                            </button>

                            <button
                              onClick={() => handleCopy(displayText, verse.reference, id)}
                              className={`p-1 rounded border text-[10px] flex items-center gap-1 transition-all ${
                                isCopied 
                                  ? "text-emerald-medium bg-emerald-fixed/20 border-emerald-medium/20 font-bold" 
                                  : "border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50"
                              }`}
                              title="Copier"
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? "Copie !" : "Copier"}</span>
                            </button>

                            <button
                              onClick={() => onNavigateToChatWithQuery(`Explique-moi la profondeur théologique et donne-moi une réflexion de méditation sur ce verset : "${displayText}" (${verse.reference})`)}
                              className="p-1 rounded border border-cream-darker dark:border-charcoal-light/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-charcoal-light/30 hover:text-emerald-medium text-[10px] flex items-center gap-1 transition-colors"
                              title="Demander à l'IA"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Sagesse Divine IA</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

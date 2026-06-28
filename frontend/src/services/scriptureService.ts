// Scripture Service to fetch full, live Bible and Quran scriptures in French

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export interface ScriptureVerse {
  number: number;
  text: string;
  reference: string;
}

export interface ParsedReference {
  type: 'Bible' | 'Coran';
  bookId?: string;
  surahNumber?: number;
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

const API_BASE = 'https://marilyne.alwaysdata.net/spirittalk/api';

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 'genesis', name: 'Genèse', chapters: 50 },
  { id: 'exodus', name: 'Exode', chapters: 40 },
  { id: 'leviticus', name: 'Lévitique', chapters: 27 },
  { id: 'numbers', name: 'Nombres', chapters: 36 },
  { id: 'deuteronomy', name: 'Deutéronome', chapters: 34 },
  { id: 'joshua', name: 'Josué', chapters: 24 },
  { id: 'judges', name: 'Juges', chapters: 21 },
  { id: 'ruth', name: 'Ruth', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', chapters: 24 },
  { id: '1kings', name: '1 Rois', chapters: 22 },
  { id: '2kings', name: '2 Rois', chapters: 25 },
  { id: '1chronicles', name: '1 Chroniques', chapters: 29 },
  { id: '2chronicles', name: '2 Chroniques', chapters: 36 },
  { id: 'ezra', name: 'Esdras', chapters: 10 },
  { id: 'nehemiah', name: 'Néhémie', chapters: 13 },
  { id: 'esther', name: 'Esther', chapters: 10 },
  { id: 'job', name: 'Job', chapters: 42 },
  { id: 'psalms', name: 'Psaumes', chapters: 150 },
  { id: 'proverbs', name: 'Proverbes', chapters: 31 },
  { id: 'ecclesiastes', name: 'Ecclésiaste', chapters: 12 },
  { id: 'songofsongs', name: 'Cantique des Cantiques', chapters: 8 },
  { id: 'isaiah', name: 'Ésaïe', chapters: 66 },
  { id: 'jeremiah', name: 'Jérémie', chapters: 52 },
  { id: 'lamentations', name: 'Lamentations', chapters: 5 },
  { id: 'ezekiel', name: 'Ézéchiel', chapters: 48 },
  { id: 'daniel', name: 'Daniel', chapters: 12 },
  { id: 'hosea', name: 'Osée', chapters: 14 },
  { id: 'joel', name: 'Joël', chapters: 3 },
  { id: 'amos', name: 'Amos', chapters: 9 },
  { id: 'obadiah', name: 'Abdias', chapters: 1 },
  { id: 'jonah', name: 'Jonas', chapters: 4 },
  { id: 'micah', name: 'Michée', chapters: 7 },
  { id: 'nahum', name: 'Nahum', chapters: 3 },
  { id: 'habakkuk', name: 'Habacuc', chapters: 3 },
  { id: 'zephaniah', name: 'Sophonie', chapters: 3 },
  { id: 'haggai', name: 'Aggée', chapters: 2 },
  { id: 'zechariah', name: 'Zacharie', chapters: 14 },
  { id: 'malachi', name: 'Malachie', chapters: 4 },
  { id: 'matthew', name: 'Matthieu', chapters: 28 },
  { id: 'mark', name: 'Marc', chapters: 16 },
  { id: 'luke', name: 'Luc', chapters: 24 },
  { id: 'john', name: 'Jean', chapters: 21 },
  { id: 'acts', name: 'Actes', chapters: 28 },
  { id: 'romans', name: 'Romains', chapters: 16 },
  { id: '1corinthians', name: '1 Corinthiens', chapters: 16 },
  { id: '2corinthians', name: '2 Corinthiens', chapters: 13 },
  { id: 'galatians', name: 'Galates', chapters: 6 },
  { id: 'ephesians', name: 'Éphésiens', chapters: 6 },
  { id: 'philippians', name: 'Philippiens', chapters: 4 },
  { id: 'colossians', name: 'Colossiens', chapters: 4 },
  { id: '1thessalonians', name: '1 Thessaloniciens', chapters: 5 },
  { id: '2thessalonians', name: '2 Thessaloniciens', chapters: 3 },
  { id: '1timothy', name: '1 Timothée', chapters: 6 },
  { id: '2timothy', name: '2 Timothée', chapters: 4 },
  { id: 'titus', name: 'Tite', chapters: 3 },
  { id: 'philemon', name: 'Philémon', chapters: 1 },
  { id: 'hebrews', name: 'Hébreux', chapters: 13 },
  { id: 'james', name: 'Jacques', chapters: 5 },
  { id: '1peter', name: '1 Pierre', chapters: 5 },
  { id: '2peter', name: '2 Pierre', chapters: 3 },
  { id: '1john', name: '1 Jean', chapters: 5 },
  { id: '2john', name: '2 Jean', chapters: 1 },
  { id: '3john', name: '3 Jean', chapters: 1 },
  { id: 'jude', name: 'Jude', chapters: 1 },
  { id: 'revelation', name: 'Apocalypse', chapters: 22 }
];

export const FALLBACK_SURAHS: QuranSurah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "L'Ouverture", numberOfAyahs: 7 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "La Vache", numberOfAyahs: 286 },
  { number: 3, name: "آل عمران", englishName: "Al-Imran", englishNameTranslation: "La Famille d'Imran", numberOfAyahs: 200 },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "Les Femmes", numberOfAyahs: 176 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "La Table Servie", numberOfAyahs: 120 },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishNameTranslation: "Le Repentir", numberOfAyahs: 129 },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "La Caverne", numberOfAyahs: 110 },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Marie", numberOfAyahs: 98 },
  { number: 20, name: "طه", englishName: "Ta-Ha", englishNameTranslation: "Ta-Ha", numberOfAyahs: 135 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", englishNameTranslation: "Le Discernement", numberOfAyahs: 77 },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya-Sin", numberOfAyahs: 83 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "Le Tout Miséricordieux", numberOfAyahs: 78 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", englishNameTranslation: "L'Événement", numberOfAyahs: 96 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "La Royauté", numberOfAyahs: 30 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "Le Monothéisme Pur", numberOfAyahs: 4 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "L'Aube Naissante", numberOfAyahs: 5 },
  { number: 114, name: "الناس", englishName: "An-Nas", englishNameTranslation: "Les Hommes", numberOfAyahs: 6 }
];

export const scriptureService = {
  // --- BIBLE ---
  getBibleBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  },

  async fetchBibleChapter(bookId: string, chapter: number): Promise<ScriptureVerse[]> {
    const bookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name || bookId;
    try {
      const res = await fetch(`${API_BASE}/bible?book=${bookId}&chapter=${chapter}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // labs.bible.org retourne un tableau de versets directement
      // Notre proxy retourne { reference, text, translation_name, verses: [...] }
      const verses = data.verses ?? data;

      if (Array.isArray(verses) && verses.length > 0) {
        return verses.map((v: any) => ({
          number: parseInt(v.verse ?? v.numberInSurah ?? '0'),
          text: (v.text ?? '').trim(),
          reference: `${bookName} ${v.chapter ?? chapter}:${v.verse ?? ''}`
        }));
      }
      throw new Error("Aucun verset trouvé.");
    } catch (error) {
      console.error("Erreur Bible, utilisation du fallback", error);
      return [
        { number: 1, text: "Au commencement, Dieu créa les cieux et la terre.", reference: `${bookName} ${chapter}:1` },
        { number: 2, text: "La terre était informe et vide; il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux.", reference: `${bookName} ${chapter}:2` },
        { number: 3, text: "Dieu dit: Que la lumière soit! Et la lumière fut.", reference: `${bookName} ${chapter}:3` },
        { number: 4, text: "Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres.", reference: `${bookName} ${chapter}:4` },
        { number: 5, text: "Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.", reference: `${bookName} ${chapter}:5` }
      ];
    }
  },

  // --- QURAN ---
  async fetchQuranSurahs(): Promise<QuranSurah[]> {
    // On retourne directement la liste locale — pas besoin d'un appel API pour lister les sourates
    return FALLBACK_SURAHS;
  },

  async fetchQuranSurah(surahNumber: number): Promise<ScriptureVerse[]> {
    try {
      const res = await fetch(`${API_BASE}/quran?surah=${surahNumber}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Notre proxy retourne la réponse d'alquran.cloud directement : { code, status, data: { ayahs: [...] } }
      if (data.data && data.data.ayahs) {
        const surahName = data.data.englishNameTranslation || data.data.englishName;
        return data.data.ayahs.map((ayah: any) => ({
          number: ayah.numberInSurah,
          text: ayah.text.trim(),
          reference: `Sourate ${surahName} (${surahNumber}:${ayah.numberInSurah})`
        }));
      }
      throw new Error("Aucun verset trouvé.");
    } catch (error) {
      console.error("Erreur Coran, utilisation du fallback", error);
      return [
        { number: 1, text: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.", reference: `Sourate Al-Fatihah (${surahNumber}:1)` },
        { number: 2, text: "Louange à Allah, Seigneur de l'univers.", reference: `Sourate Al-Fatihah (${surahNumber}:2)` },
        { number: 3, text: "Le Tout Miséricordieux, le Très Miséricordieux,", reference: `Sourate Al-Fatihah (${surahNumber}:3)` }
      ];
    }
  },

  // --- RECHERCHE CORAN ---
  async searchQuran(query: string): Promise<ScriptureVerse[]> {
    if (!query || query.trim().length < 3) return [];
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodedQuery}/all/fr.hamidullah`);
      if (!res.ok) return [];
      const data = await res.json();
      if (data.data && data.data.results && data.data.results.length > 0) {
        return data.data.results.slice(0, 15).map((r: any) => ({
          number: r.numberInSurah,
          text: r.text.trim(),
          reference: `Sourate ${r.surah.englishNameTranslation || r.surah.englishName} (${r.surah.number}:${r.numberInSurah})`
        }));
      }
      return [];
    } catch (error) {
      console.warn("Erreur recherche Coran", error);
      return [];
    }
  },

  searchBibleLocal(query: string, scriptureLibrary: any[]): ScriptureVerse[] {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return scriptureLibrary
      .filter(item =>
        item.source === 'Bible' &&
        (item.text.toLowerCase().includes(q) || item.reference.toLowerCase().includes(q))
      )
      .map(item => ({ number: 1, text: item.text, reference: item.reference }));
  },

  // --- PARSEUR DE RÉFÉRENCE ---
  parseReferenceText(input: string): ParsedReference | null {
    if (!input) return null;
    const clean = input.toLowerCase().trim();
    const isQuran = clean.startsWith("sourate") || clean.startsWith("coran") || clean.startsWith("sura") || clean.startsWith("quran");
    const numbers = clean.match(/\d+/g)?.map(Number);
    if (!numbers || numbers.length === 0) return null;

    if (isQuran) {
      const surahNumber = numbers[0];
      const verseStart = numbers.length > 1 ? numbers[1] : undefined;
      const verseEnd = numbers.length > 2 ? numbers[2] : undefined;
      const customSurah = FALLBACK_SURAHS.find(s => s.number === surahNumber);
      const name = customSurah ? `Sourate ${customSurah.englishNameTranslation}` : `Sourate ${surahNumber}`;
      return { type: 'Coran', surahNumber, bookName: name, chapter: surahNumber, verseStart, verseEnd };
    } else {
      let bestBook: BibleBook | null = null;
      for (const book of BIBLE_BOOKS) {
        if (clean.includes(book.name.toLowerCase())) { bestBook = book; break; }
      }
      if (!bestBook) {
        const guess = clean.split(/\s+/)[0];
        bestBook = BIBLE_BOOKS.find(b => b.id.startsWith(guess) || b.name.toLowerCase().startsWith(guess)) || BIBLE_BOOKS[0];
      }
      const chapter = numbers[0] || 1;
      const verseStart = numbers.length > 1 ? numbers[1] : undefined;
      const verseEnd = numbers.length > 2 ? numbers[2] : undefined;
      return { type: 'Bible', bookId: bestBook.id, bookName: bestBook.name, chapter, verseStart, verseEnd };
    }
  },

  async fetchByReference(ref: ParsedReference): Promise<ScriptureVerse[]> {
    let verses: ScriptureVerse[] = [];
    if (ref.type === 'Bible' && ref.bookId) {
      verses = await this.fetchBibleChapter(ref.bookId, ref.chapter);
    } else if (ref.type === 'Coran' && ref.surahNumber) {
      verses = await this.fetchQuranSurah(ref.surahNumber);
    }
    if (verses.length === 0) return [];
    if (ref.verseStart !== undefined) {
      const start = ref.verseStart;
      const end = ref.verseEnd !== undefined ? ref.verseEnd : start;
      return verses.filter(v => v.number >= start && v.number <= end);
    }
    return verses;
  }
};
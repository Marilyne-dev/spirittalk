import React, { useState, useEffect, useRef } from 'react';
import {
  Music, Plus, Search, ChevronLeft, Upload, Mic, MicOff,
  Play, Pause, BookOpen, X, Check, Loader2, Hash, Clock
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Chorale {
  id: string;
  name: string;
  type: 'en_langue' | 'jeunesse' | 'groupe_priere';
  denomination: 'catholique' | 'evangelique';
  church: string;
  city: string;
  logo_url?: string;
  description?: string;
  admin_user_id?: string;
  is_verified?: boolean;
  songs_count?: number;
}

interface Song {
  id: string;
  choir_id: string;
  name: string;
  psalm_number?: number;
  audio_url?: string;
  lyrics_text?: string;
  lyrics_image_url?: string;
  language?: string;
  uploaded_by?: string;
  duration?: string;
}

interface ChoirViewProps {
  user: any;
}

const API_BASE = ((import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/spirittalk').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('spirittalk_token') || '';
  const h: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

// ── Chorales catholiques pré-enregistrées (seeds locaux) ─────────────────────
const CATHOLIC_SEEDS: Chorale[] = [
  { id: 'seed_0', name: 'Hanyé', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale en langue Hanyé' },
  { id: 'seed_1', name: 'Sexweyon', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale en langue Sexweyon' },
  { id: 'seed_2', name: 'Adjogan', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale en langue Adjogan' },
  { id: 'seed_3', name: 'Arigbo', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale en langue Arigbo' },
  { id: 'seed_4', name: 'Cécilienne', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale Cécilienne' },
  { id: 'seed_5', name: 'Aluwasio', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale Aluwasio' },
  { id: 'seed_6', name: 'Chorale des Jeunes', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale des Jeunes en langue' },
  { id: 'seed_7', name: 'MADEB', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Mouvement MADEB' },
  { id: 'seed_8', name: 'Chorale des Enfants', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Chorale des Enfants' },
  { id: 'seed_9', name: 'Maman Chérie', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Maman Chérie' },
  { id: 'seed_10', name: 'Sainte Face', type: 'groupe_priere', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Groupe de prière Sainte Face' },
  { id: 'seed_11', name: 'Saint Michel', type: 'groupe_priere', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', description: 'Groupe de prière Saint Michel' },
];

const TYPE_LABELS: Record<string, string> = {
  en_langue: '🎵 En langue',
  jeunesse: '🌟 Jeunesse',
  groupe_priere: '🙏 Groupe de prière',
};

const TYPE_COLORS: Record<string, string> = {
  en_langue: 'bg-emerald-medium/10 text-emerald-deep dark:text-emerald-fixed border-emerald-medium/20',
  jeunesse: 'bg-gold-bright/10 text-gold-deep dark:text-gold-bright border-gold-muted/20',
  groupe_priere: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/20',
};

// ── Normalise une chorale reçue du backend vers le format attendu ─────────────
// FIX PRINCIPAL : le backend retourne `nom` mais le front attend `name`
function normalizeChorale(c: any): Chorale {
  return {
    id: String(c.id),
    // ⚡ FIX : accepter `nom` (Laravel) ou `name` (déjà normalisé)
    name: c.name || c.nom || '(sans nom)',
    // ⚡ FIX : mapper le type backend → type front
    type: mapType(c.type, c.categorie),
    // ⚡ FIX : mapper `courant` (Laravel) → `denomination` (front)
    denomination: (c.denomination || c.courant || 'catholique') as Chorale['denomination'],
    church: c.church || c.eglise || c.ville || '',
    city: c.city || c.ville || '',
    logo_url: c.logo_url || '',
    description: c.description || '',
    admin_user_id: String(c.admin_user_id || c.user_id || ''),
    is_verified: c.is_verified || c.est_verifie || false,
    songs_count: c.songs_count || c.chansons_count || 0,
  };
}

// ⚡ FIX : convertit type backend → type front
function mapType(type?: string, categorie?: string): Chorale['type'] {
  if (type === 'groupe_priere') return 'groupe_priere';
  if (categorie === 'jeunesse' || categorie === 'enfant' || type === 'jeunesse') return 'jeunesse';
  return 'en_langue';
}

// ─────────────────────────────────────────────────────────────────────────────
// Magnétophone
// ─────────────────────────────────────────────────────────────────────────────
function AudioRecorder({ onAudioReady }: { onAudioReady: (base64: string, duration: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secRef = useRef(0);

  const start = async () => {
    chunksRef.current = [];
    secRef.current = 0;
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dur = `${Math.floor(secRef.current / 60)}:${(secRef.current % 60).toString().padStart(2, '0')}`;
          onAudioReady(reader.result as string, dur);
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setRecording(true);
      timerRef.current = setInterval(() => { secRef.current++; setSeconds(s => s + 1); }, 1000);
    } catch { alert('Microphone inaccessible'); }
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mrRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-3">
      {!recording ? (
        <button type="button" onClick={start}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 active:scale-95 transition-all">
          <Mic className="w-4 h-4" /> Enregistrer
        </button>
      ) : (
        <button type="button" onClick={stop}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold animate-pulse hover:bg-red-700 active:scale-95 transition-all">
          <MicOff className="w-4 h-4" /> Arrêter ({seconds}s)
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Ajout Chanson / Prière
// ─────────────────────────────────────────────────────────────────────────────
function AddContentModal({ chorale, onClose, onAdded }: {
  chorale: Chorale;
  onClose: () => void;
  onAdded: (song: Song) => void;
}) {
  const isPrayer = chorale.type === 'groupe_priere';
  const [name, setName] = useState('');
  const [psalmNum, setPsalmNum] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [language, setLanguage] = useState('Français');
  const [audioBase64, setAudioBase64] = useState('');
  const [audioDuration, setAudioDuration] = useState('');
  const [lyricsImageBase64, setLyricsImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioPreview, setAudioPreview] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
      setAudioPreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLyricsImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Donnez un nom');
    setLoading(true);
    try {
      const token = localStorage.getItem('spirittalk_token') || '';
      const fd = new FormData();
      fd.append('chorale_id', chorale.id);
      fd.append('titre', name.trim());
      if (psalmNum) fd.append('psaume', psalmNum);
      fd.append('type_contenu', isPrayer ? 'priere' : 'audio');
      if (lyricsText) fd.append('texte', lyricsText);
      if (audioDuration) fd.append('duree', audioDuration);

      // Audio fichier uploadé
      if (audioBase64 && !audioPreview.startsWith('blob:')) {
        // déjà en base64 depuis un fichier File — on passe via audio_base64
        fd.append('audio_base64', audioBase64);
      }
      // Audio enregistré au micro
      if (audioBase64 && audioPreview.startsWith('blob:')) {
        fd.append('audio_base64', audioBase64);
      }
      // Image paroles
      if (lyricsImageBase64) {
        fd.append('audio_base64_image', lyricsImageBase64);
      }

      const res = await fetch(`${API_BASE}/chansons`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) throw new Error('Erreur serveur');
      const saved = await res.json();

      onAdded({
        id: String(saved.id),
        choir_id: String(saved.chorale_id || chorale.id),
        name: saved.titre || name,
        psalm_number: saved.psaume ? parseInt(saved.psaume) : undefined,
        audio_url: saved.audio_url,
        lyrics_text: saved.texte,
        lyrics_image_url: saved.image_url,
        language,
        duration: saved.duree,
      });
      onClose();
    } catch {
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-charcoal-dark rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-cream-darker dark:border-charcoal-light/10">
        <div className="sticky top-0 bg-white dark:bg-charcoal-dark p-5 border-b border-cream-darker dark:border-charcoal-light/10 flex justify-between items-center rounded-t-3xl">
          <h3 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base">
            {isPrayer ? '🙏 Ajouter une prière' : '🎵 Ajouter une chanson'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {isPrayer ? 'Titre de la prière *' : 'Nom de la chanson *'}
            </label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base"
              placeholder={isPrayer ? 'Ex: Notre Père, Salve Regina...' : 'Ex: Alléluia, Kyrie...'}
            />
          </div>

          {!isPrayer && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Psaume associé</label>
                <input value={psalmNum} onChange={e => setPsalmNum(e.target.value)} type="number" min="1" max="150"
                  className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base"
                  placeholder="Ex: 23"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Langue</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base">
                  {['Français', 'Fon', 'Yoruba', 'Goun', 'Adja', 'Bariba', 'Latin', 'Autre'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Audio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Audio</label>
            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-charcoal-card rounded-xl border border-cream-darker dark:border-charcoal-light/10">
              <p className="text-[10px] text-slate-400">Enregistrer avec le micro :</p>
              <AudioRecorder onAudioReady={(b64, dur) => { setAudioBase64(b64); setAudioDuration(dur); setAudioPreview('blob:'); }} />
              <p className="text-[10px] text-slate-400 mt-1">Ou uploader un fichier audio :</p>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-dashed border-emerald-medium/30 rounded-xl text-xs text-emerald-medium hover:bg-emerald-medium/5 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Choisir un fichier audio (MP3, M4A, OGG...)</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
              {audioBase64 && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-medium font-bold">
                  <Check className="w-3 h-3" /> Audio prêt {audioDuration && `(${audioDuration})`}
                </div>
              )}
            </div>
          </div>

          {/* Paroles texte */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {isPrayer ? 'Texte de la prière' : 'Paroles (texte)'}
            </label>
            <textarea value={lyricsText} onChange={e => setLyricsText(e.target.value)} rows={4}
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base resize-none"
              placeholder="Tapez les paroles ici..."
            />
          </div>

          {/* Image paroles */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {isPrayer ? 'Image / capture de la prière' : 'Image des paroles'}
            </label>
            <label className="mt-1 cursor-pointer flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-charcoal-light/20 rounded-xl text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-charcoal-card transition-colors">
              <Upload className="w-4 h-4" />
              <span>Uploader une image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {lyricsImageBase64 && (
              <img src={lyricsImageBase64} className="mt-2 max-h-32 rounded-lg object-contain" alt="aperçu" />
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-emerald-medium hover:bg-emerald-deep text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {loading ? 'Enregistrement...' : (isPrayer ? 'Ajouter la prière' : 'Ajouter la chanson')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Création Chorale
// ─────────────────────────────────────────────────────────────────────────────
function CreateChoirModal({ denomination, onClose, onCreated }: {
  denomination: 'catholique' | 'evangelique';
  onClose: () => void;
  onCreated: (c: Chorale) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'en_langue' | 'jeunesse' | 'groupe_priere'>('en_langue');
  const [church, setChurch] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile && !logoBase64) return alert('Le logo officiel est obligatoire pour créer un groupe.');
    if (!name.trim() || !city.trim()) return alert('Remplissez tous les champs obligatoires.');
    setLoading(true);

    try {
      const token = localStorage.getItem('spirittalk_token') || '';
      const fd = new FormData();
      fd.append('nom', name);
      fd.append('courant', denomination);
      // ⚡ FIX : mapper le type front → type backend attendu par Laravel
      fd.append('type', type === 'groupe_priere' ? 'groupe_priere' : 'chorale');
      fd.append('langue', 'mixte');
      fd.append('categorie', type === 'jeunesse' ? 'jeunesse' : 'adulte');
      fd.append('description', description);
      fd.append('ville', city);
      if (church) fd.append('eglise', church);
      if (logoFile) {
        fd.append('logo', logoFile);
      }

      const r = await fetch(`${API_BASE}/chorales`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: fd,
      });

      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        console.error('Erreur création chorale:', errData);
        throw new Error(errData.message || 'Erreur serveur');
      }

      const saved = await r.json();
      console.log('Chorale créée:', saved);

      // ⚡ FIX PRINCIPAL : normaliser la réponse backend → format front
      const newChorale = normalizeChorale({
        ...saved,
        // Forcer les valeurs locales si le backend ne les retourne pas correctement
        denomination: denomination,
        type: type,
        church: church || city,
        city: city,
        logo_url: saved.logo_url || logoBase64,
        name: saved.nom || name,
      });

      onCreated(newChorale);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Erreur lors de la création : ' + (err.message || 'Réessayez.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-charcoal-dark rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-cream-darker dark:border-charcoal-light/10">
        <div className="sticky top-0 bg-white dark:bg-charcoal-dark p-5 border-b border-cream-darker dark:border-charcoal-light/10 flex justify-between items-center rounded-t-3xl">
          <h3 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base">
            Créer une chorale / groupe
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Logo obligatoire */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Logo officiel <span className="text-red-500">* obligatoire</span>
            </label>
            <label className="mt-1 cursor-pointer flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-charcoal-card transition-colors border-emerald-medium/30">
              {logoBase64 ? (
                <img src={logoBase64} className="w-20 h-20 rounded-full object-cover" alt="logo" />
              ) : (
                <>
                  <Plus className="w-8 h-8 text-emerald-medium/50" />
                  <span className="text-xs text-slate-400">Cliquer pour uploader le logo</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Sans logo officiel, la création est impossible.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base"
              placeholder="Nom de la chorale ou du groupe"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base">
              <option value="en_langue">🎵 Chorale en langue</option>
              <option value="jeunesse">🌟 Chorale jeunesse</option>
              <option value="groupe_priere">🙏 Groupe de prière</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Église / Paroisse</label>
              <input value={church} onChange={e => setChurch(e.target.value)}
                className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base"
                placeholder="Nom de l'église"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ville *</label>
              <input value={city} onChange={e => setCity(e.target.value)} required
                className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base"
                placeholder="Ex: Cotonou"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium dark:text-cream-base resize-none"
              placeholder="Courte description..."
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-emerald-medium hover:bg-emerald-deep text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {loading ? 'Création en cours...' : 'Créer la chorale'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
export default function ChoirView({ user }: ChoirViewProps) {
  const [denomination, setDenomination] = useState<'catholique' | 'evangelique' | null>(() => {
    return (localStorage.getItem('spirittalk_denomination') as any) || null;
  });
  const [showDenomPicker, setShowDenomPicker] = useState(!denomination);

  const [chorales, setChorales] = useState<Chorale[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedChorale, setSelectedChorale] = useState<Chorale | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showCreateChoir, setShowCreateChoir] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showLyrics, setShowLyricsFor] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tab, setTab] = useState<'catholique' | 'evangelique'>(denomination || 'catholique');
  const [psalmSearch, setPsalmSearch] = useState('');

  const chooseDenomination = (d: 'catholique' | 'evangelique') => {
    setDenomination(d);
    setTab(d);
    localStorage.setItem('spirittalk_denomination', d);
    setShowDenomPicker(false);
  };

  // ── Chargement des chorales ───────────────────────────────────────────────
  const loadChorales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chorales`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const backendChorales = (Array.isArray(data) ? data : []).map(normalizeChorale);

        // ⚡ FIX : fusionner seeds catholiques + données backend sans doublons
        // On garde les seeds dont l'id commence par "seed_" et ajoute les données backend
        const backendIds = new Set(backendChorales.map((c: Chorale) => c.name.toLowerCase()));
        const seedsNonDoublons = CATHOLIC_SEEDS.filter(s => !backendIds.has(s.name.toLowerCase()));

        setChorales([...backendChorales, ...seedsNonDoublons]);
      } else {
        // Fallback : seeds catholiques si backend ne répond pas
        setChorales(CATHOLIC_SEEDS);
      }
    } catch {
      setChorales(CATHOLIC_SEEDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChorales(); }, []);

  // ── Temps réel Pusher ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: any) => {
      const { type, data } = e.detail || {};
      if (type === 'new_chorale') {
        const normalized = normalizeChorale(data);
        setChorales(prev => {
          if (prev.some(c => c.id === normalized.id)) return prev;
          return [normalized, ...prev];
        });
      }
      if (type === 'new_chanson') {
        if (selectedChorale && String(data.choir_id) === String(selectedChorale.id)) {
          const newSong: Song = {
            id: String(data.id),
            choir_id: String(data.choir_id),
            name: data.name || data.titre || '',
            psalm_number: data.psalm_number || data.psaume,
            audio_url: data.audio_url,
            lyrics_text: data.lyrics_text || data.texte,
            lyrics_image_url: data.lyrics_image_url || data.image_url,
            language: data.language,
            duration: data.duration || data.duree,
          };
          setSongs(prev => {
            if (prev.some(s => s.id === newSong.id)) return prev;
            return [newSong, ...prev];
          });
        }
      }
    };
    window.addEventListener('spirittalk_choir_event', handler);
    return () => window.removeEventListener('spirittalk_choir_event', handler);
  }, [selectedChorale]);

  // ── Chargement des chansons ───────────────────────────────────────────────
  const loadSongs = async (choraleId: string) => {
    // Ne pas charger pour les seeds locaux (ids commençant par seed_)
    if (choraleId.startsWith('seed_')) { setSongs([]); return; }
    try {
      const res = await fetch(`${API_BASE}/chorales/${choraleId}/chansons`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSongs((Array.isArray(data) ? data : []).map((s: any) => ({
          id: String(s.id),
          choir_id: String(s.chorale_id || choraleId),
          name: s.name || s.titre || '',
          psalm_number: s.psalm_number || s.psaume ? parseInt(s.psaume) : undefined,
          audio_url: s.audio_url,
          lyrics_text: s.lyrics_text || s.texte,
          lyrics_image_url: s.lyrics_image_url || s.image_url,
          language: s.language,
          duration: s.duration || s.duree,
        })));
      } else { setSongs([]); }
    } catch { setSongs([]); }
  };

  const openChorale = (c: Chorale) => {
    setSelectedChorale(c);
    setSongs([]);
    loadSongs(c.id);
  };

  const back = () => { setSelectedChorale(null); setSongs([]); stopAudio(); setSearch(''); };

  // ── Lecture audio ─────────────────────────────────────────────────────────
  const playAudio = (song: Song) => {
    if (!song.audio_url) return;
    stopAudio();
    const a = new Audio(song.audio_url);
    audioRef.current = a;
    a.play().catch(() => alert('Impossible de lire cet audio'));
    a.onended = () => setPlayingId(null);
    setPlayingId(song.id);
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  };

  // ── Filtres ───────────────────────────────────────────────────────────────
  const filteredChorales = chorales.filter(c => {
    // ⚡ FIX : comparaison robuste denomination vs tab
    const matchTab = c.denomination === tab;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchTab && matchSearch && matchType;
  });

  const filteredSongs = songs.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchPsalm = !psalmSearch || String(s.psalm_number) === psalmSearch;
    return matchSearch && matchPsalm;
  });

  // ── Sélecteur dénomination ────────────────────────────────────────────────
  if (showDenomPicker) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-sm w-full text-center space-y-8 p-6">
          <div>
            <div className="w-16 h-16 bg-emerald-medium/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-emerald-medium" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base">Chants Sacrés</h2>
            <p className="text-sm text-slate-500 dark:text-cream-base/60 mt-2">
              Choisissez votre tradition pour voir les chorales et chansons qui vous correspondent.
            </p>
          </div>
          <div className="space-y-3">
            <button onClick={() => chooseDenomination('catholique')}
              className="w-full p-4 rounded-2xl border-2 border-emerald-medium/20 bg-emerald-medium/5 hover:bg-emerald-medium/10 hover:border-emerald-medium/40 transition-all text-left flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-medium flex items-center justify-center text-white text-xl flex-shrink-0">✝️</div>
              <div>
                <p className="font-bold text-emerald-deep dark:text-cream-base text-sm">Catholique</p>
                <p className="text-xs text-slate-400">Chorales en langue, jeunesse, groupes de prière</p>
              </div>
            </button>
            <button onClick={() => chooseDenomination('evangelique')}
              className="w-full p-4 rounded-2xl border-2 border-gold-bright/20 bg-gold-bright/5 hover:bg-gold-bright/10 hover:border-gold-bright/40 transition-all text-left flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-deep flex items-center justify-center text-white text-xl flex-shrink-0">⭐</div>
              <div>
                <p className="font-bold text-emerald-deep dark:text-cream-base text-sm">Évangélique</p>
                <p className="text-xs text-slate-400">Chorales évangéliques et groupes de louange</p>
              </div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Vous pourrez toujours accéder aux deux traditions depuis cet espace.</p>
        </div>
      </div>
    );
  }

  // ── Vue détail d'une chorale ──────────────────────────────────────────────
  if (selectedChorale) {
    const isPrayer = selectedChorale.type === 'groupe_priere';
    return (
      <div className="space-y-4 animate-fade-in">
        {showAddSong && (
          <AddContentModal
            chorale={selectedChorale}
            onClose={() => setShowAddSong(false)}
            onAdded={s => setSongs(prev => [s, ...prev])}
          />
        )}

        <div className="flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {selectedChorale.logo_url ? (
            <img src={selectedChorale.logo_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-medium/10 flex items-center justify-center text-xl">
              {selectedChorale.type === 'groupe_priere' ? '🙏' : '🎵'}
            </div>
          )}
          <div className="flex-grow">
            <h2 className="font-serif font-bold text-emerald-deep dark:text-cream-base">{selectedChorale.name}</h2>
            <p className="text-xs text-slate-400">{selectedChorale.church} · {selectedChorale.city}</p>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${TYPE_COLORS[selectedChorale.type]}`}>
            {TYPE_LABELS[selectedChorale.type]}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none dark:text-cream-base"
              placeholder={isPrayer ? "Chercher une prière..." : "Chercher une chanson..."}
            />
          </div>
          {!isPrayer && (
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input value={psalmSearch} onChange={e => setPsalmSearch(e.target.value)} type="number" min="1" max="150"
                className="w-24 pl-8 pr-2 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none dark:text-cream-base"
                placeholder="Ps."
              />
            </div>
          )}
          <button onClick={() => setShowAddSong(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-medium hover:bg-emerald-deep text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">{isPrayer ? '🙏' : '🎵'}</div>
            <p className="text-slate-400 text-sm">
              {selectedChorale.id.startsWith('seed_')
                ? 'Cette chorale pré-enregistrée n\'a pas encore de chants. Ajoutez le premier !'
                : (isPrayer ? 'Aucune prière encore.' : 'Aucune chanson encore.')}
            </p>
            <button onClick={() => setShowAddSong(true)}
              className="px-6 py-2 bg-emerald-medium text-white rounded-xl text-xs font-bold hover:bg-emerald-deep transition-all">
              {isPrayer ? 'Ajouter une prière' : 'Ajouter une chanson'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map(song => (
              <div key={song.id} className="bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playingId === song.id ? stopAudio() : playAudio(song)}
                    disabled={!song.audio_url}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                      song.audio_url
                        ? 'bg-emerald-medium text-white hover:bg-emerald-deep shadow-md'
                        : 'bg-slate-100 dark:bg-charcoal-light/10 text-slate-300 cursor-not-allowed'
                    }`}>
                    {playingId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-emerald-deep dark:text-cream-base truncate">{song.name}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {song.psalm_number && (
                        <span className="text-[10px] bg-gold-bright/10 text-gold-deep dark:text-gold-bright px-2 py-0.5 rounded-full border border-gold-muted/20 font-bold">
                          Ps. {song.psalm_number}
                        </span>
                      )}
                      {song.language && <span className="text-[10px] text-slate-400">{song.language}</span>}
                      {song.duration && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{song.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  {(song.lyrics_text || song.lyrics_image_url) && (
                    <button onClick={() => setShowLyricsFor(showLyrics === song.id ? null : song.id)}
                      className="p-2 text-slate-400 hover:text-emerald-medium rounded-lg hover:bg-emerald-medium/5 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showLyrics === song.id && (
                  <div className="border-t border-cream-darker dark:border-charcoal-light/10 pt-3 space-y-2">
                    {song.lyrics_text && (
                      <p className="text-xs text-slate-600 dark:text-cream-base/70 whitespace-pre-line leading-relaxed">{song.lyrics_text}</p>
                    )}
                    {song.lyrics_image_url && (
                      <img src={song.lyrics_image_url} className="max-w-full rounded-lg" alt="paroles" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Vue liste des chorales ────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">
      {showCreateChoir && (
        <CreateChoirModal
          denomination={tab}
          onClose={() => setShowCreateChoir(false)}
          onCreated={c => {
            // ⚡ FIX : ajouter immédiatement dans la liste locale ET changer le tab
            setTab(c.denomination);
            setChorales(prev => {
              if (prev.some(x => x.id === c.id)) return prev;
              return [c, ...prev];
            });
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base">🎵 Chants Sacrés</h1>
          <p className="text-xs text-slate-400 mt-0.5">Chorales, chansons et prières de la communauté</p>
        </div>
        <button onClick={() => setShowDenomPicker(true)}
          className="text-[10px] text-slate-400 hover:text-emerald-medium border border-cream-darker dark:border-charcoal-light/10 px-3 py-1.5 rounded-lg transition-colors">
          Changer ✝️/⭐
        </button>
      </div>

      <div className="flex rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card">
        {(['catholique', 'evangelique'] as const).map(d => (
          <button key={d} onClick={() => setTab(d)}
            className={`flex-1 py-3 text-xs font-bold transition-all ${
              tab === d ? 'bg-emerald-medium text-white' : 'text-slate-400 hover:text-emerald-medium hover:bg-emerald-medium/5'
            }`}>
            {d === 'catholique' ? '✝️ Catholique' : '⭐ Évangélique'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-grow relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none dark:text-cream-base"
            placeholder="Chercher une chorale..."
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-cream-darker dark:border-charcoal-light/10 rounded-xl px-3 py-2.5 text-xs bg-white dark:bg-charcoal-card text-slate-600 dark:text-cream-base outline-none">
          <option value="all">Tous les types</option>
          <option value="en_langue">🎵 En langue</option>
          <option value="jeunesse">🌟 Jeunesse</option>
          <option value="groupe_priere">🙏 Groupe de prière</option>
        </select>
        <button onClick={() => setShowCreateChoir(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-medium hover:bg-emerald-deep text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Créer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-medium" /></div>
      ) : filteredChorales.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🎵</div>
          <p className="text-slate-400 text-sm">Aucune chorale trouvée pour "{tab}".</p>
          <button onClick={() => setShowCreateChoir(true)}
            className="px-6 py-2 bg-emerald-medium text-white rounded-xl text-xs font-bold hover:bg-emerald-deep transition-all">
            Créer la première chorale
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredChorales.map(c => (
            <button key={c.id} onClick={() => openChorale(c)}
              className="text-left bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl p-4 hover:border-emerald-medium/30 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                {c.logo_url ? (
                  <img src={c.logo_url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-cream-darker" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-medium/10 flex items-center justify-center text-xl flex-shrink-0">
                    {c.type === 'groupe_priere' ? '🙏' : '🎵'}
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-emerald-deep dark:text-cream-base group-hover:text-emerald-medium transition-colors truncate">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{c.church} · {c.city}</p>
                  <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${TYPE_COLORS[c.type]}`}>
                    {TYPE_LABELS[c.type]}
                  </span>
                </div>
                {c.songs_count !== undefined && c.songs_count > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-emerald-medium">{c.songs_count}</p>
                    <p className="text-[9px] text-slate-400">titres</p>
                  </div>
                )}
              </div>
              {c.description && (
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{c.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
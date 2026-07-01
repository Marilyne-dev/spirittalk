import React, { useState, useEffect, useRef } from 'react';
import {
  Music, Plus, Search, ChevronLeft, Upload, Mic, MicOff,
  Play, Pause, BookOpen, Users, Cross, Star, X, Check,
  Filter, Headphones, Clock, Hash
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


// PAR :
const getHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('spirittalk_user') || '{}');
    const token = user?.token || user?.access_token || user?.api_token || '';
    const h: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  } catch {
    return { 'Content-Type': 'application/json', Accept: 'application/json' };
  }
};

// Chorales catholiques pré-enregistrées (seeds)
const CATHOLIC_SEEDS: Omit<Chorale, 'id'>[] = [
  { name: 'Hanyé', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale en langue Hanyé' },
  { name: 'Sexweyon', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale en langue Sexweyon' },
  { name: 'Adjogan', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale en langue Adjogan' },
  { name: 'Arigbo', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale en langue Arigbo' },
  { name: 'Cécilienne', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale Cécilienne' },
  { name: 'Aluwasio', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale Aluwasio' },
  { name: 'Chorale des Jeunes', type: 'en_langue', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale des Jeunes en langue' },
  { name: 'MADEB', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Mouvement MADEB' },
  { name: 'Chorale des Enfants', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Chorale des Enfants' },
  { name: 'Maman Chérie', type: 'jeunesse', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Maman Chérie' },
  { name: 'Sainte Face', type: 'groupe_priere', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Groupe de prière Sainte Face' },
  { name: 'Saint Michel', type: 'groupe_priere', denomination: 'catholique', church: 'Paroisse', city: 'Bénin', logo_url: '', description: 'Groupe de prière Saint Michel' },
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

// ─────────────────────────────────────────────────────────────────────────────
// Composant magnétophone audio
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
      timerRef.current = setInterval(() => {
        secRef.current++;
        setSeconds(s => s + 1);
      }, 1000);
    } catch {
      alert('Microphone inaccessible');
    }
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
      // Upload audio si présent
      let audioUrl = '';
      if (audioBase64) {
        const res = await fetch(`${API_BASE}/upload-audio`, {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ audio: audioBase64 })
        });
        if (res.ok) { const d = await res.json(); audioUrl = d.url || ''; }
      }
      // Upload image paroles si présente
      let lyricsImageUrl = '';
      if (lyricsImageBase64) {
        const res = await fetch(`${API_BASE}/upload-audio`, {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ audio: lyricsImageBase64 })
        });
        if (res.ok) { const d = await res.json(); lyricsImageUrl = d.url || ''; }
      }
      const body = {
        choir_id: chorale.id,
        name: name.trim(),
        psalm_number: psalmNum ? parseInt(psalmNum) : null,
        audio_url: audioUrl || null,
        lyrics_text: lyricsText || null,
        lyrics_image_url: lyricsImageUrl || null,
        language,
        duration: audioDuration || null,
      };
      const res = await fetch(`${API_BASE}/chansons`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const saved = await res.json();
      onAdded({ ...saved, id: String(saved.id) });
      onClose();
    } catch {
      alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
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
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium"
              placeholder={isPrayer ? 'Ex: Notre Père, Salve Regina...' : 'Ex: Alléluia, Kyrie...'}
            />
          </div>

          {!isPrayer && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Psaume associé</label>
                <input value={psalmNum} onChange={e => setPsalmNum(e.target.value)} type="number" min="1" max="150"
                  className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium"
                  placeholder="Ex: 23"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Langue</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium">
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
              <AudioRecorder onAudioReady={(b64, dur) => { setAudioBase64(b64); setAudioDuration(dur); }} />
              <p className="text-[10px] text-slate-400 mt-1">Ou uploader un fichier audio :</p>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-dashed border-emerald-medium/30 rounded-xl text-xs text-emerald-medium hover:bg-emerald-medium/5 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Choisir un fichier audio (MP3, M4A, OGG...)</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
              {(audioBase64 || audioPreview) && (
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
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium resize-none"
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
            className="w-full py-3 bg-emerald-medium hover:bg-emerald-deep text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm">
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
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

// REMPLACER tout le handleSubmit par :
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!logoBase64) return alert('Le logo officiel est obligatoire pour créer un groupe.');
  if (!name.trim() || !church.trim() || !city.trim()) return alert('Remplissez tous les champs obligatoires.');
  setLoading(true);
  try {
    const fd = new FormData();
    fd.append('nom', name);
    fd.append('courant', denomination);
    fd.append('type', type === 'en_langue' ? 'chorale' : type === 'jeunesse' ? 'chorale' : 'groupe_priere');
    fd.append('langue', 'mixte');
    fd.append('categorie', type === 'jeunesse' ? 'jeunesse' : 'adulte');
    fd.append('description', description);
    fd.append('ville', city);

    // Convertir base64 en blob pour FormData
    const base64Data = logoBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    fd.append('logo', blob, 'logo.jpg');

    const user = JSON.parse(localStorage.getItem('spirittalk_user') || '{}');
    const token = user?.token || user?.access_token || '';

    const r = await fetch(`${API_BASE}/chorales`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: fd,
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(JSON.stringify(err));
    }
    const saved = await r.json();
    onCreated({ ...saved, id: String(saved.id), name: saved.nom });
    onClose();
  } catch (err: any) {
    console.error(err);
    alert('Erreur lors de la création. Réessayez.');
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
              Logo officiel * <span className="text-red-500">(obligatoire)</span>
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
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium"
              placeholder="Nom de la chorale ou du groupe"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium">
              <option value="en_langue">🎵 Chorale en langue</option>
              <option value="jeunesse">🌟 Chorale jeunesse</option>
              <option value="groupe_priere">🙏 Groupe de prière</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Église / Paroisse *</label>
              <input value={church} onChange={e => setChurch(e.target.value)} required
                className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium"
                placeholder="Nom de l'église"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ville *</label>
              <input value={city} onChange={e => setCity(e.target.value)} required
                className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium"
                placeholder="Ex: Cotonou"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="mt-1 w-full border border-cream-darker dark:border-charcoal-light/20 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-charcoal-card outline-none focus:border-emerald-medium resize-none"
              placeholder="Courte description..."
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-emerald-medium hover:bg-emerald-deep text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm">
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
  // ── Choix dénomination (après login, pas à l'inscription) ─────────────────
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

  // Sauvegarde du choix de dénomination
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
        setChorales(data.map((c: any) => ({ ...c, id: String(c.id) })));
      } else {
        // Fallback : seeds catholiques locaux si le backend ne répond pas
        setChorales(CATHOLIC_SEEDS.map((c, i) => ({ ...c, id: `seed_${i}` })));
      }
    } catch {
      setChorales(CATHOLIC_SEEDS.map((c, i) => ({ ...c, id: `seed_${i}` })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChorales(); }, []);

  // ── Temps réel Pusher pour chorales et chansons ───────────────────────────
  useEffect(() => {
    const handler = (e: any) => {
      const { type, data } = e.detail || {};
      if (type === 'new_chorale') {
        setChorales(prev => {
          if (prev.some(c => c.id === String(data.id))) return prev;
          return [{ ...data, id: String(data.id) }, ...prev];
        });
      }
      if (type === 'new_chanson') {
        if (selectedChorale && String(data.choir_id) === String(selectedChorale.id)) {
          setSongs(prev => {
            if (prev.some(s => s.id === String(data.id))) return prev;
            return [{ ...data, id: String(data.id) }, ...prev];
          });
        }
      }
    };
    window.addEventListener('spirittalk_choir_event', handler);
    return () => window.removeEventListener('spirittalk_choir_event', handler);
  }, [selectedChorale]);

  // ── Chargement des chansons d'une chorale ─────────────────────────────────
  const loadSongs = async (choraleId: string) => {
    try {
      const res = await fetch(`${API_BASE}/chorales/${choraleId}/chansons`, { headers: getHeaders() });
      if (res.ok) setSongs((await res.json()).map((s: any) => ({ ...s, id: String(s.id) })));
      else setSongs([]);
    } catch { setSongs([]); }
  };

  const openChorale = (c: Chorale) => {
    setSelectedChorale(c);
    setSongs([]);
    loadSongs(c.id);
  };

  const back = () => { setSelectedChorale(null); setSongs([]); stopAudio(); };

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
    const matchTab = c.denomination === tab;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.church.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchTab && matchSearch && matchType;
  });

  const filteredSongs = songs.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchPsalm = !psalmSearch || String(s.psalm_number) === psalmSearch;
    return matchSearch && matchPsalm;
  });

  // ── Sélecteur dénomination (affiché une seule fois, stocké localement) ────
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
              className="w-full p-4 rounded-2xl border-2 border-emerald-medium/20 bg-emerald-medium/5 hover:bg-emerald-medium/10 hover:border-emerald-medium/40 transition-all group text-left flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-medium flex items-center justify-center text-white text-xl flex-shrink-0">✝️</div>
              <div>
                <p className="font-bold text-emerald-deep dark:text-cream-base text-sm">Catholique</p>
                <p className="text-xs text-slate-400">Chorales en langue, jeunesse, groupes de prière</p>
              </div>
            </button>
            <button onClick={() => chooseDenomination('evangelique')}
              className="w-full p-4 rounded-2xl border-2 border-gold-bright/20 bg-gold-bright/5 hover:bg-gold-bright/10 hover:border-gold-bright/40 transition-all group text-left flex items-center gap-4">
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

        {/* Header chorale */}
        <div className="flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-xl hover:bg-cream-darker dark:hover:bg-charcoal-light/20 text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {selectedChorale.logo_url ? (
            <img src={selectedChorale.logo_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-medium/10 flex items-center justify-center text-xl">🎵</div>
          )}
          <div className="flex-grow">
            <h2 className="font-serif font-bold text-emerald-deep dark:text-cream-base">{selectedChorale.name}</h2>
            <p className="text-xs text-slate-400">{selectedChorale.church} · {selectedChorale.city}</p>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${TYPE_COLORS[selectedChorale.type]}`}>
            {TYPE_LABELS[selectedChorale.type]}
          </span>
        </div>

        {/* Recherche dans la chorale */}
        <div className="flex gap-2">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none"
              placeholder={isPrayer ? "Chercher une prière..." : "Chercher une chanson..."}
            />
          </div>
          {!isPrayer && (
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input value={psalmSearch} onChange={e => setPsalmSearch(e.target.value)} type="number" min="1" max="150"
                className="w-24 pl-8 pr-2 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none"
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

        {/* Liste des chansons / prières */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">{isPrayer ? '🙏' : '🎵'}</div>
            <p className="text-slate-400 text-sm">
              {isPrayer ? 'Aucune prière encore. Soyez le premier à en ajouter !' : 'Aucune chanson encore. Soyez le premier à en ajouter !'}
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
                      {song.language && (
                        <span className="text-[10px] text-slate-400">{song.language}</span>
                      )}
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
          onCreated={c => setChorales(prev => [c, ...prev])}
        />
      )}

      {/* Titre + bouton changer dénomination */}
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

      {/* Onglets catholique / évangélique */}
      <div className="flex rounded-2xl overflow-hidden border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card">
        {(['catholique', 'evangelique'] as const).map(d => (
          <button key={d} onClick={() => setTab(d)}
            className={`flex-1 py-3 text-xs font-bold transition-all ${
              tab === d
                ? 'bg-emerald-medium text-white'
                : 'text-slate-400 hover:text-emerald-medium hover:bg-emerald-medium/5'
            }`}>
            {d === 'catholique' ? '✝️ Catholique' : '⭐ Évangélique'}
          </button>
        ))}
      </div>

      {/* Recherche + filtres + création */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-grow relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card text-sm outline-none"
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

      {/* Liste chorales */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement des chorales...</div>
      ) : filteredChorales.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🎵</div>
          <p className="text-slate-400 text-sm">Aucune chorale trouvée.</p>
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
                {c.songs_count !== undefined && (
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
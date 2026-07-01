import React, { useState, useRef, useEffect } from 'react';
import {
  Music, Plus, Search, Upload, Mic, MicOff, Play, Pause,
  Download, BookOpen, Image, FileText, ChevronRight, X,
  Users, Star, CheckCircle, AlertCircle, Loader2, Square
} from 'lucide-react';
import { apiService } from '../services/api';

// ── Types ────────────────────────────────────────────────────────────────
type Courant = 'catholique' | 'evangelique';
type TypeGroupe = 'chorale' | 'groupe_priere' | 'mouvement';
type TypeContenu = 'audio' | 'texte' | 'image' | 'priere';

interface Chorale {
  id: string;
  nom: string;
  courant: Courant;
  type: TypeGroupe;
  langue: string;
  categorie: string;
  logo_url: string;
  description?: string;
  ville?: string;
  chansons_count?: number;
  user?: { name: string; avatar: string };
}

interface Chanson {
  id: string;
  titre: string;
  psaume?: string;
  type_contenu: TypeContenu;
  audio_url?: string;
  image_url?: string;
  texte?: string;
  format_fichier?: string;
  duree?: string;
  ecoute_count: number;
  telecharge_count: number;
}

const API = ((import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/spirittalk').replace(/\/$/, '');
const token = () => {
  try { return JSON.parse(localStorage.getItem('spirittalk_user') || '{}')?.token || ''; } catch { return ''; }
};

const apiHeaders = () => ({
  'Authorization': `Bearer ${token()}`,
});

// Tous les formats audio acceptés
const AUDIO_ACCEPT = '.mp3,.wav,.aac,.ogg,.flac,.m4a,.wma,.opus,.amr,.aiff,.ape,.mp4,.3gp';
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';

// ── Composant principal ──────────────────────────────────────────────────
export default function ChoirView({ user }: { user: any }) {
  const [courant, setCourant] = useState<Courant>('catholique');
  const [chorales, setChorales] = useState<Chorale[]>([]);
  const [selectedChorale, setSelectedChorale] = useState<Chorale | null>(null);
  const [chansons, setChansons] = useState<Chanson[]>([]);
  const [search, setSearch] = useState('');
  const [searchPsaume, setSearchPsaume] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateChorale, setShowCreateChorale] = useState(false);
  const [showAddChanson, setShowAddChanson] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<string | null>(null);

  // Charger les chorales
  useEffect(() => {
    loadChorales();
  }, [courant]);

  const loadChorales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chorales?courant=${courant}`, { headers: apiHeaders() });
      const data = await res.json();
      setChorales(Array.isArray(data) ? data : []);
    } catch { setChorales([]); }
    setLoading(false);
  };

  // Charger les chansons d'une chorale
  const loadChansons = async (choraleId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (searchPsaume) params.append('psaume', searchPsaume);
      const res = await fetch(`${API}/api/chorales/${choraleId}/chansons?${params}`, { headers: apiHeaders() });
      const data = await res.json();
      setChansons(Array.isArray(data) ? data : []);
    } catch { setChansons([]); }
    setLoading(false);
  };

  const handleSelectChorale = (c: Chorale) => {
    setSelectedChorale(c);
    setSearch('');
    setSearchPsaume('');
    loadChansons(c.id);
  };

  // Lecture audio
  const handlePlay = (chanson: Chanson) => {
    if (!chanson.audio_url) return;
    if (playingId === chanson.id) {
      audioEl?.pause();
      setPlayingId(null);
      return;
    }
    audioEl?.pause();
    const audio = new Audio(chanson.audio_url);
    audio.onended = () => setPlayingId(null);
    audio.play();
    setAudioEl(audio);
    setPlayingId(chanson.id);
    fetch(`${API}/api/chansons/${chanson.id}/ecouter`, { method: 'POST', headers: apiHeaders() }).catch(() => {});
  };

  // Télécharger
  const handleDownload = async (chanson: Chanson) => {
    setQuotaInfo(null);
    try {
      const res = await fetch(`${API}/api/chansons/${chanson.id}/download`, { method: 'POST', headers: apiHeaders() });
      const data = await res.json();
      if (res.status === 403) {
        setQuotaInfo(data.message);
        return;
      }
      // Déclencher le téléchargement
      const a = document.createElement('a');
      a.href = data.url;
      a.download = `${chanson.titre}.${data.format || 'mp3'}`;
      a.click();
      setQuotaInfo(`✅ Téléchargé ! Il vous reste ${data.restant} téléchargement(s) gratuit(s) aujourd'hui.`);
    } catch {
      setQuotaInfo("Erreur lors du téléchargement.");
    }
  };

  const filteredChorales = chorales.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-24 animate-fade-in">

      {/* ── En-tête ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base flex items-center gap-2">
            <Music className="w-6 h-6 text-emerald-medium" />
            Chants Sacrés
          </h2>
          <p className="text-xs text-slate-500 dark:text-cream-base/60 mt-0.5">
            Chorales, chants, prières — écoute & télécharge
          </p>
        </div>
        <button
          onClick={() => setShowCreateChorale(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-medium text-white rounded-xl text-xs font-bold hover:bg-emerald-deep transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Créer ma chorale
        </button>
      </div>

      {/* ── Tabs Catholique / Évangélique ─────────────────────────────── */}
      <div className="flex gap-3">
        {(['catholique', 'evangelique'] as Courant[]).map(c => (
          <button
            key={c}
            onClick={() => { setCourant(c); setSelectedChorale(null); setSearch(''); }}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
              courant === c
                ? 'bg-emerald-medium text-white border-emerald-medium shadow-md'
                : 'bg-white dark:bg-charcoal-card border-cream-darker dark:border-charcoal-light/10 text-slate-500 hover:border-emerald-medium/40'
            }`}
          >
            {c === 'catholique' ? '✝️ Catholique' : '📖 Évangélique'}
          </button>
        ))}
      </div>

      {/* ── Vue : liste chorales ──────────────────────────────────────── */}
      {!selectedChorale && (
        <>
          {/* Recherche chorale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une chorale..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-medium" /></div>
          ) : filteredChorales.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Music className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-400">Aucune chorale enregistrée pour l'instant.</p>
              <button onClick={() => setShowCreateChorale(true)} className="text-emerald-medium text-sm font-bold hover:underline">
                + Être le premier à créer une chorale {courant}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredChorales.map(chorale => (
                <button
                  key={chorale.id}
                  onClick={() => handleSelectChorale(chorale)}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card hover:border-emerald-medium/40 hover:bg-emerald-medium/5 transition-all text-left group shadow-sm"
                >
                  {/* Logo chorale */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-emerald-medium/10 border border-emerald-medium/20">
                    {chorale.logo_url ? (
                      <img src={chorale.logo_url} alt={chorale.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-emerald-medium" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-serif text-sm font-bold text-slate-800 dark:text-cream-base truncate group-hover:text-emerald-deep">
                      {chorale.nom}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {chorale.type === 'chorale' ? '🎶 Chorale' : chorale.type === 'groupe_priere' ? '🙏 Groupe de prière' : '✝️ Mouvement'}
                      {chorale.ville && ` · ${chorale.ville}`}
                    </p>
                    <p className="text-[10px] text-emerald-medium font-bold mt-1">
                      {chorale.chansons_count || 0} chant(s)
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-medium shrink-0" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Vue : chansons d'une chorale ─────────────────────────────── */}
      {selectedChorale && (
        <div className="space-y-4">
          {/* Header chorale sélectionnée */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-medium/5 border border-emerald-medium/20">
            <button onClick={() => setSelectedChorale(null)} className="text-slate-400 hover:text-emerald-medium">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              {selectedChorale.logo_url
                ? <img src={selectedChorale.logo_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-emerald-medium/20 flex items-center justify-center"><Music className="w-5 h-5 text-emerald-medium" /></div>
              }
            </div>
            <div className="flex-grow">
              <p className="font-serif font-bold text-emerald-deep dark:text-cream-base">{selectedChorale.nom}</p>
              <p className="text-[10px] text-slate-400">{chansons.length} chant(s) disponible(s)</p>
            </div>
            <button
              onClick={() => setShowAddChanson(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-medium text-white rounded-xl text-xs font-bold hover:bg-emerald-deep transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>

          {/* Message quota */}
          {quotaInfo && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${quotaInfo.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
              {quotaInfo}
              <button onClick={() => setQuotaInfo(null)} className="ml-2 opacity-60">✕</button>
            </div>
          )}

          {/* Recherches */}
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); loadChansons(selectedChorale.id); }}
                placeholder="Rechercher un chant..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
              />
            </div>
            <div className="relative w-32">
              <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchPsaume}
                onChange={e => { setSearchPsaume(e.target.value); loadChansons(selectedChorale.id); }}
                placeholder="Psaume 21..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
              />
            </div>
          </div>

          {/* Liste chansons */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-medium" /></div>
          ) : chansons.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Music className="w-10 h-10 text-slate-200 mx-auto" />
              <p className="text-sm text-slate-400">Aucun chant pour l'instant.</p>
              <button onClick={() => setShowAddChanson(true)} className="text-emerald-medium text-sm font-bold hover:underline">
                + Ajouter le premier chant
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {chansons.map(chanson => (
                <div key={chanson.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 bg-white dark:bg-charcoal-card shadow-sm">
                  {/* Icône type */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    chanson.type_contenu === 'audio' ? 'bg-emerald-medium/10' :
                    chanson.type_contenu === 'image' ? 'bg-blue-50' :
                    chanson.type_contenu === 'priere' ? 'bg-purple-50' : 'bg-amber-50'
                  }`}>
                    {chanson.type_contenu === 'audio' && <Music className="w-5 h-5 text-emerald-medium" />}
                    {chanson.type_contenu === 'image' && <Image className="w-5 h-5 text-blue-500" />}
                    {chanson.type_contenu === 'texte' && <FileText className="w-5 h-5 text-amber-500" />}
                    {chanson.type_contenu === 'priere' && <BookOpen className="w-5 h-5 text-purple-500" />}
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-cream-base truncate">{chanson.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {chanson.psaume && (
                        <span className="text-[9px] bg-gold-deep/10 text-gold-deep px-2 py-0.5 rounded-full font-bold">{chanson.psaume}</span>
                      )}
                      {chanson.format_fichier && (
                        <span className="text-[9px] text-slate-400 uppercase font-bold">{chanson.format_fichier}</span>
                      )}
                      {chanson.duree && (
                        <span className="text-[9px] text-slate-400">{chanson.duree}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Écouter */}
                    {chanson.audio_url && (
                      <button
                        onClick={() => handlePlay(chanson)}
                        className={`p-2 rounded-xl transition-all ${
                          playingId === chanson.id
                            ? 'bg-emerald-medium text-white'
                            : 'text-slate-400 hover:text-emerald-medium hover:bg-emerald-medium/10'
                        }`}
                        title="Écouter"
                      >
                        {playingId === chanson.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}
                    {/* Télécharger */}
                    {chanson.audio_url && (
                      <button
                        onClick={() => handleDownload(chanson)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        title="Télécharger (3/jour gratuits)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal : créer une chorale ─────────────────────────────────── */}
      {showCreateChorale && (
        <CreateChoraleModal
          courant={courant}
          onClose={() => setShowCreateChorale(false)}
          onCreated={() => { setShowCreateChorale(false); loadChorales(); }}
        />
      )}

      {/* ── Modal : ajouter une chanson ───────────────────────────────── */}
      {showAddChanson && selectedChorale && (
        <AddChansonModal
          chorale={selectedChorale}
          onClose={() => setShowAddChanson(false)}
          onAdded={() => { setShowAddChanson(false); loadChansons(selectedChorale.id); }}
        />
      )}
    </div>
  );
}

// ── Modal Créer une Chorale ──────────────────────────────────────────────
function CreateChoraleModal({ courant, onClose, onCreated }: {
  courant: Courant;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ nom: '', type: 'chorale', langue: 'mixte', categorie: 'adulte', description: '', ville: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogo(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!logo) { setError('Le logo est obligatoire pour créer une chorale.'); return; }
    if (!form.nom.trim()) { setError('Le nom est obligatoire.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nom', form.nom);
      fd.append('courant', courant);
      fd.append('type', form.type);
      fd.append('langue', form.langue);
      fd.append('categorie', form.categorie);
      fd.append('description', form.description);
      fd.append('ville', form.ville);
      fd.append('logo', logo);

      const res = await fetch(`${API}/api/chorales`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Erreur serveur');
      }
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-card rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">Créer ma chorale</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo — OBLIGATOIRE */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-2">
                Logo de la chorale <span className="text-red-500">* obligatoire</span>
              </label>
              <label className={`flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                logoPreview ? 'border-emerald-medium' : 'border-slate-200 hover:border-emerald-medium/50'
              }`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-24 h-24 object-contain rounded-xl" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400">Cliquer pour uploader le logo</span>
                    <span className="text-[10px] text-slate-300">JPG, PNG, WEBP</span>
                  </>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleLogo} className="hidden" />
              </label>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Nom de la chorale *</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder="Ex: Chorale Cécilienne Saint-Jean"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-2">Type de groupe *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'chorale', label: '🎶 Chorale', desc: 'Chants' },
                  { val: 'groupe_priere', label: '🙏 Prière', desc: 'Prières uniquement' },
                  { val: 'mouvement', label: '✝️ Mouvement', desc: 'Chants + prières' },
                ].map(t => (
                  <button
                    key={t.val} type="button"
                    onClick={() => setForm(p => ({ ...p, type: t.val }))}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      form.type === t.val ? 'border-emerald-medium bg-emerald-medium/10 text-emerald-deep' : 'border-cream-darker text-slate-500'
                    }`}
                  >
                    <div>{t.label}</div>
                    <div className="text-[9px] opacity-70">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Langue */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Langue</label>
                <select
                  value={form.langue}
                  onChange={e => setForm(p => ({ ...p, langue: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none dark:text-cream-base"
                >
                  <option value="langue">En langue</option>
                  <option value="francais">En français</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none dark:text-cream-base"
                >
                  <option value="adulte">Adulte</option>
                  <option value="jeunesse">Jeunesse</option>
                  <option value="enfant">Enfant</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Ville (optionnel)</label>
              <input
                type="text"
                value={form.ville}
                onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}
                placeholder="Ex: Cotonou, Porto-Novo..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none dark:text-cream-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-medium text-white rounded-2xl font-bold text-sm hover:bg-emerald-deep transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Création en cours...' : 'Créer la chorale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Modal Ajouter une Chanson ────────────────────────────────────────────
function AddChansonModal({ chorale, onClose, onAdded }: {
  chorale: Chorale;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({ titre: '', psaume: '', type_contenu: 'audio' as TypeContenu, texte: '' });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const isGroupePriere = chorale.type === 'groupe_priere';

  // Enregistrement micro
  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch { setError('Microphone inaccessible.'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.titre.trim()) { setError('Le titre est obligatoire.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('chorale_id', chorale.id);
      fd.append('titre', form.titre);
      fd.append('psaume', form.psaume);
      fd.append('type_contenu', form.type_contenu);
      fd.append('texte', form.texte);

      if (audioFile) fd.append('audio', audioFile);
      if (imageFile) fd.append('image', imageFile);

      // Enregistrement micro → envoyer en base64
      if (audioBlob && !audioFile) {
        const reader = new FileReader();
        await new Promise<void>(resolve => {
          reader.onloadend = () => {
            fd.append('audio_base64', reader.result as string);
            resolve();
          };
          reader.readAsDataURL(audioBlob);
        });
      }

      const res = await fetch(`${API}/api/chansons`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Erreur serveur');
      }
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout.');
    }
    setLoading(false);
  };

  const typeOptions = isGroupePriere
    ? [{ val: 'priere', label: '🙏 Prière', icon: BookOpen }]
    : [
        { val: 'audio', label: '🎵 Audio', icon: Music },
        { val: 'texte', label: '📝 Texte', icon: FileText },
        { val: 'image', label: '🖼️ Image', icon: Image },
      ];

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-card rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">
              {isGroupePriere ? 'Ajouter une prière' : 'Ajouter un chant'}
            </h3>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
          </div>

          <p className="text-xs text-slate-400 bg-slate-50 dark:bg-charcoal-dark rounded-xl px-3 py-2">
            Chorale : <strong>{chorale.nom}</strong>
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Titre *</label>
              <input
                type="text"
                value={form.titre}
                onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                placeholder={isGroupePriere ? "Ex: Prière du soir" : "Ex: Gloire à Dieu"}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
              />
            </div>

            {/* Psaume (pas pour groupe de prière) */}
            {!isGroupePriere && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Psaume associé (optionnel)</label>
                <input
                  type="text"
                  value={form.psaume}
                  onChange={e => setForm(p => ({ ...p, psaume: e.target.value }))}
                  placeholder="Ex: Psaume 23, Psaume 91..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base"
                />
              </div>
            )}

            {/* Type de contenu */}
            {!isGroupePriere && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-2">Type de contenu</label>
                <div className="grid grid-cols-3 gap-2">
                  {typeOptions.map(t => (
                    <button
                      key={t.val} type="button"
                      onClick={() => setForm(p => ({ ...p, type_contenu: t.val as TypeContenu }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        form.type_contenu === t.val ? 'border-emerald-medium bg-emerald-medium/10 text-emerald-deep' : 'border-cream-darker text-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload audio */}
            {(form.type_contenu === 'audio' && !isGroupePriere) && (
              <div className="space-y-3">
                {/* Upload fichier */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">
                    Uploader un fichier audio (tous formats)
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-medium/50 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-slate-300 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-cream-base/70">
                        {audioFile ? audioFile.name : 'Choisir un fichier audio'}
                      </p>
                      <p className="text-[10px] text-slate-400">MP3, WAV, AAC, OGG, FLAC, M4A, WMA, OPUS, AMR...</p>
                    </div>
                    <input type="file" accept={AUDIO_ACCEPT} onChange={e => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                </div>

                {/* Séparateur */}
                <div className="flex items-center gap-2">
                  <div className="flex-grow h-px bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-bold">OU</span>
                  <div className="flex-grow h-px bg-slate-100" />
                </div>

                {/* Enregistrement micro */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-2">
                    Enregistrer directement au micro 🎤
                  </label>
                  {!isRecording && !audioBlob && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-bold hover:bg-red-100 transition-all"
                    >
                      <Mic className="w-4 h-4" /> Démarrer l'enregistrement
                    </button>
                  )}
                  {isRecording && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                          Enregistrement... {formatTime(recordingTime)}
                        </div>
                        <button type="button" onClick={stopRecording} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">
                          <Square className="w-3 h-3" /> Arrêter
                        </button>
                      </div>
                    </div>
                  )}
                  {audioBlob && (
                    <div className="space-y-2">
                      <audio src={audioPreviewUrl} controls className="w-full h-10 rounded-xl" />
                      <button type="button" onClick={() => { setAudioBlob(null); setAudioPreviewUrl(''); }} className="text-xs text-red-400 hover:underline">
                        Supprimer et réenregistrer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload image (partition) */}
            {form.type_contenu === 'image' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">Image / Partition</label>
                <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-medium/50 cursor-pointer transition-all">
                  <Image className="w-5 h-5 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-cream-base/70">
                      {imageFile ? imageFile.name : 'Choisir une image ou PDF'}
                    </p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP, PDF</p>
                  </div>
                  <input type="file" accept={IMAGE_ACCEPT} onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>
            )}

            {/* Texte / Prière */}
            {(form.type_contenu === 'texte' || form.type_contenu === 'priere' || isGroupePriere) && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-cream-base/70 mb-1">
                  {isGroupePriere ? 'Texte de la prière' : 'Paroles du chant'}
                </label>
                <textarea
                  value={form.texte}
                  onChange={e => setForm(p => ({ ...p, texte: e.target.value }))}
                  rows={6}
                  placeholder={isGroupePriere ? "Seigneur, nous te rendons grâce..." : "Écris les paroles ici..."}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-darker dark:border-charcoal-light/20 bg-slate-50 dark:bg-charcoal-dark focus:outline-none focus:ring-1 focus:ring-emerald-medium dark:text-cream-base resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-medium text-white rounded-2xl font-bold text-sm hover:bg-emerald-deep transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Ajout en cours...' : 'Ajouter le chant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
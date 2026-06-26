import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Flame, Bookmark, PenSquare, Trash2, Copy, Check, Calendar, Plus, MessageSquare, BookOpen, Clock, X, Settings, LogOut, CheckCircle, Moon, Sparkles } from 'lucide-react';
import { Bookmark as BookmarkType, Note, Religion } from '../types';

interface ProfileViewProps {
  user: any;
  xp: number;
  streak: number;
  bookmarks: BookmarkType[];
  notes: Note[];
  onCheckIn: () => void;
  onRemoveBookmark: (id: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onDeleteNote: (id: string) => void;
  onNavigateToChatWithQuery: (initialPrompt: string) => void;
  hasCheckedInToday: boolean;
  onUpdateProfile: (updates: { name: string; email: string; religion: Religion; avatar: string; profession?: string; password?: string }) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200',
  'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=200',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200'
];

export default function ProfileView({
  user,
  xp,
  streak,
  bookmarks,
  notes,
  onCheckIn,
  onRemoveBookmark,
  onAddNote,
  onDeleteNote,
  onNavigateToChatWithQuery,
  hasCheckedInToday,
  onUpdateProfile,
  onLogout
}: ProfileViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Note creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<'Silence' | 'Gratitude' | 'Prière' | 'Méditation' | 'Autre'>('Silence');

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editReligion, setEditReligion] = useState<Religion>(user?.religion || "Mixte");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [editProfession, setEditProfession] = useState(user?.profession || "");
  const [editPassword, setEditPassword] = useState("");

  // Determine Level based on XP
  const getLevelInfo = (score: number) => {
    if (score < 500) return { title: "Nouveau Croyant", next: 500, percent: Math.round((score / 500) * 100) };
    if (score < 1200) return { title: "Explorateur Spirituel", next: 1200, percent: Math.round((score / 1200) * 100) };
    if (score < 2500) return { title: "Initié Éclairé", next: 2500, percent: Math.round((score / 2500) * 100) };
    return { title: "Sage Érudit", next: 5000, percent: Math.round((score / 5000) * 100) };
  };

  const levelInfo = getLevelInfo(xp);

  const handleCopyBookmark = (bm: BookmarkType) => {
    navigator.clipboard.writeText(`"${bm.verseText}" — ${bm.reference}`);
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    
    onAddNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory
    });
    
    // reset form
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("Silence");
    setShowAddForm(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      email: editEmail,
      religion: editReligion,
      avatar: editAvatar,
      profession: editProfession,
      password: editPassword || undefined
    });
    setEditPassword("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Profile Overview Banner */}
      <section className="bg-white dark:bg-charcoal-card rounded-3xl p-6 border border-cream-darker dark:border-charcoal-light/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
          <button
            onClick={() => {
              setEditName(user?.name || "");
              setEditEmail(user?.email || "");
              setEditReligion(user?.religion || "Mixte");
              setEditAvatar(user?.avatar || AVATAR_OPTIONS[0]);
              setIsEditing(!isEditing);
            }}
            className="p-2 text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-cream-base dark:hover:bg-charcoal-light/30 rounded-xl transition-all"
            title="Modifier le Profil / Paramètres"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Se Déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* User Image & Avatar Info */}
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold-muted/80 shadow-md">
                <img
                  className="w-full h-full object-cover"
                  src={user?.avatar || AVATAR_OPTIONS[0]}
                  alt={user?.name || "User Avatar"}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-medium dark:bg-emerald-fixed text-white dark:text-charcoal-dark p-1.5 rounded-full border-2 border-white shadow-md dark:border-charcoal-card">
                <Award className="w-3.5 h-3.5" />
              </span>
            </div>
            
            <div className="space-y-0.5">
              <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">
                {user?.name || "Chercheur de Vérité"}
              </h3>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                @{user?.username || "seeker"}
              </p>
              {user?.profession && (
                <p className="text-xs text-slate-500 dark:text-cream-base/65 font-medium italic">
                  {user?.profession}
                </p>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-1 bg-cream-darker dark:bg-charcoal-light/40 px-3 py-1 rounded-full border border-cream-darker/60">
                {user?.religion === 'Chrétienne' ? (
                  <BookOpen className="w-3.5 h-3.5 text-emerald-medium dark:text-emerald-fixed" />
                ) : user?.religion === 'Musulmane' ? (
                  <Moon className="w-3.5 h-3.5 text-gold-muted" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-medium dark:text-gold-bright" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-cream-base/70">
                  Sensibilité: {user?.religion || "Mixte"}
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress & Actions */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-4 md:border-l md:border-cream-darker dark:md:border-charcoal-light/15 md:pl-6">
            <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 dark:text-cream-base/50 uppercase tracking-widest font-bold">Titre Spirituel</p>
                <h4 className="font-serif text-lg font-bold text-emerald-medium dark:text-gold-bright flex items-center justify-center sm:justify-start gap-1">
                  <Award className="w-4 h-4" />
                  <span>{levelInfo.title}</span>
                </h4>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 dark:text-cream-base/50 uppercase tracking-widest font-bold">Énergie d'Étude</p>
                <p className="font-serif text-xl font-bold text-emerald-deep dark:text-cream-base">{xp} XP</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Progression du niveau</span>
                <span className="text-emerald-medium dark:text-gold-bright font-mono">{levelInfo.percent}%</span>
              </div>
              <div className="w-full bg-cream-darker dark:bg-charcoal-light/30 h-2 rounded-full overflow-hidden border border-cream-darker/40">
                <div
                  className="bg-emerald-medium dark:bg-emerald-fixed h-full transition-all duration-300"
                  style={{ width: `${levelInfo.percent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Plus que {levelInfo.next - (xp % levelInfo.next)} XP pour débloquer le titre suivant.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-1.5 text-gold-deep dark:text-gold-bright">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="font-serif text-sm font-bold">{streak} jours d'affilée</span>
              </div>
              
              <button
                onClick={onCheckIn}
                disabled={hasCheckedInToday}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  hasCheckedInToday
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-gold-bright text-gold-deep hover:bg-gold-muted border-gold-muted/40 active:scale-95"
                }`}
              >
                {hasCheckedInToday ? "✓ Présence Enregistrée" : "S'enregistrer aujourd'hui (+50 XP)"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Editing Section Popup overlay style or expand block */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-cream-darker/40 dark:bg-charcoal-card rounded-2xl p-6 border border-emerald-medium/10 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base">
                Modifier mon Profil Spirituel
              </h4>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-cream-darker dark:hover:bg-charcoal-light/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Profession / Fonction
                  </label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    placeholder="ex: Enseignant, Étudiant, Développeur..."
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Nouveau Mot de Passe (Optionnel)
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas modifier"
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                  />
                </div>
              </div>

              {/* Religion Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                  Ma Sensibilité Spirituelle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chrétienne', 'Musulmane', 'Mixte'] as Religion[]).map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setEditReligion(rel)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-center ${
                        editReligion === rel
                          ? 'bg-emerald-medium/10 border-emerald-medium text-emerald-medium dark:bg-emerald-fixed/15 dark:border-emerald-fixed dark:text-gold-bright font-bold'
                          : 'bg-white dark:bg-charcoal-dark border-cream-darker dark:border-charcoal-light/15 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {rel === 'Chrétienne' ? <BookOpen className="w-3.5 h-3.5" /> : rel === 'Musulmane' ? <Moon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span className="text-[10px] tracking-wider uppercase">{rel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                  Choisir mon Avatar (ou importer ma photo)
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {AVATAR_OPTIONS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(avatar)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                        editAvatar === avatar ? 'border-emerald-medium dark:border-gold-bright scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      {editAvatar === avatar && (
                        <span className="absolute inset-0 bg-emerald-medium/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Show custom uploaded avatar if not in presets */}
                  {editAvatar && !AVATAR_OPTIONS.includes(editAvatar) && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar(editAvatar)}
                      className="relative w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 transition-all border-emerald-medium dark:border-gold-bright scale-105"
                    >
                      <img src={editAvatar} className="w-full h-full object-cover" alt="Custom photo" referrerPolicy="no-referrer" />
                      <span className="absolute inset-0 bg-emerald-medium/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  )}

                  {/* File Upload Button */}
                  <div className="relative shrink-0">
                    <label 
                      title="Importer une photo depuis vos fichiers locaux"
                      className="flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-charcoal-light/30 cursor-pointer bg-slate-50/50 dark:bg-charcoal-dark hover:bg-slate-100 dark:hover:bg-charcoal-card transition-all"
                    >
                      <Plus className="w-5 h-5 text-slate-500 dark:text-cream-base" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64Str = event.target?.result as string;
                              if (base64Str) {
                                setEditAvatar(base64Str);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-cream-darker dark:border-charcoal-light/15 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-medium text-white dark:bg-emerald-fixed dark:text-charcoal-dark rounded-xl text-xs font-semibold hover:bg-emerald-deep"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asymmetric Split: Bookmarks (Mes Favoris) & Journal (Mes Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bookmarks Column (Mes Favoris) */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gold-deep" />
              <span>Mes Favoris ({bookmarks.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {bookmarks.length > 0 ? (
              bookmarks.map((bm) => {
                const isCopied = copiedId === bm.id;
                return (
                  <div
                    key={bm.id}
                    className="p-5 bg-white dark:bg-charcoal-card rounded-xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm relative group space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#759486]/10 text-emerald-medium dark:text-emerald-fixed text-[9px] uppercase font-bold tracking-wider">
                        {bm.source}
                      </span>
                      
                      <div className="flex gap-1 opacity-100 lg:opacity-30 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyBookmark(bm)}
                          className="p-1.5 text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright transition-colors"
                          title="Copier le verset"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        
                        <button
                          onClick={() => onNavigateToChatWithQuery(`Donne-moi une analyse spirituelle complète et des conseils de vie basés sur ce verset : "${bm.verseText}" (${bm.reference})`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-medium transition-colors"
                          title="Demander guidance sur ce verset"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onRemoveBookmark(bm.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="Retirer des favoris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <blockquote className="italic font-serif text-sm text-slate-700 dark:text-cream-base/90 leading-relaxed scripture-quote border-gold-deep">
                      "{bm.verseText}"
                    </blockquote>
                    
                    <div className="text-right text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      — {bm.reference}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-serif font-semibold text-slate-400">Aucun favori enregistré</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5">Explorez des écritures et sauvegardez vos inspirations quotidiennes.</p>
              </div>
            )}
          </div>
        </section>

        {/* Reflection Notes Column (Mes Notes / Journal) */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base uppercase tracking-wider flex items-center gap-2">
              <PenSquare className="w-4 h-4 text-emerald-medium" />
              <span>Mon Journal de Réflexions ({notes.length})</span>
            </h3>
            
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className="text-xs py-1.5 px-3 bg-emerald-medium text-white rounded-lg flex items-center gap-1 font-semibold hover:bg-emerald-deep transition-colors"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? "Fermer" : "Nouvelle Note"}</span>
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleFormSubmit}
                className="bg-emerald-medium/5 dark:bg-charcoal-card/45 p-5 rounded-2xl border border-emerald-medium/15 space-y-4 overflow-hidden"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Catégorie
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-700 dark:text-cream-base"
                  >
                    <option value="Silence">Silence</option>
                    <option value="Gratitude">Gratitude</option>
                    <option value="Prière">Prière</option>
                    <option value="Méditation">Méditation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Titre de la réflexion
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="ex: Méditation sur le Silence"
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-700 dark:text-cream-base"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-light dark:text-emerald-fixed block">
                    Votre pensée spirituelle
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Qu'avez-vous ressenti ou appris aujourd'hui ?"
                    className="w-full bg-white dark:bg-charcoal-dark border border-cream-darker dark:border-charcoal-light/15 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-medium text-slate-700 dark:text-cream-base"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-medium text-white rounded-lg text-xs font-semibold hover:bg-emerald-deep active:scale-95 transition-all shadow-sm"
                >
                  Enregistrer ma Note
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-xl border border-cream-darker dark:border-charcoal-light/10 hover:shadow-md transition-shadow bg-white dark:bg-charcoal-card space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-medium/10 text-emerald-medium dark:text-emerald-fixed text-[9px] font-bold uppercase rounded-md">
                          {note.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {note.date}
                        </span>
                      </div>
                      
                      <h5 className="font-serif text-base font-bold text-emerald-deep dark:text-cream-base">
                        {note.title}
                      </h5>
                    </div>
                    
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded-lg transition-colors opacity-100 lg:opacity-30 lg:group-hover:opacity-100"
                      title="Supprimer la note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-cream-base/80 leading-relaxed font-sans whitespace-pre-line">
                    {note.content}
                  </p>

                  <div className="pt-2 border-t border-cream-darker dark:border-charcoal-light/10 flex justify-end">
                    <button
                      onClick={() => onNavigateToChatWithQuery(`Analyse spirituellement et conseille-moi sur cette réflexion tirée de mon journal : "${note.content}"`)}
                      className="text-[10px] font-semibold text-emerald-medium dark:text-gold-bright hover:underline flex items-center gap-1"
                    >
                      <span>Consulter Sagesse Divine sur cette pensée</span>
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
                <PenSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-serif font-semibold text-slate-400">Aucune note de réflexion</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5">Prenez un instant pour noter vos prières et méditations quotidiennes.</p>
              </div>
            )}
          </div>
        </section>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User as UserIcon, BookOpen, Sparkles, Moon, Sun, 
  ChevronRight, Eye, EyeOff, Book, Flame, HelpCircle, Heart, 
  Send, MessageSquare, Check, Users, Award, Shield, Compass, BookOpenCheck 
} from 'lucide-react';
import { apiService } from '../services/api';
import { Religion } from '../types';
import SpiritTalkLogo from './SpiritTalkLogo';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

// Slidshow Slides (Tranquil nature photos + sacred verses from both faiths)
const SLIDESHOW_ITEMS = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200", // Calm beach sunset
    text: "Le Seigneur est mon berger, je ne manquerai de rien. Il me fait reposer dans de verts pâturages.",
    reference: "Psaumes 23:1-2",
    source: "Bible"
  },
  {
    image: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?q=80&w=1200", // Peaceful starry night
    text: "Certes, c'est par l'évocation d'Allah que les cœurs se tranquillisent.",
    reference: "Sourate Ar-Ra'd (13:28)",
    source: "Coran"
  },
  {
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200", // Foggy tranquil forest
    text: "Je vous laisse la paix, je vous donne ma paix. Que votre cœur ne se trouble point, et ne s'alarme point.",
    reference: "Jean 14:27",
    source: "Bible"
  },
  {
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200", // Sunbeam through trees
    text: "Et quiconque place sa confiance en Allah, Il lui suffit.",
    reference: "Sourate At-Talaq (65:3)",
    source: "Coran"
  },
  {
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200", // Misty mountain sunrise
    text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bienveillance...",
    reference: "Galates 5:22",
    source: "Bible"
  },
  {
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200", // Serene hills at dawn
    text: "Allah est la Lumière des cieux et de la terre.",
    reference: "Sourate An-Nur (24:35)",
    source: "Coran"
  }
];

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration specific states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [religion, setReligion] = useState<Religion>('Mixte');

  // Slide index
  const [slideIndex, setSlideIndex] = useState(0);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("Information");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  // Refs for smooth scroll
  const accueilRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % SLIDESHOW_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error("Veuillez remplir tous les champs.");
        }
        const response = await apiService.login(email, password);
        onAuthSuccess(response.user);
      } else {
        if (!name || !username || !email || !password) {
          throw new Error("Veuillez remplir tous les champs.");
        }
        const response = await apiService.register(name, username, email, password, religion);
        onAuthSuccess(response.user);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    setTimeout(() => {
      setIsSubmittingContact(false);
      setShowContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] font-sans flex flex-col selection:bg-emerald-medium/20 select-none">
      
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gold-bright/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-medium/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Landing Navigation Header */}
      <header className="sticky top-0 w-full z-50 h-20 bg-white/80 backdrop-blur-md border-b border-cream-darker flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleScroll(accueilRef)}>
          <div className="scale-75 origin-left flex items-center gap-2">
            <svg
              width="44"
              height="44"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M102 46 C112 43, 126 48, 131 56"
                stroke="#D4A373"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M141 83 C135 80, 122 75, 115 72 C110 65, 108 55, 114 47 C112 49, 107 53, 106 58 C104 63, 106 67, 104 70 C98 70, 93 68, 88 64 C84 59, 81 50, 83 40 C81 44, 78 50, 78 57 C78 64, 82 72, 80 77 C75 77, 71 74, 67 71 C62 65, 59 55, 60 44 C57 49, 54 57, 56 65 C57 74, 62 82, 59 89 C57 91, 55 92, 53 93 C65 106, 85 110, 102 110 C98 122, 90 134, 82 144 C87 146, 92 144, 98 138 C108 128, 116 116, 122 105 C128 98, 137 92, 141 83 Z"
                fill="#1D3557"
              />
              <circle cx="121" cy="62" r="3" fill="white" />
              <g transform="translate(68, 76)">
                <path d="M32 30 C18 28, 6 32, 2 34 L2 12 C6 10, 18 6, 32 8 Z" fill="#D4A373" stroke="#FFFFFF" strokeWidth="3" />
                <path d="M32 30 C46 28, 58 32, 62 34 L62 12 C58 10, 46 6, 32 8 Z" fill="#D4A373" stroke="#FFFFFF" strokeWidth="3" />
              </g>
            </svg>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-emerald-deep">
              SpiritTalk
            </h1>
          </div>
        </div>

        {/* Centered navigation items */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-slate-500">
          <button onClick={() => handleScroll(accueilRef)} className="hover:text-emerald-deep transition-colors">Accueil</button>
          <button onClick={() => handleScroll(featuresRef)} className="hover:text-emerald-deep transition-colors">Fonctionnalités</button>
          <button onClick={() => handleScroll(whyUsRef)} className="hover:text-emerald-deep transition-colors">Pourquoi Nous ?</button>
          <button onClick={() => handleScroll(contactRef)} className="hover:text-emerald-deep transition-colors">Contactez-nous</button>
        </nav>

        {/* Quick action buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleScroll(accueilRef)}
            className="px-5 py-2.5 bg-[#1D3557] hover:bg-emerald-deep text-white font-sans text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            S'Authentifier
          </button>
        </div>
      </header>

      {/* Main Sections Wrapper */}
      <div className="relative z-10 flex-grow">
        
        {/* SECTION 1: ACCUEIL & SPLIT LOGIN SCREEN (Directly matching user image 2) */}
        <section ref={accueilRef} className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-b border-cream-darker">
          
          {/* Left Hand Column: Login & Registration form */}
          <div className="lg:col-span-5 p-8 md:p-12 xl:p-16 flex flex-col justify-center bg-white border-r border-cream-darker relative">
            <div className="max-w-md mx-auto w-full space-y-8">
              
              {/* Branding and Greeting */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-medium/10 flex items-center justify-center text-emerald-deep border border-emerald-medium/10">
                    <Compass className="w-6 h-6 text-emerald-medium" />
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl font-extrabold tracking-tight text-emerald-deep leading-none">
                      SpiritTalk Sanctuary
                    </h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
                      Entrez dans l'espace de la quiétude sacrée
                    </p>
                  </div>
                </div>
              </div>

              {/* Login / Register Toggle Tab */}
              <div className="flex bg-cream-base p-1.5 rounded-xl border border-cream-darker">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    isLogin
                      ? 'bg-emerald-medium text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Se Connecter
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    !isLogin
                      ? 'bg-emerald-medium text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  S'Inscrire
                </button>
              </div>

              {/* Error messages if any */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Interactive Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Name field */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                          Nom Complet
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required={!isLogin}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Marie Diallo"
                            className="w-full bg-cream-base/50 border border-cream-darker rounded-xl pl-11 pr-4 py-3.5 text-xs focus:ring-1 focus:ring-emerald-medium text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Username field */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                          Identifiant Unique
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs font-bold">@</span>
                          <input
                            type="text"
                            required={!isLogin}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                            placeholder="mariediallo"
                            className="w-full bg-cream-base/50 border border-cream-darker rounded-xl pl-8 pr-4 py-3.5 text-xs focus:ring-1 focus:ring-emerald-medium text-[#1E293B] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Religion/Space Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                          Sensibilité Théologique Principale
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setReligion('Chrétienne')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              religion === 'Chrétienne'
                                ? 'bg-emerald-medium/10 border-emerald-medium text-emerald-deep font-bold'
                                : 'bg-cream-base/30 border-cream-darker text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                            <span className="text-[9px] uppercase font-extrabold tracking-wider">Chrétienne</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReligion('Musulmane')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              religion === 'Musulmane'
                                ? 'bg-gold-deep/10 border-gold-deep text-gold-deep font-bold'
                                : 'bg-cream-base/30 border-cream-darker text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Moon className="w-4 h-4" />
                            <span className="text-[9px] uppercase font-extrabold tracking-wider">Musulmane</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReligion('Mixte')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              religion === 'Mixte'
                                ? 'bg-[#759486]/10 border-[#759486] text-[#0d2b21] font-bold'
                                : 'bg-cream-base/30 border-cream-darker text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[9px] uppercase font-extrabold tracking-wider">Double Espace</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@sanctuary.com"
                      className="w-full bg-cream-base/50 border border-cream-darker rounded-xl pl-11 pr-4 py-3.5 text-xs focus:ring-1 focus:ring-emerald-medium text-[#1E293B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password with View toggle */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                      Mot de passe
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => alert("Pour réinitialiser votre mot de passe, contactez le support dans la section dédiée ci-dessous.")}
                        className="text-[10px] font-bold text-emerald-medium hover:underline"
                      >
                        Oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-cream-base/50 border border-cream-darker rounded-xl pl-11 pr-10 py-3.5 text-xs focus:ring-1 focus:ring-emerald-medium text-[#1E293B] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-emerald-deep hover:bg-emerald-medium text-white font-sans text-xs uppercase tracking-widest font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? "Authentification..." : isLogin ? "Se Connecter" : "Rejoindre l'Union Spirituelle"}</span>
                  {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Security Banner */}
              <div className="pt-6 border-t border-cream-darker text-center text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                <Shield className="w-4 h-4 text-[#D4A373] mx-auto mb-1.5" />
                Vos données théologiques sont cryptées et stockées de manière strictement confidentielle et sécurisée.
              </div>

            </div>
          </div>

          {/* Right Hand Column: Scenic Slideshow with automated quote transitions */}
          <div className="lg:col-span-7 relative h-80 lg:h-auto overflow-hidden flex flex-col justify-end p-8 md:p-12 xl:p-16">
            
            {/* Infinite cross-fading imagery background */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${SLIDESHOW_ITEMS[slideIndex].image})` }}
              >
                {/* Visual Darkening Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"></div>
              </motion.div>
            </AnimatePresence>

            {/* Overlaid Logo inside the slide (top right) */}
            <div className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
              <Compass className="w-5 h-5 text-gold-bright animate-spin-slow" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-white">Sagesse & Dialogue</span>
            </div>

            {/* Quote and Scripture details */}
            <div className="relative z-10 max-w-2xl space-y-6 text-white pb-6">
              
              {/* Sacred Source indicator */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  SLIDESHOW_ITEMS[slideIndex].source === 'Bible'
                    ? 'bg-emerald-medium/30 text-emerald-light border border-emerald-medium/30'
                    : 'bg-gold-bright/30 text-gold-bright border border-gold-muted/20'
                }`}>
                  {SLIDESHOW_ITEMS[slideIndex].source === 'Bible' ? '📖 Sainte Écriture' : '✨ Parole Sacrée'}
                </span>
                <span className="text-[10px] text-white/60 tracking-wider uppercase font-bold">Inspiration Universelle</span>
              </div>

              {/* The Actual Verse text */}
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={slideIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.8 }}
                  className="font-serif text-2xl md:text-3xl xl:text-4xl italic font-medium leading-relaxed tracking-wide text-cream-base"
                >
                  "{SLIDESHOW_ITEMS[slideIndex].text}"
                </motion.blockquote>
              </AnimatePresence>

              {/* Reference */}
              <AnimatePresence mode="wait">
                <motion.cite
                  key={slideIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="block font-sans text-xs text-[#D4A373] uppercase tracking-widest font-bold not-italic"
                >
                  — {SLIDESHOW_ITEMS[slideIndex].reference}
                </motion.cite>
              </AnimatePresence>

              {/* Slider indicators */}
              <div className="flex gap-1.5 pt-4">
                {SLIDESHOW_ITEMS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      slideIndex === idx ? 'w-8 bg-gold-bright' : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: LES FONCTIONNALITÉS (Animated and Explained Space by Space) */}
        <section ref={featuresRef} className="py-24 bg-white border-b border-cream-darker scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-4"
            >
              <span className="px-3 py-1 bg-emerald-medium/10 text-emerald-deep rounded-full text-[10px] font-bold uppercase tracking-widest">
                Fonctionnalités Clés
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-deep">
                Une technologie moderne au service de la foi
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                SpiritTalk unifie les outils théologiques les plus avancés au sein d'une interface épurée, respectant l'intégrité de chaque tradition spirituelle.
              </p>
            </motion.div>

            {/* Features Bento-Like Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Feature 1: Espace Chrétien */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.03, y: -4, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.1)" }}
                className="p-6 bg-[#FDFBF7] rounded-3xl border border-cream-darker hover:border-emerald-medium/20 transition-all space-y-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-medium/10 flex items-center justify-center text-emerald-deep">
                  <BookOpen className="w-6 h-6 text-emerald-medium" />
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-deep">Espace Chrétien Dédié</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lisez la Bible Louis Segond en texte intégral. Suivez des plans d'études thématiques adaptés (patience, pardon, paix) et progressez par chapitres.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-medium flex items-center gap-1">
                  <span>Sainte Bible LSG</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Feature 2: Espace Musulman */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.03, y: -4, boxShadow: "0 10px 30px -10px rgba(220, 170, 70, 0.15)" }}
                className="p-6 bg-[#FDFBF7] rounded-3xl border border-cream-darker hover:border-gold-deep/20 transition-all space-y-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-bright/20 flex items-center justify-center text-gold-deep">
                  <Moon className="w-6 h-6 text-gold-deep" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#856529]">Espace Musulman Dédié</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Consultez le Coran complet traduit par le Professeur Muhammad Hamidullah. Profitez de l'affichage arabe originel et de la translittération française.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gold-deep flex items-center gap-1">
                  <span>Traduction Hamidullah</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Feature 3: Guidance IA Sagesse Divine */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.03, y: -4, boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.1)" }}
                className="p-6 bg-[#FDFBF7] rounded-3xl border border-cream-darker hover:border-indigo-500/20 transition-all space-y-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-serif text-lg font-bold text-indigo-950">Sagesse Divine IA</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Notre guide d'intelligence spirituelle répond à vos questions en reliant ses explications à d'authentiques versets bibliques et coraniques.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <span>Modèle Gemini Sécurisé</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Feature 4: Bibliothèque & Recherche par Référence */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.03, y: -4, boxShadow: "0 10px 30px -10px rgba(217, 119, 6, 0.1)" }}
                className="p-6 bg-[#FDFBF7] rounded-3xl border border-cream-darker hover:border-amber-500/20 transition-all space-y-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <BookOpenCheck className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-serif text-lg font-bold text-amber-950">Recherche Avancée</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Recherchez par mot-clé ou par référence exacte (ex: <strong>Genèse 2:1-3</strong> ou <strong>Sourate 19 versets 1 à 5</strong>) pour charger immédiatement l'extrait désiré.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <span>Slicing de précision</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </motion.div>

            </div>

            {/* Additional Features List: Quizzes & community */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="bg-[#F2E8CF]/15 rounded-3xl border border-cream-darker p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-emerald-deep leading-tight">
                  Forum d'Échange & Défis Théologiques Interactifs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parce que la foi grandit par la réflexion partagée, nous offrons un espace communautaire inspiré de Facebook pour partager vos méditations de façon sécurisée, interagir avec les autres seekers, et répondre aux défis quotidiens :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-medium shrink-0 mt-0.5" />
                    <span><strong>Fil d'actualité fraternel</strong> : Partagez des textes et rattachez des versets sacrés d'un seul clic.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-medium shrink-0 mt-0.5" />
                    <span><strong>Interactions communautaires</strong> : Aimez, commentez et sollicitez directement l'intelligence artificielle pour analyser les publications spirituelles d'autres membres.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-medium shrink-0 mt-0.5" />
                    <span><strong>Quizzes de théologie</strong> : Testez vos connaissances bibliques et coraniques quotidiennement pour accumuler de l'XP et élever votre niveau spirituel.</span>
                  </li>
                </ul>
              </div>

              <div className="relative group overflow-hidden rounded-2xl">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-cream-darker shadow-lg w-full h-auto object-cover max-h-[300px]"
                  src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800"
                  alt="Interactive SpiritTalk Features"
                />
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -bottom-2 -left-2 bg-white p-4 rounded-xl border border-cream-darker shadow-md flex items-center gap-3 z-10"
                >
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                  <div>
                    <h4 className="font-sans text-xs font-bold text-emerald-deep">Série d'Assiduité</h4>
                    <p className="text-[9px] text-slate-400">Gardez la flamme spirituelle active</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SECTION 3: POURQUOI NOUS ? (Value proposition, ecumenical design, Christians & Muslims) */}
        <section ref={whyUsRef} className="py-24 bg-[#FDFBF7] border-b border-cream-darker scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-4"
            >
              <span className="px-3 py-1 bg-gold-bright/30 text-gold-deep rounded-full text-[10px] font-bold uppercase tracking-widest">
                Pourquoi SpiritTalk ?
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-deep">
                Conçu pour la paix, l'harmonie et l'unité fraternelle
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                À une époque où l'incompréhension domine, SpiritTalk offre un sanctuaire pacifique unique au monde, favorisant l'apprentissage mutuel sans dogmatisme.
              </p>
            </motion.div>

            {/* Editorial Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Point 1: Two Faiths, One Respect */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -3 }}
                className="space-y-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-medium/10 text-emerald-deep flex items-center justify-center font-serif text-lg font-bold">1</div>
                <h3 className="font-serif text-xl font-bold text-emerald-deep">Double espace d'apprentissage</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nous ne mélangeons pas les Écritures mais nous les présentons côte à côte avec le même respect et la même rigueur théologique. Les utilisateurs choisissent leur sensibilité préférée ou profitent d'un espace mixte de dialogue.
                </p>
              </motion.div>

              {/* Point 2: Zero Ad, Offline First & Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -3 }}
                className="space-y-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-gold-bright/30 text-gold-deep flex items-center justify-center font-serif text-lg font-bold">2</div>
                <h3 className="font-serif text-xl font-bold text-[#856529]">Confidentialité & Recueillement</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aucune publicité, aucun algorithme d'attention agressif. SpiritTalk est un sanctuaire de silence et de concentration pour lire, méditer, et enregistrer vos notes personnelles dans un carnet spirituel intime.
                </p>
              </motion.div>

              {/* Point 3: Live API & Intelligent Search */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -3 }}
                className="space-y-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-serif text-lg font-bold">3</div>
                <h3 className="font-serif text-xl font-bold text-indigo-950">Accès direct aux API authentiques</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contrairement aux applications utilisant des résumés, notre lecteur de chapitre et de sourates est connecté en direct aux serveurs sacrés pour charger le texte littéral, verset par verset, dans des traductions validées.
                </p>
              </motion.div>

            </div>

            {/* Quote of Rumi on Tolerance */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="p-8 md:p-12 bg-white rounded-3xl border border-cream-darker text-center max-w-4xl mx-auto space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-16 h-16 bg-gold-bright/10 rounded-full blur-xl"></div>
              <blockquote className="font-serif text-lg md:text-xl text-slate-700 italic leading-relaxed">
                "La vérité est un miroir tombé des mains de Dieu et qui s'est brisé. Chacun en ramasse un morceau et croit détenir toute la vérité. SpiritTalk cherche à assembler ces morceaux pour contempler la beauté de la lumière commune."
              </blockquote>
              <cite className="block text-xs uppercase tracking-widest text-slate-400 font-bold not-italic">
                — Inspiré de Jalâl ad-Dîn Rûmî
              </cite>
            </motion.div>

          </div>
        </section>

        {/* SECTION 4: CONTACTEZ-NOUS */}
        <section ref={contactRef} className="py-24 bg-white scroll-mt-20">
          <div className="max-w-3xl mx-auto px-6 space-y-12">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <span className="px-3 py-1 bg-emerald-medium/10 text-emerald-deep rounded-full text-[10px] font-bold uppercase tracking-widest">
                Support & Prières
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-emerald-deep">
                Entrons en contact
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto">
                Vous avez une question théologique, besoin d'aide pour utiliser l'application, ou souhaitez soumettre une intention de prière confidentielle ? Écrivez-nous librement.
              </p>
            </motion.div>

            {/* Beautiful Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#FDFBF7] rounded-3xl border border-cream-darker p-8 shadow-sm"
            >
              <form onSubmit={handleContactSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Votre Nom</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jean Diop"
                      className="w-full bg-white border border-cream-darker rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-medium focus:outline-none text-[#1E293B]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="jean@domain.com"
                      className="w-full bg-white border border-cream-darker rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-medium focus:outline-none text-[#1E293B]"
                    />
                  </div>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Objet de votre message</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-white border border-cream-darker rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-medium focus:outline-none text-[#1E293B] font-semibold"
                  >
                    <option value="Information">Demande d'information générale</option>
                    <option value="Prière">Intention de prière fraternelle</option>
                    <option value="Technique">Problème d'accès ou bug technique</option>
                    <option value="Partenariat">Soutien ou partenariat œcuménique</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Message ou Requête</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Écrivez ici vos doutes, demandes, ou remerciements..."
                    className="w-full bg-white border border-cream-darker rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-medium focus:outline-none text-[#1E293B]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 bg-emerald-deep hover:bg-emerald-medium text-white font-sans text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{isSubmittingContact ? "Envoi céleste en cours..." : "Envoyer mon message"}</span>
                  <Send className="w-3.5 h-3.5" />
                </motion.button>

              </form>
            </motion.div>

          </div>
        </section>


      </div>

      {/* FOOTER */}
      <footer className="bg-[#1D3557] text-white py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-gold-bright">SpiritTalk Sanctuary</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Dialogues Sacrés & Sagesse Connectée</p>
          </div>
          
          <p className="text-[10px] text-white/40 max-w-md md:text-right leading-relaxed">
            SpiritTalk est une application œcuménique indépendante visant à unir les fidèles par l'étude réciproque de la Bible et du Coran. Tous droits réservés © 2026.
          </p>
        </div>
      </footer>

      {/* Contact Success Overlay */}
      <AnimatePresence>
        {showContactSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-cream-darker shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-emerald-deep">Message Reçu en Paix</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Votre message a bien été envoyé au support de SpiritTalk. Nos modérateurs et guides de paix vous répondront par email sous un délai de 24h. Que la bénédiction vous accompagne !
                </p>
              </div>

              <button
                onClick={() => setShowContactSuccess(false)}
                className="w-full py-3 bg-emerald-deep text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-emerald-medium transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

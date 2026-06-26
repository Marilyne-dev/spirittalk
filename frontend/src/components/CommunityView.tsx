import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageCircle, Share2, Plus, Image as ImageIcon, Video, Send, 
  UserPlus, UserCheck, Search, Users, Bell, Trash2, Shield, Sparkles, BookOpen, Moon, Book
} from 'lucide-react';
import { CommunityPost, Friend, SpiritNotification, Religion, PostComment } from '../types';

interface CommunityViewProps {
  user: any;
  posts: CommunityPost[];
  friends: Friend[];
  notifications: SpiritNotification[];
  onAddPost: (content: string, images: string[], videoUrl?: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onSendFriendRequest: (friendId: string) => void;
  onAcceptFriendRequest: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onClearNotification: (notifId: string) => void;
  onNavigateToChat: () => void;
  onSearchMembers: (query: string) => void;
}

export default function CommunityView({
  user,
  posts,
  friends,
  notifications,
  onAddPost,
  onLikePost,
  onAddComment,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRemoveFriend,
  onClearNotification,
  onNavigateToChat,
  onSearchMembers
}: CommunityViewProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'notifications'>('feed');
  const [feedFilter, setFeedFilter] = useState<'All' | 'Chrétienne' | 'Musulmane'>('All');
  
  // Post Creation States
  const [newPostText, setNewPostText] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedVideoUrl, setAttachedVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Active Comment input states
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Friends search filter
  const [friendsSearch, setFriendsSearch] = useState('');
  const [friendsFilter, setFriendsFilter] = useState<'All' | 'Chrétienne' | 'Musulmane'>('All');

  useEffect(() => {
    if (activeTab !== 'friends') return;
    const timeoutId = window.setTimeout(() => {
      onSearchMembers(friendsSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, friendsSearch, onSearchMembers]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingImage(true);

    const loadPromises = Array.from(files).map((file: any) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loadPromises).then((results) => {
      setAttachedImages((prev) => [...prev, ...results]);
      setIsUploadingImage(false);
    });
  };

  const handleAddPresetImage = () => {
    // Elegant placeholders that fit the spirit
    const presets = [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=400',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=400',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400'
    ];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setAttachedImages((prev) => [...prev, randomPreset]);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && attachedImages.length === 0 && !attachedVideoUrl) return;

    onAddPost(newPostText, attachedImages, attachedVideoUrl || undefined);
    setNewPostText('');
    setAttachedImages([]);
    setAttachedVideoUrl('');
    setShowVideoInput(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text.trim());
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'All') return true;
    return post.religion === feedFilter;
  });

  const filteredFriends = friends.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(friendsSearch.toLowerCase()) || 
                          f.username.toLowerCase().includes(friendsSearch.toLowerCase()) ||
                          (f.profession && f.profession.toLowerCase().includes(friendsSearch.toLowerCase()));
    const matchesReligion = friendsFilter === 'All' || f.religion === friendsFilter;
    return matchesSearch && matchesReligion;
  });

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-medium" />
          <span>La Communauté SpiritTalk</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-cream-base/60 leading-relaxed">
          Partagez vos réflexions spirituelles, posez des questions, liez des amitiés chrétiennes et musulmanes et grandissez ensemble dans la foi.
        </p>
      </div>

      {/* Community Sub-Tabs */}
      <div className="grid grid-cols-3 bg-cream-darker/40 dark:bg-charcoal-card/40 p-1 rounded-xl border border-cream-darker dark:border-charcoal-light/10">
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'feed'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Actualités</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'friends'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Membres & Amis</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'notifications'
              ? 'bg-white dark:bg-charcoal-card text-emerald-deep dark:text-gold-bright shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-cream-base/80'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadNotifCount > 0 && (
            <span className="absolute top-1.5 right-4 bg-red-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold animate-bounce">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB CONTENT: NEWS FEED --- */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post Card */}
          <form onSubmit={handleCreatePost} className="bg-white dark:bg-charcoal-card p-4 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gold-muted/40 bg-slate-100">
                <img src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'} className="w-full h-full object-cover" alt="" />
              </div>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={`Partagez vos méditations, vos doutes ou vos joies, ${user?.name}...`}
                className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-cream-base/30 text-emerald-deep dark:text-cream-base py-1"
                rows={3}
              />
            </div>

            {/* Attached media grid */}
            {attachedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-cream-darker dark:border-charcoal-light/20 group">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Input Box */}
            {showVideoInput && (
              <div className="p-3 bg-cream-base/30 dark:bg-charcoal-dark/50 rounded-xl space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Lien Vidéo (YouTube ou direct MP4)</label>
                <input
                  type="text"
                  value={attachedVideoUrl}
                  onChange={(e) => setAttachedVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-cream-darker bg-white dark:bg-charcoal-dark text-slate-800 dark:text-cream-base focus:outline-none"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-cream-darker/60 dark:border-charcoal-light/10">
              <div className="flex gap-1">
                {/* Real image uploader */}
                <label className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-emerald-medium dark:hover:text-gold-bright hover:bg-slate-50 dark:hover:bg-charcoal-light/20 transition-all flex items-center gap-1.5 text-xs font-semibold">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4 text-emerald-medium" />
                  <span className="hidden sm:inline">Ajouter Photos</span>
                </label>

                {/* Preset imagery shortcut */}
                <button
                  type="button"
                  onClick={handleAddPresetImage}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-medium hover:bg-slate-50 dark:hover:bg-charcoal-light/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Image Spirituelle</span>
                </button>

                {/* Video Link */}
                <button
                  type="button"
                  onClick={() => setShowVideoInput(!showVideoInput)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-medium hover:bg-slate-50 dark:hover:bg-charcoal-light/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Video className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Lien Vidéo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newPostText.trim() && attachedImages.length === 0 && !attachedVideoUrl}
                className="px-4 py-2 bg-emerald-medium text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-deep transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publier</span>
              </button>
            </div>
          </form>

          {/* Feed Filter Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setFeedFilter('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                feedFilter === 'All'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-charcoal-card text-slate-500 dark:text-cream-base/60'
              }`}
            >
              Tous les posts
            </button>
            <button
              onClick={() => setFeedFilter('Chrétienne')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                feedFilter === 'Chrétienne'
                  ? 'bg-emerald-medium text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-charcoal-card text-slate-500 dark:text-cream-base/60'
              }`}
            >
              <Book className="w-3 h-3" />
              <span>Chrétiens</span>
            </button>
            <button
              onClick={() => setFeedFilter('Musulmane')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                feedFilter === 'Musulmane'
                  ? 'bg-gold-deep text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-charcoal-card text-slate-500 dark:text-cream-base/60'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Musulmans</span>
            </button>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isBible = post.religion === 'Chrétienne';
              const isQuran = post.religion === 'Musulmane';
              const showComments = activeCommentId === post.id;

              return (
                <div key={post.id} className="p-6 bg-white dark:bg-charcoal-card rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                        <img src={post.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1">
                          {post.name}
                          {post.religion === 'Chrétienne' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-medium" title="Chrétien" />
                          ) : post.religion === 'Musulmane' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-deep" title="Musulman" />
                          ) : null}
                        </h4>
                        <p className="text-[10px] text-slate-400">@{post.username} • {post.time}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isBible 
                        ? 'bg-emerald-fixed/60 text-emerald-deep' 
                        : isQuran
                        ? 'bg-gold-bright/20 text-gold-deep dark:text-gold-bright border border-gold-muted/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {post.religion}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="text-sm text-slate-800 dark:text-cream-base/95 leading-relaxed">
                    {post.content}
                  </div>

                  {/* Dynamic Multi-Images Render */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-1.5 rounded-xl overflow-hidden mt-2 ${
                      post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {post.images.map((img, i) => (
                        <div key={i} className="relative aspect-video">
                          <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video Render */}
                  {post.videoUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black mt-2">
                      {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${post.videoUrl.split('v=')[1]?.split('&')[0] || ''}`}
                          title="Video presentation"
                          allowFullScreen
                        />
                      ) : (
                        <video src={post.videoUrl} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}

                  {/* Verses references attachment */}
                  {post.verse_reference && (
                    <div className="p-4 rounded-xl bg-cream-base/40 dark:bg-charcoal-dark/40 border border-cream-darker/60 italic text-xs leading-relaxed space-y-1">
                      <p className="text-emerald-deep dark:text-cream-base">"{post.verse_text}"</p>
                      <p className="text-right font-semibold text-slate-500">— {post.verse_reference}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-cream-darker/60 dark:border-charcoal-light/10 text-xs">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${
                        post.likedByMe ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                      <span>{post.likes} J'aime</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentId(showComments ? null : post.id)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-medium font-bold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} Commentaire{post.comments.length > 1 ? 's' : ''}</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`"${post.content}" — Partagé par @${post.username} sur SpiritTalk`);
                        alert("Partage copié !");
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Partager</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="pt-4 border-t border-cream-darker/30 dark:border-charcoal-light/10 space-y-4 animate-fade-in">
                      {/* Comments list */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 items-start bg-slate-50 dark:bg-charcoal-dark/40 p-2.5 rounded-xl text-xs">
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                              <img src={comment.authorAvatar} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-emerald-deep dark:text-cream-base">{comment.authorName}</span>
                                <span className="text-[9px] text-slate-400">{comment.time}</span>
                              </div>
                              <p className="text-slate-600 dark:text-cream-base/80 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {post.comments.length === 0 && (
                          <p className="text-center text-[11px] text-slate-400 italic py-2">Aucun commentaire pour le moment. Soyez le premier à donner votre avis spirituel !</p>
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                          placeholder="Écrire votre avis fraternel..."
                          className="flex-grow text-xs bg-slate-100 dark:bg-charcoal-dark rounded-xl px-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-emerald-medium text-slate-800 dark:text-cream-base"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-2 bg-emerald-medium text-white rounded-xl hover:bg-emerald-deep transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MEMBERS & FRIENDS --- */}
      {activeTab === 'friends' && (() => {
        const myRelations = filteredFriends.filter(f => f.status && f.status !== 'none');
        const discoverRelations = filteredFriends.filter(f => !f.status || f.status === 'none');

        return (
          <div className="space-y-6">
            {/* User's Public Profile Card - Facebook-style indicator */}
            <div className="bg-gradient-to-r from-emerald-medium/10 via-emerald-deep/5 to-gold-deep/10 border border-cream-darker dark:border-charcoal-light/10 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-medium shrink-0 shadow-sm">
                  <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-medium tracking-wider bg-emerald-medium/10 px-2.5 py-0.5 rounded-full">Mon Profil Communautaire (Public)</span>
                  <h4 className="font-serif text-base font-bold text-slate-800 dark:text-cream-base flex items-center gap-2 mt-1">
                    {user?.name}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                      user?.religion === 'Chrétienne' ? 'bg-emerald-medium/10 text-emerald-medium' : 'bg-gold-deep/10 text-gold-deep'
                    }`}>
                      Fidèle {user?.religion}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">@{user?.username || 'utilisateur'} • {user?.profession || 'Membres Actif de la Communauté'}</p>
                </div>
              </div>
              <div className="text-left md:text-right shrink-0">
                <div className="text-[10px] text-slate-500 dark:text-cream-base/60">
                  Statut : <span className="font-bold text-green-500 animate-pulse">● En ligne</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Vous êtes visible dans l'annuaire public</p>
              </div>
            </div>

            {/* Controls Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="glass-panel rounded-xl p-2 flex items-center gap-2 border border-cream-darker bg-white/80 dark:bg-charcoal-card/80">
                <Search className="w-4 h-4 text-slate-400 ml-1.5" />
                <input
                  type="text"
                  value={friendsSearch}
                  onChange={(e) => setFriendsSearch(e.target.value)}
                  placeholder="Rechercher par nom, prenom ou @username..."
                  className="flex-grow bg-transparent border-none focus:outline-none text-xs text-emerald-deep dark:text-cream-base py-1"
                />
              </div>

              <div className="flex gap-1 justify-end">
                <button
                  onClick={() => setFriendsFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    friendsFilter === 'All'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-card text-slate-500'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFriendsFilter('Chrétienne')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    friendsFilter === 'Chrétienne'
                      ? 'bg-emerald-medium text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-card text-slate-500'
                  }`}
                >
                  Chrétiens
                </button>
                <button
                  onClick={() => setFriendsFilter('Musulmane')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    friendsFilter === 'Musulmane'
                      ? 'bg-gold-deep text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-card text-slate-500'
                  }`}
                >
                  Musulmans
                </button>
              </div>
            </div>

            {/* SECTION 1: Mes Relations Fraternelles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-slate-700 dark:text-cream-base flex items-center gap-1.5">
                  <span>Mes Relations Fraternelles ({myRelations.length})</span>
                </h3>
                <span className="h-px bg-cream-darker dark:bg-charcoal-light/10 flex-grow ml-3"></span>
              </div>

              {myRelations.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50/50 dark:bg-charcoal-card/20 rounded-2xl border border-dashed border-cream-darker text-slate-400 text-xs italic">
                  Vous n'avez pas encore de relations fraternelles établies. Ajoutez des fidèles ci-dessous pour démarrer des échanges spirituels !
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRelations.map((friend) => {
                    const isAccepted = friend.status === 'accepted';
                    const isPendingSent = friend.status === 'pending_sent';
                    const isPendingReceived = friend.status === 'pending_received';

                    return (
                      <div key={friend.id} className="bg-white dark:bg-charcoal-card p-4 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                              <img src={friend.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </div>
                            {friend.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1.5">
                              {friend.name}
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                                friend.religion === 'Chrétienne' ? 'bg-emerald-medium/10 text-emerald-medium' : 'bg-gold-deep/10 text-gold-deep'
                              }`}>
                                {friend.religion}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-400">@{friend.username}</p>
                            {friend.profession && (
                              <p className="text-[10px] text-slate-500 dark:text-cream-base/60 italic mt-0.5">{friend.profession}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          {isAccepted ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={onNavigateToChat}
                                className="px-3 py-1.5 bg-[#1D3557] hover:bg-emerald-deep text-white font-bold text-[10px] uppercase tracking-wide rounded-lg"
                              >
                                Inbox
                              </button>
                              <button
                                onClick={() => onRemoveFriend(friend.id)}
                                className="px-2 py-1.5 border border-cream-darker hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg text-[10px]"
                                title="Retirer"
                              >
                                X
                              </button>
                            </div>
                          ) : isPendingSent ? (
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-charcoal-dark text-slate-400 font-bold text-[10px] uppercase rounded-lg border border-slate-200 dark:border-charcoal-light/10">
                              En attente
                            </span>
                          ) : isPendingReceived ? (
                            <button
                              onClick={() => onAcceptFriendRequest(friend.id)}
                              className="px-3 py-1.5 bg-emerald-medium hover:bg-emerald-deep text-white font-bold text-[10px] uppercase tracking-wide rounded-lg flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Accepter</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: Découvrir d'autres fidèles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-slate-700 dark:text-cream-base flex items-center gap-1.5">
                  <span>Découvrir d'autres fidèles ({discoverRelations.length})</span>
                </h3>
                <span className="h-px bg-cream-darker dark:bg-charcoal-light/10 flex-grow ml-3"></span>
              </div>

              {discoverRelations.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50/50 dark:bg-charcoal-card/20 rounded-2xl border border-dashed border-cream-darker text-slate-400 text-xs italic">
                  Aucun autre fidèle à découvrir pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoverRelations.map((friend) => {
                    return (
                      <div key={friend.id} className="bg-white dark:bg-charcoal-card p-4 rounded-2xl border border-cream-darker dark:border-charcoal-light/10 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                              <img src={friend.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </div>
                            {friend.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1.5">
                              {friend.name}
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                                friend.religion === 'Chrétienne' ? 'bg-emerald-medium/10 text-emerald-medium' : 'bg-gold-deep/10 text-gold-deep'
                              }`}>
                                {friend.religion}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-400">@{friend.username}</p>
                            {friend.profession && (
                              <p className="text-[10px] text-slate-500 dark:text-cream-base/60 italic mt-0.5">{friend.profession}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => onSendFriendRequest(friend.id)}
                            className="px-3 py-1.5 border border-[#759486] hover:bg-emerald-medium/10 text-[#759486] font-bold text-[10px] uppercase tracking-wide rounded-lg flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        );
      })()}

      {/* --- TAB CONTENT: NOTIFICATIONS --- */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                notif.isRead 
                  ? 'bg-white dark:bg-charcoal-card border-cream-darker dark:border-charcoal-light/10 opacity-70' 
                  : 'bg-emerald-medium/5 border-emerald-medium/20 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold text-emerald-deep dark:text-cream-base flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-medium animate-pulse" />
                  <span>{notif.title}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-cream-base/80">{notif.description}</p>
                <p className="text-[10px] text-slate-400">{notif.time}</p>
              </div>

              <div className="flex gap-2">
                {notif.type === 'friend_request' && (
                  <button
                    onClick={() => {
                      // auto find and accept request
                      const requestFrom = friends.find(f => f.name.includes(notif.title.split(' ')[0]));
                      if (requestFrom) onAcceptFriendRequest(requestFrom.id);
                      onClearNotification(notif.id);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-medium text-white font-bold text-[9px] uppercase tracking-wider rounded-lg"
                  >
                    Accepter
                  </button>
                )}
                <button
                  onClick={() => onClearNotification(notif.id)}
                  className="p-1.5 text-slate-300 hover:text-slate-500 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-charcoal-card border border-cream-darker dark:border-charcoal-light/10 rounded-2xl">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-emerald-deep dark:text-cream-base">Aucune notification</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Vos interactions avec vos amis chrétiens et musulmans apparaîtront ici en temps réel.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

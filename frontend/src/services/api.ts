import { Bookmark, Note, ReadingPlan, ChatMessage } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/spirittalk';

const getHeaders = () => {
  const token = localStorage.getItem('spirittalk_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // --- AUTHENTICATION ---
  async login(email: string, password: string) {
    localStorage.removeItem('spirittalk_token');
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 401 || response.status === 422) {
        const err = await response.json().catch(() => ({}));
        const msg = err?.errors?.email?.[0] || err?.message || 'Identifiants invalides';
        throw new Error(msg);
      }
      if (!response.ok) throw new Error('Serveur injoignable');
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('spirittalk_token', data.token);
        const currentSimulatedStr = localStorage.getItem('spirittalk_simulated_users');
        const currentSimulated = currentSimulatedStr ? JSON.parse(currentSimulatedStr) : [];
        const filtered = currentSimulated.filter((u: any) => u.email.toLowerCase() !== data.user.email.toLowerCase());
        filtered.push(data.user);
        localStorage.setItem('spirittalk_simulated_users', JSON.stringify(filtered));
        localStorage.setItem('spirittalk_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async register(name: string, username: string, email: string, password: string, religion: 'Chrétienne' | 'Musulmane' | 'Mixte') {
    localStorage.removeItem('spirittalk_token');
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, username, email, password, password_confirmation: password, religion }),
      });
      if (response.status === 422) {
        const err = await response.json().catch(() => ({}));
        const firstError = err?.errors ? Object.values(err.errors)[0] : null;
        const msg = (Array.isArray(firstError) ? firstError[0] : null) || err?.message || 'Données invalides';
        throw new Error(msg);
      }
      if (!response.ok) throw new Error('Erreur lors de l\'inscription');
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('spirittalk_token', data.token);
        const currentSimulatedStr = localStorage.getItem('spirittalk_simulated_users');
        const currentSimulated = currentSimulatedStr ? JSON.parse(currentSimulatedStr) : [];
        const filtered = currentSimulated.filter((u: any) => u.email.toLowerCase() !== data.user.email.toLowerCase());
        filtered.push(data.user);
        localStorage.setItem('spirittalk_simulated_users', JSON.stringify(filtered));
        localStorage.setItem('spirittalk_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async updateProfile(updates: { name?: string; email?: string; religion?: 'Chrétienne' | 'Musulmane' | 'Mixte'; avatar?: string }) {
    const savedUserStr = localStorage.getItem('spirittalk_user');
    const current = savedUserStr ? JSON.parse(savedUserStr) : null;
    if (current) {
      const updatedUser = { ...current, ...updates };
      localStorage.setItem('spirittalk_user', JSON.stringify(updatedUser));
      const currentSimulatedStr = localStorage.getItem('spirittalk_simulated_users');
      const currentSimulated = currentSimulatedStr ? JSON.parse(currentSimulatedStr) : [];
      const updatedList = currentSimulated.map((u: any) => {
        if (u.email.toLowerCase() === current.email.toLowerCase() || u.id?.toString() === current.id?.toString()) {
          return { ...u, ...updates };
        }
        return u;
      });
      const exists = currentSimulated.some((u: any) => u.email.toLowerCase() === current.email.toLowerCase() || u.id?.toString() === current.id?.toString());
      if (!exists) {
        updatedList.push(updatedUser);
      }
      localStorage.setItem('spirittalk_simulated_users', JSON.stringify(updatedList));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
      const data = await response.json();
      localStorage.setItem('spirittalk_user', JSON.stringify(data.user || data));
      return data;
    } catch (error) {
      console.warn("Laravel Backend Profile Update failed, using local simulation", error);
      const savedUserStr = localStorage.getItem('spirittalk_user');
      const current = savedUserStr ? JSON.parse(savedUserStr) : { id: 1, name: 'Seeker', email: 'seeker@example.com', religion: 'Mixte', xp_points: 1200, level: 'Explorateur Sage' };
      const updatedUser = { ...current, ...updates };
      localStorage.setItem('spirittalk_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    }
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (error) {
      console.warn("Laravel Backend Logout failed", error);
    } finally {
      localStorage.removeItem('spirittalk_token');
      localStorage.removeItem('spirittalk_user');
    }
  },

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Session expirée');
      return await response.json();
    } catch (error) {
      const savedUser = localStorage.getItem('spirittalk_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
  },

  // --- FAVORITE VERSES (BOOKMARKS) ---
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-verses`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      return data.map((fav: any) => ({
        id: fav.id.toString(),
        verseText: fav.text,
        reference: fav.reference,
        source: fav.source,
        savedAt: new Date(fav.created_at).toLocaleDateString('fr-FR'),
      }));
    } catch (error) {
      console.warn("Using localStorage for favorites/bookmarks", error);
      const saved = localStorage.getItem('spirittalk_bookmarks');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addBookmark(source: string, book: string, chapter: number, verse: number, text: string, reference: string): Promise<Bookmark> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-verses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ source, book, chapter, verse, text, reference }),
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const fav = await response.json();
      return {
        id: fav.id.toString(),
        verseText: fav.text,
        reference: fav.reference,
        source: fav.source,
        savedAt: "Aujourd'hui",
      };
    } catch (error) {
      console.warn("Local storage save for bookmark", error);
      const bookmarks = JSON.parse(localStorage.getItem('spirittalk_bookmarks') || '[]');
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}`,
        verseText: text,
        reference,
        source,
        savedAt: "Aujourd'hui",
      };
      localStorage.setItem('spirittalk_bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
      return newBookmark;
    }
  },

  async deleteBookmark(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-verses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.warn("Local storage delete for bookmark", error);
      const bookmarks = JSON.parse(localStorage.getItem('spirittalk_bookmarks') || '[]');
      const filtered = bookmarks.filter((bm: Bookmark) => bm.id !== id);
      localStorage.setItem('spirittalk_bookmarks', JSON.stringify(filtered));
      return true;
    }
  },

  // --- USER REFLECTION NOTES (JOURNAL) ---
  async getNotes(): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-notes`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      return data.map((note: any) => ({
        id: note.id.toString(),
        title: note.title,
        content: note.content,
        date: new Date(note.created_at).toLocaleDateString('fr-FR'),
        category: note.category || 'Silence'
      }));
    } catch (error) {
      console.warn("Using localStorage for notes", error);
      const saved = localStorage.getItem('spirittalk_notes');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addNote(title: string, content: string, category: Note['category']): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, content, category }),
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const note = await response.json();
      return {
        id: note.id.toString(),
        title: note.title,
        content: note.content,
        date: "Aujourd'hui",
        category: note.category || 'Silence'
      };
    } catch (error) {
      console.warn("Local storage save for note", error);
      const notes = JSON.parse(localStorage.getItem('spirittalk_notes') || '[]');
      const newNote: Note = {
        id: `note_${Date.now()}`,
        title,
        content,
        date: "Aujourd'hui",
        category
      };
      localStorage.setItem('spirittalk_notes', JSON.stringify([newNote, ...notes]));
      return newNote;
    }
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-notes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.warn("Local storage delete for note", error);
      const notes = JSON.parse(localStorage.getItem('spirittalk_notes') || '[]');
      const filtered = notes.filter((n: Note) => n.id !== id);
      localStorage.setItem('spirittalk_notes', JSON.stringify(filtered));
      return true;
    }
  },

  // --- QUIZ SCORES ---
  async saveQuizScore(score: number, totalQuestions: number, theme: string, source: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-scores`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ score, total_questions: totalQuestions, theme, source, played_at: new Date().toISOString().split('T')[0] }),
      });
      return await response.json();
    } catch (error) {
      console.warn("Failed to post quiz score to Laravel backend", error);
      return { success: true, score, totalQuestions };
    }
  },

  // --- SOCIAL PUBLIC INSPIRATIONS ---
  async getInspirations() {
    try {
      const response = await fetch(`${API_BASE_URL}/inspirations`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch public inspirations from Laravel backend", error);
      return null;
    }
  },

  async createInspiration(content: string, verseReference?: string, verseText?: string, source?: string, images?: string[], videoUrl?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/inspirations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          content,
          verse_reference: verseReference,
          verse_text: verseText,
          source,
          images,
          video_url: videoUrl,
          is_public: true
        }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to create public inspiration on Laravel backend", error);
      return null;
    }
  },

  async addInspirationComment(id: string, content: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/inspirations/${id}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to add comment on Laravel backend", error);
      return null;
    }
  },

  async likeInspiration(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/inspirations/${id}/like`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to like inspiration on Laravel backend", error);
      return null;
    }
  },

  // --- READING PLANS & PROGRESSION ---
  async getReadingPlans(): Promise<ReadingPlan[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-plans`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        progress: item.progress?.percentage || 0,
        category: item.theme,
        totalChapters: item.duration_days,
        currentChapter: item.progress?.current_day || 0
      }));
    } catch (error) {
      console.warn("Failed to fetch reading plans from Laravel backend, using simulation", error);
      const saved = localStorage.getItem('spirittalk_reading_plans');
      if (saved) return JSON.parse(saved);
      const defaultPlans: ReadingPlan[] = [
        { id: 'plan_peace', title: "La Paix Intérieure", progress: 65, category: "Paix", totalChapters: 7, currentChapter: 4 },
        { id: 'plan_wisdom', title: "Sagesse des Anciens", progress: 12, category: "Sagesse", totalChapters: 10, currentChapter: 1 },
        { id: 'plan_forgiveness', title: "Le chemin du Pardon", progress: 0, category: "Pardon", totalChapters: 5, currentChapter: 0 }
      ];
      localStorage.setItem('spirittalk_reading_plans', JSON.stringify(defaultPlans));
      return defaultPlans;
    }
  },

  async updateReadingProgress(planId: string, currentDay: number, percentage: number, completed: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-progress`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reading_plan_id: planId,
          current_day: currentDay,
          percentage,
          completed
        }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return response.ok;
    } catch (error) {
      console.warn("Failed to update reading progress on Laravel backend, saving locally", error);
      const savedPlans = JSON.parse(localStorage.getItem('spirittalk_reading_plans') || '[]');
      const updated = savedPlans.map((p: ReadingPlan) => {
        if (p.id === planId) {
          return { ...p, currentChapter: currentDay, progress: percentage };
        }
        return p;
      });
      localStorage.setItem('spirittalk_reading_plans', JSON.stringify(updated));
      return true;
    }
  },

  async getFriendships(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch friendships from Laravel backend", error);
      return [];
    }
  },

  async sendFriendRequest(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to send friend request to Laravel backend", error);
      return null;
    }
  },

  async acceptFriendRequest(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/${userId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to accept friend request on Laravel backend", error);
      return null;
    }
  },

  async removeFriend(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.warn("Failed to remove friendship on Laravel backend", error);
      return false;
    }
  },

  async getDirectMessages(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch direct messages from Laravel backend", error);
      return [];
    }
  },

  async sendDirectMessage(recipientId: string, text?: string, images?: string[], audioUrl?: string, audioDuration?: string, callType?: 'audio' | 'video') {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          recipient_id: recipientId,
          text,
          images,
          audio_url: audioUrl,
          audio_duration: audioDuration,
          call_type: callType
        }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to send direct message to Laravel backend", error);
      return null;
    }
  },

  async sendTypingStatus(recipientId: string, isTyping: boolean) {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages/typing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ recipient_id: recipientId, is_typing: isTyping }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to send typing status to Laravel backend", error);
      return null;
    }
  },

  async sendCallSignal(recipientId: string, signal: any, type: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages/call-signal`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ recipient_id: recipientId, signal, type }),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to send call signal to Laravel backend", error);
      return null;
    }
  },

  // --- MESSAGERIE : LU / NON LU ---

  /**
   * Marque tous les messages d'un expéditeur comme lus.
   * Appelé quand l'utilisateur ouvre la conversation.
   */
  async markMessagesAsRead(senderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages/mark-read/${senderId}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return true;
    } catch (error) {
      console.warn("Failed to mark messages as read", error);
      return false;
    }
  },

  /**
   * Retourne le nombre de messages non lus par expéditeur.
   * Format : { [senderId: string]: number }
   * Ex: { "3": 5, "7": 2 }
   */
  async getUnreadCounts(): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${API_BASE_URL}/direct-messages/unread-counts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch unread counts", error);
      return {};
    }
  },

  async getRegisteredUsers(search = ''): Promise<any[]> {
    const query = search.trim();
    const queryString = query ? `?search=${encodeURIComponent(query)}` : '';
    const url = `${API_BASE_URL}/users${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      console.log(`[getRegisteredUsers] GET ${url} → HTTP ${response.status}`);

      if (!response.ok) {
        console.warn(`[getRegisteredUsers] API returned ${response.status}. Token présent: ${!!localStorage.getItem('spirittalk_token')}`);
        return [];
      }

      const data = await response.json();

      if (data && Array.isArray(data.users)) {
        console.log(`[getRegisteredUsers] ${data.users.length} utilisateurs reçus`);
        return data.users;
      }

      if (Array.isArray(data)) {
        console.log(`[getRegisteredUsers] ${data.length} utilisateurs reçus (tableau direct)`);
        return data;
      }

      console.warn('[getRegisteredUsers] Format inattendu:', JSON.stringify(data).substring(0, 200));
      return [];
    } catch (err) {
      console.error(`[getRegisteredUsers] Erreur réseau:`, err);
      return [];
    }
  }
};
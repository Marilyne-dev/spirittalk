import { Bookmark, Note, ReadingPlan, ChatMessage } from '../types';

// The API base URL defaults to the user's Laravel backend on AlwaysData
// Users can configure this in their .env as VITE_API_URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://marilyne.alwaysdata.net/api';

// Simple helper to get headers with Sanctum token if present
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

/**
 * Robust API Client that communicates with the Laravel Sanctum Backend.
 * Falls back to localStorage storage if the backend is not yet accessible,
 * ensuring flawless offline-first and development mode operation.
 */
export const apiService = {
  // --- AUTHENTICATION ---
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Identifiants invalides ou serveur injoignable');
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('spirittalk_token', data.token);
        localStorage.setItem('spirittalk_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.warn("Laravel Backend Login failed, using local simulation", error);
      // Simulate login for development/preview
      const mockUser = {
        id: 1,
        name: 'Seeker',
        username: 'seeker',
        email: email,
        religion: 'Mixte',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
        level: 'Explorateur Sage',
        xp_points: 1200
      };
      localStorage.setItem('spirittalk_token', 'mock_token_123456');
      localStorage.setItem('spirittalk_user', JSON.stringify(mockUser));
      return { token: 'mock_token_123456', user: mockUser };
    }
  },

  async register(name: string, username: string, email: string, password: string, religion: 'Chrétienne' | 'Musulmane' | 'Mixte') {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, username, email, password, religion }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'inscription');
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('spirittalk_token', data.token);
        localStorage.setItem('spirittalk_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.warn("Laravel Backend Register failed, using local simulation", error);
      const mockUser = {
        id: Date.now(),
        name,
        username,
        email,
        religion,
        avatar: religion === 'Chrétienne' 
          ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' 
          : religion === 'Musulmane' 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
        level: 'Explorateur',
        xp_points: 0
      };
      localStorage.setItem('spirittalk_token', 'mock_token_123456');
      localStorage.setItem('spirittalk_user', JSON.stringify(mockUser));
      return { token: 'mock_token_123456', user: mockUser };
    }
  },

  async updateProfile(updates: { name?: string; email?: string; religion?: 'Chrétienne' | 'Musulmane' | 'Mixte'; avatar?: string }) {
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

  async createInspiration(content: string, verseReference?: string, verseText?: string, source?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/inspirations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          content,
          verse_reference: verseReference,
          verse_text: verseText,
          source,
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
          return {
            ...p,
            currentChapter: currentDay,
            progress: percentage
          };
        }
        return p;
      });
      localStorage.setItem('spirittalk_reading_plans', JSON.stringify(updated));
      return true;
    }
  }
};

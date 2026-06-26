export interface Verse {
  id: string;
  text: string;
  reference: string;
  source: 'Bible' | 'Coran' | 'Autre';
  category: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
  source: string;
}

export interface InspirationCard {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  imageUrl: string;
  content: string; // The reading text
}

export interface Bookmark {
  id: string;
  verseText: string;
  reference: string;
  source: string;
  savedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Silence' | 'Gratitude' | 'Prière' | 'Méditation' | 'Autre';
}

export interface ReadingPlan {
  id: string;
  title: string;
  progress: number;
  category: string;
  totalChapters: number;
  currentChapter: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  scriptureQuote?: {
    text: string;
    reference: string;
    source: string;
  };
}

export type Religion = 'Chrétienne' | 'Musulmane' | 'Mixte';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  religion: Religion;
  avatar?: string;
  level: string;
  xp_points: number;
}

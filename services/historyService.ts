
import { ArticleComponents, AllImageDetails, AllPinterestContent } from './geminiService';

export interface SavedArticle {
  id: string;
  timestamp: number;
  title: string;
  keyword: string;
  content: string;
  components: ArticleComponents;
  images?: AllImageDetails;
  pinterest?: AllPinterestContent;
  youtube?: string;
  reelsScript?: string;
}

const STORAGE_KEY = 'content_toolkit_history';

export const getHistory = (): SavedArticle[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveToHistory = (article: Omit<SavedArticle, 'id' | 'timestamp'>): SavedArticle | null => {
  try {
      const history = getHistory();
      // Generate a simple unique ID
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const newEntry: SavedArticle = {
        ...article,
        id,
        timestamp: Date.now(),
      };
      // Add to beginning of list
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...history]));
      return newEntry;
  } catch (e) {
      console.error("Failed to save history", e);
      return null;
  }
};

export const updateHistoryItem = (id: string, updates: Partial<SavedArticle>) => {
    try {
        const history = getHistory();
        const index = history.findIndex(item => item.id === id);
        if (index !== -1) {
            history[index] = { ...history[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error("Failed to update history item", e);
    }
};

export const deleteFromHistory = (id: string) => {
    try {
        const history = getHistory();
        const filtered = history.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
        console.error("Failed to delete from history", e);
    }
}

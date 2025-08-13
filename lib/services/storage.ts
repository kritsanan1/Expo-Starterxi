
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Draft } from '../types';

export class StorageService {
  private static DRAFTS_KEY = '@social_media_app_drafts';

  static async saveDraft(draft: Omit<Draft, 'id' | 'created_at'>): Promise<string> {
    try {
      const drafts = await this.getDrafts();
      const newDraft: Draft = {
        ...draft,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      
      drafts.push(newDraft);
      await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(drafts));
      return newDraft.id;
    } catch (error) {
      console.error('Save draft error:', error);
      throw error;
    }
  }

  static async getDrafts(): Promise<Draft[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(this.DRAFTS_KEY);
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      console.error('Get drafts error:', error);
      return [];
    }
  }

  static async deleteDraft(id: string): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      const filteredDrafts = drafts.filter(draft => draft.id !== id);
      await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(filteredDrafts));
    } catch (error) {
      console.error('Delete draft error:', error);
      throw error;
    }
  }

  static async updateDraft(id: string, updates: Partial<Draft>): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      const draftIndex = drafts.findIndex(draft => draft.id === id);
      
      if (draftIndex !== -1) {
        drafts[draftIndex] = { ...drafts[draftIndex], ...updates };
        await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(drafts));
      }
    } catch (error) {
      console.error('Update draft error:', error);
      throw error;
    }
  }
}

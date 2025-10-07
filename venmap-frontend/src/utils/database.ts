// IndexedDB storage layer using Dexie.js
import Dexie, { type Table } from 'dexie';

// Database interfaces
export interface BusinessPlan {
  id?: number;
  name: string;
  template: string;
  data: Record<string, any>; // Form data
  generatedPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id?: number;
  businessPlanId?: number; // Optional reference to a business plan
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: number;
  sessionId: number;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  context?: string; // Business plan context used for this message
}

export interface UploadedDocument {
  id?: number;
  name: string;
  type: string; // MIME type
  content: string; // Text content (for .md, .txt files)
  size: number;
  uploadedAt: string;
  businessPlanId?: number; // Optional reference to associated business plan
}

export interface AppSettings {
  id?: number;
  key: string;
  value: any;
  updatedAt: string;
}

// Database class
export class VentureMapDB extends Dexie {
  // Tables
  businessPlans!: Table<BusinessPlan>;
  chatSessions!: Table<ChatSession>;
  chatMessages!: Table<ChatMessage>;
  uploadedDocuments!: Table<UploadedDocument>;
  appSettings!: Table<AppSettings>;

  constructor() {
    super('VentureMapDatabase');
    
    // Define schema
    this.version(1).stores({
      businessPlans: '++id, name, template, createdAt, updatedAt',
      chatSessions: '++id, businessPlanId, title, createdAt, updatedAt',
      chatMessages: '++id, sessionId, type, timestamp',
      uploadedDocuments: '++id, name, type, uploadedAt, businessPlanId',
      appSettings: '++id, &key, updatedAt'
    });
  }

  // Method to delete and recreate database
  async recreateDatabase(): Promise<void> {
    await this.delete();
    await this.open();
  }
}

// Database instance
export const db = new VentureMapDB();

// Storage service class
export class StorageService {
  // Initialize database with error handling
  static async initializeDatabase(): Promise<void> {
    try {
      await db.open();
    } catch (error) {
      console.warn('Database initialization failed, recreating...', error);
      await db.recreateDatabase();
    }
  }
  // Business Plans
  static async saveBusinessPlan(plan: Omit<BusinessPlan, 'id'>): Promise<number> {
    const timestamp = new Date().toISOString();
    
    // Check if plan with same name exists
    const existing = await db.businessPlans
      .where('name')
      .equals(plan.name)
      .and(p => p.template === plan.template)
      .first();
    
    if (existing) {
      // Update existing plan
      await db.businessPlans.update(existing.id!, {
        ...plan,
        updatedAt: timestamp
      });
      return existing.id!;
    } else {
      // Create new plan
      return await db.businessPlans.add({
        ...plan,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  }

  static async getBusinessPlans(): Promise<BusinessPlan[]> {
    return await db.businessPlans
      .orderBy('updatedAt')
      .reverse()
      .toArray();
  }

  static async getBusinessPlan(id: number): Promise<BusinessPlan | undefined> {
    return await db.businessPlans.get(id);
  }

  static async deleteBusinessPlan(id: number): Promise<void> {
    try {
      await db.transaction('rw', [db.businessPlans, db.chatSessions, db.chatMessages, db.uploadedDocuments], async () => {
        // Delete the business plan
        await db.businessPlans.delete(id);
        
        // Delete associated chat sessions and messages
        const sessions = await db.chatSessions.where('businessPlanId').equals(id).toArray();
        for (const session of sessions) {
          await db.chatMessages.where('sessionId').equals(session.id!).delete();
        }
        await db.chatSessions.where('businessPlanId').equals(id).delete();
        
        // Update uploaded documents to remove reference
        await db.uploadedDocuments.where('businessPlanId').equals(id).modify({businessPlanId: undefined});
      });
    } catch (error) {
      // If transaction fails due to missing object stores, try recreating database
      if (error instanceof Error && error.message.includes('object store was not found')) {
        console.warn('Database schema issue detected, recreating database...');
        await db.recreateDatabase();
        // Just delete the business plan without the complex transaction
        await db.businessPlans.delete(id);
      } else {
        throw error;
      }
    }
  }

  // Chat functionality
  static async createChatSession(title: string, businessPlanId?: number): Promise<number> {
    const timestamp = new Date().toISOString();
    return await db.chatSessions.add({
      title,
      businessPlanId,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  static async getChatSessions(businessPlanId?: number): Promise<ChatSession[]> {
    let query = db.chatSessions.orderBy('updatedAt').reverse();
    
    if (businessPlanId) {
      return await query.filter(session => session.businessPlanId === businessPlanId).toArray();
    }
    
    return await query.toArray();
  }

  static async addChatMessage(sessionId: number, type: 'user' | 'assistant', message: string, context?: string): Promise<number> {
    const messageId = await db.chatMessages.add({
      sessionId,
      type,
      message,
      context,
      timestamp: new Date().toISOString()
    });

    // Update session updated time
    await db.chatSessions.update(sessionId, {
      updatedAt: new Date().toISOString()
    });

    return messageId;
  }

  static async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db.chatMessages
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');
  }

  static async deleteChatSession(sessionId: number): Promise<void> {
    await db.transaction('rw', [db.chatSessions, db.chatMessages], async () => {
      await db.chatMessages.where('sessionId').equals(sessionId).delete();
      await db.chatSessions.delete(sessionId);
    });
  }

  // Document uploads
  static async saveDocument(document: Omit<UploadedDocument, 'id'>): Promise<number> {
    return await db.uploadedDocuments.add({
      ...document,
      uploadedAt: new Date().toISOString()
    });
  }

  static async getDocuments(businessPlanId?: number): Promise<UploadedDocument[]> {
    if (businessPlanId) {
      return await db.uploadedDocuments
        .where('businessPlanId')
        .equals(businessPlanId)
        .reverse()
        .sortBy('uploadedAt');
    }
    
    return await db.uploadedDocuments
      .toCollection()
      .reverse()
      .sortBy('uploadedAt');
  }

  static async deleteDocument(id: number): Promise<void> {
    await db.uploadedDocuments.delete(id);
  }

  // App settings
  static async setSetting(key: string, value: any): Promise<void> {
    const existing = await db.appSettings.where('key').equals(key).first();
    const timestamp = new Date().toISOString();
    
    if (existing) {
      await db.appSettings.update(existing.id!, { value, updatedAt: timestamp });
    } else {
      await db.appSettings.add({ key, value, updatedAt: timestamp });
    }
  }

  static async getSetting<T>(key: string, defaultValue?: T): Promise<T> {
    const setting = await db.appSettings.where('key').equals(key).first();
    return setting ? setting.value : defaultValue!;
  }

  // Migration from localStorage
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      // Migrate saved plans
      const savedPlans = localStorage.getItem('kiernan-ai-saved-plans');
      if (savedPlans && savedPlans !== '[]') {
        const plans = JSON.parse(savedPlans);
        if (Array.isArray(plans) && plans.length > 0) {
          for (const plan of plans) {
            await this.saveBusinessPlan({
              name: plan.name || plan.data?.businessName || 'Untitled Plan',
              template: plan.template || 'Standard Business Plan',
              data: plan.data || {},
              generatedPlan: plan.generatedPlan || '',
              createdAt: plan.createdAt || new Date().toISOString(),
              updatedAt: plan.updatedAt || new Date().toISOString()
            });
          }
          console.log(`✅ Migrated ${plans.length} business plans from localStorage`);
        }
      }

      // Migrate dark mode setting
      const darkMode = localStorage.getItem('kiernan-ai-dark-mode');
      if (darkMode) {
        await this.setSetting('darkMode', darkMode === 'true');
        console.log(`✅ Migrated dark mode setting: ${darkMode}`);
      }

      // Migrate API keys
      const apiKeys = localStorage.getItem('userApiKeys');
      if (apiKeys) {
        const keys = JSON.parse(apiKeys);
        await this.setSetting('userApiKeys', keys);
        console.log(`✅ Migrated API keys`);
      }

      console.log(`🎉 Migration from localStorage completed successfully!`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Database maintenance
  static async clearAllData(): Promise<void> {
    try {
      await db.transaction('rw', [
        db.businessPlans, 
        db.chatSessions, 
        db.chatMessages, 
        db.uploadedDocuments, 
        db.appSettings
      ], async () => {
        await db.businessPlans.clear();
        await db.chatSessions.clear();
        await db.chatMessages.clear();
        await db.uploadedDocuments.clear();
        await db.appSettings.clear();
      });
    } catch (error) {
      // If transaction fails, recreate database
      console.warn('Failed to clear data, recreating database...', error);
      await db.recreateDatabase();
    }
  }

  // Complete database reset
  static async resetDatabase(): Promise<void> {
    console.log('🔄 Resetting database...');
    await db.recreateDatabase();
    console.log('✅ Database reset complete');
  }

  static async getStorageStats(): Promise<{
    businessPlans: number;
    chatSessions: number;
    chatMessages: number;
    documents: number;
    settings: number;
  }> {
    return {
      businessPlans: await db.businessPlans.count(),
      chatSessions: await db.chatSessions.count(),
      chatMessages: await db.chatMessages.count(),
      documents: await db.uploadedDocuments.count(),
      settings: await db.appSettings.count()
    };
  }
}
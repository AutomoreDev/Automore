import { getDb } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';
import type { Transaction } from 'firebase-admin/firestore';

/**
 * Database configuration and utilities for Firestore
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Collections reference for type safety
   */
  public collections = {
    users: 'users',
    companies: 'companies',
    projects: 'projects',
    supportTickets: 'support_tickets',
    invoices: 'invoices',
    documents: 'documents',
    permissions: 'permissions',
    activities: 'activities',
    settings: 'settings',
    notifications: 'notifications'
  } as const;

  /**
   * Get Firestore database instance
   */
  public getDatabase() {
    return getDb();
  }

  /**
   * Get Firestore collection reference
   */
  public getCollection(collectionName: string) {
    return this.getDatabase().collection(collectionName);
  }

  /**
   * Get server timestamp
   */
  public getServerTimestamp() {
    return FieldValue.serverTimestamp();
  }

  /**
   * Get current timestamp as Date
   */
  public getCurrentTimestamp(): Date {
    return new Date();
  }

  /**
   * Batch write operations
   */
  public batch() {
    return this.getDatabase().batch();
  }

  /**
   * Transaction operations
   */
  public runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>) {
    return this.getDatabase().runTransaction(updateFunction);
  }
}

// Export singleton instance
export const dbConfig = DatabaseConfig.getInstance();

// Export convenient access to database
export const db = () => getDb();
export { FieldValue };
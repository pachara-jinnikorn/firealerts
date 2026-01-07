// src/services/sync.service.ts
// ============================================
// OFFLINE SYNC SERVICE
// ============================================
// Automatically syncs local records to Supabase when online

import { DatabaseService } from './database.service';

// Adjust this import based on your types location
interface Record {
  id: string;
  type: string;
  notes: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  polygons: Array<{
    coordinates: Array<[number, number]>;
  }>;
  photos: string[];
  timestamp: number;
  synced?: boolean;
}

export class SyncService {
  private static STORAGE_KEY = 'burnRecords';
  private static SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static isSyncing = false;

  /**
   * Sync all local records to Supabase
   */
  static async syncLocalRecords(): Promise<{ success: number; failed: number }> {
    // Prevent multiple simultaneous syncs
    if (this.isSyncing) {
      console.log('Sync already in progress...');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      // Get records from localStorage
      const localRecords = this.getLocalRecords();
      const unsynced = localRecords.filter(r => !r.synced);

      if (unsynced.length === 0) {
        console.log('✅ No records to sync');
        return { success: 0, failed: 0 };
      }

      console.log(`🔄 Syncing ${unsynced.length} records...`);

      for (const record of unsynced) {
        try {
          const supabaseId = await DatabaseService.saveRecord(record);
          
          if (supabaseId) {
            // Mark as synced
            this.markRecordAsSynced(record.id);
            successCount++;
            console.log(`✅ Synced record ${record.id}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to sync record ${record.id}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ Error syncing record ${record.id}:`, error);
        }
      }

      console.log(`🎉 Sync complete! Success: ${successCount}, Failed: ${failedCount}`);
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Setup automatic sync
   */
  static setupAutoSync(): void {
    console.log('🔧 Setting up auto-sync...');

    // Sync when app starts if online
    if (navigator.onLine) {
      console.log('📡 Online - starting initial sync...');
      this.syncLocalRecords();
    } else {
      console.log('📴 Offline - will sync when connection is restored');
    }

    // Sync when connection is restored
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored! Starting sync...');
      this.syncLocalRecords();
    });

    // Log when going offline
    window.addEventListener('offline', () => {
      console.log('📴 Connection lost. Records will be saved locally.');
    });

    // Periodic sync every 5 minutes if online
    setInterval(() => {
      if (navigator.onLine) {
        console.log('⏰ Periodic sync check...');
        this.syncLocalRecords();
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Get all local records from localStorage
   */
  private static getLocalRecords(): Record[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local records:', error);
      return [];
    }
  }

  /**
   * Mark a record as synced
   */
  private static markRecordAsSynced(recordId: string): void {
    try {
      const records = this.getLocalRecords();
      const updated = records.map(r => 
        r.id === recordId ? { ...r, synced: true } : r
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log(`✅ Marked record ${recordId} as synced`);
    } catch (error) {
      console.error('Error marking record as synced:', error);
    }
  }

  /**
   * Save a record locally (for offline use)
   */
  static saveRecordLocally(record: Record): void {
    try {
      const records = this.getLocalRecords();
      const updated = [...records, { ...record, synced: false }];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log(`💾 Saved record ${record.id} locally`);
    } catch (error) {
      console.error('Error saving record locally:', error);
    }
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): {
    total: number;
    synced: number;
    unsynced: number;
    isOnline: boolean;
  } {
    const records = this.getLocalRecords();
    const synced = records.filter(r => r.synced).length;
    const unsynced = records.filter(r => !r.synced).length;

    return {
      total: records.length,
      synced,
      unsynced,
      isOnline: navigator.onLine,
    };
  }

  /**
   * Force sync now (can be called manually)
   */
  static async forceSyncNow(): Promise<boolean> {
    if (!navigator.onLine) {
      console.log('❌ Cannot sync - no internet connection');
      return false;
    }

    const result = await this.syncLocalRecords();
    return result.failed === 0;
  }

  /**
   * Clear all local records (use with caution!)
   */
  static clearLocalRecords(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Cleared all local records');
    } catch (error) {
      console.error('Error clearing local records:', error);
    }
  }
}
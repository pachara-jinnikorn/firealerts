/**
 * RecordService - Business logic layer for handling history records
 * This service abstracts whether data comes from Supabase, a REST API, or Local Storage.
 */

import { DatabaseService } from './database.service';
import { storage, SavedRecord } from '../utils/storage';

export class RecordService {
    /**
     * Fetch all records for the user.
     * Priority: Cloud (Supabase) -> Local Cache
     */
    static async getAllRecords(userId: string): Promise<SavedRecord[]> {
        try {
            // 1. Try to fetch from cloud (Supabase)
            const cloudRecords = await DatabaseService.getUserRecords(userId);

            // 2. Map cloud records to App format if needed (already handled by DatabaseService)
            // 3. Merge with local-only drafts
            const localRecords = storage.getRecords();
            const drafts = localRecords.filter(r => r.status === 'draft');

            // Return combined list, with cloud records taking precedence for synced items
            return [...drafts, ...(cloudRecords as unknown as SavedRecord[])];
        } catch (error) {
            console.error('Failed to fetch records inside RecordService:', error);
            // Fallback to local storage if offline or error
            return storage.getRecords();
        }
    }

    /**
     * Save a record. 
     * If it's a draft, save locally.
     * If it's final (saved), save locally and attempt sync.
     */
    static async saveRecord(record: SavedRecord): Promise<boolean> {
        // Always save locally first (Offline-first approach)
        storage.saveRecord(record);

        if (record.status === 'saved') {
            // Attempt to sync to cloud
            const supabaseId = await DatabaseService.saveRecord(record as any);
            if (supabaseId) {
                // Update local record as synced
                storage.saveRecord({
                    ...record,
                    synced: true,
                    supabaseId
                });
                return true;
            }
        }
        return true;
    }


    }

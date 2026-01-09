export interface SavedRecord {
  id: string;
  type: 'rice' | 'sugarcane';
  date: string;
  time: string;
  synced?: boolean;      // Tracks if the record is uploaded to Supabase
  supabaseId?: string;   // Stores the remote UUID
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  polygons: Array<{
    id: string;
    points: [number, number][];
    area: number;
    type: 'burn' | 'non-burn';
    color: string;
  }>;
  // Rice specific
  riceFieldType?: 'dry' | 'wet' | 'unspecified';
  riceVariety?: string;
  // Sugarcane specific
  burnType?: 'before' | 'after' | 'unspecified';
  activities?: {
    plowing: boolean;
    collecting: boolean;
    other: boolean;
    otherText?: string;
  };
  remarks?: string;
  photos?: string[]; // Base64 encoded images
  createdAt: string;
  status: 'draft' | 'saved';
}

const STORAGE_KEY_BASE = 'burn_area_records';
const USER_ID_KEY = 'current_user_id';
const getStorageKey = () => {
  try {
    const userId = localStorage.getItem(USER_ID_KEY);
    return `${STORAGE_KEY_BASE}:${userId || 'guest'}`;
  } catch {
    return `${STORAGE_KEY_BASE}:guest`;
  }
};

export const storage = {
  // Get all records
  getRecords: (): SavedRecord[] => {
    try {
      const key = getStorageKey();
      let data = localStorage.getItem(key);
      if (!data) {
        const legacy = localStorage.getItem(STORAGE_KEY_BASE);
        if (legacy) {
          localStorage.setItem(key, legacy);
          localStorage.removeItem(STORAGE_KEY_BASE);
          data = legacy;
        }
      }
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  },

  // Get record by ID
  getRecord: (id: string): SavedRecord | null => {
    const records = storage.getRecords();
    return records.find(r => r.id === id) || null;
  },

  // Save a new record
  saveRecord: (record: SavedRecord): void => {
    try {
      const records = storage.getRecords();
      const existingIndex = records.findIndex(r => r.id === record.id);

      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.unshift(record); // Add to beginning
      }

      localStorage.setItem(getStorageKey(), JSON.stringify(records));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  // Delete a record
  deleteRecord: (id: string): void => {
    try {
      const records = storage.getRecords();
      const filtered = records.filter(r => r.id !== id);
      localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from storage:', error);
    }
  },

  // Update record status from draft to saved
  updateRecordStatus: (id: string, status: 'draft' | 'saved'): void => {
    try {
      const records = storage.getRecords();
      const record = records.find(r => r.id === id);
      if (record) {
        record.status = status;
        localStorage.setItem(getStorageKey(), JSON.stringify(records));
      }
    } catch (error) {
      console.error('Error updating record status:', error);
    }
  },

  // Get records by type
  getRecordsByType: (type: 'rice' | 'sugarcane'): SavedRecord[] => {
    const records = storage.getRecords();
    return records.filter(r => r.type === type);
  },

  // Get statistics
  getStats: () => {
    const records = storage.getRecords();
    const riceRecords = records.filter(r => r.type === 'rice');
    const sugarcaneRecords = records.filter(r => r.type === 'sugarcane');

    const totalRiceArea = riceRecords.reduce((sum, r) =>
      sum + r.polygons.reduce((pSum, p) => pSum + p.area, 0), 0);

    const totalSugarcaneArea = sugarcaneRecords.reduce((sum, r) =>
      sum + r.polygons.reduce((pSum, p) => pSum + p.area, 0), 0);

    return {
      total: records.length,
      rice: riceRecords.length,
      sugarcane: sugarcaneRecords.length,
      totalRiceArea: totalRiceArea / 1600, // in rai
      totalSugarcaneArea: totalSugarcaneArea / 1600, // in rai
    };
  },

  // Cleanup legacy sample data
  purgeSampleData: (): void => {
    try {
      const records = storage.getRecords();
      // Known sample IDs from previous versions
      const sampleIds = ['sample-rice-1', 'sample-sugarcane-1', 'sample-rice-draft'];

      const hasSampleData = records.some(r => sampleIds.includes(r.id));
      if (hasSampleData) {
        console.log('Purging legacy sample data...');
        const cleanRecords = records.filter(r => !sampleIds.includes(r.id));
        localStorage.setItem(getStorageKey(), JSON.stringify(cleanRecords));
      }
    } catch (e) {
      console.error('Error purging sample data:', e);
    }
  },
  // Nuke everything (Panic Button)
  clearAllData: (): void => {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(k => k.startsWith('burn_area_records'));
      appKeys.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('current_user_id');
      console.log('All local data cleared.');
    } catch (e) {
      console.error('Error clearing data:', e);
    }
  }
};

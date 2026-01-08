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
  burnType?: 'before' | 'after';
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

  // Initialize sample data with photos
  initializeSampleData: (): void => {
    const records = storage.getRecords();
    if (records.length > 0) return; // Don't add sample data if records exist

    const sampleRecords: SavedRecord[] = [
      // Rice field sample
      {
        id: 'sample-rice-1',
        type: 'rice',
        date: '2025-01-03',
        time: '14:30',
        location: {
          lat: 13.7563,
          lng: 100.5018,
          accuracy: 5,
        },
        polygons: [
          {
            id: 'poly-1',
            points: [
              [13.7563, 100.5018],
              [13.7565, 100.5018],
              [13.7565, 100.5020],
              [13.7563, 100.5020],
            ],
            area: 3200,
            type: 'burn',
            color: '#ef4444',
          },
          {
            id: 'poly-2',
            points: [
              [13.7563, 100.5020],
              [13.7565, 100.5020],
              [13.7565, 100.5022],
              [13.7563, 100.5022],
            ],
            area: 1600,
            type: 'non-burn',
            color: '#22c55e',
          },
        ],
        riceFieldType: 'dry',
        riceVariety: 'กข15',
        remarks: 'เผาฟางข้าวหลังเก็บเกี่ยว พื้นที่ดินดี อากาศดีเหมาะแก่การเผา',
        photos: [
          'https://images.unsplash.com/photo-1686765990667-dc4e5b6638a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZmllbGQlMjBidXJuaW5nfGVufDF8fHx8MTc2NzYwNTMwMXww&ixlib=rb-4.1.0&q=80&w=1080',
          'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3Njc1NTgyNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        ],
        createdAt: new Date('2025-01-03T14:30:00').toISOString(),
        status: 'saved',
      },
      // Sugarcane field sample
      {
        id: 'sample-sugarcane-1',
        type: 'sugarcane',
        date: '2025-01-02',
        time: '10:15',
        location: {
          lat: 13.7500,
          lng: 100.5100,
          accuracy: 8,
        },
        polygons: [
          {
            id: 'poly-3',
            points: [
              [13.7500, 100.5100],
              [13.7503, 100.5100],
              [13.7503, 100.5103],
              [13.7500, 100.5103],
            ],
            area: 4800,
            type: 'burn',
            color: '#ef4444',
          },
        ],
        burnType: 'before',
        activities: {
          plowing: true,
          collecting: false,
          other: true,
          otherText: 'พรวนดินและใส่ปุ๋ย',
        },
        remarks: 'เผาใบอ้อยก่อนตัด ทำให้การเก็บเกี่ยวง่ายขึ้น',
        photos: [
          'https://images.unsplash.com/photo-1652798909993-efcb4841b3b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhcmNhbmUlMjBoYXJ2ZXN0JTIwYnVybmluZ3xlbnwxfHx8fDE3Njc2MDUzMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          'https://images.unsplash.com/photo-1750316025900-a40f88744828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBidXJuaW5nJTIwZmFybXxlbnwxfHx8fDE3Njc2MDUzMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        ],
        createdAt: new Date('2025-01-02T10:15:00').toISOString(),
        status: 'saved',
      },
      // Draft example
      {
        id: 'sample-rice-draft',
        type: 'rice',
        date: '2025-01-04',
        time: '16:45',
        location: {
          lat: 13.7600,
          lng: 100.4950,
          accuracy: 10,
        },
        polygons: [
          {
            id: 'poly-4',
            points: [
              [13.7600, 100.4950],
              [13.7602, 100.4950],
              [13.7602, 100.4952],
              [13.7600, 100.4952],
            ],
            area: 2400,
            type: 'burn',
            color: '#ef4444',
          },
        ],
        riceFieldType: 'wet',
        riceVariety: 'ปทุมธานี 1',
        remarks: 'ยังไม่เสร็จ รอตรวจสอบเพิ่มเติม',
        photos: [
          'https://images.unsplash.com/photo-1686765990667-dc4e5b6638a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZmllbGQlMjBidXJuaW5nfGVufDF8fHx8MTc2NzYwNTMwMXww&ixlib=rb-4.1.0&q=80&w=1080',
        ],
        createdAt: new Date('2025-01-04T16:45:00').toISOString(),
        status: 'draft',
      },
    ];

    localStorage.setItem(getStorageKey(), JSON.stringify(sampleRecords));
  }
};

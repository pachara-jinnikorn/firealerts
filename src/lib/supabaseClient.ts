// src/lib/supabaseClient.ts
// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================
// Replace the values below with your actual Supabase credentials
// Find them at: Supabase Dashboard > Settings > API

import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual values from Supabase dashboard
const supabaseUrl = 'https://qrqubfyuxpzdksnijhhy.supabase.co'; // Your Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycXViZnl1eHB6ZGtzbmlqaGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODUwOTUsImV4cCI6MjA4MzI2MTA5NX0.oHTo182eAacbtUQQ9ex8n7R7gEKRe4SP2FE-rjb8Bso'; // Your anon/public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session so the user stays logged in
    persistSession: true,
    // Auto-refresh tokens
    autoRefreshToken: true,
  },
});

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface BurnRecord {
  id: string;
  user_id: string;
  record_type: string;
  notes: string | null;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  location_name: string | null;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_id: string | null;
}

export interface BurnPolygon {
  id: string;
  record_id: string;
  geometry: any; // GeoJSON
  area_sqm: number;
  created_at: string;
}

export interface BurnPhoto {
  id: string;
  record_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}
// src/services/database.service.ts
// ============================================
// DATABASE SERVICE - ALL SUPABASE OPERATIONS
// ============================================

import { supabase, BurnRecord, BurnPolygon, BurnPhoto } from '../lib/supabaseClient';

// Adjust this import based on your types location
// import { Record } from '../types';

// If you don't have a types file, use this type definition:
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
}

export class DatabaseService {
  /**
   * Save a new burn record to Supabase
   */
  static async saveRecord(record: Record): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving record to Supabase...', record);

      // 1. Insert main record
      const { data: burnRecord, error: recordError } = await supabase
        .from('burn_records')
        .insert({
          user_id: user.id,
          record_type: record.type,
          notes: record.notes || null,
          location: `POINT(${record.location.lng} ${record.location.lat})`,
          location_name: record.location.name || null,
          local_id: record.id, // Track local ID for sync
        })
        .select()
        .single();

      if (recordError) {
        console.error('Error inserting record:', recordError);
        throw recordError;
      }

      console.log('Record saved:', burnRecord.id);

      // 2. Insert polygons
      if (record.polygons && record.polygons.length > 0) {
        const polygonInserts = record.polygons.map(polygon => ({
          record_id: burnRecord.id,
          geometry: {
            type: 'Polygon',
            coordinates: [polygon.coordinates],
          },
        }));

        const { error: polygonError } = await supabase
          .from('burn_polygons')
          .insert(polygonInserts);

        if (polygonError) {
          console.error('Error inserting polygons:', polygonError);
          throw polygonError;
        }

        console.log(`Saved ${polygonInserts.length} polygons`);
      }

      // 3. Upload photos
      if (record.photos && record.photos.length > 0) {
        await this.uploadPhotos(burnRecord.id, record.photos);
      }

      return burnRecord.id;
    } catch (error) {
      console.error('Error saving record to Supabase:', error);
      return null;
    }
  }

  /**
   * Upload photos to Supabase Storage
   */
  static async uploadPhotos(recordId: string, photos: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log(`Uploading ${photos.length} photos...`);

    for (let i = 0; i < photos.length; i++) {
      try {
        const photoDataUrl = photos[i];
        
        // Skip HTTP URLs (sample data)
        if (photoDataUrl.startsWith('http')) {
          console.log(`Skipping external URL photo ${i + 1}`);
          continue;
        }

        // Extract the base64 data and determine the mime type
        const matches = photoDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.error(`Invalid base64 format for photo ${i}`);
          continue;
        }

        const mimeType = matches[1] || 'image/jpeg';
        const base64Data = matches[2];
        
        // Convert base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Determine file extension from mime type
        const extension = mimeType.split('/')[1] || 'jpg';
        
        // Create unique file path: userId/recordId/photo_index_timestamp.ext
        const filePath = `${user.id}/${recordId}/photo_${i}_${Date.now()}.${extension}`;

        console.log(`Uploading photo ${i + 1}/${photos.length} to ${filePath} (${blob.size} bytes, ${mimeType})`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('burn-photos')
          .upload(filePath, blob, {
            contentType: mimeType,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for photo ${i}:`, uploadError);
          throw uploadError;
        }

        // Save photo metadata to database
        const { error: dbError } = await supabase
          .from('burn_photos')
          .insert({
            record_id: recordId,
            storage_path: filePath,
            file_size: blob.size,
            mime_type: mimeType,
          });

        if (dbError) {
          console.error(`Database error for photo ${i}:`, dbError);
          throw dbError;
        }

        console.log(`✅ Photo ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Error uploading photo ${i}:`, error);
      }
    }
  }

  /**
   * Get all records for current user
   */
  static async getUserRecords(): Promise<Record[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log('Fetching user records...');

      // Fetch records with polygons and photos
      const { data: records, error } = await supabase
        .from('burn_records')
        .select(`
          *,
          burn_polygons(*),
          burn_photos(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error);
        throw error;
      }

      console.log(`Fetched ${records?.length || 0} records`);

      // Transform to app format
      return await Promise.all(
        records.map((record: any) => this.transformToAppRecord(record))
      );
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }

  /**
   * Get records within a specific radius (in kilometers)
   */
  static async getRecordsNearLocation(
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<Record[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log(`Fetching records within ${radiusKm}km of (${lat}, ${lng})`);

      // Use PostGIS to find records within radius
      const { data: records, error } = await supabase.rpc('get_records_near', {
        lat,
        lng,
        radius_meters: radiusKm * 1000,
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching nearby records:', error);
        throw error;
      }

      console.log(`Found ${records?.length || 0} nearby records`);

      return await Promise.all(
        records.map((record: any) => this.transformToAppRecord(record))
      );
    } catch (error) {
      console.error('Error fetching nearby records:', error);
      return [];
    }
  }

  /**
   * Get photo URL from storage with signed URL
   */
  static async getPhotoUrl(storagePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from('burn-photos')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  }

  /**
   * Get all photo URLs for a record
   */
  static async getRecordPhotos(recordId: string): Promise<string[]> {
    try {
      const { data: photos, error } = await supabase
        .from('burn_photos')
        .select('storage_path')
        .eq('record_id', recordId);

      if (error) throw error;

      // Get signed URLs for all photos
      const urls = await Promise.all(
        photos.map(photo => this.getPhotoUrl(photo.storage_path))
      );

      return urls.filter(url => url !== null) as string[];
    } catch (error) {
      console.error('Error getting record photos:', error);
      return [];
    }
  }

  /**
   * Delete a record and all associated data
   */
  static async deleteRecord(recordId: string): Promise<boolean> {
    try {
      console.log(`Deleting record ${recordId}...`);

      // Get photos to delete from storage
      const { data: photos } = await supabase
        .from('burn_photos')
        .select('storage_path')
        .eq('record_id', recordId);

      // Delete photos from storage
      if (photos && photos.length > 0) {
        const paths = photos.map(p => p.storage_path);
        const { error: storageError } = await supabase.storage
          .from('burn-photos')
          .remove(paths);

        if (storageError) {
          console.error('Error deleting photos from storage:', storageError);
        } else {
          console.log(`Deleted ${paths.length} photos from storage`);
        }
      }

      // Delete record (cascades to polygons and photos table)
      const { error } = await supabase
        .from('burn_records')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Error deleting record:', error);
        throw error;
      }

      console.log('Record deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }

  /**
   * Transform Supabase record to app Record type
   */
  private static async transformToAppRecord(dbRecord: any): Promise<Record> {
    // Get photo URLs
    const photoUrls = dbRecord.burn_photos 
      ? await Promise.all(
          dbRecord.burn_photos.map((p: any) => this.getPhotoUrl(p.storage_path))
        )
      : [];

    // Parse location from PostGIS format
    let lat = 0, lng = 0;
    if (dbRecord.location) {
      // Location is stored as POINT(lng lat)
      const match = dbRecord.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        lng = parseFloat(match[1]);
        lat = parseFloat(match[2]);
      }
    }

    return {
      id: dbRecord.local_id || dbRecord.id,
      type: dbRecord.record_type,
      notes: dbRecord.notes || '',
      location: {
        lat,
        lng,
        name: dbRecord.location_name || '',
      },
      polygons: dbRecord.burn_polygons?.map((p: any) => ({
        coordinates: p.geometry.coordinates[0],
      })) || [],
      photos: photoUrls.filter(url => url !== null) as string[],
      timestamp: new Date(dbRecord.created_at).getTime(),
    };
  }

  /**
   * Get analytics summary
   */
  static async getAnalytics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Total records
      const { count: totalRecords } = await supabase
        .from('burn_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Total area
      const { data: areaData } = await supabase
        .from('burn_polygons')
        .select('area_sqm, burn_records!inner(user_id)')
        .eq('burn_records.user_id', user.id);

      const totalArea = areaData?.reduce((sum, p) => sum + (p.area_sqm || 0), 0) || 0;

      // Records by type
      const { data: byType } = await supabase
        .from('burn_records')
        .select('record_type')
        .eq('user_id', user.id);

      const recordsByType = byType?.reduce((acc, r) => {
        acc[r.record_type] = (acc[r.record_type] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});

      return {
        totalRecords: totalRecords || 0,
        totalAreaHectares: (totalArea / 10000).toFixed(2),
        recordsByType,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}
import { supabase } from '../lib/supabaseClient';
import { SavedRecord, storage } from './storage';

// Export the shared instance if needed by other modules (though direct import from lib is preferred)
export { supabase };

export const syncToCloud = async () => {
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    return { success: false, count: 0, error: 'Not authenticated' };
  }

  console.log('Syncing as user:', user.id);

  // Only sync records that are 'saved' (not drafts) and not yet synced
  const recordsToSync = storage.getRecords().filter(r => r.status === 'saved' && !r.synced);
  
  if (recordsToSync.length === 0) {
    console.log('No records to sync');
    return { success: true, count: 0 };
  }

  console.log(`Found ${recordsToSync.length} records to sync`);

  for (const record of recordsToSync) {
    try {
      console.log(`Syncing record ${record.id}...`);

      // 1. Insert the main record
      const { data: remoteRecord, error: recordError } = await supabase
        .from('burn_records')
        .insert({
          user_id: user.id, // ← CRITICAL: Must set user_id for RLS
          record_type: record.type === 'rice' ? 'ข้าว' : 'อ้อย',
          notes: record.remarks,
          // PostGIS requires Longitude then Latitude: POINT(lng lat)
          location: `POINT(${record.location.lng} ${record.location.lat})`,
          local_id: record.id
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 2. Insert Polygons (swapping coordinates to [lng, lat] for GeoJSON)
      if (record.polygons && record.polygons.length > 0) {
        const polygonInserts = record.polygons.map(p => ({
          record_id: remoteRecord.id,
          geometry: {
            type: "Polygon",
            coordinates: [p.points.map(pt => [pt[1], pt[0]])]
          },
          area_sqm: p.area
        }));

        await supabase.from('burn_polygons').insert(polygonInserts);
      }

      // 3. Handle Photos (Convert Base64 to Blob and upload to bucket)
      if (record.photos && record.photos.length > 0) {
        for (const [index, base64] of record.photos.entries()) {
          // Skip unsplash URLs if they are sample data
          if (base64.startsWith('http')) continue; 

          try {
            // Extract the base64 data and determine the mime type
            const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
              console.error('Invalid base64 string format');
              continue;
            }

            const mimeType = matches[1] || 'image/jpeg';
            const base64Data = matches[2];
            
            // Convert base64 to binary
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // Determine file extension from mime type
            const extension = mimeType.split('/')[1] || 'jpg';
            const path = `${user.id}/${remoteRecord.id}/photo_${index}_${Date.now()}.${extension}`;

            console.log(`Uploading photo ${index + 1}/${record.photos.length} (${blob.size} bytes) to ${path}`);

            const { error: uploadError } = await supabase.storage
              .from('burn-photos')
              .upload(path, blob, {
                contentType: mimeType,
                upsert: false
              });

            if (uploadError) {
              console.error(`Error uploading photo ${index}:`, uploadError);
              continue;
            }

            console.log(`Photo ${index + 1} uploaded successfully`);

            // Insert photo metadata
            const { error: dbError } = await supabase.from('burn_photos').insert({
              record_id: remoteRecord.id,
              storage_path: path,
              file_size: blob.size,
              mime_type: mimeType
            });

            if (dbError) {
              console.error(`Error saving photo metadata ${index}:`, dbError);
            }
          } catch (photoError) {
            console.error(`Error processing photo ${index}:`, photoError);
          }
        }
      }

      // 4. Update local record as synced
      storage.saveRecord({
        ...record,
        synced: true,
        supabaseId: remoteRecord.id
      });

      console.log(`✅ Successfully synced record ${record.id}`);

    } catch (err) {
      console.error(`Failed to sync record ${record.id}:`, err);
    }
  }
  return { success: true, count: recordsToSync.length };
};
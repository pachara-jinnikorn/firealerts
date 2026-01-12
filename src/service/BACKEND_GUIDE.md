# Backend Integration Guide

This project follows a service-oriented architecture to handle backend communications. You can use **Supabase** (currently configured) or switch to a custom **REST API**.

## Architecture Overview

1.  **Transport Layer (`src/service/apiClient.ts`)**: Generic fetch wrapper for REST APIs.
2.  **Database Service (`src/service/database.service.ts`)**: Direct integration with Supabase tables and storage.
3.  **Application Service (`src/service/recordService.ts`)**: The "middleman" that the UI components call. It handles logic like merging local drafts with cloud data.

## 1. Using Supabase (Recommended)

Supabase is already integrated into the `DatabaseService`. To update your own project:
- Update `supabaseUrl` and `supabaseAnonKey` in `src/lib/supabaseClient.ts`.
- Ensure your database has tables: `burn_records`, `burn_polygons`, and `burn_photos`.

## 2. Using a Custom REST API (Node.js, Go, Python, etc.)

If you want to use a traditional backend instead of Supabase, follow these steps:

### A. Update Environment Variables
Add your API URL to a `.env` file (or update `apiClient.ts` defaults):
```env
VITE_API_URL=https://your-api-server.com/api/v1
```

### B. Update `RecordService.ts`
Modify the methods in `RecordService.ts` to use `APIClient` instead of `DatabaseService`:

```typescript
// Example: Fetching records from a Custom API
static async getAllRecords(userId: string) {
  return await APIClient.get<SavedRecord[]>(`/records?userId=${userId}`);
}

// Example: Saving a record to a Custom API
static async saveRecord(record: SavedRecord) {
  return await APIClient.post('/records', record);
}
```

## 3. Handling Authentication

The `APIClient` is ready to handle JWT tokens. You can uncomment the Authorization header in `apiClient.ts`:

```typescript
// apiClient.ts
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`, // Get token from storage
  ...headers,
};
```

## 4. Best Practices

- **Offline-First**: Always save to `storage` (localStorage) before attempting an API call.
- **Error Handling**: Catch errors in the Service layer and return friendly error messages or fallback data.
- **Environment Separation**: Use different API URLs for staging and production.

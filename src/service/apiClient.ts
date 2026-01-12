/**
 * Generic API Client for REST services
 * This provides a foundation for connecting to any custom backend (Node.js, Go, Python, etc.)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export class APIClient {
    private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...config } = options;

        // Build URL with query parameters
        const url = new URL(`${BASE_URL}${endpoint}`);
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }

        // Default headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
            ...headers,
        };

        try {
            const response = await fetch(url.toString(), {
                ...config,
                headers: defaultHeaders,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            return await response.json() as T;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    static get<T>(endpoint: string, params?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    static post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    static delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

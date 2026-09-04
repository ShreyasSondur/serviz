import { Platform } from 'react-native';
import Constants from 'expo-constants';
import storage from '@/utils/storage';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

const normalizeApiUrl = (rawUrl?: string): string | null => {
  if (!rawUrl || rawUrl.trim() === '') return null;
  let url = rawUrl.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

// Extract candidate URLs: prioritize .env EXPO_PUBLIC_API_URL first, then dev fallbacks
const getFallbackUrls = (): string[] => {
  const urls: string[] = [];

  // 1. Production / VPS Backend URL from .env file (EXPO_PUBLIC_API_URL)
  const envUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envUrl) {
    urls.push(envUrl);
  }

  // Always include the official production API endpoint as primary candidate
  const defaultProdUrl = 'https://backend.servizuae.com/api/v1';
  if (!urls.includes(defaultProdUrl)) {
    urls.push(defaultProdUrl);
  }

  // 2. Local Metro / Expo dev machine IP for local development fallback (only in DEV mode)
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        urls.push(`http://${ip}:8000/api/v1`);
      }
    }

    if (Platform.OS === 'android') {
      urls.push('http://10.0.2.2:8000/api/v1');
    }

    urls.push('http://localhost:8000/api/v1');
    urls.push('http://127.0.0.1:8000/api/v1');
  }

  return Array.from(new Set(urls));
};

const CANDIDATE_URLS = getFallbackUrls();
const INITIAL_BASE_URL = CANDIDATE_URLS[0] || 'https://backend.servizuae.com/api/v1';

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = INITIAL_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async saveWorkingUrl(url: string) {
    this.baseUrl = url;
    // Do not persist local/loopback URLs in production builds
    const isLocal = url.includes('localhost') || url.includes('10.0.2.2') || url.includes('127.0.0.1');
    if (!isLocal || __DEV__) {
      try {
        await storage.setItem('serviz_working_base_url', url);
      } catch (e) {
        // Ignored
      }
    }
  }

  public async setToken(token: string | null) {
    this.authToken = token;
    if (token) {
      await storage.setItem('serviz_auth_token', token);
    } else {
      await storage.removeItem('serviz_auth_token');
    }
  }

  public getToken(): string | null {
    return this.authToken;
  }

  public async loadSavedToken(): Promise<string | null> {
    try {
      const savedUrl = await storage.getItem('serviz_working_base_url');
      if (savedUrl && savedUrl.trim() !== '') {
        const trimmed = savedUrl.trim();
        const isLocal = trimmed.includes('localhost') || trimmed.includes('10.0.2.2') || trimmed.includes('127.0.0.1');
        // Only load saved URL if not an emulator loopback in production
        if (!isLocal || __DEV__) {
          this.baseUrl = trimmed;
        }
      }
      const saved = await storage.getItem('serviz_auth_token');
      if (saved) {
        this.authToken = saved;
      }
    } catch (e) {
      // Ignored
    }
    return this.authToken;
  }

  private getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-App-Secret': process.env.EXPO_PUBLIC_APP_SECRET || 'SERVIZ_APP_PROD_SECRET_KEY_2026',
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Fast fetch wrapper with AbortController timeout to prevent hanging socket connections
  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 15000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  // Attempt request with auto-retry & realistic 15s timeout across candidate URLs
  private async executeFetch(
    endpoint: string,
    options: RequestInit
  ): Promise<{ response: Response | null; data: any; error: string | null }> {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let lastError: any = null;

    // 1. Try current baseUrl with 15s timeout and 1 auto-retry on connection drop
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await this.fetchWithTimeout(`${this.baseUrl}${formattedEndpoint}`, options, 15000);
        const data = await res.json().catch(() => null);
        this.saveWorkingUrl(this.baseUrl);
        return { response: res, data, error: null };
      } catch (err: any) {
        lastError = err;
        console.warn(`[API] Attempt ${attempt + 1} to ${this.baseUrl}${formattedEndpoint} failed:`, err?.message || err);
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
    }

    // 2. Try alternate candidate fallback URLs
    for (const url of CANDIDATE_URLS) {
      if (url === this.baseUrl) continue;
      try {
        const res = await this.fetchWithTimeout(`${url}${formattedEndpoint}`, options, 10000);
        const data = await res.json().catch(() => null);
        console.log(`[API] Connected successfully to fallback URL: ${url}`);
        this.saveWorkingUrl(url);
        return { response: res, data, error: null };
      } catch (err: any) {
        lastError = err;
      }
    }

    console.error(`[API] All connection attempts failed for ${formattedEndpoint}:`, lastError?.message || lastError);

    return {
      response: null,
      data: null,
      error: 'Cannot connect to backend server. Please check your network connection.',
    };
  }

  private parseErrorMessage(resData: any, status: number): string {
    let errorMsg = resData?.detail || resData?.message;
    if (Array.isArray(errorMsg)) {
      return errorMsg.map((e: any) => (e.msg ? `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}` : JSON.stringify(e))).join(', ');
    }
    if (typeof errorMsg === 'object' && errorMsg !== null) {
      return JSON.stringify(errorMsg);
    }
    if (typeof errorMsg === 'string' && errorMsg.trim() !== '') {
      return errorMsg;
    }
    return `Request failed with status ${status}`;
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await this.executeFetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.response) {
      return { data: null, error: res.error || 'Network Error', status: 500 };
    }

    return {
      data: res.response.ok ? res.data : null,
      error: res.response.ok ? null : this.parseErrorMessage(res.data, res.response.status),
      status: res.response.status,
    };
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await this.executeFetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify(body),
    });

    if (!res.response) {
      return { data: null, error: res.error || 'Network Error', status: 500 };
    }

    return {
      data: res.response.ok ? res.data : null,
      error: res.response.ok ? null : this.parseErrorMessage(res.data, res.response.status),
      status: res.response.status,
    };
  }

  public async postForm<T>(endpoint: string, params: Record<string, string>): Promise<ApiResponse<T>> {
    const formBody = Object.keys(params)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&');

    const res = await this.executeFetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders('application/x-www-form-urlencoded'),
      body: formBody,
    });

    if (!res.response) {
      return { data: null, error: res.error || 'Network Error', status: 500 };
    }

    return {
      data: res.response.ok ? res.data : null,
      error: res.response.ok ? null : this.parseErrorMessage(res.data, res.response.status),
      status: res.response.status,
    };
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await this.executeFetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify(body),
    });

    if (!res.response) {
      return { data: null, error: res.error || 'Network Error', status: 500 };
    }

    return {
      data: res.response.ok ? res.data : null,
      error: res.response.ok ? null : this.parseErrorMessage(res.data, res.response.status),
      status: res.response.status,
    };
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await this.executeFetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.response) {
      return { data: null, error: res.error || 'Network Error', status: 500 };
    }

    return {
      data: res.response.ok ? res.data : null,
      error: res.response.ok ? null : this.parseErrorMessage(res.data, res.response.status),
      status: res.response.status,
    };
  }
}

export const api = new ApiService();
export default api;

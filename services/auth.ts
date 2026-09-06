/**
 * Authentication service handling login, registration, and user session API calls.
 */

import { api, ApiResponse } from './api';

export interface PartnerProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  emirate: string;
  city: string;
  emirate_id_number?: string;
  business_name?: string;
  is_verified?: boolean;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'BANNED';
  services_limit: number;
  deals_limit: number;
}

export interface User {
  id: string | number;
  name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  phone_number?: string;
  role?: 'USER' | 'PARTNER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  is_active?: boolean;
  createdAt?: string;
  partnerProfile?: PartnerProfile | null;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  requires_otp?: boolean;
  temp_token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Log in user with email & password against FastAPI backend.
   */
  public async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const res = await api.postForm<AuthTokenResponse>('/auth/login', {
      username: email.trim(),
      password: password,
    });

    if (res.error || !res.data) {
      return {
        data: null,
        error: res.error || 'Login failed',
        status: res.status,
      };
    }

    const token = res.data.access_token;
    await api.setToken(token);

    // Fast instant user object
    const fastUser: User = {
      id: 1,
      email: email.trim(),
      full_name: email.trim().split('@')[0],
      role: 'USER',
    };

    // Background sync user profile
    this.getProfile().catch(() => null);

    return {
      data: {
        user: fastUser,
        token: token,
      },
      error: null,
      status: 200,
    };
  }

  /**
   * Register standard user.
   */
  public async signup(fullName: string, email: string, password: string): Promise<ApiResponse<User>> {
    return api.post<User>('/auth/signup', {
      full_name: fullName,
      email: email,
      password: password,
    });
  }

  /**
   * Log out user.
   */
  public async logout(): Promise<void> {
    await api.setToken(null);
  }

  /**
   * Fetch currently authenticated user profile & partner metadata.
   */
  public async getProfile(): Promise<ApiResponse<User>> {
    const res = await api.get<any>('/auth/me');
    if (res.error || !res.data) {
      return {
        data: null,
        error: res.error || 'Failed to load profile',
        status: res.status,
      };
    }

    const userData = res.data;
    let partnerProfile: PartnerProfile | null = null;

    // Check if partner profile exists
    try {
      const partnerRes = await api.get<PartnerProfile>('/partner/profile');
      if (partnerRes.data) {
        partnerProfile = partnerRes.data;
      }
    } catch (_) {}

    const formattedUser: User = {
      id: userData.id,
      name: userData.full_name || userData.email.split('@')[0],
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone_number,
      phone_number: userData.phone_number,
      role: userData.role,
      is_active: userData.is_active,
      avatar: userData.avatar || undefined,
      createdAt: new Date().toISOString(),
      partnerProfile: partnerProfile,
    };

    return {
      data: formattedUser,
      error: null,
      status: 200,
    };
  }

  /**
   * Update user phone number.
   */
  public async updatePhone(phoneNumber: string): Promise<ApiResponse<User>> {
    return api.put<User>('/auth/me/phone', {
      phone_number: phoneNumber,
    });
  }
}

export const authService = new AuthService();
export default authService;

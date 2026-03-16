import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Attach auth token if available
  const token = global.__authToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);

// ─── Blueprints ────────────────────────────────────────────────────────────

export interface Blueprint {
  id: string;
  name: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  imageUrl?: string;
  materials: { name: string; quantity: number }[];
  craftTime: number; // seconds
  trackedBy?: number;
}

export const getBlueprintsApi = () => api.get<Blueprint[]>('/blueprints');
export const getBlueprintApi = (id: string) => api.get<Blueprint>(`/blueprints/${id}`);

// ─── Marketplace ───────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  itemName: string;
  itemCategory: string;
  rarity: Blueprint['rarity'];
  imageUrl?: string;
  price: number;
  currency: 'credits';
  quantity: number;
  seller: { id: string; username: string };
  createdAt: string;
  expiresAt: string;
}

export const getListingsApi = (params?: {
  category?: string;
  rarity?: string;
  search?: string;
  page?: number;
}) => api.get<{ listings: Listing[]; total: number; page: number }>('/marketplace', { params });

export const createListingApi = (data: Omit<Listing, 'id' | 'seller' | 'createdAt' | 'expiresAt'>) =>
  api.post<Listing>('/marketplace', data);

export const deleteListingApi = (id: string) => api.delete(`/marketplace/${id}`);

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  credits: number;
  joinedAt: string;
  trackedBlueprints: string[];
  activeListings: number;
}

export const loginApi = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login', { email, password });

export const registerApi = (username: string, email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/register', { username, email, password });

export const getMeApi = () => api.get<User>('/auth/me');

// ─── Tracker ───────────────────────────────────────────────────────────────

export const trackBlueprintApi = (blueprintId: string) =>
  api.post(`/tracker/${blueprintId}`);

export const untrackBlueprintApi = (blueprintId: string) =>
  api.delete(`/tracker/${blueprintId}`);

export const getTrackedBlueprintsApi = () =>
  api.get<Blueprint[]>('/tracker');

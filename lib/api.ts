/**
 * API Client for Aloha Content Factory
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aloha-content-api-production.up.railway.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Dashboard API
export async function getDashboardOverview() {
  return fetchApi<DashboardOverview>('/api/v1/dashboard/overview');
}

export async function getClientDashboard(clientId: string) {
  return fetchApi<ClientDashboard>(`/api/v1/dashboard/client/${clientId}`);
}

export async function getPipelines() {
  return fetchApi<Pipeline[]>('/api/v1/dashboard/pipelines');
}

export async function getCosts() {
  return fetchApi<CostData>('/api/v1/dashboard/costs');
}

// Clients API
export async function getClients() {
  return fetchApi<Client[]>('/api/v1/clients');
}

export async function getClient(id: string) {
  return fetchApi<Client>(`/api/v1/clients/${id}`);
}

export async function createClient(data: CreateClientData) {
  return fetchApi<Client>('/api/v1/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string) {
  return fetchApi<void>(`/api/v1/clients/${id}`, { method: 'DELETE' });
}

// Content API
export async function getScripts(params?: { clientId?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString();
  return fetchApi<Script[]>(`/api/v1/content/scripts${query ? `?${query}` : ''}`);
}

export async function generateScript(data: GenerateScriptData) {
  return fetchApi<Script>('/api/v1/content/scripts/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRenders(params?: { clientId?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString();
  return fetchApi<Render[]>(`/api/v1/content/renders${query ? `?${query}` : ''}`);
}

export async function getReviewQueue(params?: { clientId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  const query = searchParams.toString();
  return fetchApi<ReviewItem[]>(`/api/v1/content/review-queue${query ? `?${query}` : ''}`);
}

export async function getCalendar(params?: { clientId?: string; startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  return fetchApi<CalendarItem[]>(`/api/v1/content/calendar${query ? `?${query}` : ''}`);
}

export async function getScheduled(params?: { clientId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  const query = searchParams.toString();
  return fetchApi<ScheduledItem[]>(`/api/v1/content/scheduled${query ? `?${query}` : ''}`);
}

export async function approveRender(id: string) {
  return fetchApi<void>(`/api/v1/content/renders/${id}/approve`, { method: 'POST' });
}

export async function scheduleRender(id: string, data: { scheduledTime: string; platforms: string[] }) {
  return fetchApi<void>(`/api/v1/content/renders/${id}/schedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function publishRender(id: string, data: { platforms: string[] }) {
  return fetchApi<void>(`/api/v1/content/renders/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Analytics API
export async function getPerformance(clientId: string, params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  return fetchApi<PerformanceData>(`/api/v1/analytics/performance/${clientId}${query ? `?${query}` : ''}`);
}

export async function getContentTypeAnalytics(clientId: string) {
  return fetchApi<ContentTypeAnalytics>(`/api/v1/analytics/content-types/${clientId}`);
}

export async function getKeywordAnalytics(clientId: string) {
  return fetchApi<KeywordAnalytics>(`/api/v1/analytics/keywords/${clientId}`);
}

export async function getInsights(params?: { clientId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  const query = searchParams.toString();
  return fetchApi<Insight[]>(`/api/v1/analytics/insights${query ? `?${query}` : ''}`);
}

// Types
export interface DashboardOverview {
  totalClients: number;
  activeClients: number;
  totalContent: number;
  pendingReview: number;
  scheduledPosts: number;
  publishedToday: number;
  weeklyStats: {
    scriptsGenerated: number;
    videosRendered: number;
    postsPublished: number;
  };
  recentActivity: Activity[];
}

export interface ClientDashboard {
  client: Client;
  stats: {
    totalScripts: number;
    totalRenders: number;
    pendingReview: number;
    scheduled: number;
    published: number;
  };
  recentContent: Render[];
}

export interface Pipeline {
  id: string;
  status: string;
  clientId: string;
  clientName: string;
  stage: string;
  progress: number;
  startedAt: string;
}

export interface CostData {
  totalCost: number;
  breakdown: {
    ai: number;
    rendering: number;
    storage: number;
  };
  byClient: { clientId: string; clientName: string; cost: number }[];
}

export interface Client {
  id: string;
  name: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  status: string;
  createdAt: string;
  keywords: string[];
  platforms: string[];
}

export interface CreateClientData {
  name: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  keywords?: string[];
  platforms?: string[];
}

export interface Script {
  id: string;
  clientId: string;
  title: string;
  content: string;
  contentType: string;
  status: string;
  createdAt: string;
}

export interface GenerateScriptData {
  clientId: string;
  contentType: string;
  topic?: string;
  keywords?: string[];
}

export interface Render {
  id: string;
  scriptId: string;
  clientId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
  title?: string;
}

export interface ReviewItem {
  id: string;
  renderId: string;
  clientId: string;
  clientName: string;
  title: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: string;
}

export interface CalendarItem {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  scheduledTime: string;
  platforms: string[];
  status: string;
}

export interface ScheduledItem {
  id: string;
  clientId: string;
  title: string;
  scheduledTime: string;
  platforms: string[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  clientId?: string;
  createdAt: string;
}

export interface PerformanceData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  growth: number;
  chartData: { date: string; views: number; engagement: number }[];
}

export interface ContentTypeAnalytics {
  byType: { type: string; count: number; engagement: number }[];
}

export interface KeywordAnalytics {
  keywords: { keyword: string; count: number; performance: number }[];
}

export interface Insight {
  id: string;
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  clientId?: string;
}

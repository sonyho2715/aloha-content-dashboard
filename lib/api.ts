/**
 * API Client for Aloha Content Factory
 * Types aligned with actual backend API responses
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aloha-content-api-production.up.railway.app';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
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
      return { success: false, error: errorText || `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// Dashboard API
// ============================================================================
export async function getDashboardOverview() {
  return fetchApi<DashboardOverview>('/api/v1/dashboard/overview');
}

export async function getClientDashboard(clientId: string) {
  return fetchApi<ClientDashboard>(`/api/v1/dashboard/client/${clientId}`);
}

export async function getPipelines() {
  return fetchApi<Pipeline[]>('/api/v1/dashboard/pipelines');
}

export async function getCosts(params?: { clientId?: string; days?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.days) searchParams.set('days', params.days);
  const query = searchParams.toString();
  return fetchApi<CostData>(`/api/v1/dashboard/costs${query ? `?${query}` : ''}`);
}

// ============================================================================
// Clients API
// ============================================================================
export async function getClients(params?: { active?: string; industry?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.active) searchParams.set('active', params.active);
  if (params?.industry) searchParams.set('industry', params.industry);
  const query = searchParams.toString();
  return fetchApi<ClientFull[]>(`/api/v1/clients${query ? `?${query}` : ''}`);
}

export async function getClient(id: string) {
  return fetchApi<ClientFull>(`/api/v1/clients/${id}`);
}

export async function createClient(data: CreateClientData) {
  return fetchApi<ClientFull>('/api/v1/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: Partial<CreateClientData>) {
  return fetchApi<ClientFull>(`/api/v1/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string) {
  return fetchApi<{ message: string }>(`/api/v1/clients/${id}`, { method: 'DELETE' });
}

export async function addClientKeyword(clientId: string, data: { keyword: string; category?: string; priority?: number }) {
  return fetchApi<ClientKeyword>(`/api/v1/clients/${clientId}/keywords`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function connectPlatform(clientId: string, data: PlatformConnectData) {
  return fetchApi<{ id: string; platform: string; accountName: string }>(`/api/v1/clients/${clientId}/platforms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Content API
// ============================================================================
export async function getScripts(params?: { clientId?: string; status?: string; limit?: string; offset?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit);
  if (params?.offset) searchParams.set('offset', params.offset);
  const query = searchParams.toString();
  return fetchApi<ScriptFull[]>(`/api/v1/content/scripts${query ? `?${query}` : ''}`);
}

export async function getScript(id: string) {
  return fetchApi<ScriptFull>(`/api/v1/content/scripts/${id}`);
}

export async function generateScript(data: GenerateScriptData) {
  return fetchApi<ScriptFull>('/api/v1/content/scripts/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRenders(params?: { clientId?: string; status?: string; limit?: string; offset?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit);
  if (params?.offset) searchParams.set('offset', params.offset);
  const query = searchParams.toString();
  return fetchApi<RenderFull[]>(`/api/v1/content/renders${query ? `?${query}` : ''}`);
}

export async function getRender(id: string) {
  return fetchApi<RenderFull>(`/api/v1/content/renders/${id}`);
}

export async function scoreRender(id: string) {
  return fetchApi<QualityScore>(`/api/v1/content/renders/${id}/score`, { method: 'POST' });
}

export async function approveRender(id: string) {
  return fetchApi<RenderFull>(`/api/v1/content/renders/${id}/approve`, { method: 'POST' });
}

export async function scheduleRender(id: string, data: { platforms: string[]; scheduledFor?: string }) {
  return fetchApi<{ scheduledFor: string }>(`/api/v1/content/renders/${id}/schedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function publishRender(id: string, data?: { platforms?: string[] }) {
  return fetchApi<{ message: string }>(`/api/v1/content/renders/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function getReviewQueue(params?: { clientId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  const query = searchParams.toString();
  return fetchApi<ReviewRender[]>(`/api/v1/content/review-queue${query ? `?${query}` : ''}`);
}

export async function getScheduled(clientId: string) {
  return fetchApi<ScheduledContent[]>(`/api/v1/content/scheduled?clientId=${clientId}`);
}

export async function getCalendar(clientId: string, params?: { start?: string; end?: string }) {
  const searchParams = new URLSearchParams();
  searchParams.set('clientId', clientId);
  if (params?.start) searchParams.set('start', params.start);
  if (params?.end) searchParams.set('end', params.end);
  return fetchApi<CalendarEntry[]>(`/api/v1/content/calendar?${searchParams.toString()}`);
}

// ============================================================================
// Analytics API
// ============================================================================
export async function getPerformance(clientId: string, params?: { platform?: string; days?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.days) searchParams.set('days', params.days);
  const query = searchParams.toString();
  return fetchApi<PerformanceData>(`/api/v1/analytics/performance/${clientId}${query ? `?${query}` : ''}`);
}

export async function getContentTypeAnalytics(clientId: string) {
  return fetchApi<ContentTypeData[]>(`/api/v1/analytics/content-types/${clientId}`);
}

export async function getKeywordAnalytics(clientId: string) {
  return fetchApi<KeywordData[]>(`/api/v1/analytics/keywords/${clientId}`);
}

export async function refreshAnalytics(data: { renderId?: string; clientId?: string }) {
  return fetchApi<{ message: string }>('/api/v1/analytics/refresh', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getInsights(params?: { industry?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.industry) searchParams.set('industry', params.industry);
  const query = searchParams.toString();
  return fetchApi<IndustryInsight[]>(`/api/v1/analytics/insights${query ? `?${query}` : ''}`);
}

// ============================================================================
// Types - Dashboard
// ============================================================================
export interface DashboardOverview {
  clients: {
    total: number;
    active: number;
  };
  content: {
    scripts: number;
    renders: number;
    published: number;
    pendingReview: number;
  };
  thisMonth: {
    scripts: number;
    renders: number;
    published: number;
  };
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  keyword: string;
  client: string;
  status: string;
  createdAt: string;
}

export interface ClientDashboard {
  client: {
    id: string;
    businessName: string;
    industry: string;
    tier: string;
    status: string;
    locations: Location[];
    platforms: { platform: string; accountName: string }[];
  };
  stats: {
    totalScripts: number;
    totalRenders: number;
    activeKeywords: number;
    scriptsThisMonth: number;
    rendersCompleted: number;
    rendersApproved: number;
    avgQualityScore: string;
  };
  performance: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagementScore: string;
  };
  pipeline: PipelineStatus | null;
}

export interface Pipeline {
  id: string;
  status: string;
  clientId: string;
  startedAt: string;
  completedAt?: string;
  scriptsGenerated: number;
  voiceoversCreated: number;
  videosRendered: number;
  videosPublished: number;
}

export interface PipelineStatus {
  status: string;
  startedAt: string;
  scriptsGenerated: number;
  voiceoversCreated: number;
  videosRendered: number;
  videosPublished: number;
}

export interface CostData {
  totalCost: string;
  byService: { service: string; cost: string; operations: number }[];
  daily: { date: string; cost: string }[];
}

// ============================================================================
// Types - Clients
// ============================================================================
export interface ClientFull {
  id: string;
  businessName: string;
  industry: string;
  description?: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  primaryAudience: string;
  tier: string;
  monthlyFee: number;
  monthlyBudget?: number;
  brandVoice?: Record<string, unknown>;
  logoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  locations: Location[];
  keywords?: ClientKeyword[];
  platformAccounts?: PlatformAccount[];
  _count: {
    scripts: number;
    renders: number;
    platformAccounts?: number;
  };
}

export interface Location {
  id: string;
  clientId: string;
  name: string;
  island: string;
  neighborhood: string;
  address?: string;
}

export interface ClientKeyword {
  id: string;
  clientId: string;
  keyword: string;
  category?: string;
  priority: number;
  isActive: boolean;
}

export interface PlatformAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
}

export interface CreateClientData {
  businessName: string;
  industry: string;
  description?: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  primaryAudience?: 'local' | 'tourist' | 'both';
  tier?: 'starter' | 'growth' | 'scale' | 'enterprise';
  monthlyFee: number;
  monthlyBudget?: number;
  brandVoice?: Record<string, unknown>;
  logoUrl?: string;
  locations?: { name: string; island: string; neighborhood: string; address?: string }[];
  keywords?: { keyword: string; category?: string; priority?: number }[];
}

export interface PlatformConnectData {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook';
  accessToken: string;
  refreshToken?: string;
  accountId?: string;
  accountName: string;
  tokenExpiresAt?: string;
}

// ============================================================================
// Types - Content
// ============================================================================
export interface ScriptFull {
  id: string;
  clientId: string;
  keyword: string;
  contentType?: string;
  targetAudience?: string;
  hookText: string;
  bodyText: string;
  ctaText: string;
  fullScript: string;
  voiceStyle?: string;
  hookStyle?: string;
  angle?: string;
  wordCount: number;
  estimatedDuration: number;
  status: string;
  createdAt: string;
  client?: { id: string; businessName: string; industry?: string };
  voiceover?: VoiceoverInfo;
  renders?: RenderFull[];
}

export interface VoiceoverInfo {
  id: string;
  status: string;
  durationSeconds?: number;
}

export interface RenderFull {
  id: string;
  scriptId: string;
  clientId: string;
  voiceoverId?: string;
  templateId?: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  resolution?: string;
  fileSize?: number;
  qualityScore?: number;
  autoApproved?: boolean;
  renderMetadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  script?: { id: string; keyword: string; hookText: string };
  client?: { id: string; businessName: string };
  publications?: PublicationInfo[];
}

export interface PublicationInfo {
  id: string;
  platform: string;
  status: string;
}

export interface QualityScore {
  score: number;
  details: Record<string, unknown>;
}

export interface ReviewRender {
  id: string;
  scriptId: string;
  clientId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  qualityScore?: number;
  createdAt: string;
  script: { keyword: string; hookText: string };
  client: { businessName: string };
}

export interface ScheduledContent {
  id: string;
  renderId: string;
  scheduledFor: string;
  platforms: string[];
  status: string;
}

export interface CalendarEntry {
  id: string;
  renderId: string;
  keyword: string;
  scheduledFor: string;
  platforms: string[];
  status: string;
}

export interface GenerateScriptData {
  clientId: string;
  keyword: string;
  contentType?: string;
  audienceType?: 'local' | 'tourist' | 'mixed';
  angle?: string;
  queueVoiceover?: boolean;
}

// ============================================================================
// Types - Analytics
// ============================================================================
export interface PerformanceData {
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    contentPieces: number;
    avgScore: string;
  };
  byPlatform: PlatformStats[];
  topContent: TopContent[];
}

export interface PlatformStats {
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  count: number;
  avgScore: string;
}

export interface TopContent {
  renderId: string;
  platform: string;
  keyword: string;
  views: number;
  engagement: number;
  score?: string;
}

export interface ContentTypeData {
  contentType: string;
  totalViews: number;
  totalEngagement: number;
  count: number;
  avgScore: string;
}

export interface KeywordData {
  keyword: string;
  totalViews: number;
  totalEngagement: number;
  count: number;
  avgScore: string;
}

export interface IndustryInsight {
  id: string;
  industry: string;
  bestHookStyles: string[];
  optimalLength: Record<string, unknown>;
  bestPostingTimes: Record<string, unknown>;
  winningHashtags: string[];
  effectiveCTAs: string[];
  localVsTourist: Record<string, unknown>;
  videosAnalyzed: number;
  updatedAt: string;
}

// ============================================================================
// Simplified types for UI components (derived from full types)
// ============================================================================

// Simple client for list views
export interface Client {
  id: string;
  businessName: string;
  industry: string;
  tier: string;
  targetAudience: string;
  status: string;
  createdAt: string;
}

// Transform ClientFull to Client for simple display
export function toSimpleClient(full: ClientFull): Client {
  return {
    id: full.id,
    businessName: full.businessName,
    industry: full.industry,
    tier: full.tier,
    targetAudience: full.primaryAudience,
    status: full.status,
    createdAt: full.createdAt,
  };
}

// Simple script for list views
export interface Script {
  id: string;
  clientId: string;
  keyword: string;
  hook: string;
  body: string;
  cta: string;
  voiceStyle: string;
  status: string;
  createdAt: string;
}

// Transform ScriptFull to Script
export function toSimpleScript(full: ScriptFull): Script {
  return {
    id: full.id,
    clientId: full.clientId,
    keyword: full.keyword,
    hook: full.hookText,
    body: full.bodyText,
    cta: full.ctaText,
    voiceStyle: full.voiceStyle || 'default',
    status: full.status,
    createdAt: full.createdAt,
  };
}

// Simple render for list views
export interface Render {
  id: string;
  scriptId: string;
  clientId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  qualityScore?: number;
  createdAt: string;
}

// Transform RenderFull to Render
export function toSimpleRender(full: RenderFull): Render {
  return {
    id: full.id,
    scriptId: full.scriptId,
    clientId: full.clientId,
    status: full.status,
    videoUrl: full.videoUrl,
    thumbnailUrl: full.thumbnailUrl,
    duration: full.durationSeconds,
    qualityScore: full.qualityScore,
    createdAt: full.createdAt,
  };
}

// Review item for review queue
export interface ReviewItem {
  id: string;
  scriptId: string;
  clientId: string;
  clientName: string;
  keyword: string;
  thumbnailUrl?: string;
  status: string;
  qualityScore?: number;
  createdAt: string;
}

// Transform ReviewRender to ReviewItem
export function toReviewItem(render: ReviewRender): ReviewItem {
  return {
    id: render.id,
    scriptId: render.scriptId,
    clientId: render.clientId,
    clientName: render.client.businessName,
    keyword: render.script.keyword,
    thumbnailUrl: render.thumbnailUrl,
    status: render.status,
    qualityScore: render.qualityScore,
    createdAt: render.createdAt,
  };
}

// Calendar item for calendar view
export interface CalendarItem {
  id: string;
  clientId: string;
  clientName: string;
  keyword: string;
  scheduledTime: string;
  platforms: string[];
  status: string;
}

// Scheduled item for upcoming list
export interface ScheduledItem {
  id: string;
  clientId: string;
  keyword: string;
  scheduledTime: string;
  platforms: string[];
}

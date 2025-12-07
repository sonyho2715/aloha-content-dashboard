'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Building2,
  Hash,
  Clock,
  Video,
} from 'lucide-react';
import { getInsights, getClients, getPerformance, IndustryInsight, ClientFull, PerformanceData } from '@/lib/api';

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<IndustryInsight[]>([]);
  const [clients, setClients] = useState<ClientFull[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      const result = await getClients({ active: 'true' });
      if (result.data && result.data.length > 0) {
        setClients(result.data);
        setSelectedClientId(result.data[0].id);
      }
    };
    fetchClients();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch industry insights
    const insightsResult = await getInsights();
    if (insightsResult.data) {
      setInsights(insightsResult.data);
    }

    // Fetch performance data if client is selected
    if (selectedClientId) {
      const perfResult = await getPerformance(selectedClientId);
      if (perfResult.data) {
        setPerformance(perfResult.data);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedClientId]);

  // Stats from performance data or defaults
  const stats = performance?.totals ?? {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    contentPieces: 0,
    avgScore: '0',
  };

  const formatIndustry = (industry: string) => {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <>
      <Header
        title="Analytics"
        subtitle={selectedClient ? `Performance for ${selectedClient.businessName}` : "Performance insights"}
        onRefresh={fetchData}
      />

      <div className="p-8">
        {/* Client Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gray-400" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {clients.length === 0 ? (
                <option value="">No clients available</option>
              ) : (
                clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.businessName}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={stats.views.toLocaleString()}
            change={`${stats.contentPieces} content pieces`}
            changeType="neutral"
            icon={Eye}
            iconColor="text-blue-600 bg-blue-100"
          />
          <StatCard
            title="Total Likes"
            value={stats.likes.toLocaleString()}
            change={`Avg Score: ${stats.avgScore}`}
            changeType="neutral"
            icon={Heart}
            iconColor="text-pink-600 bg-pink-100"
          />
          <StatCard
            title="Comments"
            value={stats.comments.toLocaleString()}
            change="Engagement metric"
            changeType="neutral"
            icon={MessageCircle}
            iconColor="text-purple-600 bg-purple-100"
          />
          <StatCard
            title="Shares"
            value={stats.shares.toLocaleString()}
            change="Viral metric"
            changeType="neutral"
            icon={Share2}
            iconColor="text-emerald-600 bg-emerald-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engagement Chart Placeholder */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Engagement Over Time
              </h2>
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Chart visualization coming soon
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Connect a client to see real analytics
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgScore}%
                </p>
                <p className="text-sm text-gray-500">Avg. Quality Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.contentPieces}
                </p>
                <p className="text-sm text-gray-500">Content Pieces</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {performance?.byPlatform?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Platforms</p>
              </div>
            </div>
          </div>

          {/* Industry Insights */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Industry Insights
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : insights.length === 0 ? (
              <div className="space-y-3">
                {/* Default insights when API returns empty */}
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Get Started
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Add clients and generate content to see AI-powered insights
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-l-emerald-500">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Best Posting Times
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Hawaii audiences engage most between 7-9 AM and 6-8 PM HST
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Content Variety
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Mix promotional content with educational and behind-the-scenes posts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatIndustry(insight.industry)}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {insight.videosAnalyzed} videos analyzed
                      </span>
                    </div>
                    {insight.bestHookStyles && insight.bestHookStyles.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Best Hook Styles:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.bestHookStyles.slice(0, 3).map((style, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {insight.winningHashtags && insight.winningHashtags.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="h-3 w-3" />
                        {insight.winningHashtags.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Platform
          </h2>
          {performance?.byPlatform && performance.byPlatform.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {performance.byPlatform.map((platform) => {
                const platformColors: Record<string, string> = {
                  tiktok: 'bg-pink-500',
                  instagram: 'bg-purple-500',
                  youtube: 'bg-red-500',
                  facebook: 'bg-blue-500',
                };
                return (
                  <div key={platform.platform} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${platformColors[platform.platform] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {platform.platform}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{platform.views.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {platform.count} posts | {platform.avgScore}% score
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { platform: 'TikTok', color: 'bg-pink-500' },
                { platform: 'Instagram', color: 'bg-purple-500' },
                { platform: 'YouTube', color: 'bg-red-500' },
                { platform: 'Facebook', color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.platform} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {item.platform}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">No data yet</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Content */}
        {performance?.topContent && performance.topContent.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Content
            </h2>
            <div className="space-y-3">
              {performance.topContent.slice(0, 5).map((content, index) => (
                <div key={content.renderId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{content.keyword}</p>
                    <p className="text-sm text-gray-500 capitalize">{content.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{content.views.toLocaleString()} views</p>
                    <p className="text-sm text-gray-500">{content.engagement.toLocaleString()} engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

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
} from 'lucide-react';
import { getInsights, Insight } from '@/lib/api';

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo data for now (real data would come from API with clientId)
  const demoStats = {
    views: 45230,
    likes: 3420,
    comments: 892,
    shares: 567,
    engagement: 8.4,
    growth: 12.3,
  };

  const fetchData = async () => {
    setLoading(true);
    const result = await getInsights();
    if (result.data) {
      setInsights(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-amber-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Performance insights across all clients"
        onRefresh={fetchData}
      />

      <div className="p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={demoStats.views.toLocaleString()}
            change="+12% from last week"
            changeType="positive"
            icon={Eye}
            iconColor="text-blue-600 bg-blue-100"
          />
          <StatCard
            title="Total Likes"
            value={demoStats.likes.toLocaleString()}
            change="+8% from last week"
            changeType="positive"
            icon={Heart}
            iconColor="text-pink-600 bg-pink-100"
          />
          <StatCard
            title="Comments"
            value={demoStats.comments.toLocaleString()}
            change="+15% from last week"
            changeType="positive"
            icon={MessageCircle}
            iconColor="text-purple-600 bg-purple-100"
          />
          <StatCard
            title="Shares"
            value={demoStats.shares.toLocaleString()}
            change="+5% from last week"
            changeType="positive"
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
                  {demoStats.engagement}%
                </p>
                <p className="text-sm text-gray-500">Avg. Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  +{demoStats.growth}%
                </p>
                <p className="text-sm text-gray-500">Growth Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">4.2</p>
                <p className="text-sm text-gray-500">Avg. Posts/Day</p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI Insights
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
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 bg-gray-50 rounded-lg border-l-4 ${getPriorityColor(
                      insight.priority
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Performance by Type */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content Performance by Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { type: 'Promotional', count: 45, engagement: 6.2, color: 'bg-blue-500' },
              { type: 'Educational', count: 32, engagement: 8.1, color: 'bg-emerald-500' },
              { type: 'Behind-the-Scenes', count: 28, engagement: 9.4, color: 'bg-purple-500' },
              { type: 'Testimonial', count: 15, engagement: 7.8, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.type} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {item.type}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500">
                  {item.engagement}% engagement
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

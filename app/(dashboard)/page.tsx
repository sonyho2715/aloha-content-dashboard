'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import {
  Users,
  FileVideo,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Play,
  AlertCircle,
} from 'lucide-react';
import { getDashboardOverview, DashboardOverview } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const result = await getDashboardOverview();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOverview(result.data);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Dashboard" subtitle="Overview of your content factory" />
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800">Connection Error</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of your content factory"
        onRefresh={fetchData}
      />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Clients"
            value={overview?.activeClients || 0}
            change={`${overview?.totalClients || 0} total`}
            icon={Users}
            iconColor="text-blue-600 bg-blue-100"
          />
          <StatCard
            title="Total Content"
            value={overview?.totalContent || 0}
            change={`${overview?.weeklyStats.scriptsGenerated || 0} scripts this week`}
            changeType="positive"
            icon={FileVideo}
            iconColor="text-purple-600 bg-purple-100"
          />
          <StatCard
            title="Pending Review"
            value={overview?.pendingReview || 0}
            icon={Clock}
            iconColor="text-amber-600 bg-amber-100"
          />
          <StatCard
            title="Published Today"
            value={overview?.publishedToday || 0}
            change={`${overview?.scheduledPosts || 0} scheduled`}
            icon={CheckCircle}
            iconColor="text-emerald-600 bg-emerald-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileVideo className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-600">Scripts Generated</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {overview?.weeklyStats.scriptsGenerated || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Play className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-600">Videos Rendered</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {overview?.weeklyStats.videosRendered || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-600">Posts Published</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {overview?.weeklyStats.postsPublished || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {overview?.recentActivity && overview.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {overview.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <p className="text-emerald-100 text-sm mb-4">
            Get started with common tasks
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/clients"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Add New Client
            </a>
            <a
              href="/content"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Generate Content
            </a>
            <a
              href="/review"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Review Queue
            </a>
            <a
              href="/analytics"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

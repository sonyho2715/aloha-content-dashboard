'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import {
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Calendar,
  Eye,
} from 'lucide-react';
import { getReviewQueue, approveRender, ReviewRender, toReviewItem, ReviewItem } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const result = await getReviewQueue();
    if (result.data) {
      // Transform API response to ReviewItem format
      setItems(result.data.map((r: ReviewRender) => toReviewItem(r)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const result = await approveRender(id);
    if (!result.error) {
      setItems(items.filter((item) => item.id !== id));
      setSelectedItem(null);
    }
    setActionLoading(null);
  };

  return (
    <>
      <Header
        title="Review Queue"
        subtitle={`${items.length} items pending review`}
        onRefresh={fetchData}
      />

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">
              No content waiting for review. New content will appear here when ready.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.keyword}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.clientName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            item.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.qualityScore !== undefined && (
                          <span className="text-gray-500">
                            Score: {(item.qualityScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(item.id);
                        }}
                        disabled={actionLoading === item.id}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-8">
              {selectedItem ? (
                <>
                  <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                    {selectedItem.thumbnailUrl ? (
                      <img
                        src={selectedItem.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Play className="h-16 w-16 text-white/50" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedItem.keyword}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Client: {selectedItem.clientName}
                  </p>
                  {selectedItem.qualityScore !== undefined && (
                    <p className="text-sm text-gray-500 mb-4">
                      Quality Score: {(selectedItem.qualityScore * 100).toFixed(0)}%
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Eye className="h-4 w-4" />
                      Preview Video
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedItem.id)}
                      disabled={actionLoading === selectedItem.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedItem.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select an item to preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

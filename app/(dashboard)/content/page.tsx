'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import {
  FileVideo,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { getRenders, getScripts, RenderFull, ScriptFull } from '@/lib/api';
import { format } from 'date-fns';

type TabType = 'renders' | 'scripts';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('renders');
  const [renders, setRenders] = useState<RenderFull[]>([]);
  const [scripts, setScripts] = useState<ScriptFull[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [rendersResult, scriptsResult] = await Promise.all([
      getRenders(),
      getScripts(),
    ]);
    if (rendersResult.data) setRenders(rendersResult.data);
    if (scriptsResult.data) setScripts(scriptsResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
      case 'rendering':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      rendering: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      draft: 'bg-gray-100 text-gray-700',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Header
        title="Content Library"
        subtitle="Manage your generated content"
        onRefresh={fetchData}
      />

      <div className="p-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('renders')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'renders'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Videos ({renders.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scripts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Scripts ({scripts.length})
              </span>
            </button>
          </div>

          <div className="flex-1" />

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Sparkles className="h-4 w-4" />
            Generate New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : activeTab === 'renders' ? (
          renders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-500">
                Generate scripts and render videos to see them here
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {renders.map((render) => (
                    <tr key={render.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                            {render.thumbnailUrl ? (
                              <img
                                src={render.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Play className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {render.script?.keyword || `Video ${render.id.slice(0, 8)}`}
                            </span>
                            {render.client && (
                              <p className="text-xs text-gray-500">{render.client.businessName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            render.status
                          )}`}
                        >
                          {getStatusIcon(render.status)}
                          {render.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {render.durationSeconds ? `${render.durationSeconds}s` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {render.qualityScore ? `${(render.qualityScore * 100).toFixed(0)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(render.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : scripts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileVideo className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scripts yet</h3>
            <p className="text-gray-500">
              Generate your first AI script to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{script.keyword}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {script.client && (
                        <span className="text-xs text-gray-500">
                          {script.client.businessName}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {script.voiceStyle || script.contentType || 'Standard'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          script.status
                        )}`}
                      >
                        {getStatusIcon(script.status)}
                        {script.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(script.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{script.hookText}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{script.wordCount} words</span>
                  <span>~{script.estimatedDuration}s</span>
                  {script.voiceover && (
                    <span className={`px-2 py-0.5 rounded ${
                      script.voiceover.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      Voiceover: {script.voiceover.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

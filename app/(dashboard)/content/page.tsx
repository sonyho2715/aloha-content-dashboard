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
  X,
  Loader2,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { getRenders, getScripts, getClients, generateScript, RenderFull, ScriptFull, ClientFull, GenerateScriptData } from '@/lib/api';
import { format } from 'date-fns';

type TabType = 'renders' | 'scripts';

const CONTENT_TYPES = [
  { value: 'promotional', label: 'Promotional' },
  { value: 'educational', label: 'Educational' },
  { value: 'behind_the_scenes', label: 'Behind the Scenes' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'announcement', label: 'Announcement' },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('renders');
  const [renders, setRenders] = useState<RenderFull[]>([]);
  const [scripts, setScripts] = useState<ScriptFull[]>([]);
  const [clients, setClients] = useState<ClientFull[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateData, setGenerateData] = useState<Partial<GenerateScriptData>>({
    clientId: '',
    keyword: '',
    contentType: 'promotional',
    audienceType: 'local',
    queueVoiceover: true,
  });

  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterClientId, setFilterClientId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Video preview state
  const [previewVideo, setPreviewVideo] = useState<RenderFull | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const filterParams: { clientId?: string; status?: string } = {};
    if (filterClientId) filterParams.clientId = filterClientId;
    if (filterStatus) filterParams.status = filterStatus;

    const [rendersResult, scriptsResult, clientsResult] = await Promise.all([
      getRenders(filterParams),
      getScripts(filterParams),
      getClients({ active: 'true' }),
    ]);
    if (rendersResult.data) setRenders(rendersResult.data);
    if (scriptsResult.data) setScripts(scriptsResult.data);
    if (clientsResult.data) {
      setClients(clientsResult.data);
      // Set default client for generate modal if not set
      if (!generateData.clientId && clientsResult.data.length > 0) {
        const firstClientId = clientsResult.data[0].id;
        setGenerateData(prev => ({ ...prev, clientId: firstClientId }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterClientId, filterStatus]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateError(null);
    setGenerating(true);

    try {
      if (!generateData.clientId || !generateData.keyword) {
        setGenerateError('Client and keyword are required');
        setGenerating(false);
        return;
      }

      const result = await generateScript(generateData as GenerateScriptData);
      if (result.success) {
        setShowGenerateModal(false);
        setGenerateData({
          clientId: clients[0]?.id || '',
          keyword: '',
          contentType: 'promotional',
          audienceType: 'local',
          queueVoiceover: true,
        });
        setActiveTab('scripts');
        fetchData();
      } else {
        setGenerateError(result.error || 'Failed to generate script');
      }
    } catch (error) {
      setGenerateError('An unexpected error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const clearFilters = () => {
    setFilterClientId('');
    setFilterStatus('');
  };

  const hasFilters = filterClientId || filterStatus;

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

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                hasFilters
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasFilters && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-10 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <select
                      value={filterClientId}
                      onChange={(e) => setFilterClientId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">All Clients</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.businessName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="approved">Approved</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="flex-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewVideo(render)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            View
                          </button>
                          {render.videoUrl && (
                            <a
                              href={render.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
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

      {/* Generate Script Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold">Generate AI Script</h2>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              {generateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {generateError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={generateData.clientId}
                  onChange={(e) => setGenerateData({ ...generateData, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={generateData.keyword}
                  onChange={(e) => setGenerateData({ ...generateData, keyword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., lomi lomi massage, happy hour specials"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={generateData.contentType}
                    onChange={(e) => setGenerateData({ ...generateData, contentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={generateData.audienceType}
                    onChange={(e) => setGenerateData({ ...generateData, audienceType: e.target.value as 'local' | 'tourist' | 'mixed' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="local">Local</option>
                    <option value="tourist">Tourist</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Angle / Hook (optional)
                </label>
                <input
                  type="text"
                  value={generateData.angle || ''}
                  onChange={(e) => setGenerateData({ ...generateData, angle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., seasonal special, customer story"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="queueVoiceover"
                  checked={generateData.queueVoiceover}
                  onChange={(e) => setGenerateData({ ...generateData, queueVoiceover: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="queueVoiceover" className="text-sm text-gray-700">
                  Automatically generate voiceover
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !generateData.clientId || !generateData.keyword}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Script
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {previewVideo.script?.keyword || `Video ${previewVideo.id.slice(0, 8)}`}
                </h2>
                {previewVideo.client && (
                  <p className="text-sm text-gray-500">{previewVideo.client.businessName}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {previewVideo.videoUrl ? (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Play className="h-16 w-16 mx-auto mb-2" />
                    <p>Video not yet available</p>
                    <p className="text-sm">Status: {previewVideo.status}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{previewVideo.status}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {previewVideo.durationSeconds ? `${previewVideo.durationSeconds}s` : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Quality Score</p>
                  <p className="font-medium text-gray-900">
                    {previewVideo.qualityScore ? `${(previewVideo.qualityScore * 100).toFixed(0)}%` : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(previewVideo.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {previewVideo.videoUrl && (
                <div className="flex justify-end mt-4">
                  <a
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

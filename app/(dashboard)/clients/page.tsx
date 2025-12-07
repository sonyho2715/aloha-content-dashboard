'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import {
  Plus,
  Search,
  Building2,
  Users,
  Tag,
  MoreVertical,
  ExternalLink,
  Trash2,
  FileVideo,
  Play,
  X,
  Loader2,
} from 'lucide-react';
import { getClients, createClient, deleteClient, ClientFull, CreateClientData } from '@/lib/api';
import { format } from 'date-fns';

const INDUSTRIES = [
  'restaurant',
  'spa_wellness',
  'retail',
  'hospitality',
  'fitness',
  'beauty_salon',
  'automotive',
  'real_estate',
  'healthcare',
  'professional_services',
  'tourism',
  'food_truck',
  'cafe',
  'bar_nightclub',
  'other',
];

const ISLANDS = ['Oahu', 'Maui', 'Big Island', 'Kauai', 'Molokai', 'Lanai'];

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateClientData>>({
    businessName: '',
    industry: 'restaurant',
    contactName: '',
    contactEmail: '',
    primaryAudience: 'local',
    tier: 'starter',
    monthlyFee: 500,
    locations: [{ name: 'Main', island: 'Oahu', neighborhood: '' }],
    keywords: [],
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ClientFull | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const result = await getClients();
    if (result.success && result.data) {
      setClients(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const result = await createClient(formData as CreateClientData);
      if (result.success) {
        setShowAddModal(false);
        setFormData({
          businessName: '',
          industry: 'restaurant',
          contactName: '',
          contactEmail: '',
          primaryAudience: 'local',
          tier: 'starter',
          monthlyFee: 500,
          locations: [{ name: 'Main', island: 'Oahu', neighborhood: '' }],
          keywords: [],
        });
        fetchData();
      } else {
        setFormError(result.error || 'Failed to create client');
      }
    } catch (error) {
      setFormError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    setDeletingId(showDeleteConfirm.id);

    try {
      const result = await deleteClient(showDeleteConfirm.id);
      if (result.success) {
        setClients(clients.filter(c => c.id !== showDeleteConfirm.id));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatIndustry = (industry: string) => {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <>
      <Header
        title="Clients"
        subtitle="Manage your SMB clients"
        onRefresh={fetchData}
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-500 mb-4">
              Add your first Hawaii SMB client to start generating content
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.businessName}</h3>
                      <p className="text-sm text-gray-500">{formatIndustry(client.industry)}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>Tier: {client.tier}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Audience: {client.primaryAudience}</span>
                  </div>
                  {client._count && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileVideo className="h-4 w-4" />
                        {client._count.scripts} scripts
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {client._count.renders} videos
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : client.status === 'paused'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {client.status}
                  </span>
                  {client.locations && client.locations.length > 0 && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                      {client.locations[0].island}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Added {format(new Date(client.createdAt), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(client)}
                      disabled={deletingId === client.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete client"
                    >
                      {deletingId === client.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    {client.website && (
                      <a
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add New Client</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Business Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Aloha Spa & Wellness"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {formatIndustry(ind)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Island *
                    </label>
                    <select
                      required
                      value={formData.locations?.[0]?.island || 'Oahu'}
                      onChange={(e) => setFormData({
                        ...formData,
                        locations: [{ ...formData.locations?.[0], island: e.target.value, name: formData.locations?.[0]?.name || 'Main', neighborhood: formData.locations?.[0]?.neighborhood || '' }]
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {ISLANDS.map((island) => (
                        <option key={island} value={island}>
                          {island}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neighborhood
                    </label>
                    <input
                      type="text"
                      value={formData.locations?.[0]?.neighborhood || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        locations: [{ ...formData.locations?.[0], neighborhood: e.target.value, name: formData.locations?.[0]?.name || 'Main', island: formData.locations?.[0]?.island || 'Oahu' }]
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Waikiki, Kailua"
                    />
                  </div>
                </div>
              </div>

              {/* Service Tier */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Service Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={formData.primaryAudience}
                      onChange={(e) => setFormData({ ...formData, primaryAudience: e.target.value as 'local' | 'tourist' | 'both' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="local">Local</option>
                      <option value="tourist">Tourist</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Tier
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'starter' | 'growth' | 'scale' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="starter">Starter ($500/mo)</option>
                      <option value="growth">Growth ($1,000/mo)</option>
                      <option value="scale">Scale ($2,000/mo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.businessName}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Client
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Client</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{showDeleteConfirm.businessName}</strong>?
              This will also delete all associated scripts, videos, and analytics data. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId === showDeleteConfirm.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

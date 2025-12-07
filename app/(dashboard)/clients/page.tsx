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
} from 'lucide-react';
import { getClients, Client } from '@/lib/api';
import { format } from 'date-fns';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await getClients();
    if (result.data) {
      setClients(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.industry}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{client.businessType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{client.targetAudience}</span>
                  </div>
                </div>

                {client.keywords && client.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {client.keywords.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                    {client.keywords.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{client.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {client.platforms && client.platforms.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {client.platforms.map((platform, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Added {format(new Date(client.createdAt), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            <p className="text-gray-500 mb-4">
              Client creation form coming soon. Use the API directly for now.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

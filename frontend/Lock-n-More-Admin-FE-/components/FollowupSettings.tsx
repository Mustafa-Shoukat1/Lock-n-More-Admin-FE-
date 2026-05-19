import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface FollowupTemplate {
  id: number;
  platform: string;
  message_text: string;
  is_active: boolean;
}

interface FollowupSchedule {
  id: number;
  platform: string;
  session_id: string;
  delay_minutes: number;
  next_send_at: string;
  last_sent_at?: string;
  is_enabled: boolean;
}

export const FollowupSettings: React.FC = () => {
  const [templates, setTemplates] = useState<FollowupTemplate[]>([]);
  const [activeFollowups, setActiveFollowups] = useState<FollowupSchedule[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FollowupTemplate | null>(null);
  const [editingText, setEditingText] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(120);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadActiveFollowups();
    const interval = setInterval(loadActiveFollowups, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/followup/templates');
      setTemplates(response.data || []);
      if (response.data?.length > 0) {
        setSelectedTemplate(response.data[0]);
        setEditingText(response.data[0].message_text);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadActiveFollowups = async () => {
    try {
      const response = await api.get('/followup/all');
      setActiveFollowups(response.data || []);
    } catch (error) {
      console.error('Error loading active followups:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !editingText.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/followup/templates/${selectedTemplate.id}`, {
        messageText: editingText
      });
      loadTemplates();
      alert('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFollowup = async (id: number) => {
    if (!window.confirm('Cancel this follow-up?')) return;

    setLoading(true);
    try {
      await api.delete(`/followup/${id}`);
      loadActiveFollowups();
      alert('Follow-up cancelled');
    } catch (error) {
      console.error('Error cancelling followup:', error);
      alert('Failed to cancel follow-up');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDelay = async (id: number, newDelay: number) => {
    setLoading(true);
    try {
      await api.patch(`/followup/${id}/delay`, {
        delayMinutes: newDelay
      });
      loadActiveFollowups();
    } catch (error) {
      console.error('Error updating delay:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg space-y-6">
      <h2 className="text-2xl font-bold text-white">Follow-up Automation</h2>

      {/* Templates Section */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">Follow-up Messages</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Select Platform:</label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = templates.find(t => t.id === parseInt(e.target.value));
              if (template) {
                setSelectedTemplate(template);
                setEditingText(template.message_text);
              }
            }}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.platform.charAt(0).toUpperCase() + t.platform.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Message Template:</label>
          <textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            placeholder="Enter the automatic follow-up message..."
          />
        </div>

        <button
          onClick={handleUpdateTemplate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Configuration Section */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">Default Settings</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Default Delay (minutes):</label>
          <select
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={480}>8 hours</option>
            <option value={1440}>24 hours</option>
          </select>
          <p className="text-sm text-gray-400">
            Bot will send automatic follow-up after customer silence
          </p>
        </div>
      </div>

      {/* Active Follow-ups Section */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Active Follow-ups ({activeFollowups.length})
        </h3>

        {activeFollowups.length === 0 ? (
          <p className="text-gray-400 text-sm">No active follow-ups scheduled</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left">Platform</th>
                  <th className="px-4 py-2 text-left">Session</th>
                  <th className="px-4 py-2 text-left">Next Send</th>
                  <th className="px-4 py-2 text-left">Delay</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {activeFollowups.map(followup => (
                  <tr key={followup.id} className="hover:bg-slate-700">
                    <td className="px-4 py-2 font-medium">
                      {followup.platform.charAt(0).toUpperCase() + followup.platform.slice(1)}
                    </td>
                    <td className="px-4 py-2 text-xs truncate">
                      {followup.session_id}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {new Date(followup.next_send_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={followup.delay_minutes}
                        onChange={(e) => handleUpdateDelay(followup.id, parseInt(e.target.value))}
                        className="px-2 py-1 bg-slate-600 text-white rounded text-xs"
                        disabled={loading}
                      >
                        <option value={30}>30m</option>
                        <option value={60}>1h</option>
                        <option value={120}>2h</option>
                        <option value={480}>8h</option>
                        <option value={1440}>24h</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleCancelFollowup(followup.id)}
                        disabled={loading}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowupSettings;

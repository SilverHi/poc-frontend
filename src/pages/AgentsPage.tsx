import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal, FormModal } from '../components/Modal';
import { notification } from 'antd';
import { apiService } from '../services/api';
import { CustomAgent } from '../types';

interface OpenAIConfig {
  models: Array<{
    id: string;
    name: string;
    max_tokens: number;
    description: string;
  }>;
  default_model: string;
  default_temperature: number;
  default_max_tokens: number;
  is_configured: boolean;
  has_api_key: boolean;
}

const categories = [
  { value: 'analysis', label: 'Analysis', color: 'bg-purple-500' },
  { value: 'validation', label: 'Validation', color: 'bg-blue-500' },
  { value: 'generation', label: 'Generation', color: 'bg-orange-500' },
  { value: 'optimization', label: 'Optimization', color: 'bg-yellow-500' },
];

const icons = ['📝', '🧠', '✅', '📖', '🎯', '📋', '⚡', '🔗', '🔍', '💡', '🎨', '🛠️'];

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [config, setConfig] = useState<OpenAIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📝',
    category: 'analysis',
    color: 'bg-purple-500',
    system_prompt: '',
    model: '',
    temperature: 0.7,
    max_tokens: 1000,
  });

  useEffect(() => {
    fetchAgents();
    fetchConfig();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await apiService.getAgents() as CustomAgent[];
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      notification.error({
        message: 'Failed to fetch agents',
        description: 'Unable to get agent list',
        placement: 'topRight',
      });
    }
  };

  const fetchConfig = async () => {
    try {
      const data = await apiService.getOpenAIConfig() as OpenAIConfig;
      setConfig(data);
      if (data.models.length > 0) {
        setFormData(prev => ({
          ...prev,
          model: data.default_model || data.models[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      notification.error({
        message: 'Failed to fetch configuration',
        description: 'Unable to get OpenAI configuration',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (editingAgent) {
        // Update existing agent
        await apiService.updateAgent(editingAgent.id, formData);
      } else {
        // Create new agent
        await apiService.createAgent(formData);
      }
      
      await fetchAgents();
      notification.success({
        message: editingAgent ? 'Agent updated successfully' : 'Agent created successfully',
        description: editingAgent ? 'Agent has been successfully updated' : 'New Agent has been successfully created',
        placement: 'topRight',
      });
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      notification.error({
        message: 'Operation failed',
        description: 'Failed to save agent',
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (agent: CustomAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      category: agent.category,
      color: agent.color,
      system_prompt: agent.system_prompt,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setAgentToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      setDeleting(true);
      await apiService.deleteAgent(agentToDelete);

      await fetchAgents();
      notification.success({
        message: 'Deleted successfully',
        description: 'Agent deleted successfully!',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      notification.error({
        message: 'Delete failed',
        description: 'Failed to delete agent',
        placement: 'topRight',
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setAgentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAgentToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '📝',
      category: 'analysis',
      color: 'bg-purple-500',
      system_prompt: '',
      model: config?.default_model || '',
      temperature: 0.7,
      max_tokens: 1000,
    });
    setEditingAgent(null);
    setShowForm(false);
  };

  const handleOptimizePrompt = async () => {
    try {
      setOptimizing(true);
      const result = await apiService.optimizePrompt(formData.system_prompt);
      setFormData(prev => ({ ...prev, system_prompt: result.optimized_prompt }));
      notification.success({
        message: 'Prompt Optimized Successfully',
        description: 'System prompt has been successfully optimized',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      notification.error({
        message: 'Optimization Failed',
        description: 'Failed to optimize prompt, please try again later',
        placement: 'topRight',
      });
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!config?.is_configured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">OpenAI Not Configured</h1>
          <p className="text-gray-600 mb-6">
            Please configure your OpenAI API key in the config/openai.json file to use custom agents.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent Builder</h1>
            <p className="text-sm text-gray-600">Create and manage custom AI agents</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Home
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Agent
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Agent Form Modal */}
        <FormModal
          isOpen={showForm}
          onClose={resetForm}
          onSubmit={handleSubmit}
          title={editingAgent ? 'Edit Agent' : 'Create New Agent'}
          submitText={editingAgent ? 'Update Agent' : 'Create Agent'}
          cancelText="Cancel"
          isSubmitting={submitting}
          canSubmit={!!(formData.name && formData.description && formData.system_prompt)}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const category = categories.find(c => c.value === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    category: e.target.value,
                    color: category?.color || 'bg-purple-500'
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt
              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={!formData.system_prompt.trim() || optimizing}
                className="ml-2 px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {optimizing ? 'Optimizing...' : '✨ Optimize Prompt'}
              </button>
            </label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              rows={6}
              placeholder="Please enter system prompt, describing the role and tasks of the AI assistant..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {config?.models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature
            </label>
            <input
              type="number"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={formData.max_tokens}
              onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </FormModal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this Agent? This action cannot be undone."
          confirmText="Confirm Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          isLoading={deleting}
        />

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${agent.color} flex items-center justify-center text-white text-xl`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {agent.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClick(agent.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span>{agent.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{agent.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Tokens:</span>
                  <span>{agent.max_tokens}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Agents</h3>
            <p className="text-gray-600 mb-6">Create your first custom agent to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
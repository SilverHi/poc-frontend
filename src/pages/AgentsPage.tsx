import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal, FormModal } from '../components/Modal';
import { notification } from 'antd';

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

interface OpenAIConfig {
  models: Array<{
    id: string;
    name: string;
    maxTokens: number;
    description: string;
  }>;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  isConfigured: boolean;
  hasApiKey: boolean;
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📝',
    category: 'analysis',
    color: 'bg-purple-500',
    systemPrompt: '',
    model: '',
    temperature: 0.7,
    maxTokens: 1000,
  });

  useEffect(() => {
    fetchAgents();
    fetchConfig();
  }, []);

  const fetchAgents = async () => {
    try {
      // Mock API call - 替换为实际的API调用
      const mockAgents: CustomAgent[] = [];
      setAgents(mockAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      // Mock config - 替换为实际的API调用
      const mockConfig: OpenAIConfig = {
        models: [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4000, description: 'Fast and efficient' },
          { id: 'gpt-4', name: 'GPT-4', maxTokens: 8000, description: 'Most capable model' }
        ],
        defaultModel: 'gpt-3.5-turbo',
        defaultTemperature: 0.7,
        defaultMaxTokens: 1000,
        isConfigured: true,
        hasApiKey: true
      };
      setConfig(mockConfig);
      if (mockConfig.models.length > 0) {
        setFormData(prev => ({
          ...prev,
          model: mockConfig.defaultModel || mockConfig.models[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Mock API call - 替换为实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟
      
      await fetchAgents();
      notification.success({
        message: editingAgent ? 'Agent 更新成功' : 'Agent 创建成功',
        description: editingAgent ? 'Agent 已成功更新' : '新的 Agent 已成功创建',
        placement: 'topRight',
      });
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      notification.error({
        message: '操作失败',
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
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
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
      // Mock API call - 替换为实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟

      await fetchAgents();
      notification.success({
        message: '删除成功',
        description: 'Agent 删除成功！',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      notification.error({
        message: '删除失败',
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
      systemPrompt: '',
      model: config?.defaultModel || '',
      temperature: 0.7,
      maxTokens: 1000,
    });
    setEditingAgent(null);
    setShowForm(false);
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

  if (!config?.isConfigured) {
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
          canSubmit={!!(formData.name && formData.description && formData.systemPrompt)}
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
            </label>
            <input
              type="text"
              value={formData.systemPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              value={formData.maxTokens}
              onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
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
          title="确认删除"
          message="确定要删除这个Agent吗？此操作无法撤销。"
          confirmText="确认删除"
          cancelText="取消"
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
                  <span>{agent.maxTokens}</span>
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
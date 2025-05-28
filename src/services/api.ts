import { StoredResource, CustomAgent } from '@/types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses, return null
      return null as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Agent related APIs
  async getAgents(): Promise<CustomAgent[]> {
    return this.request('/agents');
  }

  async createAgent(agentData: any) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(agentId: string, agentData: any) {
    return this.request(`/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(agentId: string) {
    return this.request(`/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async executeAgent(agentId: string, input: string): Promise<{ output: string; logs: string[] }> {
    return this.request(`/agents/${agentId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  async optimizePrompt(prompt: string): Promise<{ optimized_prompt: string; logs: string[] }> {
    return this.request('/agents/optimize-prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Resource related APIs
  async getResources(): Promise<StoredResource[]> {
    return this.request('/resources');
  }

  async uploadResource(file: File, title: string, description: string = ''): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);

    await this.request('/resources/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser automatically set Content-Type for FormData
    });
  }

  async deleteResource(resourceId: string) {
    return this.request(`/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  async updateResource(resourceId: string, resourceData: any) {
    return this.request(`/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  }

  // Config related APIs
  async getOpenAIConfig(): Promise<any> {
    return this.request('/config/openai');
  }

  async updateOpenAIConfig(config: any) {
    return this.request('/config/openai', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Export API service
export const apiService = {
  // Get resource list
  async getResources() {
    return apiClient.getResources();
  },

  // Get custom agent list
  async getAgents() {
    return apiClient.getAgents();
  },

  // Execute custom agent
  async executeAgent(agentId: string, input: string) {
    return apiClient.executeAgent(agentId, input);
  },

  // Create agent
  async createAgent(agentData: any) {
    return apiClient.createAgent(agentData);
  },

  // Update agent
  async updateAgent(agentId: string, agentData: any) {
    return apiClient.updateAgent(agentId, agentData);
  },

  // Delete agent
  async deleteAgent(agentId: string) {
    return apiClient.deleteAgent(agentId);
  },

  // Optimize prompt
  async optimizePrompt(prompt: string) {
    return apiClient.optimizePrompt(prompt);
  },

  // Upload resource
  async uploadResource(file: File, title: string, description: string = '') {
    return apiClient.uploadResource(file, title, description);
  },

  // Delete resource
  async deleteResource(resourceId: string) {
    return apiClient.deleteResource(resourceId);
  },

  // Update resource
  async updateResource(resourceId: string, resourceData: any) {
    return apiClient.updateResource(resourceId, resourceData);
  },

  // Get OpenAI configuration
  async getOpenAIConfig() {
    return apiClient.getOpenAIConfig();
  },

  // Update OpenAI configuration
  async updateOpenAIConfig(config: any) {
    return apiClient.updateOpenAIConfig(config);
  }
}; 
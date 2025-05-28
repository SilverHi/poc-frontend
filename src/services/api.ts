import { StoredResource } from '@/types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// API 客户端类
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

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Agent 相关 API
  async getAgents() {
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

  // Resource 相关 API
  async getResources(): Promise<StoredResource[]> {
    return this.request('/resources');
  }

  async uploadResource(formData: FormData): Promise<any> {
    return this.request('/resources/upload', {
      method: 'POST',
      headers: {}, // 让浏览器自动设置 Content-Type for FormData
      body: formData,
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

  // Config 相关 API
  async getOpenAIConfig() {
    return this.request('/config/openai');
  }

  async updateOpenAIConfig(configData: any) {
    return this.request('/config/openai', {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }
}

// 创建 API 客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 导出 API 服务
export const apiService = {
  // 获取资源列表
  async getResources(): Promise<StoredResource[]> {
    return apiClient.getResources();
  },

  // 获取自定义代理列表
  async getAgents() {
    return apiClient.getAgents();
  },

  // 执行自定义代理
  async executeAgent(agentId: string, input: string): Promise<{ output: string; logs: string[] }> {
    return apiClient.executeAgent(agentId, input);
  },

  // 创建代理
  async createAgent(agentData: any) {
    return apiClient.createAgent(agentData);
  },

  // 更新代理
  async updateAgent(agentId: string, agentData: any) {
    return apiClient.updateAgent(agentId, agentData);
  },

  // 删除代理
  async deleteAgent(agentId: string) {
    return apiClient.deleteAgent(agentId);
  },

  // 上传资源
  async uploadResource(file: File, title: string, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    return apiClient.uploadResource(formData);
  },

  // 删除资源
  async deleteResource(resourceId: string) {
    return apiClient.deleteResource(resourceId);
  },

  // 更新资源
  async updateResource(resourceId: string, resourceData: any) {
    return apiClient.updateResource(resourceId, resourceData);
  },

  // 获取OpenAI配置
  async getOpenAIConfig() {
    return apiClient.getOpenAIConfig();
  },

  // 更新OpenAI配置
  async updateOpenAIConfig(configData: any) {
    return apiClient.updateOpenAIConfig(configData);
  },
}; 
import { StoredResource } from '@/types';

// Mock 数据
const mockStoredResources: StoredResource[] = [
  {
    id: '1',
    title: '产品需求文档模板',
    description: '标准的产品需求文档模板，包含功能需求、非功能需求等',
    type: 'md',
    parsedContent: `# 产品需求文档模板

## 1. 产品概述
- 产品名称
- 产品定位
- 目标用户

## 2. 功能需求
- 核心功能
- 辅助功能
- 扩展功能

## 3. 非功能需求
- 性能要求
- 安全要求
- 可用性要求`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: '用户故事模板',
    description: '敏捷开发中的用户故事编写模板',
    type: 'text',
    parsedContent: `作为一个 [用户角色]
我希望 [功能描述]
以便于 [价值/目标]

验收标准：
- [ ] 标准1
- [ ] 标准2
- [ ] 标准3`,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockCustomAgents = [
  {
    id: 'custom-1',
    name: '需求分析师',
    description: '专门分析和整理产品需求的AI助手',
    icon: '📋',
    category: 'analysis',
    color: '#1890ff',
    systemPrompt: '你是一个专业的需求分析师...',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  // 获取资源列表
  async getResources(): Promise<StoredResource[]> {
    await delay(500);
    return mockStoredResources;
  },

  // 获取自定义代理列表
  async getAgents() {
    await delay(300);
    return mockCustomAgents;
  },

  // 执行自定义代理
  async executeAgent(agentId: string, input: string): Promise<{ output: string; logs: string[] }> {
    await delay(2000);
    
    const logs = [
      `启动代理 ${agentId}...`,
      '分析输入内容...',
      '应用处理逻辑...',
      '生成输出结果...'
    ];

    const output = `这是代理 ${agentId} 处理的结果：\n\n基于输入内容："${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"，我已经完成了分析和处理。\n\n处理结果包含了详细的分析和建议。`;

    return { output, logs };
  }
}; 
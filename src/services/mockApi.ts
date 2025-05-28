import { StoredResource } from '@/types';

// Mock data
const mockStoredResources: StoredResource[] = [
  {
    id: '1',
    title: 'Product Requirements Document Template',
    description: 'Standard product requirements document template, including functional requirements, non-functional requirements, etc.',
    file_name: 'product-requirements-template.md',
    file_size: 2048,
    file_type: 'md',
    parsed_content: `# Product Requirements Document Template

## 1. Product Overview
- Product Name
- Product Positioning
- Target Users

## 2. Functional Requirements
- Core Functions
- Auxiliary Functions
- Extended Functions

## 3. Non-functional Requirements
- Performance Requirements
- Security Requirements
- Usability Requirements`,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'User Story Template',
    description: 'User story writing template in agile development',
    file_name: 'user-story-template.txt',
    file_size: 512,
    file_type: 'text',
    parsed_content: `As a [user role]
I want [feature description]
So that [value/goal]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3`,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

const mockCustomAgents = [
  {
    id: 'custom-1',
    name: 'Requirements Analyst',
    description: 'AI assistant specialized in analyzing and organizing product requirements',
    icon: '📋',
    category: 'analysis',
    color: '#1890ff',
    systemPrompt: 'You are a professional requirements analyst...',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  // Get resource list
  async getResources(): Promise<StoredResource[]> {
    await delay(500);
    return mockStoredResources;
  },

  // Get custom agent list
  async getAgents() {
    await delay(300);
    return mockCustomAgents;
  },

  // Execute custom agent
  async executeAgent(agentId: string, input: string): Promise<{ output: string; logs: string[] }> {
    await delay(2000);
    
    const logs = [
      `Starting agent ${agentId}...`,
      'Analyzing input content...',
      'Applying processing logic...',
      'Generating output result...'
    ];

    const output = `This is the result processed by agent ${agentId}:\n\nBased on the input content: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}", I have completed the analysis and processing.\n\nThe processing result contains detailed analysis and recommendations.`;

    return { output, logs };
  }
}; 
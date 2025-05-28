export interface InputResource {
  id: string;
  title: string;
  type: 'pdf' | 'md' | 'text';
  content: string;
  description?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'validation' | 'generation' | 'optimization';
  color: string;
}

export interface WorkflowStep {
  id: string;
  agent: Agent;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  logs?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

// 新增对话链相关类型
export interface ConversationNode {
  id: string;
  type: 'input' | 'output' | 'bubble';
  content: string;
  resources?: InputResource[];
  agent?: Agent;
  status?: 'running' | 'completed' | 'error';
  logs?: string[];
  timestamp: Date;
  isCurrentInput?: boolean;
  isEditable?: boolean;
}

export interface ConversationChain {
  id: string;
  nodes: ConversationNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredResource {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  type: string;
  parsedContent: string;
  createdAt: string;
  updatedAt: string;
} 
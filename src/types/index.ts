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

// Extended Agent type, including complete information returned from backend
export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
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

// New conversation chain related types
export interface ConversationNode {
  id: string;
  type: 'input' | 'output' | 'bubble';
  content: string;
  resources?: InputResource[];
  agent?: Agent;
  agentId?: string;
  agentName?: string;
  status?: 'running' | 'completed' | 'error';
  logs?: string[];
  executionLogs?: string[];
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
  file_name: string;
  file_size: number;
  file_type: string;
  parsed_content: string;
  created_at: string;
  updated_at: string;
}

// Conversation history related types
export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  node_type: 'query' | 'answer' | 'log';
  content: string;
  sort: number;
  agent_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}

export interface ConversationMessageCreate {
  conversation_id: string;
  node_type: 'query' | 'answer' | 'log';
  content: string;
  sort: number;
  agent_id: string | null;
}

export interface SaveConversationRequest {
  title: string;
  messages: ConversationMessageCreate[];
} 
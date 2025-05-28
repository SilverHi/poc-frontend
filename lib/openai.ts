import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
  models: Array<{
    id: string;
    name: string;
    maxTokens: number;
    description: string;
  }>;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config', 'openai.json');
      const configFile = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configFile);
      
      if (this.config && this.config.apiKey && this.config.apiKey !== 'your-openai-api-key-here') {
        this.client = new OpenAI({
          apiKey: this.config.apiKey,
          baseURL: this.config.baseURL,
        });
      }
    } catch (error) {
      console.error('Error loading OpenAI config:', error);
    }
  }

  getConfig(): OpenAIConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }

  async chat(params: {
    systemPrompt: string;
    userMessage: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI client not configured. Please check your API key in config/openai.json');
    }

    // 将系统提示合并到用户消息中，而不是使用system角色
    // 这样可以兼容不支持system角色的LLM
    const combinedMessage = `Instructions:
${params.systemPrompt}

---

User Input:
${params.userMessage}`;

    const response = await this.client.chat.completions.create({
      model: params.model || this.config.defaultModel,
      messages: [
        { role: 'user', content: combinedMessage }
      ],
      temperature: params.temperature ?? this.config.defaultTemperature,
      max_tokens: params.maxTokens || this.config.defaultMaxTokens,
    });

    return response.choices[0]?.message?.content || 'No response generated';
  }

  async executeAgent(agentConfig: {
    systemPrompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
  }, userInput: string): Promise<{ output: string; logs: string[] }> {
    const logs = [
      'Starting AI agent execution...',
      'Sending request to OpenAI...',
      'Processing response...',
      'Execution completed'
    ];

    try {
      const output = await this.chat({
        systemPrompt: agentConfig.systemPrompt,
        userMessage: userInput,
        model: agentConfig.model,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
      });

      return { output, logs };
    } catch (error) {
      console.error('Error executing agent:', error);
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      
      // Save to file
      try {
        const configPath = path.join(process.cwd(), 'config', 'openai.json');
        fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
        
        // Reinitialize client if API key changed
        if (newConfig.apiKey) {
          this.client = new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL,
          });
        }
      } catch (error) {
        console.error('Error saving OpenAI config:', error);
        throw new Error('Failed to save configuration');
      }
    }
  }
}

export const openaiService = new OpenAIService(); 
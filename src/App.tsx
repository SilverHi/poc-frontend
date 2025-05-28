import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputResource, Agent, ConversationNode, CustomAgent } from '@/types';
import { mockAgents, executeAgent } from '@/data/mockData';
import { StoredResource } from '@/lib/database';
import InputResourceCard from '@/components/InputResourceCard';
import AgentCard from '@/components/AgentCard';
import ConversationChain from '@/components/ConversationChain';
import { apiService } from '@/services/api';
import { 
  Layout, 
  Typography, 
  Button, 
  Input, 
  Card, 
  Space, 
  Tag, 
  Empty,
  Avatar,
  message
} from 'antd';
import { 
  ToolOutlined, 
  ClearOutlined, 
  UploadOutlined, 
  SearchOutlined,
  RocketOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

function App() {
  const [selectedResources, setSelectedResources] = useState<InputResource[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationNodes, setConversationNodes] = useState<ConversationNode[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [storedResources, setStoredResources] = useState<StoredResource[]>([]);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [filteredStoredResources, setFilteredStoredResources] = useState<StoredResource[]>([]);
  
  const conversationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to the latest conversation node
  useEffect(() => {
    if (conversationRef.current && conversationNodes.length > 0) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationNodes]);

  // Fetch custom agents and resources on component mount
  useEffect(() => {
    fetchCustomAgents();
    fetchStoredResources();
  }, []);

  // Initialize first input node
  useEffect(() => {
    if (conversationNodes.length === 0) {
      const initialInputNode: ConversationNode = {
        id: `input-initial`,
        type: 'input',
        content: '',
        resources: [],
        timestamp: new Date(),
        isCurrentInput: true,
        isEditable: true
      };
      setConversationNodes([initialInputNode]);
    }
  }, []);

  // Filter resources based on search query
  useEffect(() => {
    if (resourceSearchQuery.trim()) {
      const filtered = storedResources.filter(resource =>
        resource.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
        resource.parsed_content.toLowerCase().includes(resourceSearchQuery.toLowerCase())
      );
      setFilteredStoredResources(filtered);
    } else {
      setFilteredStoredResources(storedResources);
    }
  }, [resourceSearchQuery, storedResources]);

  const fetchCustomAgents = async () => {
    try {
      const data = await apiService.getAgents() as CustomAgent[];
      setCustomAgents(data);
    } catch (error) {
      console.error('Error fetching custom agents:', error);
      message.error('Failed to fetch custom agents');
    }
  };

  const fetchStoredResources = async () => {
    try {
      const data = await apiService.getResources();
      setStoredResources(data);
    } catch (error) {
      console.error('Error fetching stored resources:', error);
      message.error('Failed to fetch resources');
    }
  };

  const handleResourceSelect = (resource: InputResource) => {
    setSelectedResources(prev => {
      const isSelected = prev.some(r => r.id === resource.id);
      const newResources = isSelected 
        ? prev.filter(r => r.id !== resource.id)
        : [...prev, resource];
      
      // Update current input node resources simultaneously
      setConversationNodes(prevNodes => prevNodes.map(node => 
        node.isCurrentInput 
          ? { ...node, resources: newResources }
          : node
      ));
      
      return newResources;
    });
  };

  const handleAgentSelect = (agent: Agent) => {
    if (isExecuting) return;
    setSelectedAgent(agent);
  };

  const getInputContent = () => {
    // Get content from current input node first
    const currentInputNode = conversationNodes.find(node => node.isCurrentInput);
    let content = currentInputNode ? currentInputNode.content : userInput;
    const resources = currentInputNode ? (currentInputNode.resources || []) : selectedResources;
    
    if (resources.length > 0) {
      const resourceContent = resources.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
      content = content ? `${content}\n\nReference Resources:\n${resourceContent}` : resourceContent;
    }
    return content;
  };

  const canExecute = () => {
    // Check if there is current input node or user input
    const currentInputNode = conversationNodes.find(node => node.isCurrentInput);
    const hasContent = currentInputNode ? 
      (currentInputNode.content.trim() || (currentInputNode.resources && currentInputNode.resources.length > 0)) :
      (userInput.trim() || selectedResources.length > 0);
    
    return selectedAgent && hasContent && !isExecuting;
  };

  const executeCustomAgent = async (agentId: string, input: string): Promise<{ output: string; logs: string[] }> => {
    try {
      return await apiService.executeAgent(agentId, input);
    } catch (error) {
      console.error('Error executing custom agent:', error);
      throw error;
    }
  };

  const handleExecute = async () => {
    if (!canExecute() || !selectedAgent) return;

    setIsExecuting(true);
    setExecutionLogs([]);
    
    // Get current input node content
    const currentInputNode = conversationNodes.find(node => node.isCurrentInput);
    const inputContent = currentInputNode ? getInputContent() : userInput;
    
    // If no current input node, create the first input node
    if (!currentInputNode) {
      const firstInputNode: ConversationNode = {
        id: `input-${Date.now()}`,
        type: 'input',
        content: userInput,
        resources: [...selectedResources],
        timestamp: new Date(),
        isCurrentInput: false, // Becomes history after execution
        isEditable: false
      };
      setConversationNodes(prev => [...prev, firstInputNode]);
    } else {
      // Mark current input node as history
      setConversationNodes(prev => prev.map(node => 
        node.isCurrentInput 
          ? { ...node, isCurrentInput: false, isEditable: false }
          : node
      ));
    }

    // Create bubble node for processing
    const bubbleNode: ConversationNode = {
      id: `bubble-${Date.now()}`,
      type: 'bubble',
      content: `Using ${selectedAgent.name} to process...`,
      agent: selectedAgent,
      status: 'running',
      logs: [],
      timestamp: new Date()
    };
    
    setConversationNodes(prev => [...prev, bubbleNode]);
    const currentAgent = selectedAgent;
    setSelectedAgent(null);

    try {
      // Simulate log updates during execution
      const logs = [
        `Starting ${currentAgent.name}...`,
        'Analyzing input content...',
        'Applying processing logic...',
        'Generating output result...'
      ];
      
      for (let i = 0; i < logs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExecutionLogs(prev => [...prev, logs[i]]);
        setConversationNodes(prev => prev.map(node => 
          node.id === bubbleNode.id 
            ? { ...node, logs: logs.slice(0, i + 1) }
            : node
        ));
      }

      let result;
      
      // Check if it's a custom agent or mock agent
      const isCustomAgent = customAgents.some(agent => agent.id === currentAgent.id);
      
      if (isCustomAgent) {
        // Execute custom agent via API
        result = await executeCustomAgent(currentAgent.id, inputContent);
      } else {
        // Execute mock agent
        result = await executeAgent(currentAgent.id, inputContent);
      }

      // Update bubble node to completed
      setConversationNodes(prev => prev.map(node => 
        node.id === bubbleNode.id 
          ? { ...node, status: 'completed', content: 'Processing completed', logs: result.logs }
          : node
      ));

      // Create output node that becomes the new current input
      const outputNode: ConversationNode = {
        id: `output-${Date.now()}`,
        type: 'output',
        content: result.output,
        agent: currentAgent,
        status: 'completed',
        timestamp: new Date(),
        isCurrentInput: true, // Output node becomes new current input
        isEditable: true
      };
      
      setConversationNodes(prev => [...prev, outputNode]);

      // Update userInput to output content, prepare for next round
      setUserInput(result.output);
      setSelectedResources([]);
      
    } catch (error) {
      // Update bubble node to error
      setConversationNodes(prev => prev.map(node => 
        node.id === bubbleNode.id 
          ? { 
              ...node, 
              status: 'error', 
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          : node
      ));
    } finally {
      setIsExecuting(false);
      setExecutionLogs([]);
    }
  };

  const clearConversation = () => {
    // Create a new initial input node
    const initialInputNode: ConversationNode = {
      id: `input-initial-${Date.now()}`,
      type: 'input',
      content: '',
      resources: [],
      timestamp: new Date(),
      isCurrentInput: true,
      isEditable: true
    };
    
    setConversationNodes([initialInputNode]);
    setUserInput('');
    setSelectedResources([]);
    setSelectedAgent(null);
    setExecutionLogs([]);
  };

  const handleResourceRemove = (nodeId: string, resourceId: string) => {
    setConversationNodes(prev => prev.map(node => 
      node.id === nodeId && node.resources
        ? { ...node, resources: node.resources.filter(r => r.id !== resourceId) }
        : node
    ));
  };

  const handleBubbleClick = (nodeId: string) => {
    // Can implement bubble click logic here, such as expanding detailed information
    console.log('Clicked bubble:', nodeId);
  };

  const handleContentChange = (nodeId: string, content: string) => {
    setConversationNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, content }
        : node
    ));
    // Update userInput state simultaneously to keep in sync
    setUserInput(content);
  };

  const handleAgentBuilderClick = () => {
    console.log('Agent Builder button clicked');
    navigate('/agents');
  };

  const handleResourceManageClick = () => {
    console.log('Resource management button clicked');
    navigate('/resources');
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div>
          <Title level={2} className="mb-0 text-gray-900">User Story Generator</Title>
          <Text type="secondary" className="text-sm">
            AI Agent-based Intelligent Requirements Analysis and Story Generation Platform
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<ToolOutlined />}
            onClick={handleAgentBuilderClick}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Agent Builder
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={clearConversation}
          >
            Clear Chat
          </Button>
        </Space>
      </Header>

      <Layout className="h-[calc(100vh-80px)]">
        {/* Left Sidebar - Input Resources */}
        <Sider width={320} className="bg-white border-r border-gray-200 flex flex-col" theme="light">
          <div className="p-4 border-b border-gray-200">
            <Space className="w-full justify-between mb-2">
              <Title level={4} className="mb-0 text-gray-900">Input Resources</Title>
              <Button
                type="primary"
                size="small"
                icon={<UploadOutlined />}
                onClick={handleResourceManageClick}
              >
                Manage
              </Button>
            </Space>
            <Text type="secondary" className="text-sm">
              Select relevant documents and templates as reference
            </Text>
          </div>
          
          {/* Search Box */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search resources..."
              value={resourceSearchQuery}
              onChange={(e) => setResourceSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredStoredResources.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary">
                      {resourceSearchQuery ? 'No matching resources found' : 'No resources available'}
                    </Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {resourceSearchQuery ? 'Try different search terms' : 'Click manage button to upload documents'}
                    </Text>
                  </div>
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredStoredResources.map(resource => {
                  const inputResource: InputResource = {
                    id: resource.id,
                    title: resource.title,
                    type: resource.file_type === 'pdf' ? 'pdf' : resource.file_type === 'md' ? 'md' : 'text',
                    content: resource.parsed_content,
                    description: resource.description
                  };
                  return (
                    <InputResourceCard
                      key={resource.id}
                      resource={inputResource}
                      isSelected={selectedResources.some(r => r.id === resource.id)}
                      onSelect={handleResourceSelect}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Sider>

        {/* Center - Main Workspace */}
        <Content className="flex flex-col bg-gray-50">
          {/* Complete conversation chain sliding window */}
          <div className="flex-1 h-full">
            <ConversationChain
              nodes={conversationNodes}
              onResourceRemove={handleResourceRemove}
              onBubbleClick={handleBubbleClick}
              onContentChange={handleContentChange}
              selectedAgent={selectedAgent}
              onExecute={handleExecute}
              canExecute={!!canExecute()}
              isExecuting={isExecuting}
              executionLogs={executionLogs}
            />
          </div>
        </Content>

        {/* Right Sidebar - Agents */}
        <Sider width={320} className="bg-white border-l border-gray-200 flex flex-col" theme="light">
          <div className="p-4 border-b border-gray-200">
            <Title level={4} className="mb-0 text-gray-900">AI Agents</Title>
            <Text type="secondary" className="text-sm">
              Select appropriate Agents to process your content
            </Text>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Built-in Agents */}
            <div className="mb-4">
              <Text strong className="text-sm text-gray-700 mb-2 block">Built-in Agents</Text>
              <div className="space-y-2">
                {mockAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={handleAgentSelect}
                    disabled={isExecuting}
                  />
                ))}
              </div>
            </div>

            {/* Custom Agents */}
            {customAgents.length > 0 && (
              <div>
                <Text strong className="text-sm text-gray-700 mb-2 block">Custom Agents</Text>
                <div className="space-y-2">
                  {customAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={{
                        id: agent.id,
                        name: agent.name,
                        description: agent.description,
                        icon: agent.icon,
                        category: agent.category as 'analysis' | 'validation' | 'generation' | 'optimization',
                        color: agent.color,
                      }}
                      onSelect={handleAgentSelect}
                      disabled={isExecuting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App; 
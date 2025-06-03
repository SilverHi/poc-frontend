import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputResource, Agent, ConversationNode, CustomAgent, SaveConversationRequest, ConversationMessage } from '@/types';
import { StoredResource } from '@/lib/database';
import InputResourceCard from '@/components/InputResourceCard';
import AgentCard from '@/components/AgentCard';
import ConversationChain from '@/components/ConversationChain';
import ConversationHistoryDrawer from '@/components/ConversationHistoryDrawer';
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
  message,
  Modal
} from 'antd';
import { 
  ToolOutlined, 
  ClearOutlined, 
  UploadOutlined, 
  SearchOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  MessageOutlined,
  SaveOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

function App() {
  const [selectedResources, setSelectedResources] = useState<InputResource[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationNodes, setConversationNodes] = useState<ConversationNode[]>([]);
  
  // 调试：监控conversationNodes变化
  useEffect(() => {
    console.log('🎯 ConversationNodes state changed:', conversationNodes);
  }, [conversationNodes]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [storedResources, setStoredResources] = useState<StoredResource[]>([]);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [filteredStoredResources, setFilteredStoredResources] = useState<StoredResource[]>([]);
  
  // Conversation history related states
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
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
    fetchAgents();
    fetchStoredResources();
  }, []);

  // Initialize first input node
  useEffect(() => {
    if (conversationNodes.length === 0 && !currentConversationId) {
      console.log('🔄 Initializing first input node');
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
  }, [conversationNodes.length, currentConversationId]);

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

  const fetchAgents = async () => {
    try {
      const data = await apiService.getAgents() as CustomAgent[];
      setCustomAgents(data);
      
      // Convert CustomAgent to Agent format for allAgents
      const convertedAgents: Agent[] = data.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        icon: agent.icon,
        category: agent.category as 'analysis' | 'validation' | 'generation' | 'optimization',
        color: agent.color,
      }));
      
      setAllAgents(convertedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to fetch agents');
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

    // 获取当前输入内容
    const currentInputNode = conversationNodes.find(node => node.isCurrentInput);
    const inputContent = currentInputNode ? getInputContent() : userInput;
    let conversationId = currentConversationId;
    const sortBase = conversationNodes.length;
    const now = new Date();

    // 如果没有会话ID，先创建会话
    if (!conversationId) {
      const title = inputContent.length > 50 ? inputContent.substring(0, 50) + '...' : inputContent;
      const conversationSummary = await apiService.saveConversation({
        title: title,
        messages: []
      });
      conversationId = conversationSummary.id;
      setCurrentConversationId(conversationId);
    }

    // 1. 保存query消息
    const queryMsgData = {
      conversation_id: conversationId,
      node_type: 'query' as const,
      content: inputContent,
      sort: sortBase,
      agent_id: selectedAgent.id,
    };
    const queryMsg = await apiService.createConversationMessage(queryMsgData);

    // 2. 保存log消息（记录agent执行信息） - 这个log将在UI中显示为bubble
    const logMsgData = {
      conversation_id: conversationId,
      node_type: 'log' as const,
      content: `Agent execution started: ${selectedAgent.name}`,
      sort: sortBase + 1,
      agent_id: selectedAgent.id,
    };
    const logMsg = await apiService.createConversationMessage(logMsgData);

    // 创建agent处理节点
    const bubbleNode = {
      id: `bubble-${Date.now()}`,
      type: 'bubble' as const,
      content: `Using ${selectedAgent.name} to process...`,
      agent: selectedAgent,
      status: 'running' as const,
      logs: [],
      timestamp: new Date()
    };
    
    // UI同步：将当前input设为不可编辑，并添加agent处理节点
    setConversationNodes(prev => {
      const updatedNodes = prev.map(node => 
        node.isCurrentInput 
          ? { 
              ...node, 
              isCurrentInput: false, 
              isEditable: false,
              agent: selectedAgent,
              content: inputContent
            }
          : node
      );
      
      return [...updatedNodes, bubbleNode];
    });
    
    const currentAgent = selectedAgent;
    setSelectedAgent(null);

    try {
      const result = await executeCustomAgent(currentAgent.id, inputContent);

      // 3. 保存answer消息
      const answerMsgData = {
        conversation_id: conversationId,
        node_type: 'answer' as const,
        content: result.output,
        sort: sortBase + 2, // query=sortBase, log=sortBase+1, answer=sortBase+2
        agent_id: currentAgent.id,
      };
      const answerMsg = await apiService.createConversationMessage(answerMsgData);

      // 4. 更新log消息，记录执行结果
      const logUpdateMsgData = {
        conversation_id: conversationId,
        node_type: 'log' as const,
        content: `Agent execution completed: ${currentAgent.name}. Execution logs: ${result.logs.join('; ')}`,
        sort: sortBase + 3,
        agent_id: currentAgent.id,
      };
      await apiService.createConversationMessage(logUpdateMsgData);

      // UI同步：更新bubble节点状态并添加output节点
      setConversationNodes(prev => [
        ...prev.map(node => 
          node.id === bubbleNode.id 
            ? { 
                ...node, 
                status: 'completed' as const,
                content: `${currentAgent.name} processing completed`,
                logs: result.logs
              }
            : node
        ),
        {
          id: (answerMsg as any).id,
          type: 'output' as const,
          content: result.output,
          agent: currentAgent,
          status: 'completed',
          timestamp: new Date(),
          isCurrentInput: true,
          isEditable: true
        }
      ]);
      setUserInput(result.output);
      setSelectedResources([]);
      if (!currentConversationId) setCurrentConversationId(conversationId);
    } catch (error) {
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

  // Auto-save conversation function
  const autoSaveConversation = async (nodesToSave?: ConversationNode[]) => {
    // If we already have a conversation ID, update the existing conversation
    if (currentConversationId) {
      // For now, we'll just skip auto-save if conversation already exists
      // In the future, we could implement an update API
      console.log('Conversation already saved with ID:', currentConversationId);
      return;
    }
    
    // Use provided nodes or current state
    const nodes = nodesToSave || conversationNodes;
    
    // Generate a title based on the first meaningful content
    const firstInputNode = nodes.find(node => 
      node.type === 'input' && node.content.trim()
    );
    
    let title = 'Untitled Conversation';
    if (firstInputNode && firstInputNode.content.trim()) {
      // Use first 50 characters of the first input as title
      title = firstInputNode.content.trim().substring(0, 50);
      if (firstInputNode.content.length > 50) {
        title += '...';
      }
    }
    
    // Add timestamp to make title unique
    const timestamp = new Date().toLocaleString();
    title = `${title} - ${timestamp}`;
    
    // Convert nodes to messages format
    const messages = nodes.map((node, index) => ({
      conversation_id: '', // Will be set by backend
      node_type: node.type === 'input' ? 'query' : 'answer' as 'query' | 'answer' | 'log',
      content: node.content,
      sort: index,
      agent_id: node.agent?.id || null,
    }));

    const request: SaveConversationRequest = {
      title: title,
      messages: messages
    };

    const savedConversation = await apiService.saveConversation(request);
    setCurrentConversationId(savedConversation.id);
    console.log('Conversation auto-saved:', savedConversation.id);
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
    setCurrentConversationId(null);
  };

  const handleResourceRemove = (nodeId: string, resourceId: string) => {
    setConversationNodes(prev => prev.map(node => 
      node.id === nodeId && node.resources
        ? { ...node, resources: node.resources.filter(r => r.id !== resourceId) }
        : node
    ));
  };

  const handleResourceAdd = (nodeId: string, resource: InputResource) => {
    setConversationNodes(prev => prev.map(node => 
      node.id === nodeId
        ? { 
            ...node, 
            resources: node.resources 
              ? [...node.resources, resource]
              : [resource]
          }
        : node
    ));
    
    // Also add to selectedResources for consistency
    setSelectedResources(prev => {
      const exists = prev.some(r => r.id === resource.id);
      return exists ? prev : [...prev, resource];
    });
    
    // Refresh stored resources to get the latest from backend
    fetchStoredResources();
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

  const handleQuickUpload = () => {
    console.log('Quick upload button clicked');
    navigate('/resources');
  };

  const handleRetry = async (nodeId: string) => {
    console.log('Retry button clicked for node:', nodeId);
    
    // Find the error node
    const errorNode = conversationNodes.find(node => node.id === nodeId);
    if (!errorNode || errorNode.status !== 'error') {
      message.error('Cannot retry: node not found or not in error state');
      return;
    }

    // Find the previous input node to get the original input content
    const nodeIndex = conversationNodes.findIndex(node => node.id === nodeId);
    let inputContent = '';
    let inputResources: InputResource[] = [];
    let agent: Agent | null = null;

    // Look backwards to find the input that led to this error
    for (let i = nodeIndex - 1; i >= 0; i--) {
      const prevNode = conversationNodes[i];
      if (prevNode.type === 'input') {
        inputContent = prevNode.content;
        inputResources = prevNode.resources || [];
        break;
      }
    }

    // Get the agent from the error node
    agent = errorNode.agent || null;

    if (!agent) {
      message.error('Cannot retry: no agent information found');
      return;
    }

    if (!inputContent && inputResources.length === 0) {
      message.error('Cannot retry: no input content found');
      return;
    }

    try {
      setIsExecuting(true);
      
      // Update the error node to show retrying status
      setConversationNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, status: 'running', content: `Retrying with ${agent?.name}...`, logs: ['Retrying execution...'] }
          : node
      ));

      // Prepare input content with resources
      let fullInputContent = inputContent;
      if (inputResources.length > 0) {
        const resourceContent = inputResources.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
        fullInputContent = fullInputContent ? `${fullInputContent}\n\nReference Resources:\n${resourceContent}` : resourceContent;
      }

      // Execute the agent again
      const result = await executeCustomAgent(agent.id, fullInputContent);

      // Update bubble node to completed (same as normal execution)
      setConversationNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, status: 'completed', content: 'Processing completed', logs: result.logs }
          : node
      ));

      // Create output node (becomes current input for next round)
      const outputNode: ConversationNode = {
        id: `output-${Date.now()}`,
        type: 'output' as const,
        content: result.output,
        agent: agent,
        status: 'completed',
        timestamp: new Date(),
        isCurrentInput: true, // Output becomes current input for next round
        isEditable: true
      };
      
      setConversationNodes(prev => [...prev, outputNode]);

      // Update userInput to output content, prepare for next round
      setUserInput(result.output);
      setSelectedResources([]);

      message.success('Retry successful!');

      // Auto-save conversation after successful retry
      try {
        await autoSaveConversation();
      } catch (saveError) {
        console.error('Auto-save after retry failed:', saveError);
        // Don't show error to user for auto-save failures
      }

    } catch (error) {
      console.error('Retry failed:', error);
      
      // Update the node back to error state
      setConversationNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              status: 'error', 
              content: `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              logs: [`Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
            }
          : node
      ));

      message.error('Retry failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Conversation history related functions
  const handleHistoryDrawerOpen = () => {
    setHistoryDrawerOpen(true);
  };

  const handleHistoryDrawerClose = () => {
    setHistoryDrawerOpen(false);
  };

  const handleSaveConversation = () => {
    // Check if there are meaningful conversation nodes to save
    const meaningfulNodes = conversationNodes.filter(node => 
      node.content.trim() || (node.resources && node.resources.length > 0)
    );
    
    if (meaningfulNodes.length === 0) {
      message.warning('No content to save');
      return;
    }
    
    setSaveModalOpen(true);
  };

  const handleSaveModalOk = async () => {
    if (!conversationTitle.trim()) {
      message.error('Please enter a conversation title');
      return;
    }

    try {
      // Convert nodes to messages format
      const messages = conversationNodes.map((node, index) => ({
        conversation_id: '', // Will be set by backend
        node_type: node.type === 'input' ? 'query' : 'answer' as 'query' | 'answer' | 'log',
        content: node.content,
        sort: index,
        agent_id: node.agent?.id || null,
      }));

      const request: SaveConversationRequest = {
        title: conversationTitle,
        messages: messages
      };

      const savedConversation = await apiService.saveConversation(request);
      setCurrentConversationId(savedConversation.id);
      message.success('Conversation saved successfully');
      setSaveModalOpen(false);
      setConversationTitle('');
    } catch (error) {
      console.error('Error saving conversation:', error);
      message.error('Failed to save conversation');
    }
  };

  const handleSaveModalCancel = () => {
    setSaveModalOpen(false);
    setConversationTitle('');
  };

  const handleConversationSelect = async (conversationId: string) => {
    try {
      console.log('🔍 Loading conversation:', conversationId);
      const conversation = await apiService.getConversation(conversationId);
      console.log('📦 Raw conversation data:', conversation);
      
      if (conversation && conversation.messages.length > 0) {
        console.log('📝 Original messages count:', conversation.messages.length);
        console.log('📝 Original messages:', conversation.messages);
        
        // 首先按sort字段排序消息
        const sortedMessages = conversation.messages.sort((a, b) => a.sort - b.sort);
        console.log('🔄 Sorted messages:', sortedMessages);
        console.log('📊 Message order detail:');
        sortedMessages.forEach((msg, idx) => {
          console.log(`  ${idx}: sort=${msg.sort}, type=${msg.node_type}, agent=${msg.agent_id}, content=${msg.content.substring(0, 50)}...`);
        });
        
        // 找到最后一个answer的索引
        let lastAnswerIdx = -1;
        for (let i = sortedMessages.length - 1; i >= 0; i--) {
          if (sortedMessages[i].node_type === 'answer') {
            lastAnswerIdx = i;
            console.log('✅ Found last answer at index:', i, 'message:', sortedMessages[i]);
            break;
          }
        }
        console.log('📍 Last answer index:', lastAnswerIdx);
        
        let displayMessages: typeof sortedMessages = [];
        
        if (lastAnswerIdx === -1) {
          console.log('⚠️ No answer found, showing all non-log messages');
          // 没有answer，显示所有非log消息
          displayMessages = sortedMessages.filter(msg => msg.node_type !== 'log');
          console.log('📋 Display messages (no answer):', displayMessages);
        } else {
          console.log('✅ Found answers, applying display rules...');
          // 有answer，应用显示规则：
          // 1. 显示所有query
          // 2. 隐藏中间的answer，只显示最后一个answer
          // 3. 只显示completion log（隐藏start log），bubble需要在answer前显示
          
          // 找到最后answer对应的agent_id和sort基准
          const lastAnswerMsg = sortedMessages[lastAnswerIdx];
          const lastAnswerSort = lastAnswerMsg.sort;
          
          // 收集需要显示的消息
          const messagesToShow: typeof sortedMessages = [];
          
          sortedMessages.forEach((msg, index) => {
            if (msg.node_type === 'query') {
              console.log(`✅ Adding query at index ${index}:`, msg);
              messagesToShow.push(msg);
            } else if (msg.node_type === 'answer' && index === lastAnswerIdx) {
              console.log(`✅ Adding last answer at index ${index}:`, msg);
              messagesToShow.push(msg);
            } else if (msg.node_type === 'log' && msg.content.includes('Agent execution completed')) {
              // 显示所有completion log，隐藏所有start log
              console.log(`✅ Adding completion log at index ${index}:`, msg);
              messagesToShow.push(msg);
            } else {
              console.log(`❌ Skipping message at index ${index}:`, msg.node_type, msg.content.substring(0, 30));
            }
          });
          
          // 重新排序：按原始顺序交错排列，确保每个completion log在正确位置
          const finalMessages: typeof sortedMessages = [];
          const queryMessages = messagesToShow.filter(m => m.node_type === 'query');
          const answerMessages = messagesToShow.filter(m => m.node_type === 'answer');  // 只有最后一个
          const logMessages = messagesToShow.filter(m => m.node_type === 'log');        // 所有completion logs
          
          console.log('🔄 Reordering messages for display:');
          console.log('📝 Queries:', queryMessages.length);
          console.log('📝 Answers:', answerMessages.length);  
          console.log('📝 Logs:', logMessages.length);
          
          // 合并所有消息并按sort排序，但调整completion log的位置
          const allMessagesToSort = [...queryMessages, ...answerMessages];
          
          // 为每个completion log找到它应该插入的位置（在对应answer前）
          logMessages.forEach(logMsg => {
            // 找到这个log对应的answer（同agent_id且sort值接近）
            const correspondingAnswer = sortedMessages.find(msg => 
              msg.node_type === 'answer' && 
              msg.agent_id === logMsg.agent_id && 
              msg.sort < logMsg.sort &&
              msg.sort + 2 >= logMsg.sort  // log通常是answer的sort+1
            );
            
            if (correspondingAnswer) {
              // 将log的sort设为对应answer的sort-0.5，确保它在answer前显示
              const modifiedLog = { ...logMsg, sort: correspondingAnswer.sort - 0.5 };
              console.log(`✅ Positioning completion log: original_sort=${logMsg.sort}, new_sort=${modifiedLog.sort}, for answer_sort=${correspondingAnswer.sort}`);
              allMessagesToSort.push(modifiedLog);
            } else {
              // 如果找不到对应的answer，保持原sort
              console.log(`⚠️ No corresponding answer found for log: sort=${logMsg.sort}, keeping original position`);
              allMessagesToSort.push(logMsg);
            }
          });
          
          // 按sort排序
          displayMessages = allMessagesToSort.sort((a, b) => a.sort - b.sort);
          
          console.log('📋 Display messages (filtered):', displayMessages);
          console.log('📋 Filtered message order detail:');
          displayMessages.forEach((msg, idx) => {
            console.log(`  ${idx}: sort=${msg.sort}, type=${msg.node_type}, agent=${msg.agent_id}, content=${msg.content.substring(0, 30)}...`);
          });
        }
        
        // 转换为ConversationNode格式
        console.log('🔄 Converting to ConversationNode format...');
        console.log('🤖 All agents available:', allAgents);
        
        const convertedNodes: ConversationNode[] = displayMessages.map((msg, index) => {
          const agent = allAgents.find(a => a.id === msg.agent_id);
          
          let nodeType: ConversationNode['type'];
          let status: ConversationNode['status'] = 'completed';
          
          if (msg.node_type === 'query') {
            nodeType = 'input';
          } else if (msg.node_type === 'answer') {
            nodeType = 'output';
          } else if (msg.node_type === 'log') {
            nodeType = 'bubble';
            status = 'completed';
          } else {
            nodeType = 'input'; // fallback
          }
          
          console.log(`📝 Converting message ${index}:`, {
            original: msg,
            agent_found: agent,
            type: nodeType,
            status: status
          });
          
          return {
            id: msg.id,
            type: nodeType,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            isCurrentInput: false,
            isEditable: false,
            agent: agent,
            status: status,
            logs: msg.node_type === 'log' ? [msg.content] : undefined
          };
        });
        
        console.log('🎯 Converted nodes before modification:', convertedNodes);
        
        // 找到最后一个output节点，设置为可编辑并为当前输入
        for (let i = convertedNodes.length - 1; i >= 0; i--) {
          const node = convertedNodes[i];
          if (node.type === 'output') {
            console.log('🔚 Found last output node at index', i, ':', node);
            node.isCurrentInput = true;
            node.isEditable = true;
            console.log('✅ Set last output node as current input');
            break;
          }
        }
        
        console.log('🎯 Final converted nodes:', convertedNodes);
        
        setConversationNodes(convertedNodes);
        setCurrentConversationId(conversationId);
        setSelectedResources([]);
        setUserInput('');
        setSelectedAgent(null);
        console.log('💾 State updated successfully');
        
        message.success('Conversation loaded successfully');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      message.error('Failed to load conversation');
    }
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
            icon={<HistoryOutlined />}
            onClick={handleHistoryDrawerOpen}
          >
            History
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveConversation}
          >
            Save
          </Button>
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
              onResourceAdd={handleResourceAdd}
              onQuickUpload={handleQuickUpload}
              onRetry={handleRetry}
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
            {/* All Agents */}
            <div className="mb-4">
              <Text strong className="text-sm text-gray-700 mb-2 block">AI Agents</Text>
              <div className="space-y-2">
                {allAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={handleAgentSelect}
                    disabled={isExecuting}
                  />
                ))}
              </div>
            </div>
          </div>
        </Sider>
      </Layout>

      {/* Conversation History Drawer */}
      <ConversationHistoryDrawer
        open={historyDrawerOpen}
        onClose={handleHistoryDrawerClose}
        onConversationSelect={handleConversationSelect}
      />

      {/* Save Conversation Modal */}
      <Modal
        title="Save Conversation"
        open={saveModalOpen}
        onOk={handleSaveModalOk}
        onCancel={handleSaveModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Enter a title for this conversation:</Text>
        </div>
        <Input
          placeholder="Conversation title..."
          value={conversationTitle}
          onChange={(e) => setConversationTitle(e.target.value)}
          onPressEnter={handleSaveModalOk}
        />
      </Modal>
    </Layout>
  );
}

export default App; 
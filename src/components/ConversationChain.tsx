import React, { useRef, useEffect } from 'react';
import { ConversationNode, InputResource, Agent } from '@/types';
import ConversationCard from './ConversationCard';
import BubbleMessage from './BubbleMessage';
import AgentSelectionCard from './AgentSelectionCard';
import { Card, Typography, Input, Space, Tag } from 'antd';

const { TextArea } = Input;

const { Text } = Typography;

interface ConversationChainProps {
  nodes: ConversationNode[];
  onResourceRemove?: (nodeId: string, resourceId: string) => void;
  onBubbleClick?: (nodeId: string) => void;
  onContentChange?: (nodeId: string, content: string) => void;
  // 保留Agent相关props用于显示选中的Agent
  selectedAgent: Agent | null;
  onExecute: () => void;
  canExecute: boolean;
  isExecuting: boolean;
  executionLogs: string[];
}

export default function ConversationChain({ 
  nodes, 
  onResourceRemove, 
  onBubbleClick,
  onContentChange,
  selectedAgent,
  onExecute,
  canExecute,
  isExecuting,
  executionLogs
}: ConversationChainProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新内容
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [nodes]);



  const renderNode = (node: ConversationNode, index: number) => {
    if (node.type === 'input' || node.type === 'output') {
      return (
        <ConversationCard
          key={node.id}
          node={node}
          onResourceRemove={
            node.isCurrentInput && onResourceRemove 
              ? (resourceId: string) => onResourceRemove(node.id, resourceId)
              : undefined
          }
          onContentChange={
            node.isCurrentInput && onContentChange
              ? (content: string) => onContentChange(node.id, content)
              : undefined
          }
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
          // Agent相关props - 只在当前输入时传递
          selectedAgent={node.isCurrentInput ? selectedAgent : undefined}
          onExecute={node.isCurrentInput ? onExecute : undefined}
          canExecute={node.isCurrentInput ? canExecute : undefined}
          isExecuting={node.isCurrentInput ? isExecuting : undefined}
          executionLogs={node.isCurrentInput ? executionLogs : undefined}
        />
      );
    } else if (node.type === 'bubble') {
      return (
        <div key={node.id} className="flex justify-center">
          <BubbleMessage
            node={node}
            onClick={() => onBubbleClick?.(node.id)}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{ 
        scrollBehavior: 'smooth',
        maxHeight: 'calc(100vh - 80px)' // 减去header高度
      }}
    >
      <div className="min-h-full px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 对话节点 - 瀑布流式布局 */}
          {nodes.length > 0 ? (
            <div className="space-y-4">
              {nodes.map((node, index) => renderNode(node, index))}
            </div>
          ) : (
            /* 空状态提示 */
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <Text className="text-lg">开始你的第一轮对话</Text>
                <br />
                <Text type="secondary">选择左侧资源和右侧Agent开始对话</Text>
              </div>
            </div>
          )}
          

          
          {/* 底部间距，确保最后一个元素不会贴底 */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
} 
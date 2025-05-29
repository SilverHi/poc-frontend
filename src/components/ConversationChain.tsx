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
  onResourceAdd?: (nodeId: string, resource: InputResource) => void;
  onQuickUpload?: () => void;
  onBubbleClick?: (nodeId: string) => void;
  onContentChange?: (nodeId: string, content: string) => void;
  // Keep Agent related props for displaying selected Agent
  selectedAgent: Agent | null;
  onExecute: () => void;
  canExecute: boolean;
  isExecuting: boolean;
  executionLogs: string[];
}

export default function ConversationChain({ 
  nodes, 
  onResourceRemove, 
  onResourceAdd,
  onQuickUpload,
  onBubbleClick,
  onContentChange,
  selectedAgent,
  onExecute,
  canExecute,
  isExecuting,
  executionLogs
}: ConversationChainProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest content
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
          onResourceAdd={
            node.isCurrentInput && onResourceAdd
              ? (resource: InputResource) => onResourceAdd(node.id, resource)
              : undefined
          }
          onQuickUpload={node.isCurrentInput ? onQuickUpload : undefined}
          onContentChange={
            node.isCurrentInput && onContentChange
              ? (content: string) => onContentChange(node.id, content)
              : undefined
          }
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
          // Agent related props - only pass when current input
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
        maxHeight: 'calc(100vh - 80px)' // Subtract header height
      }}
    >
      <div className="min-h-full px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Conversation nodes - waterfall layout */}
          {nodes.length > 0 ? (
            <div className="space-y-4">
              {nodes.map((node, index) => renderNode(node, index))}
            </div>
          ) : (
            /* Empty state prompt */
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <Text className="text-lg">Start your first conversation</Text>
                <br />
                <Text type="secondary">Select resources on the left and Agent on the right to start conversation</Text>
              </div>
            </div>
          )}
          
          {/* Bottom spacing to ensure last element doesn't stick to bottom */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
} 
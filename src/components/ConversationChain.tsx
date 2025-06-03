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
  onRetry?: (nodeId: string) => void;
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
  onRetry,
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
        <div key={node.id} className="mb-6">
          <ConversationCard
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
            onRetry={onRetry ? () => onRetry(node.id) : undefined}
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
        </div>
      );
    }

    if (node.type === 'bubble') {
      return (
        <div key={node.id} className="flex justify-center my-6">
          <BubbleMessage
            node={node}
            onClick={() => onBubbleClick?.(node.id)}
            onRetry={onRetry ? () => onRetry(node.id) : undefined}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto px-2 py-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="max-w-4xl mx-auto space-y-1">
        {nodes.map((node, index) => renderNode(node, index))}
      </div>
    </div>
  );
} 
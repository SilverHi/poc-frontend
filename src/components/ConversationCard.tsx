import React from 'react';
import { Card, Typography, Space, Tag, Avatar, Button, Input } from 'antd';
import { ConversationNode, InputResource, Agent } from '@/types';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import AgentSelectionCard from './AgentSelectionCard';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ConversationCardProps {
  node: ConversationNode;
  onResourceRemove?: (resourceId: string) => void;
  onContentChange?: (content: string) => void;
  className?: string;
  // Agent related props - only needed for current input
  selectedAgent?: Agent | null;
  onExecute?: () => void;
  canExecute?: boolean;
  isExecuting?: boolean;
  executionLogs?: string[];
}

export default function ConversationCard({ 
  node, 
  onResourceRemove, 
  onContentChange, 
  className,
  selectedAgent,
  onExecute,
  canExecute,
  isExecuting,
  executionLogs
}: ConversationCardProps) {
  const isInput = node.type === 'input';
  const isOutput = node.type === 'output';
  const isCurrentInput = node.isCurrentInput || false;
  const isEditable = node.isEditable || false;

  // Determine card style
  const getCardStyle = () => {
    if (isCurrentInput) {
      return 'bg-blue-50 border-blue-200 border-2'; // Current input: blue border bold
    } else if (isOutput) {
      return 'bg-green-50 border-green-200'; // Output: green background
    } else {
      return 'bg-gray-50 border-gray-200'; // Historical input: gray background
    }
  };

  // Determine title
  const getTitle = () => {
    if (isCurrentInput) {
      return 'Current Input';
    } else if (isOutput) {
      return 'Output Result';
    } else {
      return 'Historical Input';
    }
  };

  return (
    <Card 
      className={`w-full ${className || ''} ${getCardStyle()}`}
      style={{ height: '33vh' }} // Fixed height
    >
      {/* Card header - fixed height */}
      <div className="mb-3 flex-shrink-0">
        <Space align="center" className="w-full justify-between">
          <Space align="center">
            {node.agent && (
              <Avatar 
                className={node.agent.color}
                size="large"
                style={{ 
                  backgroundColor: node.agent.color.includes('bg-') ? undefined : node.agent.color,
                  color: 'white'
                }}
              >
                {node.agent.icon}
              </Avatar>
            )}
            <div>
              <Text strong className="text-lg">
                {getTitle()}
              </Text>
              {node.agent && (
                <div className="text-sm text-gray-600">{node.agent.name}</div>
              )}
              {isCurrentInput && (
                <div className="text-xs text-blue-600">Editable</div>
              )}
            </div>
          </Space>
          <Text type="secondary" className="text-xs">
            {node.timestamp?.toLocaleTimeString()}
          </Text>
        </Space>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(33vh - 120px)' }}>
        <div className="flex-1 overflow-y-auto mb-3">
          {isEditable && isCurrentInput ? (
            // Editable state: show TextArea
            <TextArea
              value={node.content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder="Please enter your requirement description, questions or content to be processed..."
              className="resize-none h-full border-none"
              style={{ height: '100%', backgroundColor: 'transparent' }}
            />
          ) : (
            // Read-only state: show text
            <Paragraph className="text-base whitespace-pre-wrap mb-0">
              {node.content || 'Please enter content...'}
            </Paragraph>
          )}
        </div>

        {/* Resource tags - fixed at bottom */}
        {node.resources && node.resources.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-3">
            <Text strong className="text-sm text-gray-700 mb-2 block">
              Referenced Resources ({node.resources.length})
            </Text>
            <div className="max-h-16 overflow-y-auto">
              <Space wrap>
                {node.resources.map(resource => (
                  <Tag
                    key={resource.id}
                    closable={isCurrentInput && !!onResourceRemove}
                    onClose={() => onResourceRemove?.(resource.id)}
                    color="blue"
                    className="mb-1"
                  >
                    {resource.title}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}

        {/* Agent selection area - only show for current input */}
        {isCurrentInput && selectedAgent && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-3 mt-2">
            <AgentSelectionCard
              agent={selectedAgent}
              onExecute={onExecute || (() => {})}
              canExecute={canExecute || false}
              isExecuting={isExecuting || false}
              logs={executionLogs || []}
            />
          </div>
        )}

        {/* Status indicator */}
        {node.status && node.status !== 'completed' && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-2 mt-2">
            <Space>
              <Text type="secondary" className="text-sm">
                Status: {node.status === 'running' ? 'Executing...' : node.status === 'error' ? 'Execution failed' : 'Waiting'}
              </Text>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
} 
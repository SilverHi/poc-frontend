import React, { useState } from 'react';
import { Card, Typography, Space, Avatar, Tooltip, Badge, Button } from 'antd';
import { ConversationNode } from '@/types';
import { 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

interface BubbleMessageProps {
  node: ConversationNode;
  onClick?: () => void;
  onRetry?: () => void;
}

export default function BubbleMessage({ node, onClick, onRetry }: BubbleMessageProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running': return <LoadingOutlined spin className="text-white" />;
      case 'completed': return <CheckCircleOutlined className="text-white" />;
      case 'error': return <CloseCircleOutlined className="text-white" />;
      default: return <ClockCircleOutlined className="text-white" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPreviewContent = (content: string, maxLength: number = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Tooltip 
        title={
          <div>
            <div className="font-medium">{node.agent?.name || 'Processing Step'}</div>
            <div className="mt-1">{node.content}</div>
            {node.logs && node.logs.length > 0 && (
              <div className="mt-2 text-xs opacity-80">
                Latest log: {node.logs[node.logs.length - 1]}
              </div>
            )}
          </div>
        }
        placement="top"
        overlayClassName="max-w-md"
      >
        <div 
          className={`
            inline-flex items-center space-x-2 px-4 py-2 rounded-full cursor-pointer
            transition-all duration-200 hover:scale-105 hover:shadow-lg
            ${getStatusColor(node.status)}
            shadow-sm max-w-sm
          `}
          onClick={onClick}
        >
          {getStatusIcon(node.status)}
          {node.agent && (
            <Avatar 
              size="small"
              className={node.agent.color}
              style={{ 
                backgroundColor: node.agent.color.includes('bg-') ? undefined : node.agent.color,
                color: 'white'
              }}
            >
              {node.agent.icon}
            </Avatar>
          )}
          <Text className="text-sm font-medium text-white truncate">
            {getPreviewContent(node.content)}
          </Text>
        </div>
      </Tooltip>
      
      {/* Retry button for error status */}
      {node.status === 'error' && onRetry && (
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the bubble click
            onRetry();
          }}
          className="bg-red-600 hover:bg-red-700 border-red-600"
        >
          Retry
        </Button>
      )}
    </div>
  );
} 
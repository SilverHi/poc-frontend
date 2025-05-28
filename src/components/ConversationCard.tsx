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
  // Agent相关props - 只在当前输入时需要
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

  // 确定卡片样式
  const getCardStyle = () => {
    if (isCurrentInput) {
      return 'bg-blue-50 border-blue-200 border-2'; // 当前输入：蓝色边框加粗
    } else if (isOutput) {
      return 'bg-green-50 border-green-200'; // 输出：绿色背景
    } else {
      return 'bg-gray-50 border-gray-200'; // 历史输入：灰色背景
    }
  };

  // 确定标题
  const getTitle = () => {
    if (isCurrentInput) {
      return '当前输入';
    } else if (isOutput) {
      return '输出结果';
    } else {
      return '历史输入';
    }
  };

  return (
    <Card 
      className={`w-full ${className || ''} ${getCardStyle()}`}
      style={{ height: '33vh' }} // 固定高度
    >
      {/* 卡片头部 - 固定高度 */}
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
                <div className="text-xs text-blue-600">可编辑</div>
              )}
            </div>
          </Space>
          <Text type="secondary" className="text-xs">
            {node.timestamp?.toLocaleTimeString()}
          </Text>
        </Space>
      </div>

      {/* 内容区域 - 可滚动 */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(33vh - 120px)' }}>
        <div className="flex-1 overflow-y-auto mb-3">
          {isEditable && isCurrentInput ? (
            // 可编辑状态：显示TextArea
            <TextArea
              value={node.content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder="请输入您的需求描述、问题或待处理的内容..."
              className="resize-none h-full border-none"
              style={{ height: '100%', backgroundColor: 'transparent' }}
            />
          ) : (
            // 只读状态：显示文本
            <Paragraph className="text-base whitespace-pre-wrap mb-0">
              {node.content || '请输入内容...'}
            </Paragraph>
          )}
        </div>

        {/* 资源标签 - 固定在底部 */}
        {node.resources && node.resources.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-3">
            <Text strong className="text-sm text-gray-700 mb-2 block">
              引用资源 ({node.resources.length})
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

        {/* Agent选择区域 - 只在当前输入时显示 */}
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

        {/* 状态指示器 */}
        {node.status && node.status !== 'completed' && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-2 mt-2">
            <Space>
              <Text type="secondary" className="text-sm">
                状态: {node.status === 'running' ? '执行中...' : node.status === 'error' ? '执行失败' : '等待中'}
              </Text>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
} 
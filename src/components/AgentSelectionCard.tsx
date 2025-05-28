import React from 'react';
import { Card, Typography, Space, Avatar, Button } from 'antd';
import { Agent } from '@/types';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AgentSelectionCardProps {
  agent: Agent;
  onExecute: () => void;
  canExecute: boolean;
  isExecuting: boolean;
  logs?: string[];
}

export default function AgentSelectionCard({ 
  agent, 
  onExecute, 
  canExecute, 
  isExecuting,
  logs = []
}: AgentSelectionCardProps) {
  return (
    <Card className="bg-blue-50 border-blue-200 mt-4">
      <Space className="w-full justify-between" align="center">
        <Space align="center">
          <Avatar 
            className={agent.color}
            size="large"
            style={{ 
              backgroundColor: agent.color.includes('bg-') ? undefined : agent.color,
              color: 'white'
            }}
          >
            {agent.icon}
          </Avatar>
          <div>
            <Text strong className="text-gray-900">{agent.name}</Text>
            <div className="text-sm text-gray-600">{agent.description}</div>
          </div>
        </Space>
        <Button
          type="primary"
          icon={isExecuting ? <LoadingOutlined /> : <PlayCircleOutlined />}
          onClick={onExecute}
          disabled={!canExecute}
          loading={isExecuting}
          size="large"
        >
          {isExecuting ? '执行中...' : '执行'}
        </Button>
      </Space>

      {/* 执行日志 */}
      {isExecuting && logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-300">
          <Text strong className="text-sm text-gray-700 mb-2 block">
            执行日志
          </Text>
          <div className="bg-black text-green-400 font-mono text-xs p-3 rounded max-h-32 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 
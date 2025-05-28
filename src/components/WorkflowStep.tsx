import { WorkflowStep as WorkflowStepType } from '@/types';
import { useState } from 'react';
import { Card, Badge, Typography, Avatar, Space, Divider } from 'antd';
import { 
  ClockCircleOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface WorkflowStepProps {
  step: WorkflowStepType;
  isLast: boolean;
}

export default function WorkflowStep({ step, isLast }: WorkflowStepProps) {
  const [showLogs, setShowLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'running': return <LoadingOutlined spin />;
      case 'completed': return <CheckCircleOutlined />;
      case 'error': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'running': return 'processing';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <div className="mb-6">
      <Card className="overflow-hidden">
        {/* Agent Header */}
        <div className="mb-4">
          <Space align="center" className="w-full justify-between">
            <Space align="center">
              <Avatar 
                className={step.agent.color}
                size="large"
                style={{ 
                  backgroundColor: step.agent.color.includes('bg-') ? undefined : step.agent.color,
                  color: 'white'
                }}
              >
                {step.agent.icon}
              </Avatar>
              <div>
                <Text strong className="text-base">{step.agent.name}</Text>
                <div className="text-sm text-gray-600">{step.agent.description}</div>
              </div>
            </Space>
            <Badge 
              status={getStatusColor(step.status)} 
              text={
                <Space>
                  {getStatusIcon(step.status)}
                  <Text strong>{getStatusText(step.status)}</Text>
                </Space>
              }
            />
          </Space>
        </div>

        <Divider className="my-4" />

        {/* Input */}
        <div className="mb-4">
          <Text strong className="text-sm text-gray-700">Input</Text>
          <Card size="small" className="mt-2 bg-gray-50">
            <Paragraph className="mb-0 text-sm whitespace-pre-wrap">
              {step.input}
            </Paragraph>
          </Card>
        </div>

        {/* Logs (if running) */}
        {step.status === 'running' && step.logs && (
          <div className="mb-4">
            <Space className="w-full justify-between mb-2">
              <Text strong className="text-sm text-gray-700">Execution Logs</Text>
              <Text 
                className="text-xs cursor-pointer text-blue-600 hover:text-blue-800"
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                {showLogs ? ' Hide' : ' Show'}
              </Text>
            </Space>
            {showLogs && (
              <Card size="small" className="bg-black text-green-400 font-mono text-xs">
                {step.logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* Output */}
        {step.output && (
          <div>
            <Text strong className="text-sm text-gray-700">Output Results</Text>
            <Card size="small" className="mt-2 bg-green-50 border-green-200">
              <Paragraph className="mb-0 text-sm whitespace-pre-wrap">
                {step.output}
              </Paragraph>
            </Card>
          </div>
        )}
      </Card>

      {/* Connection line to next step */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-px h-6 bg-gray-300"></div>
        </div>
      )}
    </div>
  );
} 
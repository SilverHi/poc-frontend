import React, { useState } from 'react';
import { Card, Typography, Space, Tag, Avatar, Button, Input, Upload, message, Dropdown, Menu, Modal } from 'antd';
import { ConversationNode, InputResource, Agent } from '@/types';
import { DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined, PlusOutlined, LoadingOutlined, HistoryOutlined, FileAddOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import AgentSelectionCard from './AgentSelectionCard';
import { apiService } from '@/services/api';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ConversationCardProps {
  node: ConversationNode;
  onResourceRemove?: (resourceId: string) => void;
  onContentChange?: (content: string) => void;
  onResourceAdd?: (resource: InputResource) => void;
  onQuickUpload?: () => void;
  onRetry?: () => void;
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
  onResourceAdd,
  onQuickUpload,
  onRetry,
  className,
  selectedAgent,
  onExecute,
  canExecute,
  isExecuting,
  executionLogs
}: ConversationCardProps) {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
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

  // Handle file upload with real backend integration
  const handleFileUpload = async (file: File) => {
    if (!file) return false;

    // Validate file type
    const allowedTypes = ['.pdf', '.md', '.markdown', '.txt', '.text'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`Unsupported file type. Supported types: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('File size exceeds 10MB limit');
      return false;
    }

    try {
      setUploading(true);
      
      // Show uploading message
      const hideLoading = message.loading('Uploading file...', 0);
      
      // Upload file to backend
      const response = await apiService.uploadResource(file, file.name, `Quick upload: ${file.name}`);
      
      hideLoading();
      
      // Create resource object for immediate display
      const newResource: InputResource = {
        id: `uploaded-${Date.now()}`, // Use timestamp for now, could be improved with backend response
        title: file.name,
        type: fileExtension === '.pdf' ? 'pdf' : fileExtension.includes('.md') ? 'md' : 'text',
        content: 'File uploaded and processed successfully',
        description: `Uploaded file: ${file.name}`
      };
      
      // Add to resources
      onResourceAdd?.(newResource);
      
      message.success(`File "${file.name}" uploaded successfully!`);
      
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'upload') {
      // Trigger file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.md,.markdown,.txt';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      };
      input.click();
    } else if (key === 'history') {
      // Handle history reference
      message.info('History reference feature coming soon');
    }
  };

  // Create dropdown menu
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="upload" icon={<UploadOutlined />}>
        Upload File
      </Menu.Item>
      <Menu.Item key="history" icon={<HistoryOutlined />}>
        Add History Reference
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Card 
        className={`w-full ${className || ''} ${getCardStyle()}`}
        style={{ minHeight: isCurrentInput ? '40vh' : '33vh' }}
        bodyStyle={{ padding: '20px' }}
      >
        {/* Card header - fixed height */}
        <div className="mb-4 flex-shrink-0">
          <Space align="center" className="w-full justify-between">
            <Space align="center" size="large">
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
                  <div className="text-sm text-gray-600 mt-1">{node.agent.name}</div>
                )}
                {isCurrentInput && (
                  <div className="text-xs text-blue-600 mt-1">Editable</div>
                )}
              </div>
            </Space>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
                className="text-gray-500 hover:text-blue-600"
              />
              <Text type="secondary" className="text-xs">
                {node.timestamp?.toLocaleTimeString()}
              </Text>
            </Space>
          </Space>
        </div>

        {/* Content area - flexible height */}
        <div className="flex flex-col">
          <div className="mb-4" style={{ minHeight: isCurrentInput ? '120px' : 'auto' }}>
            {isEditable && isCurrentInput ? (
              // Editable state: show TextArea
              <TextArea
                value={node.content}
                onChange={(e) => onContentChange?.(e.target.value)}
                placeholder="Please enter your requirement description, questions or content to be processed..."
                className="resize-none border-none"
                style={{ 
                  height: '120px', 
                  minHeight: '120px',
                  backgroundColor: 'transparent' 
                }}
              />
            ) : (
              // Read-only state: show text
              <Paragraph className="text-base whitespace-pre-wrap mb-0">
                {node.content || 'Please enter content...'}
              </Paragraph>
            )}
          </div>

          {/* Resource management section - always visible for current input */}
          {isCurrentInput && (
            <div className="flex-shrink-0 border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <Text strong className="text-sm text-gray-700">
                  Referenced Resources ({node.resources?.length || 0})
                </Text>
                <Dropdown overlay={menu} disabled={uploading}>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={uploading ? <LoadingOutlined /> : <PlusOutlined />}
                    className="bg-blue-600 hover:bg-blue-700"
                    loading={uploading}
                  />
                </Dropdown>
              </div>
              
              {/* Resource tags display */}
              {node.resources && node.resources.length > 0 && (
                <div className="max-h-20 overflow-y-auto">
                  <Space wrap>
                    {node.resources.map(resource => (
                      <Tag
                        key={resource.id}
                        closable={!!onResourceRemove && !uploading}
                        onClose={() => onResourceRemove?.(resource.id)}
                        color="blue"
                        className="mb-1"
                      >
                        {resource.title}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          )}

          {/* Resource tags for non-current inputs - original behavior */}
          {!isCurrentInput && node.resources && node.resources.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 pt-4">
              <Text strong className="text-sm text-gray-700 mb-3 block">
                Referenced Resources ({node.resources.length})
              </Text>
              <div className="max-h-16 overflow-y-auto">
                <Space wrap>
                  {node.resources.map(resource => (
                    <Tag
                      key={resource.id}
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
            <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-3">
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
            <div className="flex-shrink-0 border-t border-gray-200 pt-3 mt-3">
              <Space className="w-full justify-between">
                <Text type="secondary" className="text-sm">
                  Status: {node.status === 'running' ? 'Executing...' : node.status === 'error' ? 'Execution failed' : 'Waiting'}
                </Text>
                {node.status === 'error' && onRetry && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                    className="bg-red-600 hover:bg-red-700 border-red-600"
                  >
                    Retry
                  </Button>
                )}
              </Space>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        title={`Preview - ${getTitle()}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
        className="preview-modal"
      >
        <div className="space-y-4">
          {/* Content Preview */}
          <div>
            <Text strong className="text-base mb-2 block">Content:</Text>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Paragraph className="text-base whitespace-pre-wrap mb-0">
                {node.content || 'No content available'}
              </Paragraph>
            </div>
          </div>

          {/* Agent Info */}
          {node.agent && (
            <div>
              <Text strong className="text-base mb-2 block">Agent:</Text>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Space align="center">
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
                  <div>
                    <Text strong className="text-lg">{node.agent.name}</Text>
                    <div className="text-sm text-gray-600">{node.agent.description}</div>
                  </div>
                </Space>
              </div>
            </div>
          )}

          {/* Resources Preview */}
          {node.resources && node.resources.length > 0 && (
            <div>
              <Text strong className="text-base mb-2 block">
                Referenced Resources ({node.resources.length}):
              </Text>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Space wrap>
                  {node.resources.map(resource => (
                    <Tag key={resource.id} color="blue" className="mb-1">
                      {resource.title}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>
          )}

          {/* Status and Logs */}
          {node.status && (
            <div>
              <Text strong className="text-base mb-2 block">Status:</Text>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Text>
                  {node.status === 'running' ? 'Executing...' : 
                   node.status === 'error' ? 'Execution failed' : 
                   node.status === 'completed' ? 'Completed' : 'Waiting'}
                </Text>
              </div>
            </div>
          )}

          {/* Execution Logs */}
          {node.logs && node.logs.length > 0 && (
            <div>
              <Text strong className="text-base mb-2 block">Execution Logs:</Text>
              <div className="bg-gray-50 p-4 rounded-lg border max-h-40 overflow-y-auto">
                {node.logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-700 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <Text strong className="text-base mb-2 block">Timestamp:</Text>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Text type="secondary">
                {node.timestamp?.toLocaleString()}
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
} 
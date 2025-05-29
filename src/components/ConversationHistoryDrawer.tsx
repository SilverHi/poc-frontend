import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  Typography, 
  Button, 
  Space, 
  Empty, 
  message, 
  Popconfirm,
  Tag,
  Input
} from 'antd';
import { 
  MessageOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ConversationSummary } from '@/types';
import { apiService } from '@/services/api';

const { Title, Text } = Typography;
const { Search } = Input;

interface ConversationHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationHistoryDrawer: React.FC<ConversationHistoryDrawerProps> = ({
  open,
  onClose,
  onConversationSelect
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      message.error('Failed to fetch conversation history');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    onClose();
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteConversation(conversationId);
      message.success('Conversation deleted successfully');
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      message.error('Failed to delete conversation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <MessageOutlined />
          <span>Conversation History</span>
        </Space>
      }
      placement="left"
      onClose={onClose}
      open={open}
      width={400}
      styles={{
        body: { padding: 0 }
      }}
    >
      <div style={{ padding: '16px 24px 0' }}>
        <Search
          placeholder="Search conversations..."
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />
      </div>

      {filteredConversations.length === 0 && !loading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No conversations found"
          style={{ marginTop: 60 }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={filteredConversations}
          renderItem={(conversation) => (
            <List.Item
              style={{
                padding: '16px 24px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleConversationClick(conversation.id)}
              actions={[
                <Popconfirm
                  title="Delete conversation"
                  description="Are you sure you want to delete this conversation?"
                  onConfirm={(e) => handleDeleteConversation(conversation.id, e!)}
                  okText="Yes"
                  cancelText="No"
                  key="delete"
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ marginBottom: 4 }}>
                    <Text strong ellipsis style={{ display: 'block' }}>
                      {conversation.title}
                    </Text>
                  </div>
                }
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space size={8}>
                      <Tag icon={<MessageOutlined />} color="blue">
                        {conversation.message_count} messages
                      </Tag>
                    </Space>
                    <Space size={4} style={{ color: '#8c8c8c', fontSize: '12px' }}>
                      <ClockCircleOutlined />
                      <span>{formatDate(conversation.updated_at)}</span>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default ConversationHistoryDrawer; 
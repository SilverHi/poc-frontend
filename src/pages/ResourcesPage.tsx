import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoredResource } from '../lib/database';
import { ConfirmModal, FormModal } from '../components/Modal';
import { 
  notification, 
  Layout, 
  Typography, 
  Button, 
  Input, 
  Card, 
  Space, 
  Tag, 
  Empty, 
  Spin,
  Row,
  Col,
  Descriptions
} from 'antd';
import { 
  UploadOutlined, 
  HomeOutlined, 
  SearchOutlined, 
  DeleteOutlined,
  FileTextOutlined,
  EditOutlined,
  FileOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography; 

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<StoredResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState<StoredResource[]>([]);

  // File upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    // Filter resources based on search query
    if (searchQuery.trim()) {
      const filtered = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.parsedContent.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(resources);
    }
  }, [searchQuery, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      // Mock API call - 替换为实际的API调用
      const mockResources: StoredResource[] = [];
      setResources(mockResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      notification.warning({
        message: '请检查输入',
        description: '请选择文件并输入标题',
        placement: 'topRight',
      });
      return;
    }

    try {
      setUploading(true);
      // Mock API call - 替换为实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟

      notification.success({
        message: '上传成功',
        description: '文件上传成功！',
        placement: 'topRight',
      });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      fetchResources(); // Refresh the list
    } catch (error) {
      console.error('Upload error:', error);
      notification.error({
        message: '上传失败',
        description: '上传失败，请重试',
        placement: 'topRight',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete button clicked for resource:', id);
    setResourceToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      setDeleting(true);
      console.log('Deleting resource with ID:', resourceToDelete);
      // Mock API call - 替换为实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟

      notification.success({
        message: '删除成功',
        description: '资源删除成功！',
        placement: 'topRight',
      });
      fetchResources(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      notification.error({
        message: '删除失败',
        description: '删除失败，请检查网络连接后重试',
        placement: 'topRight',
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setResourceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('User cancelled deletion');
    setShowDeleteModal(false);
    setResourceToDelete(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      case 'md':
        return <EditOutlined style={{ color: '#52c41a' }} />;
      case 'text':
        return <FileOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF文档';
      case 'md':
        return 'Markdown文件';
      case 'text':
        return '文本文件';
      default:
        return '未知类型';
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div>
          <Title level={2} className="mb-0 text-gray-900">资源管理</Title>
          <Text type="secondary" className="text-sm">
            管理和上传您的文档资源
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setShowUploadModal(true)}
          >
            上传文件
          </Button>
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            返回主页
          </Button>
        </Space>
      </Header>

      <Content className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="搜索资源..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
            size="large"
            allowClear
          />
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spin size="large" />
          </div>
        ) : filteredResources.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text strong>
                  {searchQuery ? '未找到匹配的资源' : '暂无资源'}
                </Text>
                <br />
                <Text type="secondary">
                  {searchQuery ? '试试其他搜索词' : '点击上传文件按钮开始添加资源'}
                </Text>
              </div>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredResources.map((resource) => (
              <Col xs={24} md={12} lg={8} key={resource.id}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(resource.id);
                      }}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<div className="text-2xl">{getTypeIcon(resource.type)}</div>}
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong className="truncate">{resource.title}</Text>
                        <Tag color="blue">{getTypeLabel(resource.type)}</Tag>
                      </div>
                    }
                    description={
                      resource.description && (
                        <Paragraph ellipsis={{ rows: 2 }} className="mb-2">
                          {resource.description}
                        </Paragraph>
                      )
                    }
                  />
                  
                  <div className="mt-4">
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="文件名">
                        <Text code className="text-xs">{resource.fileName}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="大小">
                        {formatFileSize(resource.fileSize)}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </Descriptions.Item>
                    </Descriptions>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Paragraph ellipsis={{ rows: 3 }} className="text-xs text-gray-500 mb-0">
                        {resource.parsedContent}
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Content>

      {/* Upload Modal */}
      <FormModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadTitle('');
          setUploadDescription('');
          setSelectedFile(null);
        }}
        onSubmit={handleFileUpload}
        title="上传文件"
        submitText="上传"
        cancelText="取消"
        isSubmitting={uploading}
        canSubmit={!!(selectedFile && uploadTitle.trim())}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入资源标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="输入资源描述（可选）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件 *
          </label>
          <input
            type="file"
            accept=".pdf,.md,.markdown,.txt"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            支持的文件类型: PDF, Markdown (.md), 文本文件 (.txt)
          </p>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message="确定要删除这个资源吗？此操作无法撤销。"
        confirmText="确认删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
      />
    </Layout>
  );
} 
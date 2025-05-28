import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoredResource } from '../lib/database';
import { ConfirmModal, FormModal } from '../components/Modal';
import { apiService } from '../services/api';
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
  const [fileInputKey, setFileInputKey] = useState(0); // Add key to force file input reset
  
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
        resource.parsed_content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(resources);
    }
  }, [searchQuery, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await apiService.getResources();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      notification.error({
        message: 'Failed to fetch resources',
        description: 'Unable to get resource list',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      notification.warning({
        message: 'Please check input',
        description: 'Please select a file and enter a title',
        placement: 'topRight',
      });
      return;
    }

    try {
      setUploading(true);
      await apiService.uploadResource(selectedFile, uploadTitle, uploadDescription);

      notification.success({
        message: 'Upload successful',
        description: 'File uploaded successfully!',
        placement: 'topRight',
      });
      
      // Clear form and close modal
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      setFileInputKey(prev => prev + 1); // Force file input reset
      
      fetchResources(); // Refresh the list
    } catch (error) {
      console.error('Upload error:', error);
      notification.error({
        message: 'Upload failed',
        description: 'Upload failed, please try again',
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
      await apiService.deleteResource(resourceToDelete);

      notification.success({
        message: 'Deleted successfully',
        description: 'Resource deleted successfully!',
        placement: 'topRight',
      });
      fetchResources(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      notification.error({
        message: 'Delete failed',
        description: 'Delete failed, please check network connection and try again',
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
        return 'PDF Document';
      case 'md':
        return 'Markdown File';
      case 'text':
        return 'Text File';
      default:
        return 'Unknown Type';
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div>
          <Title level={2} className="mb-0 text-gray-900">Resource Management</Title>
          <Text type="secondary" className="text-sm">
            Manage and upload your document resources
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              // Clear form state before opening modal
              setUploadTitle('');
              setUploadDescription('');
              setSelectedFile(null);
              setFileInputKey(prev => prev + 1);
              setShowUploadModal(true);
            }}
          >
            Upload File
          </Button>
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Space>
      </Header>

      <Content className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search resources..."
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
                  {searchQuery ? 'No matching resources found' : 'No resources yet'}
                </Text>
                <br />
                <Text type="secondary">
                  {searchQuery ? 'Try different search terms' : 'Click the Upload File button to start adding resources'}
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
                      Delete
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<div className="text-2xl">{getTypeIcon(resource.file_type)}</div>}
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong className="truncate">{resource.title}</Text>
                        <Tag color="blue">{getTypeLabel(resource.file_type)}</Tag>
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
                      <Descriptions.Item label="File Name">
                        <Text code className="text-xs">{resource.file_name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Size">
                        {formatFileSize(resource.file_size)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created Time">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </Descriptions.Item>
                    </Descriptions>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Paragraph ellipsis={{ rows: 3 }} className="text-xs text-gray-500 mb-0">
                        {resource.parsed_content}
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
          setFileInputKey(prev => prev + 1); // Force file input reset
        }}
        onSubmit={handleFileUpload}
        title="Upload File"
        submitText="Upload"
        cancelText="Cancel"
        isSubmitting={uploading}
        canSubmit={!!(selectedFile && uploadTitle.trim())}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter resource title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Enter resource description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File *
          </label>
          <input
            key={fileInputKey}
            type="file"
            accept=".pdf,.md,.markdown,.txt"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported file types: PDF, Markdown (.md), Text file (.txt)
          </p>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this resource? This operation cannot be undone."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
      />
    </Layout>
  );
} 
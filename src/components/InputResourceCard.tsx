import { InputResource } from '@/types';
import { Card, Tag, Typography } from 'antd';
import { FileTextOutlined, EditOutlined, FileOutlined, LinkOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface InputResourceCardProps {
  resource: InputResource;
  isSelected: boolean;
  onSelect: (resource: InputResource) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'document': return <FileTextOutlined />;
    case 'text': return <EditOutlined />;
    case 'template': return <FileOutlined />;
    case 'reference': return <LinkOutlined />;
    default: return <FileTextOutlined />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'blue';
    case 'text': return 'green';
    case 'template': return 'purple';
    case 'reference': return 'orange';
    default: return 'default';
  }
};

export default function InputResourceCard({ resource, isSelected, onSelect }: InputResourceCardProps) {
  return (
    <Card
      hoverable
      className={`mb-3 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 shadow-md' 
          : ''
      }`}
      onClick={() => onSelect(resource)}
      size="small"
      style={{
        borderColor: isSelected ? '#1677ff' : undefined,
        backgroundColor: isSelected ? '#f0f8ff' : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl text-gray-600">
          {getTypeIcon(resource.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 truncate text-sm">{resource.title}</h3>
            <Tag color={getTypeColor(resource.type)}>
              {resource.type}
            </Tag>
          </div>
          {resource.description && (
            <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
          )}
          <Paragraph 
            ellipsis={{ rows: 2, expandable: false }} 
            className="text-xs text-gray-500 mb-0"
          >
            {resource.content}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
} 
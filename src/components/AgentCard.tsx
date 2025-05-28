import { Agent } from '@/types';
import { Card, Tag, Avatar } from 'antd';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  disabled?: boolean;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'analysis': return 'Analysis';
    case 'validation': return 'Validation';
    case 'generation': return 'Generation';
    case 'optimization': return 'Optimization';
    default: return category;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'analysis': return 'blue';
    case 'validation': return 'green';
    case 'generation': return 'purple';
    case 'optimization': return 'orange';
    default: return 'default';
  }
};

export default function AgentCard({ agent, onSelect, disabled = false }: AgentCardProps) {
  return (
    <Card
      hoverable={!disabled}
      className={`mb-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onSelect(agent)}
      size="small"
    >
      <div className="flex items-start gap-3">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
            <Tag color={getCategoryColor(agent.category)}>
              {getCategoryLabel(agent.category)}
            </Tag>
          </div>
          <p className="text-xs text-gray-600">{agent.description}</p>
        </div>
      </div>
    </Card>
  );
} 
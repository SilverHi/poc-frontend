import { InputResource, Agent } from '@/types';

export const mockInputResources: InputResource[] = [
  {
    id: '1',
    title: 'Product Requirements Document',
    type: 'text',
    content: 'The user management system needs to support user registration, login, personal information management and other basic functions...',
    description: 'Complete product requirements document containing functional specifications'
  },
  {
    id: '2',
    title: 'User Research Report',
    type: 'text',
    content: 'Through research on 100 users, we found that users care most about system usability and security...',
    description: 'Research report based on user interviews'
  },
  {
    id: '3',
    title: 'Competitive Analysis',
    type: 'md',
    content: 'Analysis of mainstream user management systems in the market, including feature comparison and pros/cons analysis...',
    description: 'Competitor product feature analysis'
  },
  {
    id: '4',
    title: 'Technical Constraints',
    type: 'text',
    content: 'The system needs to support high concurrency, use microservice architecture, database using MySQL...',
    description: 'Technical implementation constraints'
  },
  {
    id: '5',
    title: 'User Story Template',
    type: 'md',
    content: 'As a [user role], I want [feature description], so that [value/goal]',
    description: 'Standard User Story writing template'
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'story-generation',
    name: 'Story Generation',
    description: 'Generate User Stories from requirements',
    icon: '📝',
    category: 'generation',
    color: '#1890ff'
  },
  {
    id: 'requirement-validation',
    name: 'Requirement Validation',
    description: 'Validate requirement completeness and clarity',
    icon: '✅',
    category: 'validation',
    color: '#52c41a'
  },
  {
    id: 'acceptance-criteria',
    name: 'Acceptance Criteria',
    description: 'Generate detailed acceptance criteria for User Stories',
    icon: '📋',
    category: 'generation',
    color: '#722ed1'
  },
  {
    id: 'story-optimization',
    name: 'Story Optimization',
    description: 'Optimize User Story expression and structure',
    icon: '⚡',
    category: 'optimization',
    color: '#faad14'
  },
  {
    id: 'dependency-analysis',
    name: 'Dependency Analysis',
    description: 'Analyze dependencies between User Stories',
    icon: '🔗',
    category: 'analysis',
    color: '#13c2c2'
  }
];

// Mock agent execution function  
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const executeAgent = async (agentId: string, _input: string): Promise<{ output: string; logs: string[] }> => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const logs = [
    `Starting ${mockAgents.find(a => a.id === agentId)?.name}...`,
    'Analyzing input content...',
    'Applying processing logic...',
    'Generating output results...',
    'Execution completed'
  ];

  let output = '';
  
  switch (agentId) {
    case 'grammar-check':
      output = `Grammar Check Results:
✅ Text grammar is correct
✅ Expression is clear and standard
⚠️ Suggestion: Use more specific verbs to describe user actions`;
      break;
    case 'semantic-analysis':
      output = `Semantic Analysis Results:
📊 Main Concepts: User management, access control, data security
🎯 Core Objectives: Improve user experience, ensure system security
🔍 Key Entities: Users, roles, permissions, operation logs`;
      break;
    case 'requirement-validation':
      output = `Requirement Validation Results:
✅ Requirement description is complete
✅ Business value is clear
⚠️ Missing specific performance metrics
❌ Need to add exception handling scenarios`;
      break;
    case 'story-generation':
      output = `Generated User Stories:

**Epic**: User Account Management

**Story 1**: User Registration
As a new user, I want to register an account through email, so that I can start using the system features.

**Story 2**: User Login
As a registered user, I want to securely log into the system, so that I can access my personal data.

**Story 3**: Personal Information Management
As a logged-in user, I want to view and edit my personal information, so that I can keep my information accurate.`;
      break;
    case 'priority-analysis':
      output = `Priority Analysis Results:

🔴 **High Priority (P0)**
- User login functionality
- Basic permission validation

🟡 **Medium Priority (P1)**  
- User registration functionality
- Personal information management

🟢 **Low Priority (P2)**
- Advanced permission configuration
- Operation log viewing`;
      break;
    case 'acceptance-criteria':
      output = `Acceptance Criteria:

**User Registration Feature**
- Given user is on registration page
- When user enters valid email and password
- Then system should create new user account
- And send confirmation email
- And redirect to login page

**User Login Feature**
- Given user is on login page
- When user enters correct credentials
- Then system should validate user identity
- And create user session
- And redirect to main page`;
      break;
    case 'story-optimization':
      output = `Optimization Suggestions:

**Original Story**: User wants to manage personal information
**Optimized**: As a logged-in user, I want to view, edit and save my basic information (name, email, phone) on the personal settings page, so that I can maintain the accuracy and timeliness of my account information.

**Improvements**:
✅ Clarified user role
✅ Specified feature scope
✅ Clearly expressed business value`;
      break;
    case 'dependency-analysis':
      output = `Dependency Analysis:

**Dependency Chain**:
1. User Registration → User Login
2. User Login → Personal Information Management
3. Permission Validation → All Feature Modules

**Blocking Relationships**:
- User login functionality must be completed before personal information management
- Basic permission framework is a prerequisite for all features

**Parallel Development**:
- User registration and password reset can be developed in parallel
- UI components can be developed in parallel with backend APIs`;
      break;
    default:
      output = `Processing completed, input content has been processed by ${mockAgents.find(a => a.id === agentId)?.name}.`;
  }

  return { output, logs };
}; 
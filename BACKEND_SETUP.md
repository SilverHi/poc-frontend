# Backend Setup Guide

## Overview

The application now includes a complete backend system with:
- SQLite database for storing custom agents
- OpenAI API integration for real AI agent execution
- RESTful API endpoints for agent management
- Agent Builder interface for creating custom agents

## Configuration

### 1. OpenAI API Setup

Copy the example configuration file and configure your OpenAI API key:

```bash
cp config/openai.json.example config/openai.json
```

Then edit the `config/openai.json` file to add your OpenAI API key:

```json
{
  "apiKey": "sk-your-actual-openai-api-key-here",
  "baseURL": "https://api.openai.com/v1",
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "maxTokens": 8192,
      "description": "Most capable model, best for complex tasks"
    },
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "maxTokens": 128000,
      "description": "Latest GPT-4 model with improved capabilities"
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "maxTokens": 4096,
      "description": "Fast and efficient for most tasks"
    }
  ],
  "defaultModel": "gpt-3.5-turbo",
  "defaultTemperature": 0.7,
  "defaultMaxTokens": 1000
}
```

**Important**: Replace `"your-openai-api-key-here"` with your actual OpenAI API key.

### 2. Database

The SQLite database (`agents.db`) will be automatically created in the project root when you first access the API endpoints. No manual setup required.

## Features

### 1. Agent Builder

Access the Agent Builder by clicking the "🛠️ Agent Builder" button in the main interface.

**Features:**
- Create custom AI agents with specific prompts
- Configure LLM parameters (model, temperature, max tokens)
- Choose from predefined categories and icons
- Edit and delete existing agents
- Real-time preview of agent configurations

### 2. Custom Agent Parameters

When creating an agent, you can configure:

- **Name**: Display name for the agent
- **Description**: Brief description of what the agent does
- **Category**: Analysis, Validation, Generation, or Optimization
- **Icon**: Visual representation (emoji)
- **System Prompt**: The core instruction that defines the agent's behavior
- **Model**: Choose from available OpenAI models
- **Temperature**: Controls randomness (0.0 = deterministic, 2.0 = very random)
- **Max Tokens**: Maximum length of the response

### 3. API Endpoints

The following REST API endpoints are available:

#### Agents
- `GET /api/agents` - List all custom agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/[id]` - Get specific agent
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent
- `POST /api/agents/[id]/execute` - Execute agent with input

#### Configuration
- `GET /api/config` - Get OpenAI configuration
- `PUT /api/config` - Update OpenAI configuration

## Usage

### 1. Creating Your First Custom Agent

1. Click "🛠️ Agent Builder" in the main interface
2. Click "Create Agent"
3. Fill in the form:
   - **Name**: "Code Reviewer"
   - **Description**: "Reviews code for best practices and bugs"
   - **Category**: "Analysis"
   - **System Prompt**: "You are an expert code reviewer. Analyze the provided code and identify potential issues, suggest improvements, and highlight best practices. Focus on security, performance, and maintainability."
   - **Model**: "gpt-4"
   - **Temperature**: 0.3
   - **Max Tokens**: 1500
4. Click "Create Agent"

### 2. Using Custom Agents

1. Return to the main interface
2. Your custom agents will appear in the "Custom Agents" section
3. Select input resources (optional)
4. Enter your content in the input area
5. Click on your custom agent
6. Click "Execute" to run the agent

### 3. Agent Execution Flow

When you execute a custom agent:
1. The input is sent to the OpenAI API with the agent's system prompt
2. The response is processed and displayed in the workflow
3. Real-time logs show the execution progress
4. The output can be used as input for the next agent in the chain

## Example System Prompts

### Code Reviewer Agent
```
You are an expert code reviewer. Analyze the provided code and identify potential issues, suggest improvements, and highlight best practices. Focus on security, performance, and maintainability. Provide specific, actionable feedback.
```

### Requirements Analyst Agent
```
You are a business analyst specializing in requirements analysis. Review the provided requirements and:
1. Identify any ambiguities or missing information
2. Suggest clarifications needed
3. Break down complex requirements into smaller, manageable pieces
4. Ensure requirements are testable and measurable
```

### User Story Writer Agent
```
You are an expert Agile coach and user story writer. Convert the provided requirements into well-formed user stories following the format: "As a [user type], I want [functionality] so that [benefit]". Include acceptance criteria for each story.
```

## Troubleshooting

### OpenAI API Issues

1. **"OpenAI Not Configured" Error**
   - Check that your API key is correctly set in `config/openai.json`
   - Ensure the API key starts with `sk-`
   - Verify you have sufficient credits in your OpenAI account

2. **"Failed to execute agent" Error**
   - Check your internet connection
   - Verify the OpenAI API is accessible
   - Check the browser console for detailed error messages

### Database Issues

1. **Agents not saving**
   - Check file permissions in the project directory
   - Ensure SQLite can create the `agents.db` file
   - Check the browser console for API errors

### Performance Tips

1. **Model Selection**
   - Use `gpt-3.5-turbo` for faster, cost-effective responses
   - Use `gpt-4` for more complex analysis tasks
   - Use `gpt-4-turbo` for tasks requiring longer context

2. **Temperature Settings**
   - Use 0.0-0.3 for factual, consistent outputs
   - Use 0.7-1.0 for creative, varied outputs
   - Use 1.0+ for highly creative or brainstorming tasks

3. **Token Management**
   - Set appropriate max tokens based on expected output length
   - Monitor token usage to control costs
   - Use shorter system prompts when possible

## Security Notes

- The OpenAI API key is stored in a local configuration file
- Never commit your actual API key to version control
- Consider using environment variables for production deployments
- The SQLite database is stored locally and not encrypted

## Development

To extend the system:

1. **Add new agent categories**: Update the `categories` array in `/src/app/agents/page.tsx`
2. **Add new models**: Update the `models` array in `config/openai.json`
3. **Customize the UI**: Modify the React components in `/src/components/`
4. **Add new API endpoints**: Create new files in `/src/app/api/`

## File Structure

```
├── config/
│   └── openai.json          # OpenAI configuration
├── lib/
│   ├── database.ts          # SQLite database management
│   └── openai.ts           # OpenAI service
├── src/
│   ├── app/
│   │   ├── agents/
│   │   │   └── page.tsx     # Agent Builder interface
│   │   ├── api/
│   │   │   ├── agents/      # Agent management APIs
│   │   │   └── config/      # Configuration APIs
│   │   └── page.tsx         # Main interface
│   └── components/          # React components
└── agents.db               # SQLite database (auto-created)
``` 
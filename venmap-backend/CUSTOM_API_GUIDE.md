# Custom API Integration Guide (Backend)

The Business Plan Generator backend supports custom AI API integrations alongside Gemini, Claude, and OpenAI. This allows you to use any AI service that provides a REST API.

## Priority Order

The backend checks for APIs in this order:
1. **Custom API** (highest priority)
2. **Gemini API**
3. **Claude API** 
4. **OpenAI API**
5. **Fallback responses** (template-based)

## Configuration

### Required Variables
- `CUSTOM_API_KEY` - Your API key/token
- `CUSTOM_API_BASE_URL` - Base URL of your API service

### Optional Variables
- `CUSTOM_API_ENDPOINT` - API endpoint path (default: `/chat/completions`)
- `CUSTOM_API_MODEL` - Model name to use (default: `gpt-3.5-turbo`)
- `CUSTOM_API_FORMAT` - Response format (default: `openai`)
- `CUSTOM_API_HEADER_PREFIX` - Auth header format (default: `Bearer`)
- `CUSTOM_API_MAX_TOKENS` - Maximum response tokens (default: `4000`)
- `CUSTOM_API_TEMPERATURE` - Response creativity (default: `0.7`)

## Supported Formats

### OpenAI Format (`CUSTOM_API_FORMAT=openai`)
```json
{
  "model": "your-model",
  "messages": [
    {"role": "system", "content": "You are a helpful business consultant. Here's the current context: context"},
    {"role": "user", "content": "prompt"}
  ],
  "max_tokens": 4000,
  "temperature": 0.7
}
```

### Claude Format (`CUSTOM_API_FORMAT=claude`)
```json
{
  "model": "your-model",
  "max_tokens": 4000,
  "messages": [
    {"role": "system", "content": "You are a helpful business consultant. Here's the current context: context"},
    {"role": "user", "content": "prompt"}
  ]
}
```

### Custom Format (`CUSTOM_API_FORMAT=custom`)
```json
{
  "model": "your-model",
  "prompt": "user prompt",
  "context": "system context",
  "max_tokens": 4000,
  "temperature": 0.7,
  "messages": [
    {"role": "system", "content": "You are a helpful business consultant. Here's the current context: context"},
    {"role": "user", "content": "prompt"}
  ]
}
```

## Authentication Headers

### Bearer Token (most common)
```
CUSTOM_API_HEADER_PREFIX=Bearer
# Results in: Authorization: Bearer your_api_key
```

### API Key Header
```
CUSTOM_API_HEADER_PREFIX=x-api-key
# Results in: x-api-key: your_api_key
```

### API-Key Header
```
CUSTOM_API_HEADER_PREFIX=API-Key
# Results in: API-Key: your_api_key
```

### Custom Header
```
CUSTOM_API_HEADER_PREFIX=MyAuth
# Results in: Authorization: MyAuth your_api_key
```

## Example Configurations

### Local Ollama
```env
CUSTOM_API_KEY=not_required
CUSTOM_API_BASE_URL=http://localhost:11434
CUSTOM_API_ENDPOINT=/api/chat
CUSTOM_API_MODEL=llama2
CUSTOM_API_FORMAT=openai
```

### Azure OpenAI
```env
CUSTOM_API_KEY=your_azure_key
CUSTOM_API_BASE_URL=https://your-resource.openai.azure.com
CUSTOM_API_ENDPOINT=/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview
CUSTOM_API_MODEL=gpt-4
CUSTOM_API_FORMAT=openai
CUSTOM_API_HEADER_PREFIX=API-Key
```

### Hugging Face Inference
```env
CUSTOM_API_KEY=hf_your_token
CUSTOM_API_BASE_URL=https://api-inference.huggingface.co
CUSTOM_API_ENDPOINT=/models/microsoft/DialoGPT-large
CUSTOM_API_MODEL=microsoft/DialoGPT-large
CUSTOM_API_FORMAT=custom
```

### LM Studio
```env
CUSTOM_API_KEY=not_required
CUSTOM_API_BASE_URL=http://localhost:1234
CUSTOM_API_ENDPOINT=/v1/chat/completions
CUSTOM_API_MODEL=local-model
CUSTOM_API_FORMAT=openai
```

## Response Parsing

The backend automatically parses responses based on the format:

- **OpenAI format**: Looks for `data.choices[0].message.content`, falls back to `data.response`
- **Claude format**: Looks for `data.content[0].text`, falls back to `data.response`
- **Custom format**: Tries `data.response`, `data.content`, `data.text`, `data.message`

## Backend API Endpoints

The backend exposes these endpoints for debugging and health checks:

### Health Check
```
GET /api/health
```
Returns the status of all configured AI providers.

### Configuration Info
```
GET /api/config-info
```
Returns configuration details for all AI providers (without exposing API keys).

### Generate Response
```
POST /api/generate
{
  "prompt": "Your business question",
  "context": "Optional context"
}
```

## Security Notes

- Never commit real API keys to version control
- Use `.env` for development configurations
- Store production secrets in secure environment variable systems
- API keys are only accessible on the backend - they are not exposed to clients
- Set `USE_BACKEND_API_KEYS=false` in production to enforce frontend-only API usage

## Available AI Providers

The backend supports these AI providers in priority order:

1. **Custom API** - Your own AI service endpoint
2. **Gemini API** - Google's Generative AI (requires `GEMINI_API_KEY`)
3. **Claude API** - Anthropic's Claude (requires `CLAUDE_API_KEY`)
4. **OpenAI API** - OpenAI's GPT models (requires `OPENAI_API_KEY`)

## Troubleshooting

1. **"Custom API error: 401"** - Check your API key and header format
2. **"Custom API error: 404"** - Verify your base URL and endpoint path
3. **"No response received"** - Check your API format setting matches your service
4. **Connection errors** - Verify network connectivity to your custom API endpoint
5. **Backend returns 403** - Set `USE_BACKEND_API_KEYS=true` or ensure frontend provides API keys
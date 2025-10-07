# Custom API Integration Guide

The Business Plan Generator supports custom AI API integrations alongside Claude and OpenAI. This allows you to use any AI service that provides a REST API.

## Priority Order

The app checks for APIs in this order:
1. **Custom API** (highest priority)
2. **Claude API** 
3. **OpenAI API**
4. **Fallback responses** (template-based)

## Configuration

### Required Variables
- `VITE_CUSTOM_API_KEY` - Your API key/token
- `VITE_CUSTOM_API_BASE_URL` - Base URL of your API service

### Optional Variables
- `VITE_CUSTOM_API_ENDPOINT` - API endpoint path (default: `/chat/completions`)
- `VITE_CUSTOM_API_MODEL` - Model name to use (default: `gpt-3.5-turbo`)
- `VITE_CUSTOM_API_FORMAT` - Response format (default: `openai`)
- `VITE_CUSTOM_API_HEADER_PREFIX` - Auth header format (default: `Bearer`)
- `VITE_CUSTOM_API_MAX_TOKENS` - Maximum response tokens (default: `4000`)
- `VITE_CUSTOM_API_TEMPERATURE` - Response creativity (default: `0.7`)

## Supported Formats

### OpenAI Format (`VITE_CUSTOM_API_FORMAT=openai`)
```json
{
  "model": "your-model",
  "messages": [
    {"role": "system", "content": "context"},
    {"role": "user", "content": "prompt"}
  ],
  "max_tokens": 4000,
  "temperature": 0.7
}
```

### Claude Format (`VITE_CUSTOM_API_FORMAT=claude`)
```json
{
  "model": "your-model",
  "max_tokens": 4000,
  "messages": [
    {"role": "system", "content": "context"},
    {"role": "user", "content": "prompt"}
  ]
}
```

### Custom Format (`VITE_CUSTOM_API_FORMAT=custom`)
```json
{
  "model": "your-model",
  "prompt": "user prompt",
  "context": "system context",
  "max_tokens": 4000,
  "temperature": 0.7,
  "messages": [...] // also included
}
```

## Authentication Headers

### Bearer Token (most common)
```
VITE_CUSTOM_API_HEADER_PREFIX=Bearer
# Results in: Authorization: Bearer your_api_key
```

### API Key Header
```
VITE_CUSTOM_API_HEADER_PREFIX=x-api-key
# Results in: x-api-key: your_api_key
```

### Custom Header
```
VITE_CUSTOM_API_HEADER_PREFIX=MyAuth
# Results in: Authorization: MyAuth your_api_key
```

## Example Configurations

### Local Ollama
```env
VITE_CUSTOM_API_KEY=not_required
VITE_CUSTOM_API_BASE_URL=http://localhost:11434
VITE_CUSTOM_API_ENDPOINT=/api/chat
VITE_CUSTOM_API_MODEL=llama2
VITE_CUSTOM_API_FORMAT=openai
```

### Azure OpenAI
```env
VITE_CUSTOM_API_KEY=your_azure_key
VITE_CUSTOM_API_BASE_URL=https://your-resource.openai.azure.com
VITE_CUSTOM_API_ENDPOINT=/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview
VITE_CUSTOM_API_MODEL=gpt-4
VITE_CUSTOM_API_FORMAT=openai
VITE_CUSTOM_API_HEADER_PREFIX=api-key
```

### Hugging Face Inference
```env
VITE_CUSTOM_API_KEY=hf_your_token
VITE_CUSTOM_API_BASE_URL=https://api-inference.huggingface.co
VITE_CUSTOM_API_ENDPOINT=/models/microsoft/DialoGPT-large
VITE_CUSTOM_API_MODEL=microsoft/DialoGPT-large
VITE_CUSTOM_API_FORMAT=custom
```

### LM Studio
```env
VITE_CUSTOM_API_KEY=not_required
VITE_CUSTOM_API_BASE_URL=http://localhost:1234
VITE_CUSTOM_API_ENDPOINT=/v1/chat/completions
VITE_CUSTOM_API_MODEL=local-model
VITE_CUSTOM_API_FORMAT=openai
```

## Response Parsing

The API client automatically parses responses based on the format:

- **OpenAI format**: Looks for `data.choices[0].message.content`
- **Claude format**: Looks for `data.content[0].text`
- **Custom format**: Tries `data.response`, `data.content`, `data.text`, `data.message`

## Debugging

You can check your API configuration in the browser console:
```javascript
// In browser dev tools
window.aiClient = AIClient.getInstance();
console.log(window.aiClient.getConfigInfo());
```

## Security Notes

- Never commit real API keys to version control
- Use `.env.local` for sensitive configurations
- Environment variables are exposed in the browser - only use in trusted environments
- Consider using a proxy server for sensitive API keys in production

## Troubleshooting

1. **"Custom API error: 401"** - Check your API key and header format
2. **"Custom API error: 404"** - Verify your base URL and endpoint path
3. **"No response received"** - Check your API format setting matches your service
4. **CORS errors** - Your API service must allow browser requests or use a proxy
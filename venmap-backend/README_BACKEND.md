# Backend Setup Instructions

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd server
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
USE_BACKEND_API_KEYS=true

# AI API Keys (used when USE_BACKEND_API_KEYS=true, configure at least one)
CLAUDE_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Backend Server

```bash
# Development mode with auto-restart
pnpm run dev

# OR production mode
pnpm run start
```

The backend server will start on `http://localhost:3001`

### 4. Backend API Key Configuration

The backend supports two modes:

#### Backend Keys Mode (USE_BACKEND_API_KEYS=true)

- Backend uses **your** API keys from `.env` file
- Users get unlimited access to AI features
- **You pay** for all API usage
- Good for testing and demo purposes

#### Frontend Keys Mode (USE_BACKEND_API_KEYS=false)  

- Backend API endpoints are disabled
- Users must enter **their own** API keys
- Users pay for their own usage
- Recommended for public deployment

### 5. Update Frontend Configuration

Create or update your frontend `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## 📡 API Endpoints

### Health Check

- `GET /health` - Server health status

### AI Generation

- `POST /api/generate` - Generate AI responses

  ```json
  {
    "prompt": "Your question here",
    "context": "Optional context"
  }
  ```

### Configuration

- `GET /api/config` - Get AI service configuration
- `GET /api/health` - AI service health check

## 🔧 Configuration Options

### Custom API Support

You can configure custom AI APIs by adding these environment variables:

```env
CUSTOM_API_KEY=your_custom_api_key
CUSTOM_API_BASE_URL=https://your-api.com
CUSTOM_API_ENDPOINT=/chat/completions
CUSTOM_API_MODEL=gpt-3.5-turbo
CUSTOM_API_FORMAT=openai
CUSTOM_API_HEADER_PREFIX=Bearer
```

### API Priority Order

1. Custom API (if configured)
2. Claude API (if configured)
3. OpenAI API (if configured)
4. Fallback responses

## 🛠️ Development

### Available Scripts

- `pnpm run dev` - Start development server with nodemon
- `pnpm start` - Start production server
- `pnpm test` - Run tests (placeholder)

### Project Structure

```text
server/
├── package.json          # Dependencies and scripts
├── server.js             # Main server file
├── .env                  # Environment variables
├── .env.example          # Environment template
├── routes/
│   └── ai.js            # AI API routes
└── services/
    └── aiService.js     # AI service logic
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin whitelist
- **Helmet**: Security headers
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error responses

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` in `.env`
2. **API Key Issues**: Verify API keys are correct and have proper permissions
3. **Port Conflicts**: Change `PORT` in `.env` if 3001 is in use
4. **Network Issues**: Ensure no firewall blocking connections

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and `USE_BACKEND_API_KEYS=true` to enable backend API usage.

## 📋 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3001 | No |
| `NODE_ENV` | Environment mode | development | No |
| `USE_BACKEND_API_KEYS` | Enable backend API keys | true | No |
| `CLAUDE_API_KEY` | Claude API key | - | No* |
| `OPENAI_API_KEY` | OpenAI API key | - | No* |
| `CUSTOM_API_KEY` | Custom API key | - | No |
| `CUSTOM_API_BASE_URL` | Custom API URL | - | No |
| `FRONTEND_URL` | Frontend URL for CORS | <http://localhost:3000> | No |

*At least one API key is required when USE_BACKEND_API_KEYS=true

## 🎯 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

Example PM2 configuration:

```json
{
  "name": "bizplan-backend",
  "script": "server.js",
  "env": {
    "NODE_ENV": "production",
    "PORT": "3001"
  }
}
```

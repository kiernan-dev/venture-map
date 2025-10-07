# VentureMap

An AI-powered business plan generator that creates comprehensive, professional business plans using multiple AI providers including Claude, OpenAI, Gemini, and custom APIs.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VentureMap.git
cd VentureMap
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd venmap-frontend
pnpm install

# Install backend dependencies
cd ../venmap-backend
pnpm install
```

### 3. Configure Environment Variables

```bash
# Backend configuration
cd venmap-backend
cp .env.example .env
# Edit .env with your API keys and configuration

# Frontend configuration (optional)
cd ../venmap-frontend
cp .env.example .env
# Edit .env with your backend URL
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd venmap-backend
pnpm run dev

# Terminal 2: Start frontend
cd venmap-frontend
pnpm run dev
```

### 5. Open Your Browser

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:3001>
- Health check: <http://localhost:3001/health>

## 🏗️ Architecture

This is a full-stack application containing:

- **Frontend** (`venmap-frontend/`) - React + TypeScript + Vite application
- **Backend** (`venmap-backend/`) - Express.js API server with AI integration

### Tech Stack

**Frontend:**

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

**Backend:**

- Node.js + Express.js
- Multi-provider AI integration
- Rate limiting & security middleware
- CORS & environment-based configuration

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
USE_BACKEND_API_KEYS=true

# AI API Keys (configure at least one)
CLAUDE_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Custom API Support (optional)
CUSTOM_API_KEY=your_custom_api_key
CUSTOM_API_BASE_URL=https://your-api.com
CUSTOM_API_ENDPOINT=/chat/completions
CUSTOM_API_MODEL=gpt-3.5-turbo
CUSTOM_API_FORMAT=openai
CUSTOM_API_HEADER_PREFIX=Bearer

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Direct AI API keys (alternative to backend keys)
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_CUSTOM_API_KEY=your_custom_api_key
VITE_CUSTOM_API_BASE_URL=https://your-api.com
```

### API Key Modes

The application supports two modes:

#### Backend Keys Mode (`USE_BACKEND_API_KEYS=true`)

- Server uses your API keys
- Users get unlimited access
- You pay for all usage
- Good for demos and testing

#### Frontend Keys Mode (`USE_BACKEND_API_KEYS=false`)

- Users provide their own API keys
- Users pay for their own usage
- Recommended for public deployment

## 📡 API Endpoints

### Health Check

- `GET /health` - Server health status
- `GET /api/health` - AI service health check

### AI Generation

- `POST /api/generate` - Generate AI responses
- `GET /api/config` - Get AI service configuration

## 🛠️ Development

### Available Scripts

**Frontend:**

```bash
cd venmap-frontend
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run lint         # Run ESLint
pnpm run preview      # Preview production build
```

**Backend:**

```bash
cd venmap-backend
pnpm run dev      # Start with nodemon (auto-restart)
pnpm run start    # Start production server
pnpm run test     # Run tests (placeholder)
```

### Project Structure

```text
VentureMap/
├── venmap-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── utils/            # Utility functions & API client
│   │   └── App.tsx           # Main application component
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
├── venmap-backend/           # Express.js backend API
│   ├── routes/
│   │   └── ai.js             # AI API routes
│   ├── services/
│   │   └── aiService.js      # AI provider abstraction
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── README.md                 # This file
├── CLAUDE.md                 # Development guidance for Claude Code
└── .gitignore                # Git ignore rules
```

## 🚀 Features

- **Multi-Provider AI Integration** - Supports Claude, OpenAI, Gemini, and custom APIs with intelligent fallback
- **Business Plan Templates** - Startup, SaaS, E-commerce, Non-profit, and custom templates
- **Interactive Chat Assistant** - Real-time Q&A with voice input support
- **Export Flexibility** - PDF, Google Docs, Notion, PowerPoint, Word, and more
- **Auto-Save & Templates** - Never lose your progress with automatic saving
- **Dark/Light Mode** - Beautiful responsive design with glass morphism effects

## 🔒 Security Features

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS Protection:** Configurable origin whitelist
- **Security Headers:** Helmet middleware for security headers
- **Input Validation:** Request validation and sanitization
- **Environment Variables:** API keys never exposed to frontend
- **Error Handling:** Comprehensive error responses without sensitive data

## 🚀 Deployment

### Using Dokploy (Recommended)

1. **Create a new project** in Dokploy
2. **Add two services:**
   - **Frontend Service:**
     - Build Context: `./venmap-frontend`
     - Build Command: `pnpm run build`
     - Port: 3000
   - **Backend Service:**
     - Build Context: `./venmap-backend`
     - Build Command: `pnpm run start`
     - Port: 3001
3. **Configure environment variables** for each service
4. **Enable auto-deployment** from your GitHub repository

### Manual Deployment

```bash
# Build frontend
cd venmap-frontend
pnpm run build

# Start backend in production
cd venmap-backend
NODE_ENV=production pnpm run start
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` in backend `.env`
2. **API Key Issues**: Verify API keys are valid and have proper permissions
3. **Port Conflicts**: Change `PORT` in backend `.env` if 3001 is in use
4. **Build Failures**: Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and enable `USE_BACKEND_API_KEYS=true` for backend API usage during development.

### AI Provider Testing

Test your AI configuration in the browser console:

```javascript
window.aiClient = AIClient.getInstance();
console.log(window.aiClient.getConfigInfo());
```

## 📋 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3001 | No |
| `NODE_ENV` | Environment mode | development | No |
| `USE_BACKEND_API_KEYS` | Enable backend API keys | true | No |
| `CLAUDE_API_KEY` | Claude API key | - | No* |
| `OPENAI_API_KEY` | OpenAI API key | - | No* |
| `GEMINI_API_KEY` | Gemini API key | - | No* |
| `FRONTEND_URL` | Frontend URL for CORS | <http://localhost:3000> | No |

*At least one API key is required when USE_BACKEND_API_KEYS=true

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code) assistance
- UI components inspired by modern design systems
- AI integration powered by Anthropic Claude, OpenAI, and Google Gemini

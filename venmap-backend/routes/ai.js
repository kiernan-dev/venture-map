import express from 'express';
import { AIService } from '../services/aiService.js';

const router = express.Router();
const aiService = new AIService();

// Generate AI response endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    // Check if backend API keys should be used
    const useBackendKeys = process.env.USE_BACKEND_API_KEYS === 'true';
    
    if (!useBackendKeys) {
      return res.status(403).json({
        error: 'Backend API keys disabled',
        message: 'Backend API keys are disabled. Please use frontend API keys.',
        useBackendKeys: false,
        timestamp: new Date().toISOString()
      });
    }

    // Validate request
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // Generate response using AI service
    const response = await aiService.generateResponse(prompt, context);

    res.json({
      response,
      provider: aiService.getActiveProvider(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI generation error:', error);
    
    // Handle specific AI API errors
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or missing API key',
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      error: 'AI generation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to generate response',
      timestamp: new Date().toISOString()
    });
  }
});

// Get AI service configuration info
router.get('/config', (req, res) => {
  try {
    const useBackendKeys = process.env.USE_BACKEND_API_KEYS === 'true';
    const config = aiService.getConfigInfo();
    
    res.json({
      config,
      activeProvider: aiService.getActiveProvider(),
      isConfigured: aiService.isConfigured(),
      useBackendKeys: useBackendKeys,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({
      error: 'Failed to get configuration',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Configuration error',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for AI services
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json({
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Service health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as aiRoutes };
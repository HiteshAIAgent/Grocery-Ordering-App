import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const LUA_API_URL = process.env.LUA_API_URL || 'https://api.heylua.ai';
const LUA_API_KEY = process.env.LUA_API_KEY || '';
const AGENT_ID = process.env.LUA_AGENT_ID || 'baseAgent_agent_1768481902814_l243cp0lt';

// Proxy endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!LUA_API_KEY) {
      return res.status(500).json({ error: 'LUA_API_KEY not configured on server' });
    }

    // Try multiple endpoints
    const endpoints = [
      '/v1/chat',
      '/api/v1/chat',
      `/agents/${AGENT_ID}/chat`,
      '/chat',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(
          `${LUA_API_URL}${endpoint}`,
          {
            agentId: AGENT_ID,
            message,
            sessionId,
            stream: false,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${LUA_API_KEY}`,
              'X-API-Key': LUA_API_KEY,
              'x-lua-api-key': LUA_API_KEY,
            },
          }
        );

        return res.json(response.data);
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.response?.status || error.message);
        
        // If not 404, return the error
        if (error.response?.status !== 404) {
          throw error;
        }
        
        // If last endpoint, throw
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message || 'Failed to connect to Lua AI API',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Lua API URL: ${LUA_API_URL}`);
  console.log(`🔑 API Key: ${LUA_API_KEY ? LUA_API_KEY.substring(0, 8) + '...' : 'NOT SET'}`);
});

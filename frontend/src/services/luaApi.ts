import axios from 'axios';

// Use proxy in development, direct API in production
const USE_PROXY = import.meta.env.DEV;
const LUA_API_URL = USE_PROXY 
  ? '' // Use relative path for proxy in dev
  : (import.meta.env.VITE_LUA_API_URL || 'https://api.heylua.ai');
const LUA_API_KEY = import.meta.env.VITE_LUA_API_KEY || '';
const AGENT_ID = import.meta.env.VITE_LUA_AGENT_ID || 'baseAgent_agent_1768481902814_l243cp0lt';

// Debug: Log API key status (without exposing the actual key)
console.log('🔍 Environment Check:', {
  USE_PROXY,
  hasApiKey: !!LUA_API_KEY,
  apiKeyPreview: LUA_API_KEY ? LUA_API_KEY.substring(0, 8) + '...' : 'NOT FOUND',
  apiUrl: LUA_API_URL,
  agentId: AGENT_ID
});
if (!LUA_API_KEY) {
  console.error('❌ LUA_API_KEY is not set in environment variables');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
} else {
  console.log('✅ API Key loaded:', LUA_API_KEY.substring(0, 8) + '...');
}

const apiClient = axios.create({
  baseURL: LUA_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include API key (only if not using proxy)
// Always add interceptor in production to ensure headers are set
if (!USE_PROXY) {
  if (LUA_API_KEY) {
    console.log('🔧 Setting up request interceptor (production mode, API key available)');
    apiClient.interceptors.request.use((config) => {
      // Try multiple authentication formats
      config.headers['Authorization'] = `Bearer ${LUA_API_KEY}`;
      config.headers['X-API-Key'] = LUA_API_KEY;
      config.headers['x-lua-api-key'] = LUA_API_KEY;
      
      // Debug: Log what headers are being sent (without exposing full key)
      console.log('🔑 Request headers being sent:', {
        'Authorization': `Bearer ${LUA_API_KEY.substring(0, 8)}...`,
        'X-API-Key': `${LUA_API_KEY.substring(0, 8)}...`,
        'URL': config.url || 'undefined',
        'BaseURL': config.baseURL || 'undefined',
        'Full URL': (config.baseURL || '') + (config.url || '')
      });
      
      return config;
    });
    console.log('✅ Request interceptor registered successfully');
  } else {
    console.error('❌ CRITICAL: No API key available in production!');
    console.error('USE_PROXY:', USE_PROXY);
    console.error('LUA_API_KEY exists:', !!LUA_API_KEY);
    console.error('Environment variables available:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  agentId: string;
  message: string;
  sessionId?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message: string;
  sessionId?: string;
  data?: any;
  toolResults?: Array<{
    tool: string;
    result: any;
  }>;
}

/**
 * Send a chat message to the Lua AI agent
 */
export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  // Use the correct Lua AI endpoint structure (from Lua CLI source)
  // Try production channel first, fallback to dev if needed
  const basePath = USE_PROXY ? '/api/lua' : '';
  const endpoint = `${basePath}/chat/generate/${AGENT_ID}?channel=production`;

  try {
    console.log(`Calling endpoint: ${endpoint}`);
    console.log(`Base URL: ${LUA_API_URL}`);
    console.log(`Full URL will be: ${LUA_API_URL}${endpoint}`);
    
    // Use the correct request body format (from Lua CLI ChatRequest interface)
    const requestBody: any = {
      messages: [{ 
        type: 'text',
        text: message
      }],
      navigate: false,
      skillOverride: [],
      sessionId: sessionId,
    };
    
    // Ensure headers are set directly on the request (fallback if interceptor doesn't work)
    const requestConfig: any = {};
    if (!USE_PROXY && LUA_API_KEY) {
      requestConfig.headers = {
        'Authorization': `Bearer ${LUA_API_KEY}`,
        'X-API-Key': LUA_API_KEY,
        'x-lua-api-key': LUA_API_KEY,
      };
      console.log('🔑 Setting headers directly on request:', {
        'Authorization': `Bearer ${LUA_API_KEY.substring(0, 8)}...`,
        'X-API-Key': `${LUA_API_KEY.substring(0, 8)}...`,
      });
    }
    
    const response = await apiClient.post<any>(endpoint, requestBody, requestConfig);

    console.log('✓ Success (201):', endpoint);
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    // Handle different response structures
    // Lua AI might return:
    // 1. { success: true, data: { text: "...", ... } }
    // 2. { text: "...", ... }
    // 3. { type: "error", textDelta: "error message", ... }
    let responseData = response.data;
    
    // If response has a nested data structure (axios wraps it)
    if (responseData?.data && typeof responseData.data === 'object') {
      responseData = responseData.data;
    }
    
    // Check for error responses
    if (responseData?.type === 'error') {
      const errorMessage = responseData?.textDelta || responseData?.error || 'Something went wrong, please try again later.';
      console.error('API returned error:', errorMessage);
      console.error('Full error response:', responseData);
      
      // Provide helpful error message if agent not deployed
      if (errorMessage.includes('Failed to generate agent response') || errorMessage.includes('agent')) {
        throw new Error(
          'Agent not responding. The agent may need to be deployed. ' +
          'Please run `lua push all --force --auto-deploy` in your project root, or contact support if the issue persists.'
        );
      }
      
      throw new Error(errorMessage);
    }
    
    // Extract text from various possible fields
    const text = 
      responseData?.text || 
      responseData?.textDelta ||  // Streaming responses use textDelta
      responseData?.message || 
      responseData?.response ||
      responseData?.content ||
      (typeof responseData === 'string' ? responseData : 'No response received');
    
    console.log('Extracted text:', text);
    
    // Also include tool results if available in the response
    const toolResults = responseData?.toolResults || responseData?.toolCalls || responseData?.tools || null;
    
    return {
      message: text,
      sessionId: responseData?.sessionId || sessionId,
      data: responseData,
      toolResults: toolResults || undefined,
    };
  } catch (error: any) {
    console.log(`✗ Failed ${endpoint}:`, error.response?.status || error.message);
    
    // Log full error response for debugging
    if (error.response) {
      console.error('❌ Full error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Log what was sent
      console.error('📤 Request that failed:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        headers: error.config?.headers ? {
          'Authorization': error.config.headers['Authorization'] ? 
            `${error.config.headers['Authorization'].substring(0, 20)}...` : 'NOT SET',
          'X-API-Key': error.config.headers['X-API-Key'] ? 
            `${error.config.headers['X-API-Key'].substring(0, 8)}...` : 'NOT SET'
        } : 'NO HEADERS'
      });
    }
    
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Authentication failed';
      console.error('❌ 401 Unauthorized Details:', errorMessage);
      console.error('💡 Possible causes:');
      console.error('   1. API key is invalid or expired');
      console.error('   2. API key does not have access to this agent');
      console.error('   3. API key format is incorrect');
      console.error(`   4. API key in use: ${LUA_API_KEY.substring(0, 8)}...`);
      console.error(`   5. Agent ID: ${AGENT_ID}`);
      
      throw new Error(
        `Authentication failed (401): ${errorMessage}. ` +
        `Please verify your API key is correct, not expired, and has access to agent ${AGENT_ID}. ` +
        `Check your Vercel environment variables and try generating a new API key if needed.`
      );
    }
    
    throw new Error(
      `Failed to connect to Lua AI API: ${error.response?.status || 'Network Error'} - ` +
      `${error.response?.data?.message || error.message || 'Unknown error'}`
    );
  }
}

/**
 * Initialize a chat session
 */
export async function initializeSession(): Promise<string | null> {
  try {
    const response = await sendChatMessage('Hello');
    return response.sessionId || null;
  } catch (error) {
    console.error('Failed to initialize session:', error);
    return null;
  }
}

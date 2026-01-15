import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get API key from env (Vite will load VITE_ prefixed vars)
  const apiKey = env.VITE_LUA_API_KEY || '';
  
  if (apiKey) {
    console.log(`✓ Vite Proxy: API key loaded (${apiKey.substring(0, 8)}...)`);
  } else {
    console.warn('⚠️ Vite Proxy: VITE_LUA_API_KEY not found in environment');
  }

  return {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api/lua': {
          target: 'https://api.heylua.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
          // Remove /api/lua prefix and return the path
          return path.replace(/^\/api\/lua/, '');
        },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (apiKey) {
                // Clear any existing auth headers first
                proxyReq.removeHeader('authorization');
                proxyReq.removeHeader('Authorization');
                proxyReq.removeHeader('x-api-key');
                proxyReq.removeHeader('X-API-Key');
                
                // Try multiple authentication formats (Lua AI might use different ones)
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                proxyReq.setHeader('X-API-Key', apiKey);
                proxyReq.setHeader('api-key', apiKey);
                
                console.log(`✓ Proxying ${req.method} ${req.url}`);
                console.log(`  API Key (first 8 chars): ${apiKey.substring(0, 8)}...`);
                console.log(`  Headers: Authorization: Bearer ${apiKey.substring(0, 8)}..., X-API-Key: ${apiKey.substring(0, 8)}...`);
              } else {
                console.error('✗ No API key found! Check .env file has VITE_LUA_API_KEY');
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log(`← Response ${proxyRes.statusCode} for ${req.url}`);
              if (proxyRes.statusCode === 401) {
                console.error('⚠️ 401 Unauthorized - Authentication failed');
                console.error('   Possible issues:');
                console.error('   1. API key format might be wrong');
                console.error('   2. API key might not have access to this agent');
                console.error('   3. API key might be expired or invalid');
                console.error(`   Current key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT FOUND'}`);
              }
            });
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
            });
          },
        },
      },
    },
  }
})

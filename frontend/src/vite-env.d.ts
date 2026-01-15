/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUA_API_KEY: string
  readonly VITE_LUA_AGENT_ID: string
  readonly VITE_LUA_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

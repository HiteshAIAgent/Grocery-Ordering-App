# Grocery Ordering Frontend

A modern, responsive React frontend for the Grocery Ordering Assistant built with Vite.

## Features

- 🎨 Beautiful, modern UI with gradient designs
- 💬 Interactive chat interface
- 🛒 Real-time basket management
- 🏪 Store comparison (Sainsbury's, Tesco, ASDA, Waitrose)
- ✅ Checkout flow with address collection
- 📱 Fully responsive design
- ⚡ Fast development with Vite

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_LUA_API_KEY=your-lua-api-key-here
   VITE_LUA_AGENT_ID=baseAgent_agent_1768481902814_l243cp0lt
   VITE_LUA_API_URL=https://api.heylua.ai
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

1. Enter grocery items in the chat (separated by commas, spaces, or periods)
2. View prices from all stores
3. Select your preferred store (cheapest or fastest)
4. Add or remove items from your basket
5. Click "Proceed to Checkout" when ready
6. Enter your delivery address
7. Complete your order and see the thank you message

## API Integration

The frontend integrates with the Lua AI API. Make sure:
- Your Lua AI API key is set in the `.env` file
- The agent ID matches your deployed agent
- The API URL is correct (default: `https://api.heylua.ai`)

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ChatInterface.tsx
│   │   ├── BasketDisplay.tsx
│   │   ├── StoreComparison.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── ThankYou.tsx
│   ├── services/         # API services
│   │   └── luaApi.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── .env                 # Environment variables (create this)
└── package.json
```

## Notes

- The frontend expects the Lua AI API to return structured responses
- If the API endpoint structure differs, update `src/services/luaApi.ts`
- All styling is done with CSS modules for better maintainability

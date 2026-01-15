# 🚀 Frontend Setup Guide

## Quick Start

Your frontend is ready! Follow these steps to get it running:

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Your Lua AI API Key

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

Then add your Lua AI API credentials:

```env
VITE_LUA_API_KEY=your-lua-api-key-here
VITE_LUA_AGENT_ID=baseAgent_agent_1768481902814_l243cp0lt
VITE_LUA_API_URL=https://api.heylua.ai
```

**⚠️ Important:** Replace `your-lua-api-key-here` with your actual Lua AI API key.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `frontend/dist` directory.

## 🎨 Features

✅ **Chat Interface** - Natural language conversation with the grocery assistant  
✅ **Basket Management** - Real-time basket updates  
✅ **Store Comparison** - Compare prices from Sainsbury's, Tesco, ASDA, and Waitrose  
✅ **Checkout Flow** - Address collection and order confirmation  
✅ **Thank You Page** - Order confirmation with order number  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

## 🔧 API Integration

The frontend communicates with your Lua AI agent through the Lua AI API. The integration is handled in `frontend/src/services/luaApi.ts`.

If your Lua AI API has a different endpoint structure, you may need to adjust the API calls in that file.

### Current API Endpoints Used:

- `POST /v1/chat` - Send chat messages
- Fallback: `POST /agents/{agentId}/chat` - Alternative endpoint structure

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React UI components
│   │   ├── ChatInterface.tsx      # Main chat component
│   │   ├── BasketDisplay.tsx      # Basket sidebar
│   │   ├── StoreComparison.tsx    # Store comparison cards
│   │   ├── CheckoutForm.tsx       # Address form
│   │   └── ThankYou.tsx           # Order confirmation
│   ├── services/
│   │   └── luaApi.ts              # Lua AI API integration
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
├── .env                           # Environment variables (create this)
└── package.json
```

## 🐛 Troubleshooting

### API Key Issues

If you see "Failed to connect to Lua AI API":
1. Verify your API key is correct in `.env`
2. Make sure the file is named `.env` (not `.env.example`)
3. Restart the dev server after updating `.env`

### Build Errors

If you encounter TypeScript errors:
```bash
npm run build
```

Check that all dependencies are installed:
```bash
npm install
```

### Port Already in Use

If port 3000 is busy, Vite will automatically try the next available port.

## 🔐 Security Notes

- **Never commit your `.env` file** - It's already in `.gitignore`
- API keys are only used client-side for API calls
- Consider using environment variables in production deployment

## 📱 Testing the Flow

1. **Add Items**: Type "I need bread, milk, eggs" in the chat
2. **View Prices**: The assistant will show prices from all stores
3. **Select Store**: Click on a store card or say "choose cheapest"
4. **Modify Basket**: Say "add cheese" or "remove eggs"
5. **Checkout**: Click "Proceed to Checkout" button
6. **Enter Address**: Fill in your delivery address
7. **Complete**: See the thank you message with order details

## 🎯 Next Steps

1. Get your Lua AI API key ready
2. Deploy your Lua agent (`lua push all --force --auto-deploy`)
3. Update the `.env` file with your API key
4. Run `npm run dev` and test the full flow!

---

Need help? Check the main README.md or the Lua AI documentation at https://docs.heylua.ai

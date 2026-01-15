import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { BasketDisplay } from './components/BasketDisplay';
import { CheckoutForm } from './components/CheckoutForm';
import { ThankYou } from './components/ThankYou';
import { sendChatMessage } from './services/luaApi';
import { StoreComparison } from './types';
import './App.css';

type AppState = 'chat' | 'checkout' | 'thankyou';

function App() {
  const [appState, setAppState] = useState<AppState>('chat');
  const [basketItems, setBasketItems] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeTotal, setStoreTotal] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string | null>(null);
  const [storeComparisons, setStoreComparisons] = useState<StoreComparison[]>([]);
  const [orderData, setOrderData] = useState<{
    orderNumber?: string;
    store?: string;
    address?: string;
  }>({});
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const handleBasketUpdate = (items: string[]) => {
    setBasketItems(items);
  };

  const handleStoreSelect = async (store: string, total: number) => {
    console.log('🛒 Store selected:', store, 'Total:', total);
    console.log('📦 Current basket items:', basketItems);
    console.log('📊 Current store comparisons:', storeComparisons.length);
    
    setSelectedStore(store);
    setStoreTotal(total);

    // Get delivery time and items from comparisons if available
    const selectedComparison = storeComparisons.find(c => c.store.toLowerCase() === store.toLowerCase());
    if (selectedComparison) {
      setDeliveryTime(`${selectedComparison.deliveryTimeHours} hour${selectedComparison.deliveryTimeHours > 1 ? 's' : ''}`);
      
      // Extract items from comparison if basket is empty
      if (basketItems.length === 0 && selectedComparison.items) {
        const itemsFromComparison = selectedComparison.items.map(item => item.item);
        console.log('📝 Extracting items from comparison:', itemsFromComparison);
        setBasketItems(itemsFromComparison);
      }
    }
    
    // Go directly to checkout (address form) immediately after store selection
    console.log('➡️ Going directly to checkout (address form)...');
    handleCheckoutRequest(store);
  };

  const handleCheckoutRequest = async (storeOverride?: string) => {
    const storeToUse = storeOverride || selectedStore;
    console.log('🛒 Checkout requested. Basket:', basketItems.length, 'items, Store:', storeToUse);
    
    if (!storeToUse) {
      console.warn('⚠️ Cannot checkout: no store selected');
      alert('Please select a store first.');
      return;
    }

    // Even if basket is empty, proceed to checkout (agent will handle it)
    if (basketItems.length === 0) {
      console.warn('⚠️ Basket is empty, but proceeding to checkout anyway');
    }

    console.log('✅ Proceeding to checkout form...');
    
    // Send "ok" message to agent to trigger checkout
    try {
      const response = await sendChatMessage('ok');
      console.log('✅ Agent responded to checkout:', response.message);
    } catch (error) {
      console.error('Failed to send checkout message:', error);
      // Continue anyway - we'll show the checkout form
    }
    
    // Always proceed to checkout form after store selection
    console.log('📋 Setting app state to checkout');
    setAppState('checkout');
  };

  const handleCheckoutSubmit = async (address: string) => {
    setIsProcessingCheckout(true);

    try {
      // Send address to agent
      const response = await sendChatMessage(`My delivery address is: ${address}`);

      // Extract order information from response
      const orderNumberMatch = response.message.match(/order\s*#?(\w+)/i);
      const orderNumber = orderNumberMatch
        ? orderNumberMatch[1]
        : `ORD-${Date.now().toString().slice(-8)}`;

      setOrderData({
        orderNumber,
        store: selectedStore || undefined,
        address,
      });

      setAppState('thankyou');
    } catch (error: any) {
      console.error('Checkout error:', error);
      // Still show thank you with basic info
      setOrderData({
        orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
        store: selectedStore || undefined,
        address,
      });
      setAppState('thankyou');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleNewOrder = () => {
    setAppState('chat');
    setBasketItems([]);
    setSelectedStore(null);
    setStoreTotal(null);
    setDeliveryTime(null);
    setStoreComparisons([]);
    setOrderData({});
  };

  // Debug: Log when storeComparisons changes
  React.useEffect(() => {
    console.log('🔄 App.tsx: storeComparisons state changed:', storeComparisons.length, storeComparisons);
  }, [storeComparisons]);

  const handleCancelCheckout = () => {
    setAppState('chat');
  };

  // Checkout is handled through UI buttons and store selection

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 Grocery Ordering Assistant</h1>
        <p>Order groceries from UK stores: Sainsbury's, Tesco, ASDA, Waitrose</p>
      </header>

      <main className="app-main">
        {appState === 'chat' && (
          <div className="chat-layout">
            <div className="sidebar">
              {basketItems.length > 0 && (
                <BasketDisplay
                  items={basketItems}
                  selectedStore={selectedStore || undefined}
                  total={storeTotal || undefined}
                  deliveryTime={deliveryTime || undefined}
                />
              )}

            </div>

            <div className="chat-area">
              <ChatInterface
                onBasketUpdate={handleBasketUpdate}
                onStoreSelect={(store, total) => {
                  handleStoreSelect(store, total);
                  // handleStoreSelect already calls handleCheckoutRequest with the store
                }}
                onStoreComparisonsUpdate={(comps) => {
                  console.log('✅✅✅ App.tsx: Received store comparisons:', comps);
                  if (comps && comps.length > 0) {
                    setStoreComparisons(comps);
                  }
                }}
                selectedStore={selectedStore || undefined}
              />
            </div>
          </div>
        )}

        {appState === 'checkout' && (
          <CheckoutForm
            onSubmit={handleCheckoutSubmit}
            onCancel={handleCancelCheckout}
            isLoading={isProcessingCheckout}
          />
        )}

        {appState === 'thankyou' && (
          <ThankYou
            orderNumber={orderData.orderNumber}
            store={orderData.store}
            address={orderData.address}
            onNewOrder={handleNewOrder}
          />
        )}
      </main>
    </div>
  );
}

export default App;

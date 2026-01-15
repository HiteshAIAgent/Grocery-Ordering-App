import React, { useState, useRef, useEffect } from 'react';
import { Message, StoreComparison } from '../types';
import { sendChatMessage } from '../services/luaApi';
import { StoreComparisonDisplay } from './StoreComparison';
import './ChatInterface.css';

interface ChatInterfaceProps {
  onBasketUpdate?: (items: string[]) => void;
  onStoreSelect?: (store: string, total: number) => void;
  onStoreComparisonsUpdate?: (comparisons: Array<{
    store: string;
    total: number;
    deliveryTimeHours: number;
    items?: Array<{ item: string; price: number; found: boolean }>;
  }>) => void;
  selectedStore?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onBasketUpdate,
  onStoreSelect,
  onStoreComparisonsUpdate,
  selectedStore,
}) => {
  const [currentComparisons, setCurrentComparisons] = useState<StoreComparison[]>([]);
  
  // Debug: Log when currentComparisons changes
  useEffect(() => {
    console.log('🔄 currentComparisons state changed:', currentComparisons.length, currentComparisons);
  }, [currentComparisons]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your grocery ordering assistant. Please tell me what items you'd like to order. You can separate them by commas, spaces, or periods.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentComparisons]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage.content, sessionId || undefined);
      
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      // Debug: Log full response to see structure
      console.log('📦 Full API Response:', JSON.stringify(response, null, 2));
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.data?.steps:', response.data?.steps);
      
      // Check for store comparisons early and clean message
      const hasStoreComparisons = response.data?.steps?.[0]?.toolResults?.[0]?.payload?.result?.comparisons;
      console.log('🔍 Has store comparisons (early check):', hasStoreComparisons);
      
      let cleanedMessage = response.message || 'I understand. Let me help you with that.';
      
      // If we have store comparisons, ALWAYS replace message - tiles show all info
      if (hasStoreComparisons) {
        // Always replace with clean message since store cards show everything
        cleanedMessage = "I've found the best prices for you. Please select a store from the options above 👆";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanedMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      

      // Parse tool results to extract basket/order information
      // Lua AI returns tool results in various nested structures
      const toolData = response.data || response.toolResults;
      
      // Direct extraction from known structure (from user's console logs)
      let directComparisons: any[] = [];
      
      // Try multiple direct paths based on actual API response structure
      // Path 1: steps[0].toolResults[0].payload.result.comparisons
      if (toolData?.steps?.[0]?.toolResults?.[0]?.payload?.result?.comparisons) {
        directComparisons = toolData.steps[0].toolResults[0].payload.result.comparisons;
        console.log('✅ Found comparisons via direct path (steps.toolResults.payload.result):', directComparisons);
      }
      // Path 2: Check all steps for toolResults
      else if (toolData?.steps) {
        for (const step of toolData.steps) {
          if (step.toolResults?.length > 0) {
            for (const tr of step.toolResults) {
              if (tr.payload?.result?.comparisons) {
                directComparisons = tr.payload.result.comparisons;
                console.log('✅ Found comparisons in step:', directComparisons);
                break;
              }
            }
            if (directComparisons.length > 0) break;
          }
        }
      }
      
      if (toolData) {
        // Look for tool results in various possible locations
        let extractedData = toolData;
        
        // Check for steps array with toolResults (primary location in Lua AI response)
        if (toolData.steps && Array.isArray(toolData.steps)) {
          for (const step of toolData.steps) {
            if (step.toolResults && Array.isArray(step.toolResults)) {
              // Extract data from all tool results in this step
              step.toolResults.forEach((toolResult: any) => {
                // Check payload.result (for compare_stores tool)
                if (toolResult.payload?.result) {
                  const result = toolResult.payload.result;
                  // Preserve comparisons array if it exists
                  if (result.comparisons && Array.isArray(result.comparisons)) {
                    if (!directComparisons.length) {
                      directComparisons = result.comparisons;
                    }
                    extractedData.comparisons = result.comparisons;
                  }
                  // Merge other properties, but preserve comparisons
                  extractedData = { ...result, ...extractedData };
                } 
                // Check direct result property
                else if (toolResult.result) {
                  const result = toolResult.result;
                  if (result.comparisons && Array.isArray(result.comparisons)) {
                    if (!directComparisons.length) {
                      directComparisons = result.comparisons;
                    }
                    extractedData.comparisons = result.comparisons;
                  }
                  extractedData = { ...result, ...extractedData };
                }
              });
            }
          }
        }
        
        // Check for direct toolResults array
        if (toolData.toolResults && Array.isArray(toolData.toolResults)) {
          // Extract data from all tool results
          toolData.toolResults.forEach((toolResult: any) => {
            if (toolResult.payload?.result) {
              const result = toolResult.payload.result;
              if (result.comparisons && Array.isArray(result.comparisons)) {
                extractedData.comparisons = result.comparisons;
              }
              extractedData = { ...result, ...extractedData };
            } else if (toolResult.result) {
              const result = toolResult.result;
              if (result.comparisons && Array.isArray(result.comparisons)) {
                extractedData.comparisons = result.comparisons;
              }
              extractedData = { ...result, ...extractedData };
            }
          });
        }
        
        // Check for response.body.messages structure
        if (toolData.response?.body?.messages) {
          for (const message of toolData.response.body.messages) {
            if (message.content && Array.isArray(message.content)) {
              for (const content of message.content) {
                if (content.type === 'tool-result' && content.output?.value) {
                  extractedData = { ...extractedData, ...content.output.value };
                }
              }
            }
          }
        }
        
        // Check for toolCalls
        if (toolData.toolCalls && Array.isArray(toolData.toolCalls)) {
          toolData.toolCalls.forEach((toolCall: any) => {
            if (toolCall.result) {
              extractedData = { ...extractedData, ...toolCall.result };
            }
          });
        }
        
        // Check if data itself contains tool results
        if (toolData.tools && Array.isArray(toolData.tools)) {
          toolData.tools.forEach((tool: any) => {
            if (tool.result) {
              extractedData = { ...extractedData, ...tool.result };
            }
          });
        }
        
        // Extract basket items from tool results
        const basketItems = extractBasketItems(extractedData);
        if (basketItems.length > 0 && onBasketUpdate) {
          onBasketUpdate(basketItems);
        }

        // Extract store selection
        const storeInfo = extractStoreInfo(extractedData);
        if (storeInfo && onStoreSelect) {
          onStoreSelect(storeInfo.store, storeInfo.total);
        }

        // Extract store comparisons with item prices
        // Use directComparisons if found, otherwise extract from extractedData
        let comparisons: any[] = [];
        
        if (directComparisons.length > 0) {
          // Use directly extracted comparisons
          comparisons = directComparisons.map((comp: any) => {
            // Normalize store name
            let storeName = comp.store;
            if (storeName.toLowerCase() === 'sainsbury') {
              storeName = "Sainsbury's";
            }
            const normalized = {
              store: storeName,
              total: comp.total || 0,
              deliveryTimeHours: comp.deliveryTimeHours || 3,
              items: comp.items || [],
            };
            console.log(`Store: ${normalized.store}, Items: ${normalized.items.length}`, normalized.items);
            return normalized;
          });
          console.log('✅ Using direct comparisons (final):', comparisons);
        } else {
          // Fallback to extraction function
          comparisons = extractStoreComparisons(extractedData);
          console.log('Extracted comparisons from tool results:', comparisons);
        }
        
        // Update local state and parent
        if (comparisons.length > 0) {
          console.log('✅✅✅ Updating store comparisons:', comparisons);
          console.log('✅ Setting currentComparisons state with', comparisons.length, 'stores');
          setCurrentComparisons(comparisons);
          if (onStoreComparisonsUpdate) {
            onStoreComparisonsUpdate(comparisons);
          }
          // Replace message with clean one when comparisons are found
          cleanedMessage = "I've found the best prices for you. Please select a store from the options above 👆";
          // Update the last message with cleaned version
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: cleanedMessage };
            }
            return updated;
          });
        } else {
          console.log('⚠️ No comparisons found in tool results. Attempting text parsing...');
          // Fallback: try to parse store comparisons from the message text
          const textComparisons = parseComparisonsFromText(response.message || '', messages);
          if (textComparisons.length > 0) {
            console.log('✅ Parsed comparisons from text (fallback):', textComparisons);
            setCurrentComparisons(textComparisons);
            if (onStoreComparisonsUpdate) {
              onStoreComparisonsUpdate(textComparisons);
            }
            // Replace message with clean one
            cleanedMessage = "I've found the best prices for you. Please select a store from the options above 👆";
            setMessages((prev) => {
              const updated = [...prev];
              if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: cleanedMessage };
              }
              return updated;
            });
          } else {
            console.error('❌ No comparisons found in any format. Full toolData:', toolData);
          }
        }
      } else {
        // If no tool data, try text parsing
        const textComparisons = parseComparisonsFromText(response.message || '', messages);
        if (textComparisons.length > 0) {
          console.log('✅ Parsed comparisons from text (no tool data):', textComparisons);
          setCurrentComparisons(textComparisons);
          if (onStoreComparisonsUpdate) {
            onStoreComparisonsUpdate(textComparisons);
          }
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key configuration and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractBasketItems = (data: any): string[] => {
    if (Array.isArray(data)) {
      return data
        .map((item) => item.items || item.item || [])
        .flat()
        .filter(Boolean);
    }
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => item.item || item).filter(Boolean);
    }
    return [];
  };

  const extractStoreInfo = (data: any): { store: string; total: number } | null => {
    if (data.store && data.total) {
      return { store: data.store, total: data.total };
    }
    return null;
  };

  const extractStoreComparisons = (data: any): Array<{
    store: string;
    total: number;
    deliveryTimeHours: number;
    items?: Array<{ item: string; price: number; found: boolean }>;
  }> => {
    const comparisons: Array<{
      store: string;
      total: number;
      deliveryTimeHours: number;
      items?: Array<{ item: string; price: number; found: boolean }>;
    }> = [];

    if (!data) return comparisons;

    // Deep search function to find comparisons in nested structures
    const searchForComparisons = (obj: any, depth = 0): void => {
      if (depth > 8 || !obj || typeof obj !== 'object') return;

      // Primary: Check if this object has comparisons array (from CompareStoresTool)
      if (obj.comparisons && Array.isArray(obj.comparisons) && obj.comparisons.length > 0) {
        // Check if we already have these comparisons (avoid duplicates)
        const existingStores = new Set(comparisons.map(c => c.store.toLowerCase()));
        
        obj.comparisons.forEach((comp: any) => {
          if (comp.store && !existingStores.has(comp.store.toLowerCase())) {
            // Normalize store name (e.g., "Sainsbury" -> "Sainsbury's")
            let storeName = comp.store;
            if (storeName.toLowerCase() === 'sainsbury') {
              storeName = "Sainsbury's";
            }
            
            comparisons.push({
              store: storeName,
              total: comp.total || 0,
              deliveryTimeHours: comp.deliveryTimeHours || 3,
              items: comp.items || [],
            });
          }
        });
        return; // Found it, stop searching
      }

      // Secondary: Single store with items (from GetStorePricesTool)
      if (obj.store && (obj.items || obj.total !== undefined)) {
        comparisons.push({
          store: obj.store,
          total: obj.total || 0,
          deliveryTimeHours: obj.deliveryTimeHours || obj.deliveryTime || 3,
          items: obj.items || [],
        });
      }

      // Recursively search nested objects and arrays
      if (Array.isArray(obj)) {
        obj.forEach((item) => searchForComparisons(item, depth + 1));
      } else {
        Object.values(obj).forEach((value) => {
          if (value && typeof value === 'object') {
            searchForComparisons(value, depth + 1);
          }
        });
      }
    };

    searchForComparisons(data);

    // Remove duplicates based on store name (case-insensitive)
    const uniqueComparisons = comparisons.filter((comp, index, self) =>
      index === self.findIndex((c) => c.store.toLowerCase() === comp.store.toLowerCase())
    );

    return uniqueComparisons;
  };

  // Fallback: Parse store comparisons from assistant's text message
  const parseComparisonsFromText = (text: string, allMessages: Message[]): Array<{
    store: string;
    total: number;
    deliveryTimeHours: number;
    items?: Array<{ item: string; price: number; found: boolean }>;
  }> => {
    const comparisons: Array<{
      store: string;
      total: number;
      deliveryTimeHours: number;
      items?: Array<{ item: string; price: number; found: boolean }>;
    }> = [];

    // Improved pattern to match store information
    // Handles formats like:
    // - "* **Asda:** £2.95 (delivery in 4 hours)"
    // - "Asda: £3.95 (delivery in 4 hours)"
    // - "**Asda:** £2.95 (delivery in 4 hours) - This is the cheapest option!"
    const storePattern = /(?:^|\n|[•*])\s*\*?\s*\*?\s*(Asda|Tesco|Sainsbury'?s?|Waitrose)[:*]\s*£([\d.]+)[^£]*?(?:delivery[^0-9]*(\d+)[^0-9]*hour|(\d+)[^0-9]*hour[^0-9]*delivery|\(.*?(\d+)\s*hour)/gi;
    
    let match;
    while ((match = storePattern.exec(text)) !== null) {
      const store = match[1];
      const total = parseFloat(match[2]);
      const hours = parseInt(match[3] || match[4] || '3');
      
      if (store && !isNaN(total)) {
        // Normalize store name
        let storeName = store.charAt(0).toUpperCase() + store.slice(1).toLowerCase();
        if (storeName.includes('sainsbury')) {
          storeName = "Sainsbury's";
        } else if (storeName === 'Asda') {
          storeName = 'Asda';
        } else if (storeName === 'Tesco') {
          storeName = 'Tesco';
        } else if (storeName === 'Waitrose') {
          storeName = 'Waitrose';
        }
        
        comparisons.push({
          store: storeName,
          total: total,
          deliveryTimeHours: hours,
        });
      }
    }

    // If we found comparisons but no items, try to extract items from conversation
    if (comparisons.length > 0) {
        // Extract items from previous messages - look for recent user messages
        const userMessages = allMessages.filter(m => m.role === 'user');
        
        // Try to find items mentioned in user messages
        let items: string[] = [];
        for (let i = userMessages.length - 1; i >= 0 && items.length === 0; i--) {
          const msg = userMessages[i].content.toLowerCase();
          
          // Check for patterns like "bread and eggs" or "bread, eggs" or "bread. eggs"
          const itemPatterns = [
            msg.match(/(?:updated?|order|need|want|get|buy|add).*?(?:to|just|:)?\s*((?:\w+\s*(?:and|,|\.|\n)\s*)*\w+)/i),
            msg.match(/((?:bread|milk|eggs|chicken|beef|pork|fish|rice|pasta|cheese|butter|yogurt|fruit|vegetable|apple|banana|orange|tomato|potato|onion|carrot|salmon|cod|tuna)[\w\s]*(?:,|and|\.|\n)[\w\s]*)+/i),
          ];
          
          for (const pattern of itemPatterns) {
            if (pattern && pattern[1]) {
              items = pattern[1]
                .split(/[,.\nand]+/)
                .map(i => i.trim())
                .filter(i => i && i.length > 2)
                .filter(i => !i.match(/^(i|need|want|get|buy|order|add|remove|items?|please|thanks|to|just|updated)/))
                .map(i => i.charAt(0).toUpperCase() + i.slice(1));
              break;
            }
          }
          
          // If no pattern match, try simple split
          if (items.length === 0) {
            const simpleItems = msg
              .replace(/^(i|need|want|get|buy|order|add|remove|items?|please|thanks|to|just|updated?)\s+/i, '')
              .split(/[,.\nand]+/)
              .map(i => i.trim())
              .filter(i => i && i.length > 2 && i.length < 30)
              .filter(i => !i.match(/^(you|we|they|this|that|the|a|an)$/i));
            
            if (simpleItems.length >= 2) {
              items = simpleItems.map(i => i.charAt(0).toUpperCase() + i.slice(1));
            }
          }
        }
        
        // If still no items found, use generic item names
        if (items.length === 0 && comparisons.length > 0) {
          // Estimate 2-3 items based on total price
          const estimatedItemCount = Math.max(2, Math.min(4, Math.round(comparisons[0].total / 2)));
          items = Array.from({ length: estimatedItemCount }, (_, i) => `Item ${i + 1}`);
        }
        
        if (items.length > 0) {
          // Assign item prices proportionally (simplified - divide total equally)
          comparisons.forEach(comp => {
            const pricePerItem = comp.total / items.length;
            comp.items = items.map(item => ({
              item: item,
              price: pricePerItem,
              found: true,
            }));
          });
        }
    }

    return comparisons;
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <div className={`message ${message.role}`}>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {/* Show store comparisons after all messages (only once) */}
        {currentComparisons.length > 0 && (
          <div className="message assistant store-comparison-message" key="store-comparison-standalone">
            <div className="message-content">
              <StoreComparisonDisplay
                comparisons={currentComparisons}
                onSelectStore={async (store, total) => {
                  console.log('🏪 Store selected in ChatInterface:', store, total);
                  if (onStoreSelect) {
                    // Keep tiles visible - they'll disappear naturally when appState changes to checkout
                    // Call parent handler which will trigger checkout
                    console.log('📞 Calling onStoreSelect with:', store, total);
                    onStoreSelect(store, total);
                  }
                }}
                selectedStore={selectedStore || undefined}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message... (e.g., 'I need bread, milk, eggs')"
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GroceryItem {
  item: string;
  price: number;
  found: boolean;
}

export interface StorePrice {
  store: string;
  items: GroceryItem[];
  total: number;
  deliveryTimeHours: number;
  deliveryTimeFormatted: string;
  notFoundItems?: string[];
}

export interface StoreComparison {
  store: string;
  total: number;
  deliveryTimeHours: number;
  items?: GroceryItem[]; // Individual item prices for this store
}

export interface BasketItem {
  item: string;
  quantity: number;
}

export interface CheckoutData {
  store: string;
  items: string[];
  total: number;
  address?: string;
}

export interface ChatResponse {
  message: string;
  data?: any;
  toolCalls?: Array<{
    name: string;
    result: any;
  }>;
}

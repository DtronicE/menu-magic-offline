export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  estimatedTime: number; // in minutes
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  customerName: string;
  tableNumber?: string;
  orderTime: Date;
  estimatedReadyTime: Date;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  price: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface KitchenUpdate {
  orderId: string;
  status: OrderStatus;
  estimatedTime?: number;
  message?: string;
  timestamp: Date;
}

export interface QRData {
  type: 'menu-item' | 'order' | 'table';
  id: string;
  data?: any;
}
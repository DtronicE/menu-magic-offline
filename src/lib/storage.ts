import { MenuItem, Order, OrderStatus } from '@/types/menu';

const STORAGE_KEYS = {
  MENU: 'menu-magic-menu',
  ORDERS: 'menu-magic-orders',
  SETTINGS: 'menu-magic-settings'
};

// Sample menu data
const defaultMenu: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
    price: 12.99,
    category: 'Burgers',
    available: true,
    estimatedTime: 15,
    allergens: ['gluten', 'dairy'],
    nutritionalInfo: { calories: 650, protein: 30, carbs: 45, fat: 35 }
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on our homemade dough',
    price: 14.99,
    category: 'Pizza',
    available: true,
    estimatedTime: 20,
    allergens: ['gluten', 'dairy'],
    nutritionalInfo: { calories: 580, protein: 25, carbs: 60, fat: 22 }
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing',
    price: 9.99,
    category: 'Salads',
    available: true,
    estimatedTime: 8,
    allergens: ['dairy', 'eggs'],
    nutritionalInfo: { calories: 320, protein: 12, carbs: 15, fat: 25 }
  },
  {
    id: '4',
    name: 'Fish & Chips',
    description: 'Beer-battered cod with crispy fries and mushy peas',
    price: 16.99,
    category: 'Seafood',
    available: false,
    estimatedTime: 18,
    allergens: ['fish', 'gluten'],
    nutritionalInfo: { calories: 780, protein: 35, carbs: 65, fat: 42 }
  },
  {
    id: '5',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in a creamy tomato-based curry sauce with basmati rice',
    price: 15.99,
    category: 'Indian',
    available: true,
    estimatedTime: 22,
    allergens: ['dairy'],
    nutritionalInfo: { calories: 520, protein: 35, carbs: 45, fat: 18 }
  },
  {
    id: '6',
    name: 'Chocolate Brownie',
    description: 'Warm chocolate brownie with vanilla ice cream and chocolate sauce',
    price: 7.99,
    category: 'Desserts',
    available: true,
    estimatedTime: 5,
    allergens: ['gluten', 'dairy', 'eggs'],
    nutritionalInfo: { calories: 450, protein: 6, carbs: 55, fat: 24 }
  }
];

export class MenuStorage {
  static getMenu(): MenuItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MENU);
      return stored ? JSON.parse(stored) : defaultMenu;
    } catch {
      return defaultMenu;
    }
  }

  static setMenu(menu: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }

  static updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const menu = this.getMenu();
    const index = menu.findIndex(item => item.id === id);
    if (index !== -1) {
      menu[index] = { ...menu[index], ...updates };
      this.setMenu(menu);
    }
  }

  static getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = stored ? JSON.parse(stored) : [];
      return orders.map((order: any) => ({
        ...order,
        orderTime: new Date(order.orderTime),
        estimatedReadyTime: new Date(order.estimatedReadyTime)
      }));
    } catch {
      return [];
    }
  }

  static setOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    this.setOrders(orders);
  }

  static updateOrderStatus(orderId: string, status: OrderStatus, estimatedTime?: number): void {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      if (estimatedTime) {
        orders[index].estimatedReadyTime = new Date(Date.now() + estimatedTime * 60000);
      }
      this.setOrders(orders);
    }
  }

  static getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : { restaurantName: 'Menu Magic Restaurant' };
    } catch {
      return { restaurantName: 'Menu Magic Restaurant' };
    }
  }

  static setSettings(settings: any): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Initialize with sample data if empty
  static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      this.setMenu(defaultMenu);
    }
  }
}

// Initialize storage on import
MenuStorage.initialize();
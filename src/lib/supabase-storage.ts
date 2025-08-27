import { supabase } from '@/integrations/supabase/client';
import { MenuItem, Order, OrderStatus, OrderItem } from '@/types/menu';

export class SupabaseStorage {
  // Menu Items
  static async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      estimatedTime: item.estimated_time,
      allergens: item.allergens || [],
      nutritionalInfo: {
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0
      }
    }));
  }

  static async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    const updateData: any = {};
    
    if (updates.available !== undefined) updateData.available = updates.available;
    if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.allergens !== undefined) updateData.allergens = updates.allergens;
    if (updates.nutritionalInfo) {
      updateData.calories = updates.nutritionalInfo.calories;
      updateData.protein = updates.nutritionalInfo.protein;
      updateData.carbs = updates.nutritionalInfo.carbs;
      updateData.fat = updates.nutritionalInfo.fat;
    }

    const { error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        )
      `)
      .order('order_time', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    return ordersData.map(orderData => ({
      id: orderData.id,
      customerName: orderData.customer_name,
      tableNumber: orderData.table_number,
      status: orderData.status as OrderStatus,
      orderTime: new Date(orderData.order_time),
      estimatedReadyTime: new Date(orderData.estimated_ready_time),
      totalAmount: typeof orderData.total_amount === 'string' ? parseFloat(orderData.total_amount) : orderData.total_amount,
      paymentStatus: orderData.payment_status as 'pending' | 'paid' | 'failed',
      specialInstructions: orderData.special_instructions,
      items: orderData.order_items.map((item: any) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        specialInstructions: item.special_instructions,
        menuItem: {
          id: item.menu_items.id,
          name: item.menu_items.name,
          description: item.menu_items.description || '',
          price: typeof item.menu_items.price === 'string' ? parseFloat(item.menu_items.price) : item.menu_items.price,
          category: item.menu_items.category,
          image: item.menu_items.image,
          available: item.menu_items.available,
          estimatedTime: item.menu_items.estimated_time,
          allergens: item.menu_items.allergens || [],
          nutritionalInfo: {
            calories: item.menu_items.calories || 0,
            protein: item.menu_items.protein || 0,
            carbs: item.menu_items.carbs || 0,
            fat: item.menu_items.fat || 0
          }
        }
      }))
    }));
  }

  static async addOrder(order: Order): Promise<void> {
    // First create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: order.id,
        customer_name: order.customerName,
        table_number: order.tableNumber,
        status: order.status,
        order_time: order.orderTime.toISOString(),
        estimated_ready_time: order.estimatedReadyTime.toISOString(),
        total_amount: order.totalAmount,
        payment_status: order.paymentStatus,
        special_instructions: order.specialInstructions
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Then create the order items
    const orderItems = order.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
      special_instructions: item.specialInstructions
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, estimatedTime?: number): Promise<void> {
    const updateData: any = { status };
    
    if (estimatedTime) {
      updateData.estimated_ready_time = new Date(Date.now() + estimatedTime * 60000).toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToMenuItems(callback: (menuItems: MenuItem[]) => void) {
    const channel = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        async () => {
          const menuItems = await this.getMenuItems();
          callback(menuItems);
        }
      )
      .subscribe();

    return channel;
  }

  static subscribeToOrders(callback: (orders: Order[]) => void) {
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async () => {
          const orders = await this.getOrders();
          callback(orders);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        async () => {
          const orders = await this.getOrders();
          callback(orders);
        }
      )
      .subscribe();

    return channel;
  }

  static unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
}
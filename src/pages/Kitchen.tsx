import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Timer, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderCard } from '@/components/OrderCard';
import { Order, OrderStatus, MenuItem } from '@/types/menu';
import { SupabaseStorage } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [ordersData, menuData] = await Promise.all([
        SupabaseStorage.getOrders(),
        SupabaseStorage.getMenuItems()
      ]);
      
      const activeOrders = ordersData.filter(order => 
        ['confirmed', 'preparing'].includes(order.status)
      ).sort((a, b) => a.orderTime.getTime() - b.orderTime.getTime());
      
      setOrders(activeOrders);
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscriptions
    const ordersChannel = SupabaseStorage.subscribeToOrders((newOrders) => {
      const activeOrders = newOrders.filter(order => 
        ['confirmed', 'preparing'].includes(order.status)
      ).sort((a, b) => a.orderTime.getTime() - b.orderTime.getTime());
      setOrders(activeOrders);
    });

    const menuChannel = SupabaseStorage.subscribeToMenuItems(setMenuItems);

    return () => {
      SupabaseStorage.unsubscribe(ordersChannel);
      SupabaseStorage.unsubscribe(menuChannel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, estimatedTime?: number) => {
    try {
      await SupabaseStorage.updateOrderStatus(orderId, newStatus, estimatedTime);
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        toast({
          title: "Order updated",
          description: `Order #${order.id.slice(-6).toUpperCase()} marked as ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const updateMenuItemAvailability = async (itemId: string, available: boolean) => {
    try {
      await SupabaseStorage.updateMenuItem(itemId, { available });
      
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        toast({
          title: "Menu updated",
          description: `${item.name} is now ${available ? 'available' : 'unavailable'}`,
        });
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error", 
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  const updateMenuItemTime = async (itemId: string, newTime: number) => {
    try {
      await SupabaseStorage.updateMenuItem(itemId, { estimatedTime: newTime });
      
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        toast({
          title: "Timing updated",
          description: `${item.name} prep time updated to ${newTime} minutes`,
        });
      }
    } catch (error) {
      console.error('Error updating menu item time:', error);
      toast({
        title: "Error",
        description: "Failed to update estimated time", 
        variant: "destructive",
      });
    }
  };

  const getOrdersByStatus = () => {
    const confirmed = orders.filter(order => order.status === 'confirmed');
    const preparing = orders.filter(order => order.status === 'preparing');
    return { confirmed, preparing };
  };

  const ordersByStatus = getOrdersByStatus();
  const totalActiveOrders = orders.length;
  const avgWaitTime = orders.length > 0 
    ? Math.round(orders.reduce((sum, order) => {
        const waitMs = new Date(order.estimatedReadyTime).getTime() - Date.now();
        return sum + Math.max(0, Math.ceil(waitMs / (1000 * 60)));
      }, 0) / orders.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-restaurant-warm">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              Kitchen Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage orders and menu availability
            </p>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalActiveOrders}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Active Orders
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{ordersByStatus.confirmed.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Confirmed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-status-preparing">{ordersByStatus.preparing.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Timer className="h-3 w-3" />
                Preparing
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-restaurant-orange">{avgWaitTime}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Wait (min)
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
              
              {/* Confirmed Orders */}
              {ordersByStatus.confirmed.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-blue-600">New Orders</h3>
                  <div className="space-y-3">
                    {ordersByStatus.confirmed.map(order => (
                      <Card key={order.id} className="border-blue-200">
                        <CardContent className="p-4">
                          <OrderCard order={order} showCustomerInfo={true} />
                          <div className="flex gap-2 mt-4">
                            <Button 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="flex-1"
                            >
                              <Timer className="h-4 w-4 mr-2" />
                              Start Preparing
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparing Orders */}
              {ordersByStatus.preparing.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-status-preparing">In Progress</h3>
                  <div className="space-y-3">
                    {ordersByStatus.preparing.map(order => (
                      <Card key={order.id} className="border-yellow-200">
                        <CardContent className="p-4">
                          <OrderCard order={order} showCustomerInfo={true} />
                          <div className="flex gap-2 mt-4">
                            <Button 
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="flex-1"
                              variant="default"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Ready
                            </Button>
                            <Select 
                              onValueChange={(value) => updateOrderStatus(order.id, 'preparing', parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Update ETA" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">+5 min</SelectItem>
                                <SelectItem value="10">+10 min</SelectItem>
                                <SelectItem value="15">+15 min</SelectItem>
                                <SelectItem value="20">+20 min</SelectItem>
                                <SelectItem value="30">+30 min</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No active orders</p>
                  <p>New orders will appear here automatically</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Management */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Menu Management</h2>
            <div className="space-y-3">
              {menuItems.map(item => (
                <Card key={item.id} className={item.available ? '' : 'opacity-75'}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />
                      <Input
                        type="number"
                        value={item.estimatedTime}
                        onChange={(e) => updateMenuItemTime(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-sm"
                        min="1"
                        max="60"
                      />
                      <span className="text-sm">min</span>
                    </div>

                    <Button
                      onClick={() => updateMenuItemAvailability(item.id, !item.available)}
                      variant={item.available ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                    >
                      {item.available ? (
                        <>
                          <AlertCircle className="h-3 w-3 mr-2" />
                          Mark Unavailable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-2" />
                          Mark Available
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
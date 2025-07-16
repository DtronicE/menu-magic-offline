import { useState, useEffect } from 'react';
import { Search, QrCode, Filter, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { QRScanner } from '@/components/QRScanner';
import { Order, OrderStatus } from '@/types/menu';
import { MenuStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const loadOrders = () => {
    const allOrders = MenuStorage.getOrders();
    // Sort by order time, newest first
    const sortedOrders = allOrders.sort((a, b) => 
      new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
    );
    setOrders(sortedOrders);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'order') {
        const order = orders.find(order => order.id === qrData.id);
        if (order) {
          // Scroll to the order or highlight it
          const orderElement = document.getElementById(`order-${order.id}`);
          if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            orderElement.classList.add('animate-pulse-orange');
            setTimeout(() => {
              orderElement.classList.remove('animate-pulse-orange');
            }, 2000);
          }
          
          toast({
            title: "Order found!",
            description: `Order #${order.id.slice(-6).toUpperCase()} for ${order.customerName}`,
          });
        } else {
          toast({
            title: "Order not found",
            description: "The scanned QR code doesn't match any order.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid QR code",
          description: "This QR code is not for an order.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Invalid QR code",
        description: "Could not read the QR code data.",
        variant: "destructive",
      });
    }
  };

  const getOrdersByStatus = () => {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'completed'];
    const grouped: Record<OrderStatus, Order[]> = {
      pending: [],
      confirmed: [],
      preparing: [],
      ready: [],
      completed: [],
      cancelled: []
    };

    filteredOrders.forEach(order => {
      grouped[order.status].push(order);
    });

    return grouped;
  };

  const ordersByStatus = getOrdersByStatus();
  const activeOrders = filteredOrders.filter(order => 
    ['confirmed', 'preparing', 'ready'].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-restaurant-warm">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Order Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your order status and estimated delivery time
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowScanner(true)} variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan Order QR
          </Button>

          <Button onClick={loadOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Orders Summary */}
        {activeOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ordersByStatus.confirmed.length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </div>
            <div className="bg-status-preparing/10 border border-status-preparing/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-status-preparing">
                {ordersByStatus.preparing.length}
              </div>
              <div className="text-sm text-muted-foreground">Preparing</div>
            </div>
            <div className="bg-status-ready/10 border border-status-ready/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-status-ready">
                {ordersByStatus.ready.length}
              </div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {/* Ready Orders */}
          {ordersByStatus.ready.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-status-ready">Ready for Pickup</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersByStatus.ready.map(order => (
                  <div key={order.id} id={`order-${order.id}`}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparing Orders */}
          {ordersByStatus.preparing.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-status-preparing">Being Prepared</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersByStatus.preparing.map(order => (
                  <div key={order.id} id={`order-${order.id}`}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Orders */}
          {ordersByStatus.confirmed.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">Confirmed Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersByStatus.confirmed.map(order => (
                  <div key={order.id} id={`order-${order.id}`}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Orders */}
          {ordersByStatus.completed.length > 0 && statusFilter === 'all' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Recent Completed Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersByStatus.completed.slice(0, 6).map(order => (
                  <div key={order.id} id={`order-${order.id}`}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusFilter === 'completed' && ordersByStatus.completed.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Completed Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersByStatus.completed.map(order => (
                  <div key={order.id} id={`order-${order.id}`}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No orders found matching your criteria.
            </p>
          </div>
        )}

        {/* QR Scanner */}
        <QRScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleQRScan}
        />
      </div>
    </div>
  );
}
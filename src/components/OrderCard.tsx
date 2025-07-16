import { Order, OrderStatus } from '@/types/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Hash, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  className?: string;
  showCustomerInfo?: boolean;
}

export function OrderCard({ order, className, showCustomerInfo = true }: OrderCardProps) {
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      pending: {
        color: 'bg-gray-500 text-white',
        icon: Timer,
        label: 'Pending'
      },
      confirmed: {
        color: 'bg-blue-500 text-white',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      preparing: {
        color: 'bg-status-preparing text-black',
        icon: Timer,
        label: 'Preparing'
      },
      ready: {
        color: 'bg-status-ready text-white',
        icon: CheckCircle,
        label: 'Ready'
      },
      completed: {
        color: 'bg-gray-600 text-white',
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-status-delayed text-white',
        icon: AlertCircle,
        label: 'Cancelled'
      }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isUrgent = new Date(order.estimatedReadyTime) < new Date();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilReady = () => {
    const now = new Date();
    const ready = new Date(order.estimatedReadyTime);
    const diffMs = ready.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Ready now!';
    if (diffMins === 1) return '1 minute';
    return `${diffMins} minutes`;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-card animate-fade-in",
      isUrgent && order.status === 'preparing' && "border-status-delayed animate-pulse-orange",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {order.id.slice(-6).toUpperCase()}
            </CardTitle>
            {showCustomerInfo && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customerName}
                </div>
                {order.tableNumber && (
                  <span>Table {order.tableNumber}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <span className="text-lg font-bold text-primary">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                {item.specialInstructions && (
                  <div className="text-muted-foreground text-xs mt-1">
                    Note: {item.specialInstructions}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Special Instructions:</div>
            <div className="text-sm text-muted-foreground">
              {order.specialInstructions}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Ordered: {formatTime(order.orderTime)}</span>
          </div>
          
          <div className="text-sm font-medium">
            {order.status === 'ready' ? (
              <span className="text-status-ready">Ready for pickup!</span>
            ) : order.status === 'completed' ? (
              <span className="text-muted-foreground">Completed</span>
            ) : (
              <span className={isUrgent ? 'text-status-delayed' : 'text-muted-foreground'}>
                ETA: {getTimeUntilReady()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { Search, QrCode, ShoppingCart, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuCard } from '@/components/MenuCard';
import { QRScanner } from '@/components/QRScanner';
import { MenuItem, OrderItem } from '@/types/menu';
import { MenuStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const menu = MenuStorage.getMenu();
    setMenuItems(menu);
    setFilteredItems(menu);
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const filterItems = () => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const addToCart = (item: MenuItem) => {
    setCart(current => {
      const existingItem = current.find(cartItem => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        return current.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...current, {
          menuItemId: item.id,
          menuItem: item,
          quantity: 1,
          price: item.price
        }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    });
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'menu-item') {
        const item = menuItems.find(item => item.id === qrData.id);
        if (item) {
          addToCart(item);
          toast({
            title: "Item scanned!",
            description: `${item.name} added to your cart via QR code.`,
          });
        } else {
          toast({
            title: "Item not found",
            description: "The scanned QR code doesn't match any menu item.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid QR code",
          description: "This QR code is not for a menu item.",
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

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const availableItems = filteredItems.filter(item => item.available);
  const unavailableItems = filteredItems.filter(item => !item.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-restaurant-warm">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Menu Magic
          </h1>
          <p className="text-muted-foreground">
            Discover delicious dishes and track your order in real-time
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowScanner(true)} variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR
          </Button>

          <Button variant="default" className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Available Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToOrder={addToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Unavailable Items */}
        {unavailableItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Currently Unavailable</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unavailableItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  showAddButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No items found matching your search criteria.
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
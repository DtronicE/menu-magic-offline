import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuIcon, ClipboardList, ChefHat, QrCode } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-restaurant-warm">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            Menu Magic
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The complete offline restaurant management system. Scan QR codes, track orders, and manage your menu in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-warm transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MenuIcon className="h-6 w-6 text-primary" />
                Browse Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore our delicious menu items with real-time availability and wait times.
              </p>
              <Button asChild className="w-full">
                <Link to="/menu">View Menu</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-warm transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-primary" />
                Track Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Monitor your order status and estimated delivery time in real-time.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/orders">Track Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-warm transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ChefHat className="h-6 w-6 text-primary" />
                Kitchen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Kitchen dashboard for managing orders and menu availability.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/kitchen">Kitchen Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <QrCode className="h-5 w-5" />
            <span>Supports QR code scanning for quick access</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Works completely offline with local storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

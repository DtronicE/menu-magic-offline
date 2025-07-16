import { MenuItem } from '@/types/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder?: (item: MenuItem) => void;
  showAddButton?: boolean;
  className?: string;
}

export function MenuCard({ item, onAddToOrder, showAddButton = true, className }: MenuCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Burgers': 'bg-restaurant-orange text-white',
      'Pizza': 'bg-restaurant-red text-white',
      'Salads': 'bg-restaurant-green text-white',
      'Seafood': 'bg-blue-500 text-white',
      'Indian': 'bg-restaurant-yellow text-black',
      'Desserts': 'bg-purple-500 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-secondary';
  };

  const getEstimatedTimeColor = (time: number) => {
    if (time <= 10) return 'text-restaurant-green';
    if (time <= 20) return 'text-restaurant-yellow';
    return 'text-restaurant-red';
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-warm animate-fade-in",
      !item.available && "opacity-75 bg-muted",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg font-bold text-primary">${item.price}</span>
            <Badge variant="secondary" className={getCategoryColor(item.category)}>
              {item.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span className={getEstimatedTimeColor(item.estimatedTime)}>
              {item.estimatedTime} min
            </span>
          </div>
          
          {!item.available && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Unavailable</span>
            </div>
          )}
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.allergens.map((allergen) => (
              <Badge key={allergen} variant="outline" className="text-xs">
                {allergen}
              </Badge>
            ))}
          </div>
        )}

        {item.nutritionalInfo && (
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="text-center">
              <div className="font-medium">{item.nutritionalInfo.calories}</div>
              <div>cal</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{item.nutritionalInfo.protein}g</div>
              <div>protein</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{item.nutritionalInfo.carbs}g</div>
              <div>carbs</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{item.nutritionalInfo.fat}g</div>
              <div>fat</div>
            </div>
          </div>
        )}

        {showAddButton && (
          <Button 
            onClick={() => onAddToOrder?.(item)}
            disabled={!item.available}
            className="w-full mt-4"
            variant={item.available ? "default" : "secondary"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {item.available ? 'Add to Order' : 'Currently Unavailable'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
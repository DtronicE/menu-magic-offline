-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  estimated_time INTEGER NOT NULL DEFAULT 15, -- in minutes
  allergens TEXT[],
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  table_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  order_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_ready_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items (public read access, no auth needed for viewing menu)
CREATE POLICY "Menu items are viewable by everyone" 
ON public.menu_items 
FOR SELECT 
USING (true);

CREATE POLICY "Menu items can be updated by everyone" 
ON public.menu_items 
FOR ALL 
USING (true);

-- Create policies for orders (public access for restaurant operations)
CREATE POLICY "Orders are viewable by everyone" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Orders can be created by everyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders can be updated by everyone" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create policies for order_items (public access)
CREATE POLICY "Order items are viewable by everyone" 
ON public.order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Order items can be created by everyone" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default menu items with proper UUIDs
INSERT INTO public.menu_items (name, description, price, category, available, estimated_time, allergens, calories, protein, carbs, fat) VALUES
('Classic Burger', 'Juicy beef patty with lettuce, tomato, onion, and our special sauce', 12.99, 'Burgers', true, 15, ARRAY['gluten', 'dairy'], 650, 30, 45, 35),
('Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil on our homemade dough', 14.99, 'Pizza', true, 20, ARRAY['gluten', 'dairy'], 580, 25, 60, 22),
('Caesar Salad', 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing', 9.99, 'Salads', true, 8, ARRAY['dairy', 'eggs'], 320, 12, 15, 25),
('Fish & Chips', 'Beer-battered cod with crispy fries and mushy peas', 16.99, 'Seafood', false, 18, ARRAY['fish', 'gluten'], 780, 35, 65, 42),
('Chicken Tikka Masala', 'Tender chicken in a creamy tomato-based curry sauce with basmati rice', 15.99, 'Indian', true, 22, ARRAY['dairy'], 520, 35, 45, 18),
('Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream and chocolate sauce', 7.99, 'Desserts', true, 5, ARRAY['gluten', 'dairy', 'eggs'], 450, 6, 55, 24);

-- Enable realtime for all tables
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'waiter' CHECK (role IN ('admin', 'cashier', 'waiter')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'waiter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create menu categories table
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for menu categories
CREATE POLICY "Anyone can view active categories" 
ON public.menu_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.menu_categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for menu categories timestamps
CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu items
CREATE POLICY "Anyone can view available items" 
ON public.menu_items 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Admins can manage items" 
ON public.menu_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for menu items timestamps
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample menu categories
INSERT INTO public.menu_categories (name, description, sort_order) VALUES
('Appetizers', 'Start your meal with these delicious appetizers', 1),
('Main Course', 'Our signature main dishes', 2),
('Beverages', 'Refreshing drinks and beverages', 3),
('Desserts', 'Sweet endings to your meal', 4);

-- Insert some sample menu items
INSERT INTO public.menu_items (category_id, name, description, base_price, is_vegetarian, preparation_time) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Appetizers' LIMIT 1), 'Veg Momos', 'Steamed dumplings filled with fresh vegetables', 120.00, true, 15),
((SELECT id FROM public.menu_categories WHERE name = 'Appetizers' LIMIT 1), 'Chicken Wings', 'Spicy grilled chicken wings', 180.00, false, 20),
((SELECT id FROM public.menu_categories WHERE name = 'Main Course' LIMIT 1), 'Veg Pizza', 'Classic vegetarian pizza with fresh toppings', 250.00, true, 25),
((SELECT id FROM public.menu_categories WHERE name = 'Main Course' LIMIT 1), 'Chicken Burger', 'Juicy chicken burger with fries', 220.00, false, 20),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages' LIMIT 1), 'Fresh Lime Soda', 'Refreshing lime soda', 60.00, true, 5),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages' LIMIT 1), 'Masala Chai', 'Traditional Indian spiced tea', 40.00, true, 5),
((SELECT id FROM public.menu_categories WHERE name = 'Desserts' LIMIT 1), 'Gulab Jamun', 'Traditional Indian sweet', 80.00, true, 5);
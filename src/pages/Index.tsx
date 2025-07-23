import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, ShoppingCart, Coffee, Utensils, Salad, Cookie } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

// Mock data for demonstration
const mockMenuCategories = [
  { id: '1', name: 'Appetizers', description: 'Start your meal', icon: Salad },
  { id: '2', name: 'Main Course', description: 'Our signature dishes', icon: Utensils },
  { id: '3', name: 'Beverages', description: 'Refreshing drinks', icon: Coffee },
  { id: '4', name: 'Desserts', description: 'Sweet endings', icon: Cookie },
];

const mockMenuItems = [
  { id: '1', name: 'Veg Momos', price: 120, category: 'Appetizers', isVeg: true, available: true },
  { id: '2', name: 'Chicken Wings', price: 180, category: 'Appetizers', isVeg: false, available: true },
  { id: '3', name: 'Veg Pizza', price: 250, category: 'Main Course', isVeg: true, available: true },
  { id: '4', name: 'Chicken Burger', price: 220, category: 'Main Course', isVeg: false, available: false },
  { id: '5', name: 'Fresh Lime Soda', price: 60, category: 'Beverages', isVeg: true, available: true },
  { id: '6', name: 'Masala Chai', price: 40, category: 'Beverages', isVeg: true, available: true },
  { id: '7', name: 'Gulab Jamun', price: 80, category: 'Desserts', isVeg: true, available: true },
];

const Index = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = mockMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!</h2>
            <p className="text-muted-foreground">
              {profile?.role === 'admin' && 'Manage your restaurant operations'}
              {profile?.role === 'cashier' && 'Process orders and handle payments'}
              {profile?.role === 'waiter' && 'Take orders and serve customers'}
            </p>
          </div>
          
          {cartItemCount > 0 && (
            <Button className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({cartItemCount})
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>
            </Button>
          )}
        </div>

        <Tabs defaultValue="pos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pos">POS / Orders</TabsTrigger>
            <TabsTrigger value="menu" disabled={profile?.role !== 'admin'}>Menu Management</TabsTrigger>
            <TabsTrigger value="inventory" disabled={profile?.role !== 'admin'}>Inventory</TabsTrigger>
            <TabsTrigger value="reports" disabled={profile?.role !== 'admin'}>Reports</TabsTrigger>
          </TabsList>

          {/* POS / Orders Tab */}
          <TabsContent value="pos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menu Selection */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === 'All' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All
                    </Button>
                    {mockMenuCategories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className={`cursor-pointer transition-colors ${!item.available ? 'opacity-50' : 'hover:bg-accent'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <div className="flex gap-1">
                            {item.isVeg ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">VEG</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">NON-VEG</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-bold text-primary">₹{item.price}</span>
                          <Button 
                            size="sm" 
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Cart / Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Current Order</CardTitle>
                    <CardDescription>Review and place your order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No items in cart</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                              </div>
                              <p className="font-semibold">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>₹{cartTotal}</span>
                          </div>
                        </div>

                        <Button className="w-full" size="lg">
                          Place Order
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Manage your restaurant's menu items and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Menu management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Track ingredients and stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Inventory management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View sales reports and business insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reports and analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;

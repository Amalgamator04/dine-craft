import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertTriangle, Package, TrendingDown } from 'lucide-react';

// Mock inventory data
const mockInventoryItems = [
  { id: '1', name: 'Tomatoes', current_stock: 15, min_stock: 20, max_stock: 100, unit: 'kg', cost_per_unit: 60, supplier: 'Fresh Farms' },
  { id: '2', name: 'Chicken Breast', current_stock: 25, min_stock: 10, max_stock: 50, unit: 'kg', cost_per_unit: 280, supplier: 'Meat Market' },
  { id: '3', name: 'Mozzarella Cheese', current_stock: 8, min_stock: 5, max_stock: 30, unit: 'kg', cost_per_unit: 450, supplier: 'Dairy Co' },
  { id: '4', name: 'Flour', current_stock: 45, min_stock: 20, max_stock: 100, unit: 'kg', cost_per_unit: 35, supplier: 'Grain Mills' },
  { id: '5', name: 'Onions', current_stock: 3, min_stock: 15, max_stock: 80, unit: 'kg', cost_per_unit: 25, supplier: 'Fresh Farms' },
];

const mockSuppliers = [
  { id: '1', name: 'Fresh Farms', contact: '+91 98765 43210', email: 'orders@freshfarms.com' },
  { id: '2', name: 'Meat Market', contact: '+91 98765 43211', email: 'sales@meatmarket.com' },
  { id: '3', name: 'Dairy Co', contact: '+91 98765 43212', email: 'orders@dairyco.com' },
  { id: '4', name: 'Grain Mills', contact: '+91 98765 43213', email: 'supply@grainmills.com' },
];

export const InventoryManagement = () => {
  const [inventoryItems, setInventoryItems] = useState(mockInventoryItems);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  
  const [itemForm, setItemForm] = useState({
    name: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    unit: '',
    cost_per_unit: '',
    supplier: ''
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    email: ''
  });

  const lowStockItems = inventoryItems.filter(item => item.current_stock <= item.min_stock);
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);

  const getStockStatus = (item: any) => {
    if (item.current_stock <= item.min_stock) return { status: 'Low', color: 'destructive' };
    if (item.current_stock >= item.max_stock * 0.8) return { status: 'High', color: 'default' };
    return { status: 'Normal', color: 'secondary' };
  };

  const getStockPercentage = (item: any) => {
    return (item.current_stock / item.max_stock) * 100;
  };

  const addInventoryItem = () => {
    const newItem = {
      id: Date.now().toString(),
      ...itemForm,
      current_stock: parseInt(itemForm.current_stock),
      min_stock: parseInt(itemForm.min_stock),
      max_stock: parseInt(itemForm.max_stock),
      cost_per_unit: parseFloat(itemForm.cost_per_unit)
    };
    setInventoryItems(prev => [...prev, newItem]);
    setItemForm({
      name: '',
      current_stock: '',
      min_stock: '',
      max_stock: '',
      unit: '',
      cost_per_unit: '',
      supplier: ''
    });
  };

  const addSupplier = () => {
    const newSupplier = {
      id: Date.now().toString(),
      ...supplierForm
    };
    setSuppliers(prev => [...prev, newSupplier]);
    setSupplierForm({
      name: '',
      contact: '',
      email: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Inventory Items</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>Add a new item to inventory</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="current-stock">Current Stock</Label>
                      <Input
                        id="current-stock"
                        type="number"
                        value={itemForm.current_stock}
                        onChange={(e) => setItemForm(prev => ({ ...prev, current_stock: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={itemForm.unit}
                        onChange={(e) => setItemForm(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="kg, pcs, ltr"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-stock">Min Stock</Label>
                      <Input
                        id="min-stock"
                        type="number"
                        value={itemForm.min_stock}
                        onChange={(e) => setItemForm(prev => ({ ...prev, min_stock: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-stock">Max Stock</Label>
                      <Input
                        id="max-stock"
                        type="number"
                        value={itemForm.max_stock}
                        onChange={(e) => setItemForm(prev => ({ ...prev, max_stock: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cost-per-unit">Cost per Unit (₹)</Label>
                    <Input
                      id="cost-per-unit"
                      type="number"
                      value={itemForm.cost_per_unit}
                      onChange={(e) => setItemForm(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={itemForm.supplier}
                      onChange={(e) => setItemForm(prev => ({ ...prev, supplier: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addInventoryItem} className="w-full">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {inventoryItems.map(item => {
              const stockStatus = getStockStatus(item);
              const stockPercentage = getStockPercentage(item);
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>
                      </div>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Stock Level</span>
                        <span>{item.current_stock} / {item.max_stock} {item.unit}</span>
                      </div>
                      <Progress value={stockPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">{item.current_stock} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Stock</p>
                        <p className="font-semibold">{item.min_stock} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost/Unit</p>
                        <p className="font-semibold">₹{item.cost_per_unit}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Suppliers</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Supplier</DialogTitle>
                  <DialogDescription>Add a new supplier</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplier-name">Name</Label>
                    <Input
                      id="supplier-name"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-contact">Contact</Label>
                    <Input
                      id="supplier-contact"
                      value={supplierForm.contact}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, contact: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-email">Email</Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addSupplier} className="w-full">
                    Add Supplier
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(supplier => (
              <Card key={supplier.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{supplier.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>📞 {supplier.contact}</p>
                    <p>📧 {supplier.email}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          </div>

          {lowStockItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No low stock alerts! All items are well stocked.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <Card key={item.id} className="border-destructive">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-destructive">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.current_stock} {item.unit} | Min: {item.min_stock} {item.unit}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
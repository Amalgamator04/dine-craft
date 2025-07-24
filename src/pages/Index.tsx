import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { POSInterface } from '@/components/POSInterface';
import { MenuManagement } from '@/components/MenuManagement';
import { InventoryManagement } from '@/components/InventoryManagement';
import { ReportsAnalytics } from '@/components/ReportsAnalytics';

const Index = () => {
  const { profile } = useAuth();

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
            <POSInterface />
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Users, Heart, Eye, Share2, Plus, Edit, Trash2, Settings, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;
type Order = Tables<'orders'> & {
  service: { name: string; type: string };
  user: { email: string };
};

const AdminPanel = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    type: 'followers' as 'followers' | 'likes' | 'views' | 'shares',
    description: '',
    price_per_unit: 0,
    coin_price: 1,
    min_quantity: 100,
    max_quantity: 10000,
    is_active: true
  });

  const serviceTypes = [
    { value: 'followers', label: 'Followers', icon: Users },
    { value: 'likes', label: 'Likes', icon: Heart },
    { value: 'views', label: 'Views', icon: Eye },
    { value: 'shares', label: 'Shares', icon: Share2 }
  ];

  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
    failed: 'bg-red-500'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch recent orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(name, type)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;
      
      // Get user emails separately
      const transformedOrders = [];
      for (const order of ordersData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', order.user_id)
          .single();
        
        transformedOrders.push({
          ...order,
          user: { email: profile?.email || 'Unknown' }
        });
      }
      
      setOrders(transformedOrders);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .insert([newService]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service created successfully"
      });

      setNewService({
        name: '',
        type: 'followers',
        description: '',
        price_per_unit: 0,
        coin_price: 1,
        min_quantity: 100,
        max_quantity: 10000,
        is_active: true
      });

      fetchData();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive"
      });
    }
  };

  const handleUpdateService = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update(service)
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service updated successfully"
      });

      setEditingService(null);
      fetchData();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading admin panel...</div>;
  }

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.total_price, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Badge variant="outline" className="bg-primary/10">
          <Settings className="h-4 w-4 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} MMK</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold">{completedOrders}</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.is_active).length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services Management</TabsTrigger>
          <TabsTrigger value="orders">Orders Management</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {/* Create New Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Service
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    placeholder="e.g., TikTok Followers - Premium"
                  />
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Select value={newService.type} onValueChange={(value: any) => setNewService({...newService, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    placeholder="Service description..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Price per Unit (MMK)</Label>
                    <Input
                      type="number"
                      value={newService.price_per_unit}
                      onChange={(e) => setNewService({...newService, price_per_unit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Coins per Unit</Label>
                    <Input
                      type="number"
                      value={newService.coin_price}
                      onChange={(e) => setNewService({...newService, coin_price: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Min Quantity</Label>
                    <Input
                      type="number"
                      value={newService.min_quantity}
                      onChange={(e) => setNewService({...newService, min_quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label>Max Quantity</Label>
                    <Input
                      type="number"
                      value={newService.max_quantity}
                      onChange={(e) => setNewService({...newService, max_quantity: parseInt(e.target.value) || 10000})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.is_active}
                    onCheckedChange={(checked) => setNewService({...newService, is_active: checked})}
                  />
                  <Label>Active Service</Label>
                </div>
                
                <Button onClick={handleCreateService} className="w-full">
                  Create Service
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const ServiceIcon = serviceTypes.find(t => t.value === service.type)?.icon || Users;
                  
                  return (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <ServiceIcon className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{service.price_per_unit} MMK/unit</span>
                            <span>{service.coin_price} coins/unit</span>
                            <span>{service.min_quantity}-{service.max_quantity} range</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setEditingService(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage customer orders and update their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{order.service?.name || 'Unknown Service'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.user.email} • {order.quantity.toLocaleString()} {order.service?.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium">{order.total_price.toLocaleString()} MMK</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={order.status} 
                        onValueChange={(value: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed') => handleUpdateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Badge className={`${statusColors[order.status]} text-white`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
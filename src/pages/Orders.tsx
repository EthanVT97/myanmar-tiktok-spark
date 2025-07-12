import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Order {
  id: string;
  service_id: string;
  quantity: number;
  target_url: string;
  total_price: number;
  coin_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  start_count?: number;
  remains?: number;
  external_order_id?: string;
  services?: {
    name: string;
    type: string;
  };
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (
            name,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getProgress = (order: Order) => {
    if (order.status === 'completed') return 100;
    if (order.status === 'processing' && order.start_count && order.remains) {
      const delivered = order.quantity - order.remains;
      return (delivered / order.quantity) * 100;
    }
    if (order.status === 'processing') return 25;
    return 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const filterOrdersByStatus = (status?: string) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="border-accent/20 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>{order.services?.name}</span>
          </CardTitle>
          <Badge variant={getStatusColor(order.status)} className="flex items-center space-x-1">
            {getStatusIcon(order.status)}
            <span className="capitalize">{order.status}</span>
          </Badge>
        </div>
        <CardDescription>
          Order ID: {order.id.slice(0, 8)}... • {new Date(order.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Service Type:</span>
            <p className="font-medium capitalize">{order.services?.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <p className="font-medium">{formatPrice(order.quantity)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total Price:</span>
            <p className="font-medium">{formatPrice(order.total_price)} MMK</p>
          </div>
          <div>
            <span className="text-muted-foreground">Coin Cost:</span>
            <p className="font-medium">{order.coin_cost} coins</p>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm">Target URL:</span>
          <p className="font-medium text-sm break-all bg-accent/20 p-2 rounded mt-1">
            {order.target_url}
          </p>
        </div>

        {(order.status === 'processing' || order.status === 'completed') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{getProgress(order).toFixed(0)}%</span>
            </div>
            <Progress value={getProgress(order)} className="h-2" />
            {order.start_count && order.remains !== undefined && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Start: {formatPrice(order.start_count)}</span>
                <span>Delivered: {formatPrice(order.quantity - order.remains)}</span>
                <span>Remains: {formatPrice(order.remains)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-xs">
            Payment: {order.payment_status}
          </Badge>
          {order.external_order_id && (
            <span className="text-xs text-muted-foreground">
              External ID: {order.external_order_id}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              My Orders
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your TikTok boost orders
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="border-accent/20 bg-card/50 backdrop-blur-sm text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto text-primary/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start boosting your TikTok content!
              </p>
              <Button>Browse Services</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filterOrdersByStatus('pending').length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({filterOrdersByStatus('processing').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({filterOrdersByStatus('completed').length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({filterOrdersByStatus('cancelled').length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({filterOrdersByStatus('failed').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6">
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="grid gap-6">
                {filterOrdersByStatus('pending').map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>

            <TabsContent value="processing" className="mt-6">
              <div className="grid gap-6">
                {filterOrdersByStatus('processing').map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="grid gap-6">
                {filterOrdersByStatus('completed').map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <div className="grid gap-6">
                {filterOrdersByStatus('cancelled').map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              <div className="grid gap-6">
                {filterOrdersByStatus('failed').map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Orders;
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Eye, 
  Share2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Coins,
  Plus
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

interface Order {
  id: string;
  service: {
    name: string;
    type: string;
  };
  target_url: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  remains: number | null;
  start_count: number | null;
}

interface Stats {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
  completed_orders: number;
}

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0,
    completed_orders: 0
  });
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchStats();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(name, type)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_price, status')
        .eq('user_id', user?.id);

      if (error) throw error;

      const calculatedStats = data?.reduce((acc, order) => ({
        total_orders: acc.total_orders + 1,
        total_spent: acc.total_spent + order.total_price,
        pending_orders: acc.pending_orders + (order.status === 'pending' ? 1 : 0),
        completed_orders: acc.completed_orders + (order.status === 'completed' ? 1 : 0),
      }), {
        total_orders: 0,
        total_spent: 0,
        pending_orders: 0,
        completed_orders: 0
      }) || {
        total_orders: 0,
        total_spent: 0,
        pending_orders: 0,
        completed_orders: 0
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const calculateProgress = (order: Order) => {
    if (!order.start_count || !order.remains) return 100;
    const delivered = order.quantity - order.remains;
    return (delivered / order.quantity) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{profile?.full_name || 'User'}</span>
          </h1>
          <p className="text-muted-foreground">Here's your TikTok growth overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total_orders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.total_spent)} MMK</p>
                </div>
                <Coins className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pending_orders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coin Balance</p>
                  <p className="text-2xl font-bold">{profile?.coin_balance || 0}</p>
                </div>
                <Coins className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/services">
              <Button variant="default" className="w-full h-16 flex flex-col gap-2">
                <Plus className="h-5 w-5" />
                New Order
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                View All Orders
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                <Coins className="h-5 w-5" />
                Payment History
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                Profile Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest TikTok boost orders</CardDescription>
              </div>
              <Link to="/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Link to="/services">
                  <Button variant="default">Place Your First Order</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{order.service.name}</h4>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(order.total_price)} MMK
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Target: {order.target_url}
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Quantity: {formatPrice(order.quantity)}</span>
                      {order.status === 'processing' && order.remains && (
                        <span className="text-sm">Remaining: {formatPrice(order.remains)}</span>
                      )}
                    </div>
                    
                    {order.status === 'processing' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round(calculateProgress(order))}%</span>
                        </div>
                        <Progress value={calculateProgress(order)} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Users, Heart, Eye, Share2, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  target_url: string;
  total_price: number;
  coin_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  start_count: number | null;
  remains: number | null;
  external_order_id: string | null;
  created_at: string;
  updated_at: string;
  service: {
    name: string;
    type: 'followers' | 'likes' | 'views' | 'shares';
    description: string;
  };
}

const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const serviceIcons = {
    followers: Users,
    likes: Heart,
    views: Eye,
    shares: Share2
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
    failed: 'bg-red-500'
  };

  const statusIcons = {
    pending: Clock,
    processing: AlertCircle,
    completed: CheckCircle,
    cancelled: XCircle,
    failed: XCircle
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrderDetails();
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services (
            name,
            type,
            description
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);

    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!order) return 0;
    
    switch (order.status) {
      case 'pending': return 10;
      case 'processing': 
        if (order.remains && order.quantity) {
          const delivered = order.quantity - order.remains;
          return 25 + ((delivered / order.quantity) * 65);
        }
        return 25;
      case 'completed': return 100;
      case 'cancelled':
      case 'failed': return 0;
      default: return 0;
    }
  };

  const getStatusMessage = () => {
    if (!order) return '';
    
    switch (order.status) {
      case 'pending': return 'Your order is waiting to be processed';
      case 'processing': 
        if (order.remains && order.quantity) {
          const delivered = order.quantity - order.remains;
          return `Delivered ${delivered.toLocaleString()} of ${order.quantity.toLocaleString()} ${order.service.type}`;
        }
        return 'Your order is being processed';
      case 'completed': return 'Your order has been completed successfully';
      case 'cancelled': return 'Your order has been cancelled';
      case 'failed': return 'Your order has failed. Please contact support';
      default: return '';
    }
  };

  const getTimeRemaining = () => {
    if (!order || order.status === 'completed') return '';
    
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // Estimate completion time based on service type and quantity
    const estimatedHours = order.service.type === 'followers' ? 24 : 
                          order.service.type === 'likes' ? 2 :
                          order.service.type === 'views' ? 6 : 4;
    
    const remainingHours = Math.max(0, estimatedHours - hoursElapsed);
    
    if (remainingHours < 1) return 'Completing soon';
    if (remainingHours < 24) return `~${Math.ceil(remainingHours)} hours remaining`;
    return `~${Math.ceil(remainingHours / 24)} days remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Order not found</div>
        </div>
      </div>
    );
  }

  const Icon = serviceIcons[order.service.type];
  const StatusIcon = statusIcons[order.status];
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/orders')}
              className="mb-4"
            >
              ← Back to Orders
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order Status</h1>
                <p className="text-muted-foreground">Order ID: {order.id}</p>
              </div>
              <Badge variant="outline" className={`${statusColors[order.status]} text-white`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {order.service.name}
                  </CardTitle>
                  <CardDescription>{order.service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Order Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Placed</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {order.status !== 'pending' && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Processing Started</p>
                            <p className="text-xs text-muted-foreground">
                              Processing your {order.service.type}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Order Completed</p>
                            <p className="text-xs text-muted-foreground">
                              All {order.quantity.toLocaleString()} {order.service.type} delivered
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target URL */}
                  <div className="space-y-2">
                    <Label>Target URL</Label>
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded border">
                      <span className="text-sm truncate flex-1">{order.target_url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(order.target_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Service</span>
                      <span className="text-sm font-medium">{order.service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quantity</span>
                      <span className="text-sm font-medium">{order.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Cost</span>
                      <span className="text-sm font-medium">{order.coin_cost} coins</span>
                    </div>
                    
                    {order.start_count && (
                      <div className="flex justify-between">
                        <span className="text-sm">Start Count</span>
                        <span className="text-sm font-medium">{order.start_count.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {order.remains !== null && (
                      <div className="flex justify-between">
                        <span className="text-sm">Remaining</span>
                        <span className="text-sm font-medium">{order.remains.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Status</span>
                      <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {order.payment_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Created</span>
                      <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Updated</span>
                      <span className="text-sm">{new Date(order.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Time */}
              {order.status === 'processing' && (
                <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Estimated Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">{getTimeRemaining()}</p>
                      <p className="text-sm text-muted-foreground">
                        We'll update you as your order progresses
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
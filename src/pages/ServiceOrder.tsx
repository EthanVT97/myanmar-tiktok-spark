import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Heart, Eye, Share2, Coins, ShoppingCart, AlertCircle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Service {
  id: string;
  name: string;
  type: 'followers' | 'likes' | 'views' | 'shares';
  description: string;
  price_per_unit: number;
  coin_price: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
}

interface Profile {
  coin_balance: number;
}

const ServiceOrder = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const serviceIcons = {
    followers: Users,
    likes: Heart,
    views: Eye,
    shares: Share2
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchServiceAndProfile();
  }, [serviceId, user]);

  const fetchServiceAndProfile = async () => {
    try {
      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (serviceError) throw serviceError;
      
      setService(serviceData);
      setQuantity(serviceData.min_quantity);

      // Fetch user profile for coin balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('coin_balance')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive"
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (service) {
      const clampedValue = Math.max(service.min_quantity, Math.min(service.max_quantity, num));
      setQuantity(clampedValue);
    }
  };

  const calculateTotal = () => {
    if (!service) return { mmk: 0, coins: 0 };
    return {
      mmk: quantity * service.price_per_unit,
      coins: quantity * service.coin_price
    };
  };

  const canAfford = () => {
    if (!profile || !service) return false;
    return profile.coin_balance >= calculateTotal().coins;
  };

  const handleOrder = async () => {
    if (!service || !user || !targetUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!canAfford()) {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough coins for this order",
        variant: "destructive"
      });
      return;
    }

    setOrdering(true);
    try {
      const total = calculateTotal();
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_id: service.id,
          quantity,
          target_url: targetUrl.trim(),
          total_price: total.mmk,
          coin_cost: total.coins,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${quantity.toLocaleString()} ${service.type} has been submitted`,
      });

      navigate(`/orders`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Service not found</div>
        </div>
      </div>
    );
  }

  const Icon = serviceIcons[service.type];
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Service Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/services')}
              className="mb-4"
            >
              ← Back to Services
            </Button>
            
            <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Place Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Target URL */}
                <div className="space-y-2">
                  <Label htmlFor="targetUrl">
                    TikTok URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetUrl"
                    placeholder="https://www.tiktok.com/@username/video/..."
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="bg-background/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the full TikTok URL for {service.type === 'followers' ? 'your profile' : 'your video'}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={service.min_quantity}
                    max={service.max_quantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="bg-background/50"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {service.min_quantity.toLocaleString()}</span>
                    <span>Max: {service.max_quantity.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coin Balance */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Coin Balance</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="font-bold">{profile?.coin_balance || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Order Button */}
                <Button 
                  onClick={handleOrder}
                  disabled={ordering || !targetUrl.trim() || !canAfford()}
                  className="w-full"
                  size="lg"
                >
                  {ordering ? "Processing..." : canAfford() ? "Place Order" : "Insufficient Coins"}
                </Button>

                {!canAfford() && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>You need {total.coins - (profile?.coin_balance || 0)} more coins</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Service</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span className="font-medium">{quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per unit</span>
                    <span className="font-medium">{service.price_per_unit} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coins per unit</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="font-medium">{service.coin_price}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total (MMK)</span>
                    <span>{total.mmk.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-primary">
                    <span>Total (Coins)</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-5 w-5" />
                      <span>{total.coins}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium">What's included:</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>High-quality {service.type} from real accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>Fast delivery (starts within 1 hour)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>24/7 customer support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>Safe and compliant methods</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrder;
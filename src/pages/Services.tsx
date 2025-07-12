import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Eye, Share2, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
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

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const serviceIcons = {
    followers: Users,
    likes: Heart,
    views: Eye,
    shares: Share2
  };

  const serviceColors = {
    followers: 'bg-blue-500',
    likes: 'bg-red-500', 
    views: 'bg-green-500',
    shares: 'bg-purple-500'
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              TikTok Boost Services
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our premium TikTok growth services designed specifically for Myanmar creators. 
            All services provide authentic engagement from real users.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service) => {
            const Icon = serviceIcons[service.type];
            const colorClass = serviceColors[service.type];
            
            return (
              <Card key={service.id} className="bg-gradient-card backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(service.price_per_unit)} MMK
                    </div>
                    <div className="text-sm text-muted-foreground">per unit</div>
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm">{service.coin_price} coins per unit</span>
                    </div>
                  </div>

                  {/* Quantity Range */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {formatPrice(service.min_quantity)}</span>
                    <span>Max: {formatPrice(service.max_quantity)}</span>
                  </div>

                  {/* CTA */}
                  {user ? (
                    <Link to={`/order/${service.id}`}>
                      <Button variant="default" className="w-full">
                        Order Now
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button variant="default" className="w-full">
                        Sign In to Order
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-muted-foreground">
              Start seeing results within minutes of placing your order
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🇲🇲</div>
            <h3 className="text-xl font-semibold mb-2">Myanmar Focused</h3>
            <p className="text-muted-foreground">
              Authentic engagement from real Myanmar TikTok users
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-muted-foreground">
              100% safe methods that comply with TikTok's terms of service
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center mt-16">
            <Card className="bg-gradient-primary/10 backdrop-blur-sm border-primary/20 max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Ready to Boost Your TikTok?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of Myanmar creators who are already growing their audience with our services
                </p>
                <Link to="/auth">
                  <Button variant="hero" size="lg">
                    Get Started Today
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
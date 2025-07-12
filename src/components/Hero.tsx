import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Users, Heart, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Myanmar TikTok
              </span>
              <br />
              <span className="text-foreground">Booster</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Premium TikTok growth services designed for Myanmar creators. 
              Boost your followers, likes, views, and shares with authentic engagement.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: 'Followers', value: '50K+' },
              { icon: Heart, label: 'Likes', value: '500K+' },
              { icon: Eye, label: 'Views', value: '2M+' },
              { icon: TrendingUp, label: 'Growth', value: '10x' },
            ].map((stat, index) => (
              <div key={index} className="bg-gradient-card backdrop-blur-sm rounded-lg p-6 shadow-elegant border border-border/50">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                    Start Boosting Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    View Services
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {[
              {
                title: 'Instant Delivery',
                description: 'Get results within minutes of placing your order',
                icon: '⚡'
              },
              {
                title: 'Myanmar Focused',
                description: 'Authentic engagement from real Myanmar users',
                icon: '🇲🇲'
              },
              {
                title: 'Secure Payments',
                description: 'KPay, WavePay, and bank transfer support',
                icon: '🔒'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-card backdrop-blur-sm rounded-lg p-6 shadow-elegant border border-border/50">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </div>
  );
};

export default Hero;
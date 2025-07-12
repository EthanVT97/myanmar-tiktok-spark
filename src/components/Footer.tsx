import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border/40 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Myanmar TikTok Booster
            </div>
            <p className="text-muted-foreground text-sm">
              Premium TikTok growth services designed specifically for Myanmar creators.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-primary">TikTok Followers</Link></li>
              <li><Link to="/services" className="hover:text-primary">TikTok Likes</Link></li>
              <li><Link to="/services" className="hover:text-primary">TikTok Views</Link></li>
              <li><Link to="/services" className="hover:text-primary">TikTok Shares</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
              <li><a href="#" className="hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary">Payment Guide</a></li>
              <li><a href="#" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Methods</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center text-xs font-bold text-primary-foreground">K</div>
                <span>KPay</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-secondary rounded flex items-center justify-center text-xs font-bold text-secondary-foreground">W</div>
                <span>WavePay</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-accent rounded flex items-center justify-center text-xs font-bold text-accent-foreground">CB</div>
                <span>CB Bank</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            © 2024 Myanmar TikTok Booster. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
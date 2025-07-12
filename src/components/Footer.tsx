import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border/40 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/4dbf40e9-f912-404e-a5c2-59b340dbc0c5.png" 
                alt="YGNB2B Tech Group" 
                className="h-8 w-auto"
              />
              <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Myanmar TikTok Booster
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Premium TikTok growth services designed specifically for Myanmar creators.
            </p>
            <div className="bg-gradient-secondary/10 rounded-lg p-4 border border-accent/20">
              <p className="text-sm font-medium text-foreground mb-2">
                ကြော်ငြာများထည့်သွင်းလိုပါကဆက်သွယ်ရန်
              </p>
              <a 
                href="https://connect.viber.com/business/00e4ad02-fb15-11ef-996b-c66269998a04?utm_source=manage&utm_medium=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <span>📱</span>
                <span>Viber မှ ဆက်သွယ်ရန်</span>
              </a>
            </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div>© 2024 All rights reserved by YGNB2B</div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://ygnb2b.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary"
              >
                ygnb2b.com
              </a>
              <a 
                href="mailto:support@ygnb2b.com" 
                className="hover:text-primary"
              >
                support@ygnb2b.com
              </a>
            </div>
          </div>
          <div className="flex flex-wrap space-x-4 sm:space-x-6 mt-4 md:mt-0">
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
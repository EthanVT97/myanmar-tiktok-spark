-- Myanmar TikTok Booster Database Schema

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'support');

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('followers', 'likes', 'views', 'shares');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'failed');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create enum for payment methods
CREATE TYPE public.payment_method AS ENUM ('kpay', 'wavepay', 'bank_transfer', 'coins');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  coin_balance INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type service_type NOT NULL,
  description TEXT,
  price_per_unit INTEGER NOT NULL, -- Price in MMK per unit
  coin_price INTEGER NOT NULL, -- Price in coins per unit
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER NOT NULL DEFAULT 10000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  target_url TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_price INTEGER NOT NULL, -- Total price in MMK
  coin_cost INTEGER NOT NULL, -- Total cost in coins
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  external_order_id TEXT, -- JustAnotherPanel order ID
  start_count INTEGER, -- Initial count before boost
  remains INTEGER, -- Remaining to be delivered
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  amount INTEGER NOT NULL, -- Amount in MMK
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  payment_proof TEXT, -- URL to payment proof image
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coin transactions table
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  transaction_type TEXT NOT NULL, -- 'purchase', 'service_payment', 'refund', 'bonus'
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment settings table (for admin to update payment numbers)
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method payment_method NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone" ON public.services
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage services" ON public.services
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'support')
  )
);

CREATE POLICY "Admins can update orders" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'support')
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'support')
  )
);

CREATE POLICY "Admins can update payments" ON public.payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'support')
  )
);

-- RLS Policies for coin transactions
CREATE POLICY "Users can view their own coin transactions" ON public.coin_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert coin transactions" ON public.coin_transactions
FOR INSERT WITH CHECK (true);

-- RLS Policies for payment settings
CREATE POLICY "Payment settings are viewable by everyone" ON public.payment_settings
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage payment settings" ON public.payment_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default services
INSERT INTO public.services (name, type, description, price_per_unit, coin_price, min_quantity, max_quantity) VALUES
('TikTok Followers - High Quality', 'followers', 'Premium Myanmar followers for your TikTok account', 50, 1, 100, 10000),
('TikTok Likes - Fast Delivery', 'likes', 'Quick likes for your TikTok videos', 10, 1, 50, 5000),
('TikTok Views - Real Traffic', 'views', 'Genuine views from Myanmar audience', 5, 1, 100, 100000),
('TikTok Shares - Viral Boost', 'shares', 'Share your content for maximum reach', 25, 1, 20, 1000);

-- Insert default payment settings
INSERT INTO public.payment_settings (payment_method, account_name, account_number) VALUES
('kpay', 'Myanmar TikTok Booster', '09123456789'),
('wavepay', 'Myanmar TikTok Booster', '09987654321'),
('bank_transfer', 'Myanmar TikTok Booster', 'CB Bank - 1234567890123');
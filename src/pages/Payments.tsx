import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Upload, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Payment {
  id: string;
  amount: number;
  payment_method: 'kpay' | 'wavepay' | 'bank_transfer' | 'coins';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  payment_proof?: string;
  transaction_id?: string;
  admin_notes?: string;
}

interface PaymentSetting {
  id: string;
  payment_method: 'kpay' | 'wavepay' | 'bank_transfer' | 'coins';
  account_name: string;
  account_number: string;
  qr_code_url?: string;
  is_active: boolean;
}

const Payments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: '',
    transaction_id: '',
    payment_proof: null as File | null
  });

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setPaymentSettings(data || []);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentSettings();
  }, [user]);

  const handleSubmitPayment = async () => {
    if (!user || !paymentForm.amount || !paymentForm.payment_method) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      let paymentProofUrl = null;

      // Upload payment proof if provided
      if (paymentForm.payment_proof) {
        const fileExt = paymentForm.payment_proof.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentForm.payment_proof);

        if (uploadError) throw uploadError;
        paymentProofUrl = uploadData.path;
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: parseInt(paymentForm.amount),
          payment_method: paymentForm.payment_method as any,
          transaction_id: paymentForm.transaction_id,
          payment_proof: paymentProofUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification",
      });

      setShowPaymentDialog(false);
      setPaymentForm({
        amount: '',
        payment_method: '',
        transaction_id: '',
        payment_proof: null
      });
      fetchPayments();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'kpay':
        return 'KPay';
      case 'wavepay':
        return 'WavePay';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'coins':
        return 'Coins';
      default:
        return method;
    }
  };

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
              Payments
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your payments and top-up coins
            </p>
          </div>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Payment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Payment</DialogTitle>
                <DialogDescription>
                  Submit your payment proof for coin top-up verification
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (MMK)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={paymentForm.payment_method} 
                    onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentSettings.map(setting => (
                        <SelectItem key={setting.id} value={setting.payment_method}>
                          {getPaymentMethodName(setting.payment_method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {paymentForm.payment_method && (
                  <div className="space-y-2">
                    {paymentSettings
                      .filter(s => s.payment_method === paymentForm.payment_method)
                      .map(setting => (
                        <div key={setting.id} className="bg-accent/20 p-3 rounded-md">
                          <p className="font-medium">{setting.account_name}</p>
                          <p className="text-sm text-muted-foreground">{setting.account_number}</p>
                          {setting.qr_code_url && (
                            <img src={setting.qr_code_url} alt="QR Code" className="w-32 h-32 mt-2" />
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input
                    id="transaction_id"
                    placeholder="Enter transaction ID"
                    value={paymentForm.transaction_id}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_id: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_proof">Payment Proof (Screenshot)</Label>
                  <Input
                    id="payment_proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      payment_proof: e.target.files?.[0] || null 
                    }))}
                  />
                </div>

                <Button 
                  onClick={handleSubmitPayment} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Payment
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {payments.length === 0 ? (
          <Card className="border-accent/20 bg-card/50 backdrop-blur-sm text-center py-12">
            <CardContent>
              <CreditCard className="h-16 w-16 mx-auto text-primary/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Payments Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't made any payments yet. Top up your coins to start ordering!
              </p>
              <Button onClick={() => setShowPaymentDialog(true)}>Make First Payment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {payments.map(payment => (
              <Card key={payment.id} className="border-accent/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span>{formatPrice(payment.amount)} MMK</span>
                    </CardTitle>
                    <Badge variant={getStatusColor(payment.status)} className="flex items-center space-x-1">
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    {getPaymentMethodName(payment.payment_method)} • {new Date(payment.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payment.transaction_id && (
                    <div>
                      <span className="text-muted-foreground text-sm">Transaction ID:</span>
                      <p className="font-medium">{payment.transaction_id}</p>
                    </div>
                  )}
                  
                  {payment.admin_notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">Admin Notes:</span>
                      <p className="text-sm bg-accent/20 p-2 rounded mt-1">{payment.admin_notes}</p>
                    </div>
                  )}

                  {payment.payment_proof && (
                    <div>
                      <span className="text-muted-foreground text-sm">Payment Proof:</span>
                      <a 
                        href={`${supabase.storage.from('payment-proofs').getPublicUrl(payment.payment_proof).data.publicUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm block mt-1"
                      >
                        View Payment Screenshot
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
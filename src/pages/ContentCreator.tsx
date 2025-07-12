import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Video, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const ContentCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    businessType: '',
    targetAudience: '',
    videoPurpose: '',
    keyPoints: '',
    trendingTheme: '',
    videoDuration: '',
    callToAction: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateContent = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate content",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['businessType', 'targetAudience', 'videoPurpose', 'keyPoints', 'videoDuration', 'callToAction'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: formData
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast({
        title: "Content Generated Successfully!",
        description: "Your TikTok content plan is ready",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Content Creator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            မြန်မာ TikTok လူငယ်များအတွက် ဖန်တီးပေးမည့် AI Content Generator
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="border-accent/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Content အချက်အလက်များ ဖြည့်စွက်ပါ</span>
              </CardTitle>
              <CardDescription>
                အောက်ပါ အချက်အလက်များကို ဖြည့်စွက်ပြီး AI ဖြင့် TikTok Content ဖန်တီးပါ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessType">စီးပွားရေး အမျိုးအစား / ထုတ်ကုန် / ဝန်ဆောင်မှု *</Label>
                <Input
                  id="businessType"
                  placeholder="ဥပမာ: အလှကုန်ဆိုင်၊ အွန်လိုင်းအဝတ်အစားဆိုင်၊ ကော်ဖီဆိုင်"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience (အဓိက ပစ်မှတ်ထားသူများ) *</Label>
                <Input
                  id="targetAudience"
                  placeholder="ဥပမာ: ၁၈-၂၅ နှစ်အရွယ် ကောလိပ်ကျောင်းသူများ"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoPurpose">ဗီဒီယို၏ ရည်ရွယ်ချက် *</Label>
                <Textarea
                  id="videoPurpose"
                  placeholder="ဥပမာ: Brand Awareness တိုးမြှင့်ရန်၊ ထုတ်ကုန်အသစ်မိတ်ဆက်ရန်"
                  value={formData.videoPurpose}
                  onChange={(e) => handleInputChange('videoPurpose', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPoints">အဓိက အချက် / အကျိုးကျေးဇူး / USP *</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="ဥပမာ: မျက်နှာအဆီပြန်ခြင်းကို သက်သာစေသည်၊ ဖက်ရှင်ကျပြီး ဝတ်ရအဆင်ပြေသည်"
                  value={formData.keyPoints}
                  onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trendingTheme">လက်ရှိ Trending Theme (ရွေးချယ်စရာ)</Label>
                <Input
                  id="trendingTheme"
                  placeholder="ဥပမာ: Transformation trend, အချစ်ဆုံးသူငယ်ချင်း challenge"
                  value={formData.trendingTheme}
                  onChange={(e) => handleInputChange('trendingTheme', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoDuration">ဗီဒီယို အရှည် *</Label>
                <Select value={formData.videoDuration} onValueChange={(value) => handleInputChange('videoDuration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ဗီဒီယို အရှည်ရွေးပါ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30s">၁၅-၃၀ စက္ကန့်</SelectItem>
                    <SelectItem value="30-60s">၃၀-၆၀ စက္ကန့်</SelectItem>
                    <SelectItem value="60-90s">၆၀-၉၀ စက္ကန့်</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action (CTA) *</Label>
                <Textarea
                  id="callToAction"
                  placeholder="ဥပမာ: Bio မှာ Link ကြည့်ရန်၊ Page ကို Follow လုပ်ရန်၊ Comment ရေးရန်"
                  value={formData.callToAction}
                  onChange={(e) => handleInputChange('callToAction', e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleGenerateContent} 
                disabled={loading}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI Content ဖန်တီးနေပါသည်...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Content ဖန်တီးပါ
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card className="border-accent/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ဖန်တီးထားသော Content</span>
                {generatedContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="flex items-center space-x-2"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                AI မှ ဖန်တီးပေးသော TikTok Content Plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="bg-accent/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <p className="text-lg mb-2">Content မဖန်တီးရသေးပါ</p>
                  <p className="text-sm">
                    ဘယ်ဘက်မှ အချက်အလက်များ ဖြည့်စွက်ပြီး AI Content ဖန်တီးပါ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
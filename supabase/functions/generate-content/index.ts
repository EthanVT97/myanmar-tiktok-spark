import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { 
      businessType, 
      targetAudience, 
      videoPurpose, 
      keyPoints, 
      trendingTheme, 
      videoDuration, 
      callToAction 
    } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `မင်းက မြန်မာနိုင်ငံရဲ့ TikTok Trend တွေ၊ လူငယ်တွေရဲ့ စိတ်နေစိတ်ထားတွေကို အပြည့်အဝနားလည်တဲ့ ဖန်တီးမှုအပြည့်ရှိတဲ့ TikTok Content Strategist တစ်ယောက်ပါ။ ငါပေးမယ့် အချက်အလက်တွေအပေါ်မူတည်ပြီး TikTok ဗီဒီယို Concept တစ်ခုလုံးကို (Script, Caption, Hashtag ပါအပါအဝင်) မြန်မာလူငယ်များ ကြိုက်နှစ်သက်မည့် လူငယ်ဆန်သော၊ သဘာဝကျကျ၊ ဖျော်ဖြေမှုနှင့် ဆွဲဆောင်မှုရှိသော ပုံစံဖြင့် ရေးသားပေးပါ။

တိုက်ရိုက်ကြော်ငြာဆန်ခြင်းကို လုံးဝရှောင်ရှားပါ။ ဗီဒီယိုကို ပညာပေး၊ ဖျော်ဖြေရေး၊ နေ့စဉ်ဘဝ ပြဿနာဖြေရှင်းပေးခြင်း (သို့မဟုတ်) အသစ်အဆန်း တင်ဆက်ခြင်းစသည့် နည်းလမ်းများဖြင့် ချဉ်းကပ်ပါ။ မြန်မာစကားပြော အသုံးအနှုန်းများ၊ လူငယ်သုံး စကားလုံးအချို့ (ပမာဏသင့်ရုံ) နှင့် အီမိုဂျီများကို လိုအပ်သလို ထည့်သွင်းပါ။

အောက်ပါ အချက်အလက်များကို အခြေခံပြီး Content Plan ကို ရေးဆွဲပေးပါ:

1. **[စီးပွားရေး အမျိုးအစား / ထုတ်ကုန် / ဝန်ဆောင်မှု]:** ${businessType}
2. **[Target Audience (အဓိက ပစ်မှတ်ထားသူများ)]:** ${targetAudience}
3. **[ဗီဒီယို၏ ရည်ရွယ်ချက်]:** ${videoPurpose}
4. **[မီးမောင်းထိုးပြလိုသော အဓိက အချက် / အကျိုးကျေးဇူး / Unique Selling Proposition (USP)]:** ${keyPoints}
5. **[လက်ရှိ Trending ဖြစ်နေသော TikTok အသံ / Challenge / Theme]:** ${trendingTheme || 'N/A'}
6. **[လိုချင်သော ဗီဒီယို အရှည်]:** ${videoDuration}
7. **[Call to Action (CTA) - ပရိသတ်ကို ဘာလုပ်စေချင်လဲ]:** ${callToAction}

ဤ Format အတိုင်း တိကျသော Content Plan ကို ထုတ်ပေးပါ:

## TikTok Content Plan

### ၁။ ဗီဒီယို Concept ခေါင်းစဉ်:
(ဖန်တီးမှုအပြည့်နဲ့ ဆွဲဆောင်မှုရှိသော ခေါင်းစဉ်)

### ၂။ ဗီဒီယို အမျိုးအစား:
(ဥပမာ- VLOG, Comedy Skit, Educational, Transformation, Daily Routine)

### ၃။ အကြံပြုထားသော Trending Music/Sound:
(သင့်လျော်သည့် အသံ/သီချင်း အမည်)

### ၄။ ဗီဒီယို Script (အဆင့်ဆင့် အသေးစိတ်):
**Hook (ပထမ ၃ စက္ကန့်):** 
**အခန်း ၁ (5-10s):** 
**အခန်း ၂ (5-10s):** 
**အခန်း ၃ (5-10s):** 
**Call to Action (နောက်ဆုံး ၃ စက္ကန့်):** 

### ၅။ Captions (ဆွဲဆောင်မှုရှိသော စာသား):
**Option 1 (တိုတိုနဲ့ ထိရောက်):** 
**Option 2 (အနည်းငယ်ရှည်ပြီး အသေးစိတ်):** 

### ၆။ Hashtags (Trend နှင့် ကိုက်ညီသော):
**General/Brand Hashtags:** 
**Trend/Niche Hashtags:** 
**Engagement Hashtags:** 

### ၇။ အပိုဆောင်း အကြံပြုချက်များ:
**Visual Style / Editing Tips:**
**Interaction Ideas:**`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates[0].content.parts[0].text;

    // Save to database
    const { error } = await supabaseClient
      .from('content_ideas')
      .insert({
        user_id: user.id,
        business_type: businessType,
        target_audience: targetAudience,
        video_purpose: videoPurpose,
        key_points: keyPoints,
        trending_theme: trendingTheme,
        video_duration: videoDuration,
        call_to_action: callToAction,
        generated_content: { content: generatedContent }
      });

    if (error) {
      console.error('Database error:', error);
    }

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
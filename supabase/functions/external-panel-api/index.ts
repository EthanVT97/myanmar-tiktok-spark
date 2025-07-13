import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PanelOrderRequest {
  service: string;
  link: string;
  quantity: number;
}

interface PanelOrderResponse {
  order: number;
  success: boolean;
}

interface PanelStatusResponse {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // External panel API configuration
    const PANEL_API_URL = Deno.env.get('PANEL_API_URL') || '';
    const PANEL_API_KEY = Deno.env.get('PANEL_API_KEY') || '';

    if (!PANEL_API_URL || !PANEL_API_KEY) {
      throw new Error('External panel API not configured');
    }

    switch (action) {
      case 'create_order': {
        const { orderId, serviceType, targetUrl, quantity } = await req.json();

        // Map our service types to external panel service IDs
        const serviceMapping = {
          followers: '1', // TikTok Followers
          likes: '2',     // TikTok Likes
          views: '3',     // TikTok Views
          shares: '4'     // TikTok Shares
        };

        const externalServiceId = serviceMapping[serviceType as keyof typeof serviceMapping];
        if (!externalServiceId) {
          throw new Error('Unsupported service type');
        }

        // Create order on external panel
        const panelResponse = await fetch(PANEL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            key: PANEL_API_KEY,
            action: 'add',
            service: externalServiceId,
            link: targetUrl,
            quantity: quantity.toString()
          })
        });

        const panelData: PanelOrderResponse = await panelResponse.json();

        if (!panelData.success) {
          throw new Error('Failed to create order on external panel');
        }

        // Update our order with external order ID
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            external_order_id: panelData.order.toString(),
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Failed to update order:', updateError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            external_order_id: panelData.order,
            message: 'Order created successfully on external panel' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_status': {
        const { externalOrderId } = await req.json();

        // Check order status on external panel
        const statusResponse = await fetch(PANEL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            key: PANEL_API_KEY,
            action: 'status',
            order: externalOrderId
          })
        });

        const statusData: PanelStatusResponse = await statusResponse.json();

        // Map external status to our status
        let ourStatus = 'processing';
        if (statusData.status === 'Completed') {
          ourStatus = 'completed';
        } else if (statusData.status === 'Canceled') {
          ourStatus = 'cancelled';
        } else if (statusData.status === 'In progress') {
          ourStatus = 'processing';
        }

        // Update our order with latest info
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            status: ourStatus,
            start_count: parseInt(statusData.start_count) || null,
            remains: parseInt(statusData.remains) || null,
            updated_at: new Date().toISOString()
          })
          .eq('external_order_id', externalOrderId);

        if (updateError) {
          console.error('Failed to update order status:', updateError);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            status: ourStatus,
            start_count: statusData.start_count,
            remains: statusData.remains,
            charge: statusData.charge
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk_status_check': {
        // Check status of all pending/processing orders
        const { data: orders, error: ordersError } = await supabaseClient
          .from('orders')
          .select('id, external_order_id')
          .in('status', ['pending', 'processing'])
          .not('external_order_id', 'is', null);

        if (ordersError) {
          throw ordersError;
        }

        const updates = [];
        
        for (const order of orders || []) {
          try {
            const statusResponse = await fetch(PANEL_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                key: PANEL_API_KEY,
                action: 'status',
                order: order.external_order_id
              })
            });

            const statusData: PanelStatusResponse = await statusResponse.json();

            let ourStatus = 'processing';
            if (statusData.status === 'Completed') {
              ourStatus = 'completed';
            } else if (statusData.status === 'Canceled') {
              ourStatus = 'cancelled';
            }

            updates.push({
              id: order.id,
              status: ourStatus,
              start_count: parseInt(statusData.start_count) || null,
              remains: parseInt(statusData.remains) || null,
              updated_at: new Date().toISOString()
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to check status for order ${order.id}:`, error);
          }
        }

        // Bulk update orders
        for (const update of updates) {
          await supabaseClient
            .from('orders')
            .update({
              status: update.status,
              start_count: update.start_count,
              remains: update.remains,
              updated_at: update.updated_at
            })
            .eq('id', update.id);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            updated_orders: updates.length,
            message: `Updated ${updates.length} orders` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }

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
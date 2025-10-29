import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { code, amount } = await req.json();

      if (!code || !amount) {
        return new Response(
          JSON.stringify({ error: 'Code and amount are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get promo code
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoError || !promo) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid promo code' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if promo code is still valid (date)
      const now = new Date();
      const validFrom = new Date(promo.valid_from);
      const validUntil = new Date(promo.valid_until);

      if (now < validFrom || now > validUntil) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Promo code has expired' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check minimum amount
      if (promo.min_amount && amount < promo.min_amount) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: `Minimum purchase of $${promo.min_amount} required`,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate discount
      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (amount * promo.discount_value) / 100;
        if (promo.max_discount && discountAmount > promo.max_discount) {
          discountAmount = promo.max_discount;
        }
      } else if (promo.discount_type === 'fixed') {
        discountAmount = promo.discount_value;
      }

      // Ensure discount doesn't exceed amount
      discountAmount = Math.min(discountAmount, amount);

      return new Response(
        JSON.stringify({
          valid: true,
          discount: discountAmount,
          finalAmount: amount - discountAmount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
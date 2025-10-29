import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        experienceId,
        slotId,
        customerName,
        customerEmail,
        customerPhone,
        numGuests,
        baseAmount,
        discountAmount,
        finalAmount,
        promoCode,
      } = body;

      // Validate required fields
      if (!experienceId || !slotId || !customerName || !customerEmail || !customerPhone || !numGuests) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check slot availability
      const { data: slot, error: slotError } = await supabase
        .from('slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (slotError || !slot) {
        return new Response(
          JSON.stringify({ error: 'Slot not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (slot.booked + numGuests > slot.capacity) {
        return new Response(
          JSON.stringify({ error: 'Not enough capacity available' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate booking reference
      const bookingReference = generateBookingReference();

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          experience_id: experienceId,
          slot_id: slotId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          num_guests: numGuests,
          base_amount: baseAmount,
          discount_amount: discountAmount || 0,
          final_amount: finalAmount,
          promo_code: promoCode || null,
          status: 'confirmed',
          booking_reference: bookingReference,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update slot booked count
      const { error: updateError } = await supabase
        .from('slots')
        .update({ booked: slot.booked + numGuests })
        .eq('id', slotId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ data: booking }),
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
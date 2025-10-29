import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathname = url.pathname.replace("/functions/v1", ""); // strip prefix
    const parts = pathname.split("/").filter(Boolean);

    // ✅ /experiences
    if (req.method === "GET" && parts.length === 1 && parts[0] === "experiences") {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ /experiences/:id
    if (req.method === "GET" && parts.length === 2 && parts[0] === "experiences") {
      const experienceId = parts[1];

      const { data: experience, error: expError } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experienceId)
        .single();

      if (expError) throw expError;

      const { data: slots, error: slotsError } = await supabase
        .from("slots")
        .select("*")
        .eq("experience_id", experienceId)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (slotsError) throw slotsError;

      return new Response(JSON.stringify({ data: { ...experience, slots } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-out-visitor' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      `<html><body><h1>Error</h1><p>Method Not Allowed</p></body></html>`,
      { status: 405, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  const url = new URL(req.url);
  const visitorId = url.searchParams.get("visitorId");

  if (!visitorId) {
    return new Response(
      `<html><body><h1>Error</h1><p>Missing visitorId parameter</p></body></html>`,
      { status: 400, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // Check if visitor exists
  const { data: visitor, error: fetchError } = await supabase
    .from("visitors")
    .select("*")
    .eq("id", visitorId)
    .single();

  if (fetchError || !visitor) {
    return new Response(
      `<html><body><h1>Error</h1><p>Visitor not found</p></body></html>`,
      { status: 404, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  if (visitor.check_out) {
    return new Response(
      `<html><body><h1>Error</h1><p>Visitor already checked out</p></body></html>`,
      { status: 400, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  // Update the visitor with the check-out time
  const { error: updateError } = await supabase
    .from("visitors")
    .update({ check_out: new Date().toISOString() })
    .eq("id", visitorId);

  if (updateError) {
    console.error("Error updating visitor:", updateError);
    return new Response(
      `<html><body><h1>Error</h1><p>Internal Server Error</p></body></html>`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  return new Response(
    `<html><body><h1>Success</h1><p>Visitor checked out successfully!</p></body></html>`,
    { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
  );
});
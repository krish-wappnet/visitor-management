import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

console.log("Starting check-out-visitor Edge Function...");

serve(async (req) => {
  console.log("Received a request:", req.method, req.url);
  return new Response(
    `<html><body><h1>Success</h1><p>Edge Function is running!</p></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
});

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

  // Initialize Firebase Admin SDK
  let db;
  try {
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!);
    const firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>Failed to initialize Firebase</p></body></html>`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // Check if visitor exists in Supabase
  const { data: visitor, error: fetchError } = await supabase
    .from("visitors")
    .select("*")
    .eq("id", visitorId)
    .single();

  if (fetchError || !visitor) {
    console.error("Error fetching visitor from Supabase:", fetchError);
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

  // Update the visitor in Supabase
  const checkOutTime = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("visitors")
    .update({ check_out: checkOutTime })
    .eq("id", visitorId);

  if (updateError) {
    console.error("Error updating visitor in Supabase:", updateError);
    return new Response(
      `<html><body><h1>Error</h1><p>Failed to update visitor in Supabase</p></body></html>`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  // Update the visitor in Firebase Firestore
  try {
    const visitorsRef = collection(db, "visitors");
    const q = query(visitorsRef, where("id", "==", visitorId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Visitor not found in Firebase:", visitorId);
      return new Response(
        `<html><body><h1>Error</h1><p>Visitor not found in Firebase</p></body></html>`,
        { status: 404, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const visitorDoc = querySnapshot.docs[0];
    await updateDoc(visitorDoc.ref, {
      checkOut: checkOutTime,
    });
  } catch (error) {
    console.error("Error updating visitor in Firebase:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>Failed to update visitor in Firebase</p></body></html>`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  return new Response(
    `<html><body><h1>Success</h1><p>Visitor checked out successfully!</p></body></html>`,
    { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
  );
});
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
//@ts-ignore
Deno.serve(async (req) => {
  try {
    // Parse request body
    const { pushToken, title, message, url } = await req.json();

    if (!pushToken || !title || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Construct push notification payload
    const payload = {
      to: pushToken,
      title,
      body: message,
      data: { url: url },
    };

    // Send the push notification
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Failed to send push notification: ${errorText}`, {
        status: 500,
      });
    }

    return new Response("Push notification sent successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

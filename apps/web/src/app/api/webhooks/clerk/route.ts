import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error";
}

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const logData = data ? JSON.stringify(data, null, 2) : "";
  console.log(`[${timestamp}] [Clerk Webhook] ${message}${logData ? `\n${logData}` : ""}`);
}

export async function POST(req: Request) {
  if (!CLERK_WEBHOOK_SECRET) {
    log("ERROR: CLERK_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // 1. Get Svix headers
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    log("ERROR: Missing Svix headers", {
      svixId: svixId || "missing",
      svixTimestamp: svixTimestamp || "missing",
      svixSignature: svixSignature || "missing",
    });
    return new Response("Missing Svix headers", { status: 400 });
  }

  // 2. Get raw body
  const payload = await req.text();

  // 3. Verify signature
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    log("ERROR: Signature verification failed", { error: getErrorMessage(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  // 4. Log the event
  log("Received webhook event", {
    type: evt.type,
    id: evt.data.id,
  });

  // 5. Forward to backend API
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evt),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log("ERROR: Backend API request failed", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return new Response("Backend API error", { status: 500 });
    }

    const result = await response.json();
    log("Successfully synced user to backend", { result });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    log("ERROR: Failed to forward webhook to backend", { error: getErrorMessage(err) });
    return new Response("Failed to forward webhook", { status: 500 });
  }
}
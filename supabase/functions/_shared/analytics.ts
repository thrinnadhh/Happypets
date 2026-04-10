const DEFAULT_MEASUREMENT_ID = "G-CWYMQHSBEY";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export async function trackGoogleAnalyticsEvent(input: {
  clientId: string;
  userId?: string | null;
  eventName: string;
  params?: AnalyticsParams;
}): Promise<void> {
  const apiSecret = Deno.env.get("GA_API_SECRET") ?? "";
  if (!apiSecret) {
    return;
  }

  const measurementId = Deno.env.get("GA_MEASUREMENT_ID") ?? DEFAULT_MEASUREMENT_ID;
  const url = new URL("https://www.google-analytics.com/mp/collect");
  url.searchParams.set("measurement_id", measurementId);
  url.searchParams.set("api_secret", apiSecret);

  const body: Record<string, unknown> = {
    client_id: input.clientId,
    events: [
      {
        name: input.eventName,
        params: input.params ?? {},
      },
    ],
  };

  if (input.userId) {
    body.user_id = input.userId;
  }

  try {
    await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Analytics must never block checkout or payment callbacks.
  }
}
export async function sendPushNotification({
  title,
  message,
  url,
  userIds
}: {
  title: string;
  message: string;
  url?: string;
  userIds?: string[]; // optionally target specific onesignal external_user_ids (if configured)
}) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restKey) {
    console.warn("[OneSignal] Skipping push notification: Credentials not set.");
    return false;
  }

  try {
    const payload: any = {
      app_id: appId,
      headings: { en: title },
      contents: { en: message },
    };

    if (url) payload.url = url;

    // In a full production app, you would pass `userIds` mapped to OneSignal aliases or player IDs.
    // For now, if no users specified, we broadcast to all subscribed devices.
    if (userIds && userIds.length > 0) {
      payload.include_external_user_ids = userIds;
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[OneSignal] Push Error:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[OneSignal] Network Error:", error);
    return false;
  }
}

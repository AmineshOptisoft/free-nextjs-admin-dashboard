"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    const host = window.location.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    const isSecureOrigin = window.location.protocol === "https:" || isLocalHost;

    // OneSignal requires a secure origin (HTTPS or localhost).
    if (!isSecureOrigin) {
      console.warn("[OneSignal] Skipping init: Push APIs require HTTPS or localhost. Running on:", window.location.href);
      return;
    }

    // Prevent noisy runtime errors on hosts that are not configured in OneSignal.
    // Override via NEXT_PUBLIC_ONESIGNAL_ALLOWED_HOSTS="host1,host2" when needed.
    const allowedHosts = (
      process.env.NEXT_PUBLIC_ONESIGNAL_ALLOWED_HOSTS ?? "mucic-jone-saltatorial.ngrok-free.dev"
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!allowedHosts.includes(host)) {
      console.info(`[OneSignal] Skipping init: "${host}" is not in allowed hosts.`);
      return;
    }

    OneSignal.init({
      appId: "c725be3b-b497-4e32-a6d6-9d8ed6420dd4",
      safari_web_id: "web.onesignal.auto.257d0569-0e14-4d06-8d17-3d55d768ff68",
      allowLocalhostAsSecureOrigin: true,
    }).then(() => {
      console.log("[OneSignal] Initialized ✅");
    }).catch((err) => {
      console.error("[OneSignal] Init error:", err);
    });
  }, []);

  return null;
}

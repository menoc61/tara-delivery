"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/push-notifications";

export function PushNotificationsInit() {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return null;
}

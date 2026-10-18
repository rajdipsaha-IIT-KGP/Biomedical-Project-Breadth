
import { useCallback, useEffect, useRef, useState } from "react";

export default function useEyeGuardNotifications(lowOPI) {
  const lastNotificationTimeRef = useRef(0);
  const lowOPIRef = useRef(lowOPI);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
  );

  const [notificationStatus, setNotificationStatus] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
      ? "Browser permission granted."
      : "Notifications are disabled."
  );

  useEffect(() => {
    lowOPIRef.current = lowOPI;
  }, [lowOPI]);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setNotificationStatus("This browser does not support notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationsEnabled(true);
        setNotificationStatus("Notifications enabled.");
      } else {
        setNotificationsEnabled(false);
        setNotificationStatus("Please allow notifications in browser settings.");
      }
    } catch (error) {
      console.error(error);
      setNotificationStatus("Could not request notification permission.");
    }
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    setNotificationStatus("Notifications disabled.");
  };

  const sendNotification = useCallback((title, body, tag) => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      setNotificationStatus("Allow notifications in browser settings first.");
      return false;
    }

    try {
      new Notification(title, {
        body,
        tag,
      });

      return true;
    } catch (error) {
      console.error("Notification failed:", error);
      setNotificationStatus("Could not display notification.");
      return false;
    }
  }, []);

  const testNotification = () => {
    const sent = sendNotification(
      "EyeGuard is working 👁️",
      "Desktop notifications are working!",
      `eyeguard-test-${Date.now()}`
    );

    if (sent) {
      setNotificationStatus("Test notification sent.");
    }
  };

  // Check OPI continuously while notifications are enabled.
  useEffect(() => {
  if (!notificationsEnabled || !lowOPI) return;

  // Notify immediately when OPI is below 1.
  const now = Date.now();

  if (now - lastNotificationTimeRef.current < 60_000) {
    return;
  }

  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification("EyeGuard reminder 👁️", {
        body: "Your calculated OPI is below 1. Consider taking a short screen break.",
        tag: "eyeguard-opi-reminder",
      });

      lastNotificationTimeRef.current = now;
      setNotificationStatus("Low OPI reminder sent.");
    } catch (error) {
      console.error("Automatic notification failed:", error);
      setNotificationStatus("Could not display the automatic reminder.");
    }
  }
}, [lowOPI, notificationsEnabled]);

  return {
    notificationsEnabled,
    notificationStatus,
    enableNotifications,
    disableNotifications,
    testNotification,
  };
}

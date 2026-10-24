
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function useEyeGuardNotifications(lowOPI) {
  const lowOPIRef = useRef(lowOPI);
  const lastToastTimeRef = useRef(0);
  const lastDesktopTimeRef = useRef(0);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
  );

  const [notificationStatus, setNotificationStatus] = useState(
    "Eye-rest reminders are ready."
  );

  useEffect(() => {
    lowOPIRef.current = lowOPI;
  }, [lowOPI]);

  const enableNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setNotificationStatus(
        "Desktop notifications are not supported by this browser."
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationsEnabled(true);
        setNotificationStatus("Desktop notifications enabled.");
      } else {
        setNotificationsEnabled(false);
        setNotificationStatus(
          "Permission not granted. In-app reminders will still work."
        );
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      setNotificationStatus("Could not enable desktop notifications.");
    }
  }, []);

  const disableNotifications = useCallback(() => {
    setNotificationsEnabled(false);
    setNotificationStatus(
      "Desktop notifications disabled. In-app reminders remain available."
    );
  }, []);

  const sendNotification = useCallback((title, body, tag) => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return false;
    }

    try {
      new Notification(title, { body, tag });
      return true;
    } catch (error) {
      console.error("Desktop notification failed:", error);
      return false;
    }
  }, []);

  const testNotification = useCallback(() => {
    const sent = sendNotification(
      "EyeGuard test 👁️",
      "Your desktop notifications are working!",
      "eyeguard-test"
    );

    setNotificationStatus(
      sent
        ? "Test desktop notification sent."
        : "Desktop notification unavailable. Check browser permission."
    );
  }, [sendNotification]);

  useEffect(() => {
    const checkReminder = () => {
      if (!lowOPIRef.current) return;

      const now = Date.now();

      // In-app toast: once per minute at most.
      if (now - lastToastTimeRef.current >= 60_000) {
        toast("Close your eyes gently for 10–20 seconds. 😌", {
          duration: 5000,
          id: "eyeguard-eye-rest",
        });

        lastToastTimeRef.current = now;
      }

      // Desktop notification: separately controlled.
      if (
        notificationsEnabled &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        now - lastDesktopTimeRef.current >= 60_000
      ) {
        const sent = sendNotification(
          "Time to rest your eyes! 👁️",
          "Close your eyes gently for 10–20 seconds and relax.",
          "eyeguard-eye-rest"
        );

        if (sent) {
          lastDesktopTimeRef.current = now;
          setNotificationStatus("Eye-rest reminder sent.");
        }
      }
    };

    checkReminder();

    const intervalId = setInterval(checkReminder, 5000);

    return () => clearInterval(intervalId);
  }, [notificationsEnabled, sendNotification]);

  return {
    notificationsEnabled,
    notificationStatus,
    enableNotifications,
    disableNotifications,
    testNotification,
  };
}

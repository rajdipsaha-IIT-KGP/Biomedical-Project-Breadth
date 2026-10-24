import { useEffect, useRef, useState } from "react";

import Header from "./components/Header";
import CameraPanel from "./components/CameraPanel";
import EyeMetrics from "./components/EyeMetrics";
import OPIPanel from "./components/OPIPanel";
import NotificationPanel from "./components/NotificationPanel";
import { Toaster } from "react-hot-toast";

import useFaceLandmarker from "./useFaceLandmarker";
import useOPI from "./opi/useOPI";
import useEyeGuardNotifications from "./opi/useEyeGuardNotifications";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState("Camera is off");
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const {
    landmarks,
    modelStatus,
    blinkCount,
    blinkRate,
    ear,
    ibi,
    lastBlinkMinEAR,
    lastBlinkTime,
  } = useFaceLandmarker(videoRef, cameraOn);

  const {
    tfbut,
    setTfbut,
    opi,
    opiStatus,
    elapsedSeconds,
  } = useOPI(lastBlinkTime);

  const {
    notificationsEnabled,
    notificationStatus,
    enableNotifications,
    disableNotifications,
    testNotification,
  } = useEyeGuardNotifications(opiStatus.low);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const blinkJustDetected =
    lastBlinkTime !== null &&
    lastBlinkTime !== undefined &&
    currentTime - lastBlinkTime < 1800;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [darkMode]);

  // Draw detected facial landmarks on the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!cameraOn || !landmarks) return;

    const points = Array.isArray(landmarks[0])
      ? landmarks[0]
      : landmarks;

    if (!Array.isArray(points)) return;

    context.fillStyle = "#22c55e";

    points.forEach((point) => {
      if (
        typeof point?.x !== "number" ||
        typeof point?.y !== "number"
      ) {
        return;
      }

      context.beginPath();
      context.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        1.5,
        0,
        Math.PI * 2
      );
      context.fill();
    });
  }, [landmarks, cameraOn]);

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Camera access is not supported in this browser.");
        return;
      }

      setStatus("Requesting camera permission...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      setStatus("Camera is running");
    } catch (error) {
      console.error("Unable to start camera:", error);
      setStatus(
        error.name === "NotAllowedError"
          ? "Camera permission was denied."
          : "Could not start the camera."
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }

    setCameraOn(false);
    setStatus("Camera is off");
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-10">
      <main className="mx-auto max-w-7xl space-y-8">
      <Toaster
  position="top-right"
  toastOptions={{
    duration: 5000,
  }}
/>
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraOn={cameraOn}
            status={status}
            modelStatus={modelStatus}
            blinkJustDetected={blinkJustDetected}
            onStart={startCamera}
            onStop={stopCamera}
          />

          <div className="space-y-6">
            <EyeMetrics
              blinkCount={blinkCount}
              blinkRate={blinkRate}
              ear={ear}
              ibi={ibi}
              lastBlinkMinEAR={lastBlinkMinEAR}
            />

            <OPIPanel
              tfbut={tfbut}
              setTfbut={setTfbut}
              opi={opi}
              opiStatus={opiStatus}
              elapsedSeconds={elapsedSeconds}
            />

            <NotificationPanel
              notificationsEnabled={notificationsEnabled}
              notificationStatus={notificationStatus}
              enableNotifications={enableNotifications}
              disableNotifications={disableNotifications}
              testNotification={testNotification}
            />
          </div>
        </div>

        <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          EyeGuard — an experimental webcam-based blink-monitoring
          prototype. It is not a medical diagnostic device.
        </footer>
      </main>
    </div>
  );
}
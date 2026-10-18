
import { useEffect, useRef, useState } from "react";
import useFaceLandmarker from "./useFaceLandmarker";
import useOPI from "./opi/useOPI";
import useEyeGuardNotifications from "./opi/useEyeGuardNotifications";

// Eye landmark indices from MediaPipe
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

const App = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState("Camera is off");
  const [darkMode, setDarkMode] = useState(false);

  // Existing webcam blink-detection hook
  const {
    landmarks,
    modelStatus,
    blinkCount,
    blinkRate,
    ibi,
    ear,
    lastBlinkMinEAR,
  } = useFaceLandmarker(videoRef, cameraOn);

  // OPI calculation and TFBUT configuration
  const {
    tfbut,
    setTfbut,
    opi,
    opiStatus,
  } = useOPI(ibi);

  // Desktop notifications
  const {
    notificationsEnabled,
    notificationStatus,
    enableNotifications,
    disableNotifications,
    testNotification,
  } = useEyeGuardNotifications(opiStatus.low);
  

  // Start webcam
  async function startCamera() {
    try {
      setStatus("Requesting camera access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
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
      console.error("Camera error:", error);
      setStatus("Camera access failed. Check browser permissions.");
    }
  }

  // Stop webcam
  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setStatus("Camera is off");
  }

  // Release webcam on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Draw eye landmarks over the mirrored video
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width && height) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || !canvas.width || !canvas.height) return;

    [LEFT_EYE, RIGHT_EYE].forEach((indices) => {
      ctx.beginPath();

      indices.forEach((index, i) => {
        const point = landmarks[index];
        const x = (1 - point.x) * canvas.width;
        const y = point.y * canvas.height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.stroke();

      indices.forEach((index) => {
        const point = landmarks[index];
        const x = (1 - point.x) * canvas.width;
        const y = point.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#22c55e";
        ctx.fill();
      });
    });
  }, [landmarks, cameraOn]);

  // Theme styles
  const theme = darkMode
    ? {
        page: "bg-slate-950 text-slate-100",
        card: "border-slate-800 bg-slate-900",
        heading: "text-slate-100",
        muted: "text-slate-400",
        divider: "border-slate-800",
        secondaryButton:
          "border-slate-700 text-slate-200 hover:bg-slate-800",
        reminder: "bg-emerald-950",
        brand: "text-emerald-400",
        badge: "bg-emerald-950 text-emerald-300",
        input:
          "border-slate-700 bg-slate-800 text-slate-100",
      }
    : {
        page: "bg-slate-50 text-slate-800",
        card: "border-slate-200 bg-white",
        heading: "text-slate-800",
        muted: "text-slate-500",
        divider: "border-slate-100",
        secondaryButton:
          "border-slate-300 text-slate-700 hover:bg-slate-50",
        reminder: "bg-emerald-50",
        brand: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800",
        input:
          "border-slate-300 bg-white text-slate-900",
      };

  // Existing eye metrics
  const metrics = [
    ["Total blinks", String(blinkCount)],
    ["Blink rate", `${blinkRate} blinks/min`],
    [
      "Interblink interval",
      ibi === null ? "--" : `${ibi.toFixed(2)} seconds`,
    ],
    [
      "Eye aspect ratio (EAR)",
      ear === null ? "--" : ear.toFixed(3),
    ],
    [
      "Minimum EAR (Last Blink)",
      lastBlinkMinEAR === null
        ? "--"
        : lastBlinkMinEAR.toFixed(3),
    ],
  ];

  return (
    <main
      className={`min-h-screen px-5 py-8 transition-colors duration-300 ${theme.page}`}
    >
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <h1 className={`text-2xl font-bold ${theme.brand}`}>
          EyeGuard
        </h1>

        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full px-4 py-2 text-xs font-semibold sm:inline-block ${theme.badge}`}
          >
            PROTOTYPE
          </span>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-pressed={darkMode}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${theme.secondaryButton}`}
          >
            <span>{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto mt-12 max-w-6xl">
        <p
          className={`text-sm font-semibold uppercase tracking-widest ${theme.brand}`}
        >
          Blink-Contingent Adaptive Eye Protection
        </p>

        <h2
          className={`mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl ${theme.heading}`}
        >
          Give your eyes the attention they deserve.
        </h2>

        <p className={`mt-4 max-w-2xl leading-7 ${theme.muted}`}>
          Monitor blinking behaviour and receive timely reminders
          during screen use.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Camera panel */}
          <section
            className={`rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${theme.card}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${theme.heading}`}>
                  Live camera
                </h3>
                <p className={`mt-1 text-sm ${theme.muted}`}>
                  Keep your face comfortably in view.
                </p>
              </div>

              <span
                className={
                  cameraOn
                    ? "text-sm font-semibold text-emerald-500"
                    : `text-sm ${theme.muted}`
                }
              >
                {cameraOn ? "● LIVE" : "● OFFLINE"}
              </span>
            </div>

            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
              />

              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {!cameraOn && (
                <p className="absolute text-sm text-slate-300">
                  Camera preview will appear here
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <p className={`text-sm ${theme.muted}`}>
                Camera: {status}
              </p>

              <p className={`text-sm ${theme.muted}`}>
                MediaPipe: {modelStatus}
              </p>

              <p className={`text-sm ${theme.muted}`}>
                Face detection:{" "}
                {landmarks ? "Face detected" : "No face detected"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={startCamera}
                disabled={cameraOn}
                className="cursor-pointer rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start camera
              </button>

              <button
                onClick={stopCamera}
                disabled={!cameraOn}
                className={`cursor-pointer rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${theme.secondaryButton}`}
              >
                Stop camera
              </button>
            </div>
          </section>

          {/* Eye metrics */}
          <section
            className={`rounded-2xl border p-5 shadow-sm ${theme.card}`}
          >
            <h3 className={`text-lg font-semibold ${theme.heading}`}>
              Eye activity
            </h3>

            <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
              Live estimates from the webcam.
            </p>

            {metrics.map(([label, value]) => (
              <div
                key={label}
                className={`border-b py-5 last:border-b-0 ${theme.divider}`}
              >
                <p className={`text-sm ${theme.muted}`}>{label}</p>
                <p className={`mt-2 text-2xl font-semibold ${theme.heading}`}>
                  {value}
                </p>
              </div>
            ))}

            <div className={`mt-4 rounded-xl p-4 ${theme.reminder}`}>
              <h4 className={`font-semibold ${theme.brand}`}>
                Blink detection
              </h4>

              <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                {landmarks
                  ? "Face tracked. Blink detection is running."
                  : "Waiting for a face to be detected."}
              </p>
            </div>
          </section>
        </div>

        {/* OPI panel */}
        <section
          className={`mt-6 rounded-2xl border p-5 shadow-sm ${theme.card}`}
        >
          <h3 className={`text-lg font-semibold ${theme.heading}`}>
            Ocular Protection Index (OPI)
          </h3>

          <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
            OPI = supplied TFBUT ÷ interblink interval (IBI).
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tfbut"
                className={`block text-sm font-semibold ${theme.heading}`}
              >
                Assumed TFBUT (seconds)
              </label>

              <input
                id="tfbut"
                type="number"
                min="0.1"
                step="0.1"
                value={tfbut}
                onChange={(event) => setTfbut(event.target.value)}
                className={`mt-2 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-emerald-600 ${theme.input}`}
              />

              <p className={`mt-2 text-xs leading-5 ${theme.muted}`}>
                Five seconds is an illustrative assumption, not a
                measurement of your eyes.
              </p>
            </div>

            <div className={`rounded-xl p-4 ${theme.reminder}`}>
              <p className={`text-sm ${theme.muted}`}>
                Calculated OPI
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  opi === null
                    ? theme.heading
                    : opiStatus.low
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              >
                {opi === null ? "--" : opi.toFixed(2)}
              </p>

              <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                {opiStatus.label}
              </p>
            </div>
          </div>

          {opiStatus.low && (
            <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <h4 className="font-semibold text-amber-500">
                EyeGuard reminder
              </h4>

              <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                OPI is below 1 using the supplied TFBUT assumption.
                Consider a short screen break. This is an experimental
                indicator, not a medical diagnosis.
              </p>
            </div>
          )}

          <p className={`mt-4 text-xs leading-5 ${theme.muted}`}>
            OPI uses the most recently completed IBI. The webcam does
            not measure TFBUT or diagnose dry eye.
          </p>
        </section>

        {/* Desktop notifications */}
        <section
          className={`mt-6 rounded-2xl border p-5 shadow-sm ${theme.card}`}
        >
          <h3 className={`text-lg font-semibold ${theme.heading}`}>
            Desktop notifications
          </h3>

          <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
            Enable notifications to receive an operating-system popup
            when a low-OPI condition is detected while you are using
            another tab.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={enableNotifications}
              disabled={notificationsEnabled}
              className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {notificationsEnabled
                ? "Notifications enabled"
                : "Enable notifications"}
            </button>

            <button
              onClick={testNotification}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold ${theme.secondaryButton}`}
            >
              Test notification
            </button>

            <button
              onClick={disableNotifications}
              disabled={!notificationsEnabled}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${theme.secondaryButton}`}
            >
              Disable notifications
            </button>
          </div>

          <p className={`mt-3 text-sm ${theme.muted}`}>
            {notificationStatus}
          </p>

          <p className={`mt-3 text-xs leading-5 ${theme.muted}`}>
            Notifications require browser permission. Automatic
            reminders are limited to one per 60 seconds. Background
            tabs can be throttled or suspended by Chrome.
          </p>
        </section>

        {/* Scientific note */}
        <section
          className={`mt-6 rounded-2xl border p-5 ${theme.card}`}
        >
          <h3 className={`font-semibold ${theme.heading}`}>
            About these measurements
          </h3>

          <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
            EyeGuard estimates blink behaviour using webcam-based eye
            landmarks. It cannot directly measure tear-film breakup
            time (TFBUT). OPI depends on the user-supplied TFBUT
            assumption and is an experimental indicator, not a
            clinical diagnosis.
          </p>
        </section>
      </section>

      {/* Footer */}
      <footer
        className={`mx-auto mt-10 flex max-w-6xl justify-between gap-4 text-xs ${theme.muted}`}
      >
        <span>EyeGuard · Development build</span>
        <span>React + MediaPipe</span>
      </footer>
    </main>
  );
};

export default App;

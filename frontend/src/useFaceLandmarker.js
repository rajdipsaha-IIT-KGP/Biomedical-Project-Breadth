
import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

// Eye landmark indices from MediaPipe
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Calculate Eye Aspect Ratio (EAR)
function calculateEAR(points, indices) {
  const [p1, p2, p3, p4, p5, p6] = indices.map(
    (index) => points[index]
  );

  const horizontal = distance(p1, p4);

  if (horizontal === 0) return 0;

  return (
    distance(p2, p6) + distance(p3, p5)
  ) / (2 * horizontal);
}

export default function useFaceLandmarker(videoRef, cameraOn) {
  const landmarkerRef = useRef(null);

  // Existing blink detection refs
  const previousClosedRef = useRef(false);
  const lastBlinkTimeRef = useRef(null);
  const blinkTimesRef = useRef([]);
  const lastVideoTimeRef = useRef(-1);

  // EAR smoothing and closure tracking refs
  const smoothedEARRef = useRef(null);
  const closureStartTimeRef = useRef(null);
  const minimumEARRef = useRef(null);

  // UI states
  const [landmarks, setLandmarks] = useState(null);
  const [modelStatus, setModelStatus] = useState("Loading model...");
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinkRate, setBlinkRate] = useState(0);
  const [ear, setEar] = useState(null);
  const [ibi, setIbi] = useState(null);
  const [lastBlinkMinEAR, setLastBlinkMinEAR] = useState(null);

  // Load the MediaPipe model
  useEffect(() => {
    let cancelled = false;
    let landmarker;

    async function loadModel() {
      try {
        setModelStatus("Loading model...");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm"
        );

        landmarker = await FaceLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: "/models/face_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
          }
        );

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setModelStatus("Model ready");
      } catch (error) {
        console.error("MediaPipe initialization failed:", error);

        if (!cancelled) {
          setModelStatus("Model failed to load");
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  // Detect face and calculate EAR
  useEffect(() => {
    if (!cameraOn || modelStatus !== "Model ready") return;

    let animationId;
    let active = true;

    function detectFace() {
      if (!active) return;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          const result = landmarker.detectForVideo(
            video,
            performance.now()
          );

          const points = result.faceLandmarks?.[0] ?? null;
          setLandmarks(points);

          if (points) {
            // Calculate EAR for both eyes
            const leftEAR = calculateEAR(points, LEFT_EYE);
            const rightEAR = calculateEAR(points, RIGHT_EYE);

            const currentEAR = (leftEAR + rightEAR) / 2;

            // 1. Smooth EAR
            const previousEAR = smoothedEARRef.current;

            const smoothedEAR =
              previousEAR === null
                ? currentEAR
                : 0.35 * currentEAR + 0.65 * previousEAR;

            smoothedEARRef.current = smoothedEAR;
            setEar(smoothedEAR);

            // 2. Hysteresis thresholds
            const CLOSE_THRESHOLD = 0.19;
            const OPEN_THRESHOLD = 0.23;

            const now = performance.now();

            // Eyes transition from open to closed
            if (
              !previousClosedRef.current &&
              smoothedEAR < CLOSE_THRESHOLD
            ) {
              previousClosedRef.current = true;
              closureStartTimeRef.current = now;

              // Start tracking this closure's minimum EAR
              minimumEARRef.current = smoothedEAR;
            }

            // Eyes remain closed: update minimum EAR
            else if (previousClosedRef.current) {
              minimumEARRef.current = Math.min(
                minimumEARRef.current ?? smoothedEAR,
                smoothedEAR
              );

              // Eyes have reopened
              if (smoothedEAR > OPEN_THRESHOLD) {
                const closedAt = closureStartTimeRef.current;

                const duration =
                  closedAt === null ? 0 : now - closedAt;

                // Accept plausible blink durations only
                if (duration >= 70 && duration <= 600) {
                  setBlinkCount((count) => count + 1);
                  blinkTimesRef.current.push(now);

                  // Save minimum EAR for the accepted blink
                  setLastBlinkMinEAR(minimumEARRef.current);

                  // Calculate inter-blink interval in seconds
                  if (lastBlinkTimeRef.current !== null) {
                    setIbi(
                      (now - lastBlinkTimeRef.current) / 1000
                    );
                  }

                  lastBlinkTimeRef.current = now;
                }

                // Reset closure tracking for the next blink
                previousClosedRef.current = false;
                closureStartTimeRef.current = null;
                minimumEARRef.current = null;
              }
            }
          } else {
            // No face detected
            setLandmarks(null);
            previousClosedRef.current = false;
            closureStartTimeRef.current = null;
            minimumEARRef.current = null;
            smoothedEARRef.current = null;
          }
        } catch (error) {
          console.error("Frame detection error:", error);
        }
      }

      animationId = requestAnimationFrame(detectFace);
    }

    animationId = requestAnimationFrame(detectFace);

    return () => {
      active = false;
      cancelAnimationFrame(animationId);
    };
  }, [cameraOn, modelStatus, videoRef]);

  // Rolling blink rate over the last 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = performance.now();

      const recentBlinks = blinkTimesRef.current.filter(
        (time) => now - time <= 60000
      );

      blinkTimesRef.current = recentBlinks;
      setBlinkRate(recentBlinks.length);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    landmarks,
    modelStatus,
    blinkCount,
    blinkRate,
    ibi,
    ear,
    lastBlinkMinEAR,
  };
}

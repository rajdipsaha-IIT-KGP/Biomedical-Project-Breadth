import { useEffect, useRef, useState } from "react";
import { calculateOPI, getOPIStatus } from "./opiUtils";

export default function useOPI(lastBlinkTime, ibi, cameraOn) {
  const [tfbut, setTfbut] = useState("5");
  const [elapsedSeconds, setElapsedSeconds] = useState(null);

  const [blinkBasedOPI, setBlinkBasedOPI] = useState(null);
  const [blinkBasedIBI, setBlinkBasedIBI] = useState(null);

  const processedBlinkRef = useRef(null);

  // Reset all OPI-related values when camera is off.
  useEffect(() => {
    if (!cameraOn) {
      setElapsedSeconds(null);
      setBlinkBasedOPI(null);
      setBlinkBasedIBI(null);
      processedBlinkRef.current = null;
    }
  }, [cameraOn]);

  // Continuous elapsed-time calculation.
  useEffect(() => {
    if (!cameraOn || lastBlinkTime === null) {
      setElapsedSeconds(null);
      return;
    }

    const updateElapsed = () => {
      setElapsedSeconds(
        Math.max(0, (Date.now() - lastBlinkTime) / 1000)
      );
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);

    return () => clearInterval(timer);
  }, [lastBlinkTime, cameraOn]);

  // Continuous OPI.
  const opi = cameraOn
    ? calculateOPI(tfbut, elapsedSeconds)
    : null;

  const opiStatus = getOPIStatus(opi);

  // Blink-based OPI.
  useEffect(() => {
    if (
      !cameraOn ||
      lastBlinkTime === null ||
      lastBlinkTime === undefined ||
      ibi === null ||
      !Number.isFinite(ibi) ||
      ibi <= 0 ||
      processedBlinkRef.current === lastBlinkTime
    ) {
      return;
    }

    processedBlinkRef.current = lastBlinkTime;

    setBlinkBasedIBI(ibi);
    setBlinkBasedOPI(calculateOPI(tfbut, ibi));
  }, [cameraOn, lastBlinkTime, ibi, tfbut]);

  const blinkBasedStatus = getOPIStatus(blinkBasedOPI);

  return {
    tfbut,
    setTfbut,
    opi,
    opiStatus,
    elapsedSeconds,
    blinkBasedOPI,
    blinkBasedIBI,
    blinkBasedStatus,
  };
}
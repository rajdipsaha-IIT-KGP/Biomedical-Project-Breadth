
import { useEffect, useState } from "react";
import { calculateOPI, getOPIStatus } from "./opiUtils";

export default function useOPI(lastBlinkTime) {
  const [tfbut, setTfbut] = useState("5");
  const [elapsedSeconds, setElapsedSeconds] = useState(null);

  useEffect(() => {
    if (lastBlinkTime === null) {
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
  }, [lastBlinkTime]);

  // Continuous estimate, not the previous completed IBI.
  const opi = calculateOPI(tfbut, elapsedSeconds);
  const opiStatus = getOPIStatus(opi);

  return {
    tfbut,
    setTfbut,
    opi,
    opiStatus,
    elapsedSeconds,
  };
}

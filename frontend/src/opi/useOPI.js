
import { useState } from "react";
import { calculateOPI, getOPIStatus } from "./opiUtils";

export default function useOPI(ibi) {
  const [tfbut, setTfbut] = useState("5");

  const opi = calculateOPI(tfbut, ibi);
  const opiStatus = getOPIStatus(opi);

  return {
    tfbut,
    setTfbut,
    opi,
    opiStatus,
  };
}


export function calculateOPI(tfbut, ibi) {
  const t = Number(tfbut);
  const interval = Number(ibi);

  if (
    tfbut === "" ||
    tfbut === null ||
    !Number.isFinite(t) ||
    t <= 0 ||
    ibi === null ||
    !Number.isFinite(interval) ||
    interval <= 0
  ) {
    return null;
  }

  return t / interval;
}

export function getOPIStatus(opi) {
  if (opi === null || !Number.isFinite(opi)) {
    return {
      label: "Waiting for blink data",
      low: false,
    };
  }

  if (opi < 1) {
    return {
      label: "IBI exceeds the supplied TFBUT",
      low: true,
    };
  }

  return {
    label: "IBI does not exceed the supplied TFBUT",
    low: false,
  };
}

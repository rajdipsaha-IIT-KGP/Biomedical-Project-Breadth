export default function OPIPanel({
  tfbut,
  setTfbut,
  opi,
  opiStatus,
  elapsedSeconds,
  blinkBasedOPI,
  blinkBasedIBI,
  blinkBasedStatus,
}) {
  const hasContinuousOPI =
    typeof opi === "number" && Number.isFinite(opi);

  const hasBlinkBasedOPI =
    typeof blinkBasedOPI === "number" &&
    Number.isFinite(blinkBasedOPI);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Ocular Protection Index
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Two experimental OPI estimates using different time measurements.
        </p>
      </div>

      <label
        htmlFor="tfbut"
        className="mb-2 block text-sm font-medium"
      >
        Assumed tear-film breakup time (TFBUT)
      </label>

      <div className="flex items-center gap-3">
        <input
          id="tfbut"
          type="number"
          min="0.1"
          step="0.1"
          value={tfbut}
          onChange={(event) => setTfbut(event.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
        />

        <span className="text-sm text-gray-500">seconds</span>
      </div>

      {/* OPI values */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* Continuous OPI */}
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Continuous OPI
          </p>

          <p className="mt-2 text-3xl font-bold">
            {hasContinuousOPI ? opi.toFixed(3) : "--"}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Based on time since last blink
          </p>

          <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-300">
            Live updating
          </p>
        </div>

        {/* Blink-Based OPI */}
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Blink-Based OPI
          </p>

          <p className="mt-2 text-3xl font-bold">
            {hasBlinkBasedOPI
              ? blinkBasedOPI.toFixed(3)
              : "--"}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Based on completed IBI
          </p>

          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
            Updates after each valid blink
          </p>
        </div>
      </div>

      {/* Time measurements */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Time since last blink
          </p>

          <p className="mt-2 text-2xl font-bold">
            {typeof elapsedSeconds === "number" &&
            Number.isFinite(elapsedSeconds)
              ? elapsedSeconds.toFixed(1)
              : "--"}

            <span className="ml-1 text-sm font-medium">s</span>
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last completed IBI
          </p>

          <p className="mt-2 text-2xl font-bold">
            {typeof blinkBasedIBI === "number"
              ? blinkBasedIBI.toFixed(2)
              : "--"}

            <span className="ml-1 text-sm font-medium">s</span>
          </p>
        </div>
      </div>

      {/* Status messages */}
      <div className="mt-4 space-y-3">
        <p
          className={`rounded-xl p-3 text-sm ${
            opiStatus?.low
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
              : "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
          }`}
        >
          <strong>Continuous OPI:</strong>{" "}
          {opiStatus?.label ?? "Waiting for blink data"}
        </p>

        <p
          className={`rounded-xl p-3 text-sm ${
            blinkBasedStatus?.low
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
          }`}
        >
          <strong>Blink-Based OPI:</strong>{" "}
          {blinkBasedStatus?.label ?? "Waiting for blink data"}
        </p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Both values are experimental estimates using an assumed TFBUT.
        The webcam detects blinks but does not directly measure tear-film
        breakup time. Neither value is a clinical measurement or diagnosis.
      </p>
    </section>
  );
}
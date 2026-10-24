export default function OPIPanel({
  tfbut,
  setTfbut,
  opi,
  opiStatus,
  elapsedSeconds,
}) {
  const hasOPI = typeof opi === "number" && Number.isFinite(opi);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Ocular Protection Index</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Estimated from your assumed TFBUT and time since the last detected
          blink.
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

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated OPI
          </p>
          <p className="mt-2 text-3xl font-bold">
            {hasOPI ? opi.toFixed(2) : "--"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Time since last blink
          </p>
          <p className="mt-2 text-3xl font-bold">
            {typeof elapsedSeconds === "number" &&
            Number.isFinite(elapsedSeconds)
              ? elapsedSeconds.toFixed(1)
              : "--"}
            <span className="ml-1 text-sm font-medium">s</span>
          </p>
        </div>
      </div>

      <p
        className={`mt-4 rounded-xl p-3 text-sm ${
          opiStatus?.low
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
            : "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
        }`}
      >
        {opiStatus?.label ?? "Waiting for blink data"}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        This is an experimental estimate, not a clinical measurement. TFBUT is
        entered as an assumption; the webcam does not measure tear-film breakup
        time.
      </p>
    </section>
  );
}
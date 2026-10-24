function MetricCard({ label, value, unit = "", description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>

      <p className="mt-2 text-2xl font-bold">
        {value}
        {unit && <span className="ml-1 text-sm font-medium">{unit}</span>}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

function formatValue(value, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "--";
}

export default function EyeMetrics({
  blinkCount,
  blinkRate,
  ear,
  ibi,
  lastBlinkMinEAR,
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Eye Metrics</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label="Total Blinks"
          value={blinkCount ?? 0}
          description="Accepted blink detections"
        />

        <MetricCard
          label="Blink Rate"
          value={formatValue(blinkRate, 1)}
          unit="/min"
          description="Based on the recent 60 seconds"
        />

        <MetricCard
          label="Eye Aspect Ratio"
          value={formatValue(ear, 3)}
          description="Lower values generally indicate more eye closure"
        />

        <MetricCard
          label="Last Blink Interval"
          value={formatValue(ibi, 2)}
          unit="s"
          description="Time between the last two detected blinks"
        />

        <MetricCard
          label="Minimum EAR"
          value={formatValue(lastBlinkMinEAR, 3)}
          description="Lowest EAR during the last accepted blink"
        />
      </div>
    </section>
  );
}
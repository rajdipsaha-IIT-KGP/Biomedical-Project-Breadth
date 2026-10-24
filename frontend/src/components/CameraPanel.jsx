export default function CameraPanel({
  videoRef,
  canvasRef,
  cameraOn,
  status,
  modelStatus,
  blinkJustDetected,
  onStart,
  onStop,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Live Camera</h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            cameraOn
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {cameraOn ? "Camera on" : "Camera off"}
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />

        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-300">
            Start the camera to begin monitoring.
          </div>
        )}

        {cameraOn && blinkJustDetected && (
          <div className="absolute left-3 top-3 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow">
            ✓ Blink detected!
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {!cameraOn ? (
          <button
            type="button"
            onClick={onStart}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Start camera
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
          >
            Stop camera
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p className="text-gray-600 dark:text-gray-300">
          <span className="font-medium">Camera:</span> {status}
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          <span className="font-medium">Face model:</span> {modelStatus}
        </p>
      </div>
    </section>
  );
}
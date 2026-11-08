
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function EARChart({ data }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Eye Aspect Ratio (EAR)
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Live eye-opening pattern over the last 30 seconds
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          Start your camera to view live EAR data.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#9ca3af"
              opacity={0.25}
            />

            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => `${value}s`}
              stroke="#9ca3af"
              fontSize={12}
            />

            <YAxis
              domain={["auto", "auto"]}
              stroke="#9ca3af"
              fontSize={12}
            />

            <Tooltip
              labelFormatter={(value) => `Time: ${value}s`}
              formatter={(value) => [
                Number(value).toFixed(4),
                "EAR",
              ]}
            />

            <Line
              type="monotone"
              dataKey="ear"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

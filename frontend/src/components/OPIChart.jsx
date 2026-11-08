
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OPIChart({ data = [] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Continuous OPI vs Time
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time continuous OPI monitoring
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
          Start the camera to generate OPI data.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 5, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#9ca3af"
                opacity={0.3}
              />

              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                label={{
                  value: "Time (seconds)",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#9ca3af",
                }}
              />

              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                label={{
                  value: "Continuous OPI",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9ca3af",
                }}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toFixed(3),
                  "Continuous OPI",
                ]}
                labelFormatter={(value) =>
                  `Time: ${value} seconds`
                }
              />

              <Line
                type="monotone"
                dataKey="opi"
                name="Continuous OPI"
                stroke="#0D9488"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

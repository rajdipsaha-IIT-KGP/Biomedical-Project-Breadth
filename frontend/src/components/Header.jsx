export default function Header({ darkMode, setDarkMode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          EyeGuard <span className="text-blue-500">👁️</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Smart blink monitoring and eye-rest reminders
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDarkMode((previous) => !previous)}
        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
      </button>
    </header>
  );
}
export default function NotificationPanel({
  notificationsEnabled,
  notificationStatus,
  enableNotifications,
  disableNotifications,
  testNotification,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">Desktop Notifications</h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Receive a reminder when the estimated OPI enters the low range.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {!notificationsEnabled ? (
          <button
            type="button"
            onClick={enableNotifications}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Enable notifications
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={testNotification}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Test notification
            </button>

            <button
              type="button"
              onClick={disableNotifications}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Disable reminders
            </button>
          </>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {notificationStatus}
      </p>
    </section>
  );
}